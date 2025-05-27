import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      title: 'Marketing Manager',
      company: 'Tech Corp',
      notes: 'Met at conference',
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@startup.io',
      title: 'Software Engineer',
      company: 'StartupCo',
      notes: 'Potential collaboration',
    },
  ]);

  const handleAddContact = () => {
    navigation.navigate('AddContact');
  };

  const handleContactPress = (contact) => {
    navigation.navigate('AIFollowUp', { contact });
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity 
      style={styles.contactCard}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactTitle}>{item.title}</Text>
        <Text style={styles.contactCompany}>{item.company}</Text>
        {item.notes && (
          <Text style={styles.contactNotes}>{item.notes}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptySubtitle}>
            Start building your network by adding contacts
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddContact}>
            <Text style={styles.emptyButtonText}>Add First Contact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 1,
  },
  contactCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 