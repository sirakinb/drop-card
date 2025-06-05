import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserCard } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import BusinessCard from '../components/BusinessCard';
import QRGenerator from '../components/QRGenerator';

const TEMPLATES = ['professional', 'modern', 'creative'];

export default function CardPreviewScreen({ navigation }) {
  const { user } = useAuth();
  const { card, saveCard, loading: cardLoading } = useUserCard();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if this is a new user without a card
  useEffect(() => {
    console.log('CardPreviewScreen - cardLoading:', cardLoading, 'card:', !!card, 'user:', user ? user.email : 'No user');
    
    // Temporarily disable auto-redirect for debugging
    // Only redirect to CreateCard if we have an authenticated user, not loading, and no card
    // if (!cardLoading && !card && user) {
    //   console.log('Redirecting to CreateCard - new user without card');
    //   navigation.navigate('CreateCard');
    // }
  }, [card, cardLoading, user, navigation]);

  // Show loading while checking card status
  if (cardLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your card...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no card exists, show a create card prompt (fallback)
  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Create Your First Card</Text>
          <Text style={styles.emptySubtitle}>
            Start networking digitally by creating your business card
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateCard')}
          >
            <Text style={styles.createButtonText}>Create Card</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ... existing code ...
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20, // Increase padding for more breathing room
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Existing styles
  cardPreviewContainer: {
  },
}); 