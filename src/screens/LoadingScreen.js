import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function LoadingScreen() {
  const handleForceReset = async () => {
    try {
      console.log('🚨 MANUAL FORCE RESET TRIGGERED');
      await AsyncStorage.clear();
      await supabase.auth.signOut();
      Alert.alert('Debug', 'Auth forcefully cleared. App should reload.');
      // Force app reload
      window.location?.reload?.(); // For web
    } catch (error) {
      console.error('Error in manual reset:', error);
      Alert.alert('Error', 'Failed to reset auth');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="card" size={64} color="#000" />
          <Text style={styles.appName}>DropCard</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>

        {/* Debug button - remove in production */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={handleForceReset}
        >
          <Text style={styles.debugButtonText}>Force Reset Auth</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 