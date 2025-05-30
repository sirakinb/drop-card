import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// 1. Create Context
const CardContext = createContext();

// 2. Create CardProvider Component
export const CardProvider = ({ children }) => {
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const CARD_STORAGE_KEY = 'userCard';

  // Function to load card data from AsyncStorage
  const loadCard = async () => {
    setIsLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem(CARD_STORAGE_KEY);
      if (jsonValue !== null) {
        setCardData(JSON.parse(jsonValue));
      } else {
        setCardData(null); // Explicitly set to null if no card found
      }
    } catch (e) {
      console.error('Failed to load card from AsyncStorage in Context', e);
      Alert.alert('Error', 'Could not load card data.');
      setCardData(null); // Ensure state is null on error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save card data to AsyncStorage and update state
  const saveCard = async (newCardData) => {
    setIsLoading(true);
    try {
      const jsonValue = JSON.stringify(newCardData);
      await AsyncStorage.setItem(CARD_STORAGE_KEY, jsonValue);
      setCardData(newCardData); // Update state after successful save
      Alert.alert('Success', 'Card saved successfully!');
    } catch (e) {
      console.error('Failed to save card to AsyncStorage in Context', e);
      Alert.alert('Error', 'Could not save card data.');
      // Optionally, revert cardData state or handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  // Load card data on initial mount
  useEffect(() => {
    loadCard();
  }, []);

  return (
    <CardContext.Provider value={{ cardData, isLoading, saveCard, loadCard }}>
      {children}
    </CardContext.Provider>
  );
};

// 3. Create custom hook to use CardContext
export const useCard = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCard must be used within a CardProvider');
  }
  return context;
};
