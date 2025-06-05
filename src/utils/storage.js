import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

// Storage keys
const STORAGE_KEYS = {
  USER_CARD: '@dropcard:user_card',
  USER_CARDS: '@dropcard:user_cards', // For multiple cards support
  CONTACTS: '@dropcard:contacts',
  SETTINGS: '@dropcard:settings',
  DRAFT_CARD: '@dropcard:draft_card',
};

/**
 * Default settings for the app
 */
const DEFAULT_SETTINGS = {
  theme: 'light',
  defaultCardId: null,
  aiApiKey: '',
  enableVoiceNotes: true,
};

/**
 * Validates a business card object
 * @param {Object} card - The business card to validate
 * @returns {boolean} - Whether the card is valid
 */
const validateCard = (card) => {
  // Required fields
  if (!card.name || !card.name.trim()) {
    return false;
  }
  
  // Email format validation if provided
  if (card.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(card.email)) {
    return false;
  }
  
  return true;
};

/**
 * Validates a contact object
 * @param {Object} contact - The contact to validate
 * @returns {boolean} - Whether the contact is valid
 */
const validateContact = (contact) => {
  // Must have card data with at least a name
  if (!contact.cardData || !contact.cardData.name || !contact.cardData.name.trim()) {
    return false;
  }
  
  return true;
};

/**
 * Storage service for business cards, contacts, and settings
 */
