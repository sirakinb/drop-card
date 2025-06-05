import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import StorageService from '../utils/storage';

// Create contexts for different domains
const UserCardContext = createContext();
const ContactsContext = createContext();
const SettingsContext = createContext();

/**
 * Main App Context Provider that combines all context providers
 * @param {Object} props - Component props
 */
export const AppContextProvider = ({ children }) => {
  // Initialize storage on first load
  useEffect(() => {
    StorageService.initialize();
  }, []);

  return (
    <SettingsProvider>
      <UserCardProvider>
        <ContactsProvider>
          {children}
        </ContactsProvider>
      </UserCardProvider>
    </SettingsProvider>
  );
};

/**
 * Provider for user's business cards
 */
const UserCardProvider = ({ children }) => {
  const [userCards, setUserCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftCard, setDraftCard] = useState(null);

  // Load user cards from storage on mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        
        // Load all user cards
        const cards = await StorageService.getAllUserCards();
        setUserCards(cards || []);
        
        // Load current primary card
        const primary = await StorageService.getUserCard();
        setCurrentCard(primary);
        
        // Load draft card if exists
        const draft = await StorageService.getDraftCard();
        setDraftCard(draft);
      } catch (error) {
        console.error('Error loading user cards:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  /**
   * Create or update a user card
   * @param {Object} cardData - The card data to save
   */
  const saveCard = useCallback(async (cardData) => {
    try {
      setLoading(true);
      
      // Save to storage
      const savedCard = await StorageService.saveCard(cardData);
      
      if (savedCard) {
        // Update state
        setCurrentCard(savedCard);
        
        // Update cards list
        setUserCards(prevCards => {
          const existingIndex = prevCards.findIndex(c => c.id === savedCard.id);
          if (existingIndex >= 0) {
            return prevCards.map(c => c.id === savedCard.id ? savedCard : c);
          } else {
            return [...prevCards, savedCard];
          }
        });
        
        // Clear draft after successful save
        await StorageService.clearDraftCard();
        setDraftCard(null);
      }
      
      return savedCard;
    } catch (error) {
      console.error('Error saving card:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a user card
   * @param {string} cardId - The ID of the card to delete
   */
  const deleteCard = useCallback(async (cardId) => {
    try {
      setLoading(true);
      
      // Delete from storage
      const success = await StorageService.deleteCard(cardId);
      
      if (success) {
        // Update state
        setUserCards(prevCards => prevCards.filter(c => c.id !== cardId));
        
        // If this was the current card, update current card
        if (currentCard && currentCard.id === cardId) {
          const newPrimary = await StorageService.getUserCard();
          setCurrentCard(newPrimary);
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentCard]);

  /**
   * Set a card as the primary/default card
   * @param {string} cardId - The ID of the card to set as primary
   */
  const setDefaultCard = useCallback(async (cardId) => {
    try {
      setLoading(true);
      
      // Find the card in our list
      const card = userCards.find(c => c.id === cardId);
      if (!card) return false;
      
      // Save as primary card
      await StorageService.saveCard(card); // This sets it as primary
      
      // Update settings
      await StorageService.setDefaultCard(cardId);
      
      // Update state
      setCurrentCard(card);
      
      return true;
    } catch (error) {
      console.error('Error setting default card:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userCards]);

  /**
   * Save a draft card
   * @param {Object} cardData - The draft card data
   */
  const saveDraftCard = useCallback(async (cardData) => {
    try {
      // Save to storage
      await StorageService.saveDraftCard(cardData);
      
      // Update state
      setDraftCard(cardData);
      
      return true;
    } catch (error) {
      console.error('Error saving draft card:', error);
      return false;
    }
  }, []);

  const value = {
    userCards,
    currentCard,
    draftCard,
    loading,
    saveCard,
    deleteCard,
    setDefaultCard,
    saveDraftCard,
    hasCards: userCards.length > 0,
  };

  return (
    <UserCardContext.Provider value={value}>
      {children}
    </UserCardContext.Provider>
  );
};

/**
 * Provider for contacts management
 */
const ContactsProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // Load contacts from storage on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const loadedContacts = await StorageService.getAllContacts();
        setContacts(loadedContacts || []);
        setFilteredContacts(loadedContacts || []);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, []);

  // Filter contacts when search query or active tag changes
  useEffect(() => {
    const filterContacts = async () => {
      try {
        setLoading(true);
        
        let filtered = [...contacts];
        
        // Apply search filter if query exists
        if (searchQuery && searchQuery.trim() !== '') {
          filtered = await StorageService.searchContacts(searchQuery);
        }
        
        // Apply tag filter if tag exists
        if (activeTag && activeTag.trim() !== '') {
          // If we already filtered by search, filter the results further
          if (searchQuery && searchQuery.trim() !== '') {
            filtered = filtered.filter(contact => 
              contact.tags && 
              Array.isArray(contact.tags) && 
              contact.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase())
            );
          } else {
            // Otherwise filter all contacts by tag
            filtered = await StorageService.filterContactsByTag(activeTag);
          }
        }
        
        setFilteredContacts(filtered);
      } catch (error) {
        console.error('Error filtering contacts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    filterContacts();
  }, [contacts, searchQuery, activeTag]);

  /**
   * Save a contact
   * @param {Object} contactData - The contact data to save
   */
  const saveContact = useCallback(async (contactData) => {
    try {
      setLoading(true);
      
      // Save to storage
      const savedContact = await StorageService.saveContact(contactData);
      
      if (savedContact) {
        // Update state
        setContacts(prevContacts => {
          const existingIndex = prevContacts.findIndex(c => c.id === savedContact.id);
          if (existingIndex >= 0) {
            return prevContacts.map(c => c.id === savedContact.id ? savedContact : c);
          } else {
            return [...prevContacts, savedContact];
          }
        });
      }
      
      return savedContact;
    } catch (error) {
      console.error('Error saving contact:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a contact
   * @param {string} contactId - The ID of the contact to delete
   */
  const deleteContact = useCallback(async (contactId) => {
    try {
      setLoading(true);
      
      // Delete from storage
      const success = await StorageService.deleteContact(contactId);
      
      if (success) {
        // Update state
        setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search contacts by query
   * @param {string} query - The search query
   */
  const searchContacts = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /**
   * Filter contacts by tag
   * @param {string} tag - The tag to filter by
   */
  const filterByTag = useCallback((tag) => {
    setActiveTag(tag);
  }, []);

  /**
   * Get all unique tags from contacts
   */
  const getAllTags = useCallback(() => {
    const tagsSet = new Set();
    
    contacts.forEach(contact => {
      if (contact.tags && Array.isArray(contact.tags)) {
        contact.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet);
  }, [contacts]);

  const value = {
    contacts,
    filteredContacts,
    loading,
    searchQuery,
    activeTag,
    saveContact,
    deleteContact,
    searchContacts,
    filterByTag,
    getAllTags,
    clearFilters: () => {
      setSearchQuery('');
      setActiveTag('');
    },
    hasContacts: contacts.length > 0,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
};

/**
 * Provider for app settings
 */
const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    defaultCardId: null,
    aiApiKey: '',
    enableVoiceNotes: true,
  });
  const [loading, setLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const loadedSettings = await StorageService.getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  /**
   * Update settings
   * @param {Object} newSettings - The new settings to apply
   */
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      
      // Save to storage
      const updatedSettings = await StorageService.updateSettings(newSettings);
      
      if (updatedSettings) {
        // Update state
        setSettings(updatedSettings);
      }
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggle theme between light and dark
   */
  const toggleTheme = useCallback(async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    return await updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);

  /**
   * Set the API key for AI features
   * @param {string} apiKey - The API key
   */
  const setApiKey = useCallback(async (apiKey) => {
    return await updateSettings({ aiApiKey: apiKey });
  }, [updateSettings]);

  /**
   * Toggle voice notes feature
   */
  const toggleVoiceNotes = useCallback(async () => {
    return await updateSettings({ enableVoiceNotes: !settings.enableVoiceNotes });
  }, [settings.enableVoiceNotes, updateSettings]);

  /**
   * Clear all app data
   */
  const clearAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clear data from storage
      const success = await StorageService.clearAllData();
      
      if (success) {
        // Reset settings to default
        const defaultSettings = await StorageService.getSettings();
        setSettings(defaultSettings);
      }
      
      return success;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    settings,
    loading,
    updateSettings,
    toggleTheme,
    setApiKey,
    toggleVoiceNotes,
    clearAllData,
    isDarkMode: settings.theme === 'dark',
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hooks for consuming the contexts
export const useUserCard = () => useContext(UserCardContext);
export const useContacts = () => useContext(ContactsContext);
export const useSettings = () => useContext(SettingsContext);

export default AppContextProvider;
