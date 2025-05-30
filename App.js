import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import all screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CreateCardScreen from './src/screens/CreateCardScreen';
import CardPreviewScreen from './src/screens/CardPreviewScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import AIFollowUpScreen from './src/screens/AIFollowUpScreen';
import ShareScreen from './src/screens/ShareScreen';
import ScanScreen from './src/screens/ScanScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import CardProvider
import { CardProvider } from './src/context/CardContext';
// Import ContactProvider
import { ContactProvider } from './src/context/ContactContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Cards flow
function CardsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CardPreview" component={CardPreviewScreen} />
      <Stack.Screen name="CreateCard" component={CreateCardScreen} />
    </Stack.Navigator>
  );
}

// Stack navigator for Contacts flow
function ContactsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContactsList" component={ContactsScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="AIFollowUp" component={AIFollowUpScreen} />
    </Stack.Navigator>
  );
}

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Cards') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Share') {
            iconName = focused ? 'share' : 'share-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          paddingBottom: 20,
          paddingTop: 8,
          height: 85,
        },
      })}
    >
      <Tab.Screen name="Cards" component={CardsStack} />
      <Tab.Screen name="Contacts" component={ContactsStack} />
      <Tab.Screen name="Share" component={ShareScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main app with splash and onboarding flow
export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Show splash screen first
  if (!isSplashComplete) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onComplete={() => setIsSplashComplete(true)} />
      </>
    );
  }

  // Show onboarding after splash
  if (!isOnboardingComplete) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={() => setIsOnboardingComplete(true)} />
      </>
    );
  }

  // Show main app after onboarding
  return (
    <CardProvider>
      <ContactProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <MainTabs />
        </NavigationContainer>
      </ContactProvider>
    </CardProvider>
  );
}
