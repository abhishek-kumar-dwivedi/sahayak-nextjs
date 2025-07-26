
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Hardcoded user type to match what Firebase would provide
type MockUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: MockUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A hardcoded user object to simulate a logged-in user
const hardcodedUser: MockUser = {
  uid: 'hardcoded-user-123',
  displayName: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  photoURL: 'https://placehold.co/40x40.png',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // The user is always the hardcoded user, and loading is always false.
  const [user] = useState<MockUser | null>(hardcodedUser);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
