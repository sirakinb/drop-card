import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wrcuxdqjqqeqlqxpukbj.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY3V4ZHFqcXFlcWxxeHB1a2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDcxMTIsImV4cCI6MjA2NDcyMzExMn0._FfLQXbKkdukWRdqOR2MvE8BEfuA2lyFYnRgYFWeHMI';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined,
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Debug function to clear all auth state
export const clearAuthState = async () => {
  try {
    await AsyncStorage.removeItem('supabase.auth.token');
    await supabase.auth.signOut();
    console.log('Auth state cleared');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}; 