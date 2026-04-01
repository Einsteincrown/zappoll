import React, { createContext, useContext, useState, useCallback } from "react";
import { UserProfile } from "@/types/poll";

interface AuthContextType {
  user: UserProfile | null;
  isConnected: boolean;
  login: (method: 'email' | 'google' | 'twitter') => Promise<void>;
  logout: () => void;
  updateBalance: (delta: number) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const generateAddress = () => {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback(async (method: 'email' | 'google' | 'twitter') => {
    // Mock Starkzap social login — silent wallet creation
    await new Promise((r) => setTimeout(r, 800));
    const id = crypto.randomUUID();
    setUser({
      id,
      walletAddress: generateAddress(),
      loginMethod: method,
      strkBalance: 100, // Mock initial balance
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateBalance = useCallback((delta: number) => {
    setUser((prev) => prev ? { ...prev, strkBalance: prev.strkBalance + delta } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isConnected: !!user, login, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
