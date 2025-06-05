import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.6; // Standard business card ratio

/**
 * BusinessCard component for displaying business card information
 * with multiple design templates
 * 
 * @param {Object} props
 * @param {Object} props.card - The business card data
 * @param {string} props.template - Template name: 'modern', 'professional', or 'creative'
 * @param {boolean} props.interactive - Whether the card should have interactive elements
 * @param {function} props.onPress - Function to call when card is pressed
 * @param {Object} props.style - Additional style for the card container
 */
const BusinessCard = ({ 
  card, 
  template = 'modern', 
  interactive = false,
  onPress,
  style = {}
}) => {
  if (!card) return null;

  // Default placeholder image for profile
  const defaultImage = require('../../assets/adaptive-icon.png');
  
  // Determine which template to render
  const renderTemplate = () => {
    switch (template) {
      case 'professional':
        return renderProfessionalTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'modern':
      default:
        return renderModernTemplate();
    }
  };

  // Modern template - Clean, minimal design with focus on typography
  const renderModernTemplate = () => (
    <View style={[styles.cardContainer, styles.modernCard, style]}>
      <View style={styles.modernContent}>
        <View style={styles.modernHeader}>
          {card.photoUri ? (
            <Image 
              source={{ uri: card.photoUri }} 
              style={styles.modernImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.modernImage, styles.placeholderImage]}>
              <Text style={styles.placeholderInitial}>
                {card.name ? card.name.charAt(0).toUpperCase() : ''}
              </Text>
            </View>
          )}
          
          <View style={styles.modernHeaderText}>
            <Text style={styles.modernName}>{card.name}</Text>
            {card.title && <Text style={styles.modernTitle}>{card.title}</Text>}
            {card.company && <Text style={styles.modernCompany}>{card.company}</Text>}
          </View>
        </View>
        
        <View style={styles.modernDivider} />
        
        <View style={styles.modernContactInfo}>
          {card.phone && (
            <View style={styles.modernContactItem}>
              <Ionicons name="call-outline" size={16} color="#555" />
              <Text style={styles.modernContactText}>{card.phone}</Text>
            </View>
          )}
          
          {card.email && (
            <View style={styles.modernContactItem}>
              <Ionicons name="mail-outline" size={16} color="#555" />
              <Text style={styles.modernContactText}>{card.email}</Text>
            </View>
          )}
          
          {card.website && (
            <View style={styles.modernContactItem}>
              <Ionicons name="globe-outline" size={16} color="#555" />
              <Text style={styles.modernContactText}>{card.website}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.modernSocial}>
          {card.linkedin && (
            <View style={styles.socialIcon}>
              <Ionicons name="logo-linkedin" size={18} color="#0077B5" />
            </View>
          )}
          
          {card.twitter && (
            <View style={styles.socialIcon}>
              <Ionicons name="logo-twitter" size={18} color="#1DA1F2" />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Professional template - Traditional business card with structured information
  const renderProfessionalTemplate = () => (
    <View style={[styles.cardContainer, styles.professionalCard, style]}>
      <View style={styles.professionalHeader}>
        {card.company && (
          <Text style={styles.professionalCompany}>{card.company.toUpperCase()}</Text>
        )}
      </View>
      
      <View style={styles.professionalContent}>
        <View style={styles.professionalMain}>
          <View style={styles.professionalNameSection}>
            <Text style={styles.professionalName}>{card.name}</Text>
            {card.title && <Text style={styles.professionalTitle}>{card.title}</Text>}
          </View>
          
          {card.photoUri ? (
            <Image 
              source={{ uri: card.photoUri }} 
              style={styles.professionalImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.professionalImage, styles.placeholderImage]}>
              <Text style={styles.placeholderInitial}>
                {card.name ? card.name.charAt(0).toUpperCase() : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.professionalDivider} />
        
        <View style={styles.professionalContactInfo}>
          {card.phone && (
            <View style={styles.professionalContactItem}>
              <Ionicons name="call" size={14} color="#333" />
              <Text style={styles.professionalContactText}>{card.phone}</Text>
            </View>
          )}
          
          {card.email && (
            <View style={styles.professionalContactItem}>
              <Ionicons name="mail" size={14} color="#333" />
              <Text style={styles.professionalContactText}>{card.email}</Text>
            </View>
          )}
          
          {card.website && (
            <View style={styles.professionalContactItem}>
              <Ionicons name="globe" size={14} color="#333" />
              <Text style={styles.professionalContactText}>{card.website}</Text>
            </View>
          )}
          
          <View style={styles.professionalSocial}>
            {card.linkedin && <Ionicons name="logo-linkedin" size={16} color="#0077B5" />}
            {card.twitter && <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />}
          </View>
        </View>
      </View>
    </View>
  );

  // Creative template - More visually interesting with color accents
  const renderCreativeTemplate = () => (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={[styles.cardContainer, styles.creativeCard, style]}
    >
      <View style={styles.creativeContent}>
        <View style={styles.creativeHeader}>
          {card.photoUri ? (
            <Image 
              source={{ uri: card.photoUri }} 
              style={styles.creativeImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.creativeImage, styles.creativePlaceholder]}>
              <Text style={styles.creativePlaceholderText}>
                {card.name ? card.name.charAt(0).toUpperCase() : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.creativeNameSection}>
          <Text style={styles.creativeName}>{card.name}</Text>
          {card.title && <Text style={styles.creativeTitle}>{card.title}</Text>}
          {card.company && <Text style={styles.creativeCompany}>{card.company}</Text>}
        </View>
        
        <View style={styles.creativeDivider} />
        
        <View style={styles.creativeContactInfo}>
          {card.phone && (
            <View style={styles.creativeContactItem}>
              <Ionicons name="call-outline" size={14} color="#fff" />
              <Text style={styles.creativeContactText}>{card.phone}</Text>
            </View>
          )}
          
          {card.email && (
            <View style={styles.creativeContactItem}>
              <Ionicons name="mail-outline" size={14} color="#fff" />
              <Text style={styles.creativeContactText}>{card.email}</Text>
            </View>
          )}
          
          {card.website && (
            <View style={styles.creativeContactItem}>
              <Ionicons name="globe-outline" size={14} color="#fff" />
              <Text style={styles.creativeContactText}>{card.website}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.creativeSocial}>
          {card.linkedin && (
            <View style={styles.creativeSocialIcon}>
              <Ionicons name="logo-linkedin" size={18} color="#fff" />
            </View>
          )}
          
          {card.twitter && (
            <View style={styles.creativeSocialIcon}>
              <Ionicons name="logo-twitter" size={18} color="#fff" />
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  // Wrap in TouchableOpacity if interactive
  if (interactive && onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.interactiveContainer}
      >
        {renderTemplate()}
      </TouchableOpacity>
    );
  }

  return renderTemplate();
};

const styles = StyleSheet.create({
  interactiveContainer: {
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Modern template styles
  modernCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modernContent: {
    flex: 1,
    padding: 20,
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  modernHeaderText: {
    flex: 1,
  },
  modernName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modernTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  modernCompany: {
    fontSize: 14,
    color: '#777',
  },
  modernDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  modernContactInfo: {
    marginBottom: 15,
  },
  modernContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernContactText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
  },
  modernSocial: {
    flexDirection: 'row',
  },
  socialIcon: {
    marginRight: 12,
  },
  
  // Professional template styles
  professionalCard: {
    backgroundColor: '#f8f8f8',
  },
  professionalHeader: {
    backgroundColor: '#333',
    padding: 12,
    alignItems: 'center',
  },
  professionalCompany: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  professionalContent: {
    flex: 1,
    padding: 16,
  },
  professionalMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionalNameSection: {
    flex: 1,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  professionalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  professionalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  professionalDivider: {
    height: 1,
    backgroundColor: '#d0d0d0',
    marginVertical: 12,
  },
  professionalContactInfo: {
    marginTop: 8,
  },
  professionalContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  professionalContactText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 8,
  },
  professionalSocial: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  
  // Creative template styles
  creativeCard: {
    borderRadius: 12,
  },
  creativeContent: {
    flex: 1,
    padding: 20,
  },
  creativeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  creativeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
  },
  creativePlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creativePlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  creativeNameSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  creativeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  creativeTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  creativeCompany: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  creativeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 12,
  },
  creativeContactInfo: {
    marginBottom: 12,
  },
  creativeContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creativeContactText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  creativeSocial: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  creativeSocialIcon: {
    marginHorizontal: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Placeholder styles
  placeholderImage: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
});

export default BusinessCard;
