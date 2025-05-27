import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShareScreen({ navigation }) {
  const handleShare = async (method) => {
    try {
      const result = await Share.share({
        message: 'Check out my DropCard! Connect with me digitally.',
        url: 'https://dropcard.app/johndoe', // This would be the actual card URL
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const shareOptions = [
    { id: 'qr', icon: 'qr-code', title: 'QR Code', subtitle: 'Show QR code for scanning' },
    { id: 'link', icon: 'link', title: 'Share Link', subtitle: 'Send via message or email' },
    { id: 'airdrop', icon: 'wifi', title: 'AirDrop', subtitle: 'Share with nearby devices' },
    { id: 'social', icon: 'share-social', title: 'Social Media', subtitle: 'Post to social platforms' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Share Your Card</Text>
        <Text style={styles.subtitle}>Choose how you'd like to share your DropCard</Text>

        <View style={styles.optionsContainer}>
          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.option}
              onPress={() => handleShare(option.id)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon} size={24} color="#000" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="copy" size={20} color="#000" />
            <Text style={styles.quickActionText}>Copy Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="mail" size={20} color="#000" />
            <Text style={styles.quickActionText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="chatbubble" size={20} color="#000" />
            <Text style={styles.quickActionText}>Message</Text>
          </TouchableOpacity>
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
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
}); 