import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useUserCard } from '../context/AppContext';
import QRGenerator from '../components/QRGenerator';
import { generateVCard, generateShareableText, generateDeepLink } from '../utils/qrGenerator';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

export default function ShareScreen({ navigation, route }) {
  const { currentCard } = useUserCard();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareMethod, setShareMethod] = useState('qr'); // 'qr', 'vcard', 'text', 'link'
  
  // Load card data from route params or context
  useEffect(() => {
    const loadCardData = async () => {
      // If card data is passed from route params
      if (route.params?.cardData) {
        setCardData(route.params.cardData);
      } 
      // Otherwise use current card from context
      else if (currentCard) {
        setCardData(currentCard);
      }
      // If no card exists, redirect to create card screen
      else {
        Alert.alert(
          'No Card Available',
          'Please create a business card first.',
          [{ text: 'OK', onPress: () => navigation.navigate('Cards') }]
        );
      }
    };
    
    loadCardData();
    
    // Request permissions for saving media
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your media library to save QR codes.'
        );
      }
    })();
  }, [route.params?.cardData, currentCard, navigation]);

  // Save QR code to device
  const saveQRCode = async () => {
    try {
      setLoading(true);
      
      // Request permissions if not already granted
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }
      
      // This will be handled by the QRGenerator component
      // See handleQRSaveSuccess and handleQRError
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code to your device.');
      setLoading(false);
    }
  };

  // Handle QR code save success
  const handleQRSaveSuccess = (fileUri) => {
    setLoading(false);
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
    
    Alert.alert(
      'Success',
      'QR Code saved to your photos',
      [{ text: 'OK' }]
    );
  };

  // Handle QR code error
  const handleQRError = (error) => {
    setLoading(false);
    Alert.alert(
      'Error',
      'Failed to generate or save QR code',
      [{ text: 'OK' }]
    );
    console.error('QR code error:', error);
  };

  // Share vCard file
  const shareVCard = async () => {
    try {
      setLoading(true);
      
      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }
      
      // Generate vCard content
      const vCardContent = generateVCard(cardData);
      
      // Create a temporary file
      const fileName = `${cardData.name.replace(/\s+/g, '_')}.vcf`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      
      // Write vCard content to file
      await FileSystem.writeAsStringAsync(fileUri, vCardContent);
      
      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/vcard',
        dialogTitle: `${cardData.name}'s Contact Card`,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error sharing vCard:', error);
      Alert.alert('Error', 'Failed to share vCard file.');
      setLoading(false);
    }
  };

  // Share text
  const shareText = async () => {
    try {
      setLoading(true);
      
      // Generate shareable text
      const text = generateShareableText(cardData);
      
      // Use native share dialog
      await Sharing.shareAsync('', {
        mimeType: 'text/plain',
        dialogTitle: `${cardData.name}'s Contact Info`,
        UTI: 'public.plain-text',
        message: text,
      }).catch(error => {
        // Fallback for platforms where direct text sharing doesn't work
        Clipboard.setStringAsync(text);
        Alert.alert(
          'Text Copied',
          'Contact information has been copied to clipboard.',
          [{ text: 'OK' }]
        );
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error sharing text:', error);
      Alert.alert('Error', 'Failed to share text.');
      setLoading(false);
    }
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      setLoading(true);
      
      // Generate deep link (in a real app, this would be a shareable URL)
      const link = generateDeepLink(cardData);
      
      // Copy to clipboard
      await Clipboard.setStringAsync(link);
      
      Alert.alert(
        'Link Copied',
        'A link to your card has been copied to clipboard.',
        [{ text: 'OK' }]
      );
      
      setLoading(false);
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard.');
      setLoading(false);
    }
  };

  // Share via social media (simulated)
  const shareViaSocial = (platform) => {
    Alert.alert(
      'Share via ' + platform,
      `This would open the ${platform} app to share your card.`,
      [{ text: 'OK' }]
    );
  };

  // If no card data yet
  if (!cardData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading card...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Card</Text>
        </View>

        {/* Share method tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              shareMethod === 'qr' && styles.activeTab
            ]}
            onPress={() => setShareMethod('qr')}
          >
            <Ionicons 
              name="qr-code" 
              size={20} 
              color={shareMethod === 'qr' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              shareMethod === 'qr' && styles.activeTabText
            ]}>QR Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              shareMethod === 'vcard' && styles.activeTab
            ]}
            onPress={() => setShareMethod('vcard')}
          >
            <Ionicons 
              name="card" 
              size={20} 
              color={shareMethod === 'vcard' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              shareMethod === 'vcard' && styles.activeTabText
            ]}>vCard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              shareMethod === 'text' && styles.activeTab
            ]}
            onPress={() => setShareMethod('text')}
          >
            <Ionicons 
              name="text" 
              size={20} 
              color={shareMethod === 'text' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              shareMethod === 'text' && styles.activeTabText
            ]}>Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              shareMethod === 'link' && styles.activeTab
            ]}
            onPress={() => setShareMethod('link')}
          >
            <Ionicons 
              name="link" 
              size={20} 
              color={shareMethod === 'link' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              shareMethod === 'link' && styles.activeTabText
            ]}>Link</Text>
          </TouchableOpacity>
        </View>

        {/* Share content */}
        <View style={styles.shareContent}>
          {/* QR Code sharing */}
          {shareMethod === 'qr' && (
            <View style={styles.qrContainer}>
              <Text style={styles.shareInstructions}>
                Let others scan this QR code to get your contact information
              </Text>
              
              <View style={styles.qrCodeWrapper}>
                <QRGenerator
                  card={cardData}
                  size={QR_SIZE}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                  ecl="H"
                  onSaveSuccess={handleQRSaveSuccess}
                  onError={handleQRError}
                />
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={saveQRCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Save to Photos</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {saveSuccess && (
                <Text style={styles.successText}>
                  QR Code saved successfully!
                </Text>
              )}
            </View>
          )}

          {/* vCard sharing */}
          {shareMethod === 'vcard' && (
            <View style={styles.vcardContainer}>
              <Text style={styles.shareInstructions}>
                Share a vCard file that can be imported into contacts
              </Text>
              
              <View style={styles.vcardPreview}>
                <Ionicons name="card" size={60} color="#007AFF" />
                <Text style={styles.vcardName}>{cardData.name}</Text>
                <Text style={styles.vcardDetails}>
                  {cardData.title}{cardData.title && cardData.company ? ', ' : ''}
                  {cardData.company}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={shareVCard}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Share vCard</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Text sharing */}
          {shareMethod === 'text' && (
            <View style={styles.textContainer}>
              <Text style={styles.shareInstructions}>
                Share your contact information as plain text
              </Text>
              
              <View style={styles.textPreview}>
                <Text style={styles.textPreviewContent}>
                  {cardData.name}{'\n'}
                  {cardData.title && `${cardData.title}\n`}
                  {cardData.company && `${cardData.company}\n`}
                  {'\n'}
                  {cardData.phone && `📱 ${cardData.phone}\n`}
                  {cardData.email && `📧 ${cardData.email}\n`}
                  {cardData.website && `🌐 ${cardData.website}\n`}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={shareText}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Share Text</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Link sharing */}
          {shareMethod === 'link' && (
            <View style={styles.linkContainer}>
              <Text style={styles.shareInstructions}>
                Share a link that opens your card in the app
              </Text>
              
              <View style={styles.linkPreview}>
                <Ionicons name="link" size={40} color="#007AFF" />
                <Text style={styles.linkText}>dropcard://{cardData.id}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={copyLink}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Copy Link</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Social sharing options */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>Share via</Text>
          
          <View style={styles.socialButtons}>
            {/* AirDrop (iOS only) */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => shareViaSocial('AirDrop')}
              >
                <View style={[styles.socialIcon, { backgroundColor: '#007AFF' }]}>
                  <Ionicons name="share" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.socialText}>AirDrop</Text>
              </TouchableOpacity>
            )}
            
            {/* Messages */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => shareViaSocial('Messages')}
            >
              <View style={[styles.socialIcon, { backgroundColor: '#34C759' }]}>
                <Ionicons name="chatbubble" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialText}>Messages</Text>
            </TouchableOpacity>
            
            {/* Mail */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => shareViaSocial('Mail')}
            >
              <View style={[styles.socialIcon, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="mail" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialText}>Mail</Text>
            </TouchableOpacity>
            
            {/* LinkedIn */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => shareViaSocial('LinkedIn')}
            >
              <View style={[styles.socialIcon, { backgroundColor: '#0077B5' }]}>
                <Ionicons name="logo-linkedin" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialText}>LinkedIn</Text>
            </TouchableOpacity>
            
            {/* Twitter */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => shareViaSocial('Twitter')}
            >
              <View style={[styles.socialIcon, { backgroundColor: '#1DA1F2' }]}>
                <Ionicons name="logo-twitter" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  shareContent: {
    marginBottom: 32,
  },
  shareInstructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  vcardContainer: {
    alignItems: 'center',
  },
  vcardPreview: {
    width: '100%',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  vcardName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 4,
  },
  vcardDetails: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  textPreview: {
    width: '100%',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  textPreviewContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkPreview: {
    width: '100%',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    width: '100%',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  socialSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 16,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
