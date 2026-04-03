import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { UserProfile } from "@/types/poll";
import { usePrivy } from "@privy-io/react-auth";
import { sdk, STRK } from "@/lib/starkzap";

interface AuthContextType {
  user: UserProfile | null;
  wallet: any | null;
  isConnected: boolean;
  login: () => void;
  logout: () => void;
  updateBalance: (delta: number) => void;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, authenticated, user: privyUser, login: privyLogin, logout: privyLogout } = usePrivy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);

  // Sync Privy auth state to our user profile
  useEffect(() => {
    if (ready && authenticated && privyUser) {
      const address = privyUser.wallet?.address || privyUser.id;
      const email = privyUser.email?.address;
      const loginMethod: 'email' | 'google' | 'twitter' =
        privyUser.twitter ? 'twitter' : 'email';

      setUser({
        id: address,
        walletAddress: address,
        email,
        loginMethod,
        strkBalance: 0,
      });

      // TODO: Once Privy wallet can be used as Starkzap signer, wire it here
      // For now we store a reference for future integration
      if (privyUser.wallet) {
        setWallet(privyUser.wallet);
      }
    } else if (ready && !authenticated) {
      setUser(null);
      setWallet(null);
    }
  }, [ready, authenticated, privyUser]);

  // Refresh STRK balance if wallet is available
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      const balance = await wallet.balanceOf?.(STRK);
      if (balance) {
        const balanceNum = parseFloat(balance.toUnit());
        setUser((prev) => prev ? { ...prev, strkBalance: balanceNum } : null);
      }
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [wallet]);

  const login = useCallback(() => {
    privyLogin();
  }, [privyLogin]);

  const logout = useCallback(() => {
    privyLogout();
    setUser(null);
    setWallet(null);
  }, [privyLogout]);

  const updateBalance = useCallback((delta: number) => {
    setUser((prev) => prev ? { ...prev, strkBalance: prev.strkBalance + delta } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, wallet, isConnected: !!user, login, logout, updateBalance, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