const StorageService = {
  /**
   * Initialize storage with default values if needed
   */
  initialize: async () => {
    try {
      // Check if settings exist, if not create defaults
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!settings) {
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      
      // Initialize empty arrays for cards and contacts if they don't exist
      const userCards = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARDS);
      if (!userCards) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify([]));
      }
      
      const contacts = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (!contacts) {
        await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify([]));
      }
      
      return true;
    } catch (error) {
      console.error('Storage initialization error:', error);
      return false;
    }
  },
  
  // ======== BUSINESS CARD OPERATIONS ========
  
  /**
   * Save a business card
   * @param {Object} cardData - The card data to save
   * @returns {Promise<Object|null>} - The saved card or null if error
   */
  saveCard: async (cardData) => {
    try {
      if (!validateCard(cardData)) {
        throw new Error('Invalid card data');
      }
      
      // Create a new card with ID if it doesn't have one
      const card = {
        ...cardData,
        id: cardData.id || uuid.v4(),
        createdAt: cardData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save as primary user card
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CARD, JSON.stringify(card));
      
      // Also add to user cards array
      const userCardsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARDS);
      let userCards = userCardsJson ? JSON.parse(userCardsJson) : [];
      
      // Update if exists, otherwise add
      const existingCardIndex = userCards.findIndex(c => c.id === card.id);
      if (existingCardIndex >= 0) {
        userCards[existingCardIndex] = card;
      } else {
        userCards.push(card);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(userCards));
      
      // Update default card in settings if this is the first card
      if (userCards.length === 1) {
        const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        const settings = settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
        
        if (!settings.defaultCardId) {
          settings.defaultCardId = card.id;
          await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        }
      }
      
      return card;
    } catch (error) {
      console.error('Error saving card:', error);
      return null;
    }
  },
  
  /**
   * Get the primary user card
   * @returns {Promise<Object|null>} - The user card or null if not found
   */
  getUserCard: async () => {
    try {
      const cardJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARD);
      return cardJson ? JSON.parse(cardJson) : null;
    } catch (error) {
      console.error('Error getting user card:', error);
      return null;
    }
  },
  
  /**
   * Get all user cards
   * @returns {Promise<Array>} - Array of user cards
   */
  getAllUserCards: async () => {
    try {
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARDS);
      return cardsJson ? JSON.parse(cardsJson) : [];
    } catch (error) {
      console.error('Error getting all user cards:', error);
      return [];
    }
  },
  
  /**
   * Get a card by ID
   * @param {string} id - The card ID
   * @returns {Promise<Object|null>} - The card or null if not found
   */
  getCardById: async (id) => {
    try {
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARDS);
      const cards = cardsJson ? JSON.parse(cardsJson) : [];
      return cards.find(card => card.id === id) || null;
    } catch (error) {
      console.error('Error getting card by ID:', error);
      return null;
    }
  },
  
  /**
   * Delete a card
   * @param {string} id - The card ID to delete
   * @returns {Promise<boolean>} - Success status
   */
  deleteCard: async (id) => {
    try {
      // Get all cards
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARDS);
      let cards = cardsJson ? JSON.parse(cardsJson) : [];
      
      // Filter out the card to delete
      cards = cards.filter(card => card.id !== id);
      
      // Save the updated cards array
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(cards));
      
      // If this was the primary card, update it
      const primaryCardJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_CARD);
      if (primaryCardJson) {
        const primaryCard = JSON.parse(primaryCardJson);
        if (primaryCard.id === id) {
          // Set a new primary card or clear it
          if (cards.length > 0) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_CARD, JSON.stringify(cards[0]));
          } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_CARD);
          }
        }
      }
      
      // Update settings if this was the default card
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        if (settings.defaultCardId === id) {
          settings.defaultCardId = cards.length > 0 ? cards[0].id : null;
          await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  },
  
  /**
   * Save a draft card
   * @param {Object} cardData - The draft card data
   * @returns {Promise<boolean>} - Success status
   */
  saveDraftCard: async (cardData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_CARD, JSON.stringify({
        ...cardData,
        updatedAt: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      console.error('Error saving draft card:', error);
      return false;
    }
  },
  
  /**
   * Get the draft card
   * @returns {Promise<Object|null>} - The draft card or null if not found
   */
  getDraftCard: async () => {
    try {
      const draftJson = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_CARD);
      return draftJson ? JSON.parse(draftJson) : null;
    } catch (error) {
      console.error('Error getting draft card:', error);
      return null;
    }
  },
  
  /**
   * Clear the draft card
   * @returns {Promise<boolean>} - Success status
   */
  clearDraftCard: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_CARD);
      return true;
    } catch (error) {
      console.error('Error clearing draft card:', error);
      return false;
    }
  },
  
  // ======== CONTACT OPERATIONS ========
  
  /**
   * Save a contact
   * @param {Object} contactData - The contact data to save
   * @returns {Promise<Object|null>} - The saved contact or null if error
   */
  saveContact: async (contactData) => {
    try {
      if (!validateContact(contactData)) {
        throw new Error('Invalid contact data');
      }
      
      // Create a new contact with ID if it doesn't have one
      const contact = {
        ...contactData,
        id: contactData.id || uuid.v4(),
        createdAt: contactData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Get existing contacts
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      let contacts = contactsJson ? JSON.parse(contactsJson) : [];
      
      // Update if exists, otherwise add
      const existingContactIndex = contacts.findIndex(c => c.id === contact.id);
      if (existingContactIndex >= 0) {
        contacts[existingContactIndex] = contact;
      } else {
        contacts.push(contact);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      
      return contact;
    } catch (error) {
      console.error('Error saving contact:', error);
      return null;
    }
  },
  
  /**
   * Get all contacts
   * @returns {Promise<Array>} - Array of contacts
   */
  getAllContacts: async () => {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      return contactsJson ? JSON.parse(contactsJson) : [];
    } catch (error) {
      console.error('Error getting all contacts:', error);
      return [];
    }
  },
  
  /**
   * Get a contact by ID
   * @param {string} id - The contact ID
   * @returns {Promise<Object|null>} - The contact or null if not found
   */
  getContactById: async (id) => {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      const contacts = contactsJson ? JSON.parse(contactsJson) : [];
      return contacts.find(contact => contact.id === id) || null;
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      return null;
    }
  },
  
  /**
   * Delete a contact
   * @param {string} id - The contact ID to delete
   * @returns {Promise<boolean>} - Success status
   */
  deleteContact: async (id) => {
    try {
      // Get all contacts
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      let contacts = contactsJson ? JSON.parse(contactsJson) : [];
      
      // Filter out the contact to delete
      contacts = contacts.filter(contact => contact.id !== id);
      
      // Save the updated contacts array
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  },
  
  /**
   * Search contacts by query string
   * @param {string} query - The search query
   * @returns {Promise<Array>} - Array of matching contacts
   */
  searchContacts: async (query) => {
    try {
      if (!query || query.trim() === '') {
        return StorageService.getAllContacts();
      }
      
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      const contacts = contactsJson ? JSON.parse(contactsJson) : [];
      
      const normalizedQuery = query.toLowerCase().trim();
      
      return contacts.filter(contact => {
        const { cardData } = contact;
        
        // Search in name, company, title, email, and notes
        return (
          (cardData.name && cardData.name.toLowerCase().includes(normalizedQuery)) ||
          (cardData.company && cardData.company.toLowerCase().includes(normalizedQuery)) ||
          (cardData.title && cardData.title.toLowerCase().includes(normalizedQuery)) ||
          (cardData.email && cardData.email.toLowerCase().includes(normalizedQuery)) ||
          (contact.notes && contact.notes.toLowerCase().includes(normalizedQuery))
        );
      });
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  },
  
  /**
   * Filter contacts by tag
   * @param {string} tag - The tag to filter by
   * @returns {Promise<Array>} - Array of contacts with the tag
   */
  filterContactsByTag: async (tag) => {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      const contacts = contactsJson ? JSON.parse(contactsJson) : [];
      
      if (!tag || tag.trim() === '') {
        return contacts;
      }
      
      const normalizedTag = tag.toLowerCase().trim();
      
      return contacts.filter(contact => {
        return contact.tags && 
               Array.isArray(contact.tags) && 
               contact.tags.some(t => t.toLowerCase() === normalizedTag);
      });
    } catch (error) {
      console.error('Error filtering contacts by tag:', error);
      return [];
    }
  },
  
  // ======== SETTINGS OPERATIONS ========
  
  /**
   * Get app settings
   * @returns {Promise<Object>} - The app settings
   */
  getSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },
  
  /**
   * Update app settings
   * @param {Object} newSettings - The settings to update
   * @returns {Promise<Object|null>} - The updated settings or null if error
   */
  updateSettings: async (newSettings) => {
    try {
      const currentSettingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const currentSettings = currentSettingsJson ? JSON.parse(currentSettingsJson) : DEFAULT_SETTINGS;
      
      const updatedSettings = {
        ...currentSettings,
        ...newSettings,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  },
  
  /**
   * Set default card ID in settings
   * @param {string} cardId - The card ID to set as default
   * @returns {Promise<boolean>} - Success status
   */
  setDefaultCard: async (cardId) => {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const settings = settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
      
      settings.defaultCardId = cardId;
      
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      
      return true;
    } catch (error) {
      console.error('Error setting default card:', error);
      return false;
    }
  },
  
  // ======== DATA EXPORT/IMPORT ========
  
  /**
   * Export all contacts as a CSV string
   * @returns {Promise<string|null>} - CSV string or null if error
   */
  exportContactsAsCSV: async () => {
    try {
      const contacts = await StorageService.getAllContacts();
      
      if (contacts.length === 0) {
        return '';
      }
      
      // CSV header
      let csv = 'Name,Title,Company,Email,Phone,Website,Notes,Meeting Context,Created Date\n';
      
      // Add each contact as a row
      contacts.forEach(contact => {
        const { cardData } = contact;
        
        // Escape fields that might contain commas
        const escapeCsvField = (field) => {
          if (!field) return '';
          const stringField = String(field);
          return stringField.includes(',') ? `"${stringField}"` : stringField;
        };
        
        csv += [
          escapeCsvField(cardData.name),
          escapeCsvField(cardData.title),
          escapeCsvField(cardData.company),
          escapeCsvField(cardData.email),
          escapeCsvField(cardData.phone),
          escapeCsvField(cardData.website),
          escapeCsvField(contact.notes),
          escapeCsvField(contact.meetingContext),
          new Date(contact.createdAt).toLocaleDateString(),
        ].join(',') + '\n';
      });
      
      return csv;
    } catch (error) {
      console.error('Error exporting contacts as CSV:', error);
      return null;
    }
  },
  
  /**
   * Clear all app data
   * @returns {Promise<boolean>} - Success status
   */
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_CARD,
        STORAGE_KEYS.USER_CARDS,
        STORAGE_KEYS.CONTACTS,
        STORAGE_KEYS.DRAFT_CARD,
      ]);
      
      // Reset settings to default
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
};

export default StorageService;
