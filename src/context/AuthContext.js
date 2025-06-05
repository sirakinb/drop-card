import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Force complete auth reset
    const forceAuthReset = async () => {
      try {
        console.log('🔄 FORCE AUTH RESET - Starting...');
        
        // Clear all possible auth storage
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage cleared');
        
        // Force sign out
        await supabase.auth.signOut();
        console.log('✅ Supabase signOut called');
        
        // Manually set states to null
        setSession(null);
        setUser(null);
        console.log('✅ Auth states manually cleared');
        
        // Wait a bit then check session
        setTimeout(async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log('🔍 Session check result:', session ? 'SESSION FOUND' : 'NO SESSION', error);
            
            if (session) {
              console.log('⚠️ UNEXPECTED SESSION FOUND:', session.user?.email);
              // Force another sign out
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            }
          } catch (error) {
            console.error('❌ Error checking session:', error);
          } finally {
            setInitializing(false);
            console.log('✅ Auth initialization complete - NO USER');
          }
        }, 200);
        
      } catch (error) {
        console.error('❌ Error in force auth reset:', error);
        setSession(null);
        setUser(null);
        setInitializing(false);
      }
    };

    forceAuthReset();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('➡️ Setting auth state to NULL');
          setSession(null);
          setUser(null);
        } else {
          console.log('➡️ Setting auth state to USER:', session.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
        setInitializing(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // We don't need email confirmation for this demo
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up successful:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Attempting sign out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Manually clear state to ensure immediate UI update
      setSession(null);
      setUser(null);
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      console.log('Attempting password reset for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    initializing,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 