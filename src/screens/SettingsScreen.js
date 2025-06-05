import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoSave, setAutoSave] = React.useState(true);

  const settingsOptions = [
    {
      section: 'Account',
      items: [
        { id: 'profile', icon: 'person', title: 'Edit Profile', action: 'navigate' },
        { id: 'privacy', icon: 'shield-checkmark', title: 'Privacy Settings', action: 'navigate' },
        { id: 'backup', icon: 'cloud-upload', title: 'Backup & Sync', action: 'navigate' },
      ]
    },
    {
      section: 'Preferences',
      items: [
        { id: 'notifications', icon: 'notifications', title: 'Notifications', action: 'toggle', value: notifications, setter: setNotifications },
        { id: 'darkMode', icon: 'moon', title: 'Dark Mode', action: 'toggle', value: darkMode, setter: setDarkMode },
        { id: 'autoSave', icon: 'save', title: 'Auto Save', action: 'toggle', value: autoSave, setter: setAutoSave },
      ]
    },
    {
      section: 'Support',
      items: [
        { id: 'help', icon: 'help-circle', title: 'Help & FAQ', action: 'navigate' },
        { id: 'contact', icon: 'mail', title: 'Contact Support', action: 'navigate' },
        { id: 'feedback', icon: 'chatbubble', title: 'Send Feedback', action: 'navigate' },
      ]
    },
    {
      section: 'About',
      items: [
        { id: 'version', icon: 'information-circle', title: 'App Version', subtitle: '1.0.0', action: 'none' },
        { id: 'terms', icon: 'document-text', title: 'Terms of Service', action: 'navigate' },
        { id: 'privacy-policy', icon: 'lock-closed', title: 'Privacy Policy', action: 'navigate' },
      ]
    }
  ];

  const handleSettingPress = (item) => {
    switch (item.action) {
      case 'navigate':
        if (item.id === 'profile') {
          navigation.navigate('CreateCard');
        } else {
          Alert.alert('Coming Soon', `${item.title} feature will be available soon.`);
        }
        break;
      case 'toggle':
        item.setter(!item.value);
        break;
      default:
        break;
    }
  };

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={() => handleSettingPress(item)}
      disabled={item.action === 'none'}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={item.icon} size={20} color="#666" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.action === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.setter}
          trackColor={{ false: '#e0e0e0', true: '#000' }}
          thumbColor="#fff"
        />
      ) : item.action === 'navigate' ? (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {settingsOptions.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
}); 