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
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-community/voice';

export default function AddContactScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });
  // const [isRecording, setIsRecording] = useState(false); // Removed
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [recognizedTextForNote, setRecognizedTextForNote] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      setRecognizedTextForNote(''); // Clear previous recognized text
    };
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      // Logic to append text is now primarily in toggleDictation after Voice.stop()
    };
    Voice.onSpeechError = (e) => {
      setSpeechError(e.error?.message || JSON.stringify(e.error));
      setIsListening(false); // Ensure listening stops on error
    };
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecognizedTextForNote(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleVoiceNote = () => { // Renamed and modified
  //   setIsRecording(!isRecording);
  //   // In a real app, this would start/stop voice recording
  //   if (!isRecording) {
  //     Alert.alert('Voice Recording', 'Voice recording started');
  //   } else {
  //     Alert.alert('Voice Recording', 'Voice recording stopped');
  //   }
  // };

  const toggleDictation = async () => {
    try {
      if (isListening) {
        await Voice.stop(); // This will trigger onSpeechEnd, then the logic below
        setIsListening(false); // Explicitly set here too for safety
        if (recognizedTextForNote.trim()) {
          setFormData(prev => ({
            ...prev,
            notes: prev.notes ? prev.notes + ' ' + recognizedTextForNote.trim() : recognizedTextForNote.trim()
          }));
        }
        setRecognizedTextForNote(''); // Reset for next session
      } else {
        // setPartialResults([]); // Not used anymore
        setSpeechError('');
        setRecognizedTextForNote(''); // Clear before starting a new session
        await Voice.start('en-US');
        // setIsListening(true); // onSpeechStart will set this
      }
    } catch (e) {
      console.error("Error in toggleDictation: ", e);
      setSpeechError(JSON.stringify(e));
      setIsListening(false); // Ensure listening state is correct on error
      setRecognizedTextForNote(''); // Clear any partial recognized text on error
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    Alert.alert('Success', 'Contact saved successfully!');
    navigation.goBack();
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
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={toggleDictation}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={20}
              color={isListening ? "#fff" : "#000"}
            />
            <Text style={[styles.voiceButtonText, isListening && styles.voiceButtonTextActive]}>
              {isListening ? "Stop Dictation" : "Start Dictation"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Temporary display for debugging - REMOVED */}
        {/* <Text>Partial: {partialResults.join(' ')}</Text> */}
        {/* <Text>Error: {speechError}</Text> */}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Contact</Text>
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
}); 