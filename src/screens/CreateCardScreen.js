import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUserCard } from '../context/AppContext';

// Debounce function for auto-save
const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

export default function CreateCardScreen({ navigation, route }) {
  const { draftCard, saveCard, saveDraftCard, loading } = useUserCard();
  const editMode = route.params?.editMode || false;
  const initialCardData = route.params?.cardData || null;
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    bio: '',
    photoUri: null,
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (initialCardData) {
        // If editing existing card
        setFormData(initialCardData);
      } else if (draftCard) {
        // If draft exists
        setFormData(draftCard);
      }
    };

    loadInitialData();
    
    // Request permissions for image picker
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add a profile image.'
        );
      }
    })();
  }, [initialCardData, draftCard]);

  // Auto-save draft when form changes
  const autoSaveDraft = useCallback(
    debounce((data) => {
      saveDraftCard(data);
    }, 1000),
    [saveDraftCard]
  );

  // Handle input changes
  const handleInputChange = (field, value) => {
    const updatedFormData = {
      ...formData,
      [field]: value,
    };
    
    setFormData(updatedFormData);
    
    // Clear error for this field if any
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Auto-save draft
    autoSaveDraft(updatedFormData);
  };

  // Image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        handleInputChange('photoUri', photoUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    
    // Email format validation
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    
    // Website URL validation
    if (formData.website && formData.website.trim() !== '') {
      try {
        new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`);
      } catch (e) {
        newErrors.website = 'Invalid website URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle preview
  const handlePreview = () => {
    if (validateForm()) {
      navigation.navigate('CardPreview', { cardData: formData });
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        // You would need a ref to the scroll view and inputs to implement scrolling to error
        Alert.alert('Validation Error', `Please fix the following error: ${errors[firstErrorField]}`);
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Save card using context
      const savedCard = await saveCard(formData);
      
      if (savedCard) {
        Alert.alert(
          'Success', 
          'Card saved successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('CardPreview', { cardData: savedCard }) }]
        );
      } else {
        throw new Error('Failed to save card');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save card. Please try again.');
      console.error('Save card error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
      >
        <Text style={styles.title}>{editMode ? 'Edit Your Card' : 'Create Your Card'}</Text>
        <Text style={styles.subtitle}>Build your digital identity</Text>

        {/* Profile Image Picker */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {formData.photoUri ? (
            <Image source={{ uri: formData.photoUri }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={40} color="#999" />
            </View>
          )}
          <View style={styles.uploadButton}>
            <Ionicons name="camera" size={16} color="#000" />
            <Text style={styles.uploadText}>
              {formData.photoUri ? 'Change Photo' : 'Upload Photo'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="John Doe"
              placeholderTextColor="#999"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Title Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Product Designer"
              placeholderTextColor="#999"
            />
          </View>

          {/* Company Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(value) => handleInputChange('company', value)}
              placeholder="Company Name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="(123) 456-7890"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          {/* Website Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={[styles.input, errors.website && styles.inputError]}
              value={formData.website}
              onChangeText={(value) => handleInputChange('website', value)}
              placeholder="www.example.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="url"
            />
            {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
          </View>

          {/* LinkedIn Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn</Text>
            <TextInput
              style={styles.input}
              value={formData.linkedin}
              onChangeText={(value) => handleInputChange('linkedin', value)}
              placeholder="username or full URL"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          {/* Twitter Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={formData.twitter}
              onChangeText={(value) => handleInputChange('twitter', value)}
              placeholder="@username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          {/* Bio Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="A brief description about yourself"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.previewButton} 
            onPress={handlePreview}
            disabled={loading || isSaving}
          >
            <Text style={styles.previewButtonText}>Preview Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={loading || isSaving}
          >
            {loading || isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Card</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Auto-save indicator */}
        {loading && (
          <Text style={styles.autoSaveText}>Auto-saving...</Text>
        )}
      </KeyboardAwareScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  required: {
    color: '#ff3b30',
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
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    backgroundColor: '#007AFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  autoSaveText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
});
