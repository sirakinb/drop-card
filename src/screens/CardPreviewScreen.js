import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserCard } from '../context/AppContext';
import BusinessCard from '../components/BusinessCard';
import QRGenerator from '../components/QRGenerator';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

export default function CardPreviewScreen({ navigation, route }) {
  const { currentCard, saveCard, loading } = useUserCard();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [cardData, setCardData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  // Load card data from route params or context
  useEffect(() => {
    const loadCardData = async () => {
      // If card data is passed from route params (from create/edit screen)
      if (route.params?.cardData) {
        setCardData(route.params.cardData);
      } 
      // Otherwise use current card from context
      else if (currentCard) {
        setCardData(currentCard);
      }
      // If no card exists, redirect to create card screen
      else {
        navigation.replace('CreateCard');
      }
    };
    
    loadCardData();
  }, [route.params?.cardData, currentCard, navigation]);

  // Handle edit button press
  const handleEdit = () => {
    navigation.navigate('CreateCard', { 
      cardData: cardData,
      editMode: true
    });
  };

  // Handle share button press
  const handleShare = () => {
    navigation.navigate('Share', { cardData: cardData });
  };

  // Toggle QR code display
  const toggleQR = () => {
    setShowQR(!showQR);
  };

  // Handle template selection
  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  // Handle QR code save success
  const handleQRSaveSuccess = (fileUri) => {
    Alert.alert(
      'Success',
      'QR Code saved to your photos',
      [{ text: 'OK' }]
    );
  };

  // Handle QR code error
  const handleQRError = (error) => {
    Alert.alert(
      'Error',
      'Failed to generate or save QR code',
      [{ text: 'OK' }]
    );
    console.error('QR code error:', error);
  };

  // If loading or no card data yet
  if (loading || !cardData) {
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
          <Text style={styles.title}>Your Card</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleEdit}
            >
              <Ionicons name="pencil" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Template selector */}
        <View style={styles.templateSelector}>
          <Text style={styles.sectionTitle}>Card Template</Text>
          <View style={styles.templateOptions}>
            <TouchableOpacity
              style={[
                styles.templateOption,
                selectedTemplate === 'modern' && styles.selectedTemplate
              ]}
              onPress={() => handleTemplateChange('modern')}
            >
              <Text style={[
                styles.templateText,
                selectedTemplate === 'modern' && styles.selectedTemplateText
              ]}>Modern</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.templateOption,
                selectedTemplate === 'professional' && styles.selectedTemplate
              ]}
              onPress={() => handleTemplateChange('professional')}
            >
              <Text style={[
                styles.templateText,
                selectedTemplate === 'professional' && styles.selectedTemplateText
              ]}>Professional</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.templateOption,
                selectedTemplate === 'creative' && styles.selectedTemplate
              ]}
              onPress={() => handleTemplateChange('creative')}
            >
              <Text style={[
                styles.templateText,
                selectedTemplate === 'creative' && styles.selectedTemplateText
              ]}>Creative</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card preview */}
        <View style={styles.cardPreviewContainer}>
          <BusinessCard 
            card={cardData} 
            template={selectedTemplate}
            style={styles.cardPreview}
          />
        </View>

        {/* QR Code section */}
        <View style={styles.qrSection}>
          <TouchableOpacity
            style={styles.qrToggleButton}
            onPress={toggleQR}
          >
            <Ionicons 
              name={showQR ? "chevron-up" : "qr-code"} 
              size={24} 
              color="#007AFF" 
            />
            <Text style={styles.qrToggleText}>
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </Text>
          </TouchableOpacity>

          {showQR && (
            <View style={styles.qrContainer}>
              <QRGenerator
                card={cardData}
                size={200}
                enableSave={true}
                onSaveSuccess={handleQRSaveSuccess}
                onError={handleQRError}
              />
              <Text style={styles.qrHelpText}>
                Scan this code to share your contact information
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Share Card</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  templateOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  templateOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedTemplate: {
    backgroundColor: '#007AFF',
  },
  templateText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  selectedTemplateText: {
    color: '#FFFFFF',
  },
  cardPreviewContainer: {
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPreview: {
    width: CARD_WIDTH,
  },
  qrSection: {
    marginBottom: 32,
  },
  qrToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  qrToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  qrHelpText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionButtons: {
    marginTop: 16,
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
