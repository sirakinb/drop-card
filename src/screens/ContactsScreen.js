import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useContacts } from '../context/AppContext';

const { width } = Dimensions.get('window');

// Debounce function for search
const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

export default function ContactsScreen({ navigation }) {
  const { 
    contacts, 
    filteredContacts, 
    loading, 
    searchContacts, 
    deleteContact, 
    filterByTag, 
    getAllTags, 
    clearFilters,
    searchQuery,
    activeTag,
    hasContacts
  } = useContacts();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'company'
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [tags, setTags] = useState([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Refs for swipeable rows
  const swipeableRefs = useRef({});
  
  // Load tags on mount
  useEffect(() => {
    const loadTags = async () => {
      const allTags = getAllTags();
      setTags(allTags);
    };
    
    loadTags();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [getAllTags]);
  
  // Debounced search function
  const handleSearch = useCallback(
    debounce((text) => {
      searchContacts(text);
    }, 300),
    [searchContacts]
  );
  
  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In a real app, this would re-fetch contacts from a server
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  // Handle contact press
  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setShowContactDetails(true);
  };
  
  // Handle delete contact
  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteContact(contactId);
            // Close any open swipeable
            if (swipeableRefs.current[contactId]) {
              swipeableRefs.current[contactId].close();
            }
          }
        },
      ]
    );
  };
  
  // Handle follow-up
  const handleFollowUp = (contact) => {
    setShowContactDetails(false);
    navigation.navigate('AIFollowUp', { contact });
  };
  
  // Handle add contact
  const handleAddContact = () => {
    navigation.navigate('AddContact');
  };
  
  // Handle filter by tag
  const handleFilterTag = (tag) => {
    filterByTag(tag);
    setShowFilters(false);
  };
  
  // Handle sort
  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    setShowSortOptions(false);
  };
  
  // Sort contacts based on selected option
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.cardData.name.localeCompare(b.cardData.name);
      case 'company':
        return (a.cardData.company || '').localeCompare(b.cardData.company || '');
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });
  
  // Render swipeable row
  const renderSwipeableRow = ({ item }) => {
    const renderRightActions = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [0, 100],
        extrapolate: 'clamp',
      });
      
      return (
        <View style={styles.swipeableActions}>
          <TouchableOpacity
            style={[styles.swipeableAction, styles.followUpAction]}
            onPress={() => handleFollowUp(item)}
          >
            <Ionicons name="chatbox-outline" size={24} color="#fff" />
            <Text style={styles.swipeableActionText}>Follow Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.swipeableAction, styles.deleteAction]}
            onPress={() => handleDeleteContact(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.swipeableActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    };
    
    return (
      <Swipeable
        ref={(ref) => (swipeableRefs.current[item.id] = ref)}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => handleContactPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.contactAvatar}>
            {item.cardData.photoUri ? (
              <Image
                source={{ uri: item.cardData.photoUri }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {item.cardData.name ? item.cardData.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.cardData.name}</Text>
            
            <View style={styles.contactDetails}>
              {item.cardData.title && (
                <Text style={styles.contactTitle}>{item.cardData.title}</Text>
              )}
              
              {item.cardData.company && (
                <Text style={styles.contactCompany}>
                  {item.cardData.title ? ` • ${item.cardData.company}` : item.cardData.company}
                </Text>
              )}
            </View>
            
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {item.tags.length > 2 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{item.tags.length - 2}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </Swipeable>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyStateText}>Loading contacts...</Text>
        </View>
      );
    }
    
    if (searchQuery || activeTag) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="search" size={60} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No matches found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={clearFilters}
          >
            <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="people" size={60} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No contacts yet</Text>
        <Text style={styles.emptyStateText}>
          Add your first contact to get started
        </Text>
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={handleAddContact}
        >
          <Text style={styles.emptyStateButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render list header
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#999"
          defaultValue={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              clearFilters();
            }}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={18} color="#007AFF" />
          <Text style={styles.filterButtonText}>
            {activeTag ? `Tag: ${activeTag}` : 'Filter'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortOptions(true)}
        >
          <Ionicons name="swap-vertical" size={18} color="#007AFF" />
          <Text style={styles.filterButtonText}>
            {sortBy === 'name' ? 'Name' : sortBy === 'company' ? 'Company' : 'Date'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTag && (
        <View style={styles.activeFilterContainer}>
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>{activeTag}</Text>
            <TouchableOpacity onPress={() => filterByTag('')}>
              <Ionicons name="close-circle" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddContact}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={sortedContacts}
          renderItem={renderSwipeableRow}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            sortedContacts.length === 0 ? styles.emptyListContent : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
      
      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter by Tag</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.tagOption,
                  activeTag === '' && styles.selectedTagOption
                ]}
                onPress={() => handleFilterTag('')}
              >
                <Text style={[
                  styles.tagOptionText,
                  activeTag === '' && styles.selectedTagOptionText
                ]}>All Contacts</Text>
                {activeTag === '' && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
              
              <FlatList
                data={tags}
                keyExtractor={(item, index) => `tag-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.tagOption,
                      activeTag === item && styles.selectedTagOption
                    ]}
                    onPress={() => handleFilterTag(item)}
                  >
                    <Text style={[
                      styles.tagOptionText,
                      activeTag === item && styles.selectedTagOptionText
                    ]}>{item}</Text>
                    {activeTag === item && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyTagsText}>No tags available</Text>
                }
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Sort Options Modal */}
      <Modal
        visible={showSortOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortOptions(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort By</Text>
                <TouchableOpacity onPress={() => setShowSortOptions(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => handleSort('name')}
              >
                <Text style={styles.sortOptionText}>Name</Text>
                {sortBy === 'name' && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => handleSort('company')}
              >
                <Text style={styles.sortOptionText}>Company</Text>
                {sortBy === 'company' && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => handleSort('date')}
              >
                <Text style={styles.sortOptionText}>Date Added</Text>
                {sortBy === 'date' && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Contact Details Modal */}
      <Modal
        visible={showContactDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactDetails(false)}
      >
        {selectedContact && (
          <View style={styles.detailsModalContainer}>
            <SafeAreaView style={styles.detailsModalContent}>
              <View style={styles.detailsHeader}>
                <TouchableOpacity
                  style={styles.detailsCloseButton}
                  onPress={() => setShowContactDetails(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                
                <View style={styles.detailsActions}>
                  <TouchableOpacity
                    style={styles.detailsActionButton}
                    onPress={() => {
                      setShowContactDetails(false);
                      handleFollowUp(selectedContact);
                    }}
                  >
                    <Ionicons name="chatbox-outline" size={22} color="#007AFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.detailsActionButton}
                    onPress={() => {
                      setShowContactDetails(false);
                      handleDeleteContact(selectedContact.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView 
                style={styles.detailsContent}
                contentContainerStyle={styles.detailsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailsProfile}>
                  {selectedContact.cardData.photoUri ? (
                    <Image
                      source={{ uri: selectedContact.cardData.photoUri }}
                      style={styles.detailsAvatar}
                    />
                  ) : (
                    <View style={styles.detailsAvatarPlaceholder}>
                      <Text style={styles.detailsAvatarText}>
                        {selectedContact.cardData.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  
                  <Text style={styles.detailsName}>
                    {selectedContact.cardData.name}
                  </Text>
                  
                  {selectedContact.cardData.title && (
                    <Text style={styles.detailsTitle}>
                      {selectedContact.cardData.title}
                    </Text>
                  )}
                  
                  {selectedContact.cardData.company && (
                    <Text style={styles.detailsCompany}>
                      {selectedContact.cardData.company}
                    </Text>
                  )}
                  
                  {selectedContact.tags && selectedContact.tags.length > 0 && (
                    <View style={styles.detailsTags}>
                      {selectedContact.tags.map((tag, index) => (
                        <View key={index} style={styles.detailsTag}>
                          <Text style={styles.detailsTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Contact Info</Text>
                  
                  {selectedContact.cardData.phone && (
                    <View style={styles.detailsItem}>
                      <Ionicons name="call-outline" size={20} color="#666" />
                      <Text style={styles.detailsItemText}>
                        {selectedContact.cardData.phone}
                      </Text>
                    </View>
                  )}
                  
                  {selectedContact.cardData.email && (
                    <View style={styles.detailsItem}>
                      <Ionicons name="mail-outline" size={20} color="#666" />
                      <Text style={styles.detailsItemText}>
                        {selectedContact.cardData.email}
                      </Text>
                    </View>
                  )}
                  
                  {selectedContact.cardData.website && (
                    <View style={styles.detailsItem}>
                      <Ionicons name="globe-outline" size={20} color="#666" />
                      <Text style={styles.detailsItemText}>
                        {selectedContact.cardData.website}
                      </Text>
                    </View>
                  )}
                  
                  {selectedContact.cardData.linkedin && (
                    <View style={styles.detailsItem}>
                      <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                      <Text style={styles.detailsItemText}>
                        {selectedContact.cardData.linkedin}
                      </Text>
                    </View>
                  )}
                  
                  {selectedContact.cardData.twitter && (
                    <View style={styles.detailsItem}>
                      <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                      <Text style={styles.detailsItemText}>
                        {selectedContact.cardData.twitter}
                      </Text>
                    </View>
                  )}
                </View>
                
                {selectedContact.notes && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Notes</Text>
                    <Text style={styles.detailsNotes}>{selectedContact.notes}</Text>
                  </View>
                )}
                
                {selectedContact.meetingContext && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Meeting Context</Text>
                    <Text style={styles.detailsContext}>
                      {selectedContact.meetingContext}
                    </Text>
                  </View>
                )}
                
                {selectedContact.voiceNoteUri && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Voice Note</Text>
                    <TouchableOpacity style={styles.voiceNoteButton}>
                      <Ionicons name="play" size={24} color="#fff" />
                      <Text style={styles.voiceNoteText}>Play Voice Note</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Actions</Text>
                  
                  <TouchableOpacity
                    style={styles.detailsActionFull}
                    onPress={() => {
                      setShowContactDetails(false);
                      handleFollowUp(selectedContact);
                    }}
                  >
                    <Ionicons name="chatbox-outline" size={20} color="#007AFF" />
                    <Text style={styles.detailsActionFullText}>
                      Create AI Follow-up
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.detailsActionFull}
                    onPress={() => {
                      // Edit contact functionality would go here
                      setShowContactDetails(false);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                    <Text style={styles.detailsActionFullText}>
                      Edit Contact
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.detailsActionFull, styles.deleteActionFull]}
                    onPress={() => {
                      setShowContactDetails(false);
                      handleDeleteContact(selectedContact.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={styles.deleteActionFullText}>
                      Delete Contact
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  activeFilterText: {
    color: '#007AFF',
    fontSize: 14,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactAvatar: {
    marginRight: 16,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
  },
  contactCompany: {
    fontSize: 14,
    color: '#666',
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  swipeableActions: {
    flexDirection: 'row',
    width: 160,
    height: '100%',
  },
  swipeableAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  followUpAction: {
    backgroundColor: '#007AFF',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  swipeableActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tagOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedTagOption: {
    backgroundColor: '#f0f8ff',
  },
  tagOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTagOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyTagsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailsModalContent: {
    flex: 1,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsCloseButton: {
    padding: 4,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 16,
  },
  detailsActionButton: {
    padding: 4,
  },
  detailsContent: {
    flex: 1,
  },
  detailsScrollContent: {
    padding: 20,
  },
  detailsProfile: {
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  detailsAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#999',
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  detailsCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  detailsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  detailsTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailsTagText: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailsItemText: {
    fontSize: 16,
    color: '#333',
  },
  detailsNotes: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailsContext: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  voiceNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    alignSelf: 'flex-start',
  },
  voiceNoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  detailsActionFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  detailsActionFullText: {
    fontSize: 16,
    color: '#007AFF',
  },
  deleteActionFull: {
    backgroundColor: '#FFF1F0',
  },
  deleteActionFullText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
