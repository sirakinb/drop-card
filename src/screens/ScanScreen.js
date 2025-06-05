import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useContacts } from '../context/AppContext';
import { parseVCard } from '../utils/qrGenerator';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanScreen({ navigation }) {
  // States for camera and scanning
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [processingQR, setProcessingQR] = useState(false);
  
  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  
  // Get contacts context for saving scanned contacts
  const { saveContact } = useContacts();
  
  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Animate scan line when scanning is active
  useEffect(() => {
    if (isScanning && !scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }
    
    return () => {
      scanLineAnim.stopAnimation();
    };
  }, [isScanning, scanned]);
  
  // Start scanning
  const handleStartScan = () => {
    setIsScanning(true);
    setScanned(false);
  };
  
  // Stop scanning
  const handleStopScan = () => {
    setIsScanning(false);
    setScanned(false);
  };
  
  // Toggle flash mode
  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };
  
  // Navigate to manual entry
  const handleManualEntry = () => {
    navigation.navigate('AddContact');
  };
  
  // Handle successful scan animation
  const animateSuccess = () => {
    successAnim.setValue(0);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setIsScanning(false);
      setScanned(false);
    });
  };
  
  // Handle barcode scanning
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processingQR) return;
    
    try {
      setScanned(true);
      setProcessingQR(true);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Check if this is a vCard QR code
      if (!data.includes('BEGIN:VCARD')) {
        Alert.alert(
          'Invalid QR Code',
          'This doesn\'t appear to be a business card QR code. Please try scanning a vCard QR code.',
          [{ text: 'OK', onPress: () => {
            setScanned(false);
            setProcessingQR(false);
          }}]
        );
        return;
      }
      
      // Parse the vCard data
      const cardData = parseVCard(data);
      
      if (!cardData || !cardData.name) {
        throw new Error('Could not parse business card data');
      }
      
      // Animate success
      animateSuccess();
      
      // Prepare contact data
      const contactData = {
        cardData: cardData,
        notes: '',
        tags: [],
        meetingContext: 'Scanned via QR code',
        createdAt: new Date().toISOString(),
      };
      
      // Show confirmation
      setTimeout(() => {
        Alert.alert(
          'Card Scanned!',
          `Successfully scanned ${cardData.name}'s business card. Would you like to add them to your contacts?`,
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => {
                setProcessingQR(false);
                setScanned(false);
              }
            },
            { 
              text: 'Add Contact', 
              onPress: async () => {
                // Save the contact
                const savedContact = await saveContact(contactData);
                
                if (savedContact) {
                  // Navigate to contact details or back to contacts list
                  navigation.navigate('ContactsList');
                  setTimeout(() => {
                    Alert.alert(
                      'Contact Added',
                      `${cardData.name} has been added to your contacts.`
                    );
                  }, 500);
                } else {
                  Alert.alert(
                    'Error',
                    'Failed to save contact. Please try again.'
                  );
                }
                
                setProcessingQR(false);
              }
            }
          ]
        );
      }, 1500); // Delay to show success animation
      
    } catch (error) {
      console.error('Error scanning QR code:', error);
      Alert.alert(
        'Scanning Error',
        'There was an error processing this QR code. Please try again.',
        [{ text: 'OK', onPress: () => {
          setScanned(false);
          setProcessingQR(false);
        }}]
      );
    }
  };
  
  // Render different screens based on permission and scanning state
  const renderContent = () => {
    // Loading state while checking permissions
    if (hasPermission === null) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.permissionText}>Checking camera permissions...</Text>
        </View>
      );
    }
    
    // Permission denied state
    if (hasPermission === false) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="camera-off" size={64} color="#FF3B30" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access in your device settings to scan QR codes.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
          >
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Active scanning state
    if (isScanning) {
      return (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            flashMode={flashMode}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
            }}
          >
            <SafeAreaView style={styles.cameraContent}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={handleStopScan}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={toggleFlash}
                >
                  <Ionicons 
                    name={flashMode === Camera.Constants.FlashMode.torch ? "flash" : "flash-off"} 
                    size={24} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scanAreaContainer}>
                <View style={styles.scanArea}>
                  {/* Scanning animation */}
                  {!scanned && (
                    <Animated.View 
                      style={[
                        styles.scanLine,
                        {
                          transform: [
                            {
                              translateY: scanLineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, SCAN_AREA_SIZE - 2],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                  
                  {/* Success animation */}
                  {scanned && (
                    <Animated.View 
                      style={[
                        styles.successOverlay,
                        {
                          opacity: successAnim,
                        },
                      ]}
                    >
                      <Ionicons name="checkmark-circle" size={80} color="#4CD964" />
                    </Animated.View>
                  )}
                </View>
                
                <Text style={styles.scanText}>
                  {scanned 
                    ? 'Processing QR code...' 
                    : 'Position QR code within the frame'}
                </Text>
              </View>
            </SafeAreaView>
          </Camera>
        </View>
      );
    }
    
    // Default state - not scanning yet
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Scan Card</Text>
        <Text style={styles.subtitle}>Point your camera at a QR code to scan a business card</Text>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={styles.scanPlaceholder}>
              <Ionicons name="qr-code-outline" size={64} color="#ccc" />
              <Text style={styles.placeholderText}>Tap to start scanning</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleStartScan}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Start Scanning</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.manualButton} onPress={handleManualEntry}>
          <Ionicons name="person-add" size={20} color="#000" />
          <Text style={styles.manualButtonText}>Add Contact Manually</Text>
        </TouchableOpacity>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for better scanning:</Text>
          <Text style={styles.tipText}>• Hold your phone steady</Text>
          <Text style={styles.tipText}>• Ensure good lighting</Text>
          <Text style={styles.tipText}>• Keep QR code within the frame</Text>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  scanArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scanPlaceholder: {
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    gap: 8,
    marginBottom: 24,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 14,
    color: '#666',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
    marginBottom: 32,
  },
  manualButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  tips: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#007AFF',
  },
  scanText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Permission styles
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
