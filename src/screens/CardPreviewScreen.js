import React, { useEffect } from 'react'; // useState, Alert, AsyncStorage removed
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  // Alert removed as context handles it
} from 'react-native';
// AsyncStorage import removed
import { Ionicons } from '@expo/vector-icons';
import { useCard } from '../context/CardContext'; // Import useCard
import { useIsFocused } from '@react-navigation/native'; // Import useIsFocused

export default function CardPreviewScreen({ navigation }) {
  const { cardData, isLoading, loadCard } = useCard(); // Use context
  const isFocused = useIsFocused();

  useEffect(() => {
    // Load data from context when the screen comes into focus
    // The context itself handles initial load, this is for refresh on focus
    if (isFocused) {
      loadCard();
    }
  }, [isFocused, loadCard]); // Added loadCard to dependency array

  const handleEdit = () => {
    navigation.navigate('CreateCard', {
      screen: 'CreateCard', 
      params: {
        cardData: cardData?.formData, 
        profileImage: cardData?.profileImage,
      },
    });
  };

  const handlePreview = () => {
    // In a real app, this would open a full preview modal
    console.log('Preview card');
  };

  const handleShare = () => {
    navigation.navigate('Main', { screen: 'Share' });
  };

  const handleMore = () => {
    // Show more options
    console.log('More options');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your DropCard</Text>
        
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <View style={styles.qrCode}>
                  <View style={[styles.qrDot, { top: 8, left: 8 }]} />
                  <View style={[styles.qrDot, { top: 8, right: 8 }]} />
                  <View style={[styles.qrDot, { bottom: 8, left: 8 }]} />
                  <View style={[styles.qrDot, { bottom: 8, right: 8 }]} />
                </View>
              </View>
            </View>
            
            <Text style={styles.scanText}>Scan to share card</Text>
            
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                {cardData?.profileImage ? (
                  <Image source={{ uri: cardData.profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person" size={24} color="#666" />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{cardData?.formData?.name || 'Name'}</Text>
                <Text style={styles.jobTitle}>{cardData?.formData?.title || 'Title'}</Text>
              </View>
            </View>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
        ) : !cardData ? ( // Check cardData from context
          <View style={styles.noCardContainer}>
            <Text style={styles.noCardText}>No card created yet.</Text>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => navigation.navigate('CreateCard')} // Navigate to CreateCard
            >
              <Text style={styles.createButtonText}>Create One Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color="#000" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handlePreview}>
            <Ionicons name="eye" size={20} color="#000" />
            <Text style={styles.actionText}>Preview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share" size={20} color="#000" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleMore}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
            <Text style={styles.actionText}>More</Text>
          </TouchableOpacity>
          </View>
        )}
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
    textAlign: 'center',
    marginBottom: 32,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  card: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrContainer: {
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    position: 'relative',
  },
  qrDot: {
    width: 16,
    height: 16,
    backgroundColor: '#000',
    position: 'absolute',
  },
  scanText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // To ensure the image respects border radius
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  saveButton: {
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noCardContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noCardText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 