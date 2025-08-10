
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser, type UserProfile } from '@/services/user-service';
import { Preloader } from '@/components/preloader';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isStudent: boolean;
  isLoading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const profile = await getUser(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  }, [user, fetchUserProfile]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsStudent(!!currentUser.email?.endsWith('@student.libroweb.io'));
        await fetchUserProfile(currentUser);
        setIsLoading(false);
      } else {
        setIsStudent(false);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const value = { user, userProfile, isStudent, isLoading, refreshUserProfile };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    