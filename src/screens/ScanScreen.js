import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    // In a real app, this would start the camera and QR scanner
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Card Scanned!',
        'Successfully scanned John Smith\'s business card. Would you like to add them to your contacts?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Contact', 
            onPress: () => navigation.navigate('AddContact', {
              scannedData: {
                name: 'John Smith',
                email: 'john@company.com',
                title: 'Sales Manager',
                company: 'Tech Solutions Inc.'
              }
            })
          }
        ]
      );
    }, 2000);
  };

  const handleManualEntry = () => {
    navigation.navigate('AddContact');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Card</Text>
        <Text style={styles.subtitle}>Point your camera at a QR code to scan a business card</Text>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            {isScanning ? (
              <View style={styles.scanningIndicator}>
                <Ionicons name="scan" size={64} color="#007AFF" />
                <Text style={styles.scanningText}>Scanning...</Text>
              </View>
            ) : (
              <View style={styles.scanPlaceholder}>
                <Ionicons name="qr-code-outline" size={64} color="#ccc" />
                <Text style={styles.placeholderText}>Tap to start scanning</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={handleStartScan}
          disabled={isScanning}
        >
          <Ionicons 
            name={isScanning ? "stop" : "camera"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Start Scanning'}
          </Text>
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
  scanningIndicator: {
    alignItems: 'center',
    gap: 16,
  },
  scanningText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
  scanButtonActive: {
    backgroundColor: '#ff4444',
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
}); 