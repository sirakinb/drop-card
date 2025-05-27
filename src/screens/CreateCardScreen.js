import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';

export default function CreateCardScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    title: 'Product Designer',
    company: 'Company Name',
    email: 'your@email.com',
  });
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handlePreview = () => {
    navigation.navigate('Main', { 
      screen: 'Cards',
      params: { cardData: formData, profileImage }
    });
  };

  const handleSave = () => {
    Alert.alert('Success', 'Card saved successfully!');
    navigation.navigate('Main', { 
      screen: 'Cards',
      params: { cardData: formData, profileImage }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Your Card</Text>
        <Text style={styles.subtitle}>Build your digital identity</Text>

        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person" size={40} color="#999" />
          </View>
          <View style={styles.uploadButton}>
            <Ionicons name="camera" size={16} color="#000" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="John Doe"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Product Designer"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(value) => handleInputChange('company', value)}
              placeholder="Company Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
            <Text style={styles.previewButtonText}>Preview Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Card</Text>
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  previewButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#f0f0f0',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 