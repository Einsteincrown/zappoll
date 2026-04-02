import React, { createContext, useContext, useState, useCallback } from "react";
import { UserProfile } from "@/types/poll";
import { sdk, STRK } from "@/lib/starkzap";
import { OnboardStrategy, Amount } from "starkzap";

interface AuthContextType {
  user: UserProfile | null;
  wallet: any | null;
  isConnected: boolean;
  login: (method: 'email' | 'google' | 'twitter') => Promise<void>;
  logout: () => void;
  updateBalance: (delta: number) => void;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      const balance = await wallet.balanceOf(STRK);
      const balanceNum = parseFloat(balance.toUnit());
      setUser((prev) => prev ? { ...prev, strkBalance: balanceNum } : null);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [wallet]);

  const login = useCallback(async (_method: 'email' | 'google' | 'twitter') => {
    try {
      // Use Cartridge Controller for social login via Starkzap Wallets module
      const policies = [
        { target: STRK.address, method: "transfer" },
      ];

      const onboard = await sdk.onboard({
        strategy: OnboardStrategy.Cartridge,
        cartridge: { policies },
        deploy: "if_needed",
      });

      const w = onboard.wallet;
      setWallet(w);

      // Read real STRK balance
      const balance = await w.balanceOf(STRK);
      const balanceNum = parseFloat(balance.toUnit());
      const address = w.address || (await w.getAddress?.()) || "0x...";

      setUser({
        id: typeof address === "string" ? address : String(address),
        walletAddress: typeof address === "string" ? address : String(address),
        loginMethod: _method,
        strkBalance: balanceNum,
      });
    } catch (err) {
      console.error("Starkzap login failed:", err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setWallet(null);
  }, []);

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
