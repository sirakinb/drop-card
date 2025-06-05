import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import LoadingScreen from './src/screens/LoadingScreen';

// Main App Screens
import CardPreviewScreen from './src/screens/CardPreviewScreen';
import CreateCardScreen from './src/screens/CreateCardScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import AddContactScreen from './src/screens/AddContactScreen';
import ScanScreen from './src/screens/ScanScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShareScreen from './src/screens/ShareScreen';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppContextProvider } from './src/context/AppContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ContactsStack = createStackNavigator();

// Contacts Stack Navigator
function ContactsStackNavigator() {
  return (
    <ContactsStack.Navigator>
      <ContactsStack.Screen 
        name="ContactsList" 
        component={ContactsScreen}
        options={{ headerShown: false }}
      />
      <ContactsStack.Screen 
        name="AddContact" 
        component={AddContactScreen}
        options={{
          title: 'Add Contact',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </ContactsStack.Navigator>
  );
}

// Main Tab Navigator (for authenticated users)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Your Card') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
          borderTopColor: '#e0e0e0',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Your Card" component={CardPreviewScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Contacts" component={ContactsStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator (for unauthenticated users)
function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#f8f9fa' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Main App Stack Navigator (for authenticated users)
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f8f9fa' }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="CreateCard" 
        component={CreateCardScreen}
        options={{
          headerShown: true,
          title: 'Create Your Card',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="Share" 
        component={ShareScreen}
        options={{
          headerShown: true,
          title: 'Share Card',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigatorWithContext />
        </NavigationContainer>
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// App Navigator with conditional context loading
function AppNavigatorWithContext() {
  const { user, initializing } = useAuth();

  console.log('🏗️ AppNavigatorWithContext render:');
  console.log('   - initializing:', initializing);
  console.log('   - user:', user ? `${user.email} (id: ${user.id})` : 'null');
  console.log('   - user type:', typeof user);

  // Show loading screen while checking auth state
  if (initializing) {
    console.log('👀 Showing LoadingScreen - still initializing');
    return <LoadingScreen />;
  }

  // Show auth stack if not authenticated or if user is null/undefined
  if (!user || !user.id) {
    console.log('🔐 Showing AuthStack - no valid user found');
    return <AuthStack />;
  }

  // Show main app with contexts if authenticated
  console.log('🏠 Showing AppStack with contexts - user authenticated:', user.email);
  return (
    <AppContextProvider>
      <AppStack />
    </AppContextProvider>
  );
} 