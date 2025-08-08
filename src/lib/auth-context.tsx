'use client';

import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'manager' | 'employee' | 'guest';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Temporary demo users for development
const DEMO_USERS = [
  {
    id: 'admin-1',
    email: 'admin@sanpedrobeachresort.com',
    password: 'admin123',
    profile: {
      id: 'admin-1',
      email: 'admin@sanpedrobeachresort.com',
      full_name: 'System Administrator',
      phone: null,
      role: 'admin' as const,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'manager-1',
    email: 'manager@sanpedrobeachresort.com',
    password: 'manager123',
    profile: {
      id: 'manager-1',
      email: 'manager@sanpedrobeachresort.com',
      full_name: 'Resort Manager',
      phone: null,
      role: 'manager' as const,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'employee-1',
    email: 'employee@sanpedrobeachresort.com',
    password: 'employee123',
    profile: {
      id: 'employee-1',
      email: 'employee@sanpedrobeachresort.com',
      full_name: 'Resort Employee',
      phone: null,
      role: 'employee' as const,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'guest-1',
    email: 'guest@sanpedrobeachresort.com',
    password: 'guest123',
    profile: {
      id: 'guest-1',
      email: 'guest@sanpedrobeachresort.com',
      full_name: 'Guest User',
      phone: null,
      role: 'guest' as const,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkExistingSession = () => {
      try {
        const storedUser = localStorage.getItem('spbr_user');
        const storedProfile = localStorage.getItem('spbr_user_profile');

        if (storedUser && storedProfile) {
          const userData = JSON.parse(storedUser);
          const profileData = JSON.parse(storedProfile);

          setUser(userData);
          setUserProfile(profileData);

          // Create a mock session
          const mockSession: Session = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: userData,
          };
          setSession(mockSession);
        }
      } catch (error) {
        console.error('Error loading stored session:', error);
        // Clear invalid session data
        localStorage.removeItem('spbr_user');
        localStorage.removeItem('spbr_user_profile');
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // First try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);

        // Try to fetch user profile from database
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
          localStorage.setItem('spbr_user', JSON.stringify(data.user));
          localStorage.setItem(
            'spbr_user_profile',
            JSON.stringify(profileData)
          );
        }

        return;
      }

      // Fallback to demo users if Supabase Auth fails
      const demoUser = DEMO_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (demoUser) {
        const mockUser: User = {
          id: demoUser.id,
          email: demoUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated',
        };

        const mockSession: Session = {
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser,
        };

        setUser(mockUser);
        setSession(mockSession);
        setUserProfile(demoUser.profile);

        // Store in localStorage for persistence
        localStorage.setItem('spbr_user', JSON.stringify(mockUser));
        localStorage.setItem(
          'spbr_user_profile',
          JSON.stringify(demoUser.profile)
        );

        return;
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Try Supabase sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase sign out error:', error);
    }

    // Clear local state and storage
    setUser(null);
    setSession(null);
    setUserProfile(null);
    localStorage.removeItem('spbr_user');
    localStorage.removeItem('spbr_user_profile');
  };

  const value = {
    user,
    session,
    userProfile,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
