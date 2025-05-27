import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AIFollowUpScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    name: 'Sarah',
    email: 'sarah@company.com',
  };

  const [message, setMessage] = useState(
    `Hi ${contact.name}, I wanted to follow up on our conversation last week about the project timeline. Are you available for a quick call tomorrow to discuss the next steps? Looking forward to hearing from you.`
  );

  const handleCopyMessage = () => {
    Clipboard.setString(message);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const handleSendLater = () => {
    Alert.alert('Scheduled', 'Message scheduled to send later');
  };

  const handleEditMessage = () => {
    Alert.alert('Edit Message', 'Message editing functionality would be implemented here');
  };

  const handleRegenerate = () => {
    const messages = [
      `Hi ${contact.name}, I wanted to follow up on our conversation last week about the project timeline. Are you available for a quick call tomorrow to discuss the next steps? Looking forward to hearing from you.`,
      `Hello ${contact.name}, Hope you're doing well! I wanted to circle back on our discussion about the upcoming project. Would you be free for a brief chat this week to go over the details? Thanks!`,
      `Hi ${contact.name}, Thanks for the great conversation last week. I'd love to continue our discussion about the project when you have a moment. Let me know when works best for you!`,
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Follow-Up</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>AI Follow-Up</Text>
        <Text style={styles.subtitle}>Smart message generated for you</Text>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCopyMessage}>
            <Ionicons name="copy" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Copy Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSendLater}>
            <Ionicons name="time" size={20} color="#000" />
            <Text style={styles.secondaryButtonText}>Send Later</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleEditMessage}>
            <Ionicons name="pencil" size={20} color="#000" />
            <Text style={styles.secondaryButtonText}>Edit Message</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
          <Ionicons name="refresh" size={20} color="#666" />
          <Text style={styles.regenerateText}>Regenerate message</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
  messageContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8,
  },
  regenerateText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
}); 