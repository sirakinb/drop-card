import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
// AsyncStorage import removed
import { Ionicons } from '@expo/vector-icons';
import { useContacts } from '../context/ContactContext'; // Import useContacts

export default function AddContactScreen({ navigation, route }) {
  const { addContact, isLoading: isContextLoading } = useContacts(); // Use context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    company: '',
    notes: '',
  });
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (route.params?.scannedData) {
      const { name, email, title, company } = route.params.scannedData;
      setFormData(prev => ({
        ...prev,
        name: name || prev.name,
        email: email || prev.email,
        title: title || prev.title,
        company: company || prev.company,
      }));
    }
  }, [route.params?.scannedData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      Alert.alert('Voice Recording', 'Voice recording started');
    } else {
      Alert.alert('Voice Recording', 'Voice recording stopped');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name.'); // Local validation alert
      return;
    }

    const newContact = {
      id: Date.now().toString(), // Generate ID here
      ...formData, // Spread existing form data
    };

    // Call addContact from context. It handles its own alerts for success/failure.
    await addContact(newContact); 

    // Check if context is not loading (i.e., addContact has finished)
    // and then navigate. The alert for success/failure is handled by addContact itself.
    // A more robust way might be for addContact to return a status or for errors to be thrown
    // and caught here, but for now, relying on its internal alert and then navigating is okay.
    if (!isContextLoading) { 
        // Check navigation.canGoBack() before going back if there's any doubt.
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Contact</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add Contact</Text>
        <Text style={styles.subtitle}>Add a quick note to remember this contact.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter title (e.g., Software Engineer)"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company name"
              value={formData.company}
              onChangeText={(value) => handleInputChange('company', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes about this contact"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={handleVoiceNote}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={20} 
              color={isRecording ? "#fff" : "#000"} 
            />
            <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextActive]}>
              {isRecording ? "Stop Recording" : "Add Voice Note"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isContextLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isContextLoading}
        >
          <Text style={styles.saveButtonText}>
            {isContextLoading ? 'Saving...' : 'Save Contact'}
          </Text>
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
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  input: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    gap: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ff4444',
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  voiceButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc', // Optional: style for disabled button
  }
}); 