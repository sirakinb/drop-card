import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// 1. Create Context
const ContactContext = createContext();

// 2. Create ContactProvider Component
export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const CONTACTS_STORAGE_KEY = 'userContacts';

  // Function to load contacts from AsyncStorage
  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (jsonValue !== null) {
        setContacts(JSON.parse(jsonValue));
      } else {
        setContacts([]); // Initialize with empty array if no contacts found
      }
    } catch (e) {
      console.error('Failed to load contacts from AsyncStorage in Context', e);
      Alert.alert('Error', 'Could not load contacts.');
      setContacts([]); // Ensure state is empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new contact
  const addContact = async (newContactData) => {
    // ID generation is expected to be done before calling addContact (e.g., in AddContactScreen)
    // Or, it could be done here if preferred. For now, assuming newContactData includes an ID.
    if (!newContactData.id) {
        // If ID is not provided, generate one.
        // This is a fallback, ideally ID is generated in the screen before calling this.
        newContactData.id = Date.now().toString();
    }

    setIsLoading(true);
    try {
      const currentContacts = contacts || []; // Use current state or empty array
      const updatedContacts = [...currentContacts, newContactData];
      
      const jsonValue = JSON.stringify(updatedContacts);
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, jsonValue);
      
      setContacts(updatedContacts); // Update state after successful save
      Alert.alert('Success', 'Contact saved successfully!');
    } catch (e) {
      console.error('Failed to save contact to AsyncStorage in Context', e);
      Alert.alert('Error', 'Could not save contact.');
      // Optionally, revert state or handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts on initial mount
  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <ContactContext.Provider value={{ contacts, isLoading, addContact, loadContacts }}>
      {children}
    </ContactContext.Provider>
  );
};

// 3. Create custom hook to use ContactContext
export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};
