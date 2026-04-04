import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { UserProfile } from "@/types/poll";
import { usePrivy } from "@privy-io/react-auth";
import { sdk, STRK } from "@/lib/starkzap";
import { StarkSigner, OnboardStrategy } from "starkzap";

const PRIVATE_KEY_STORAGE_KEY = "zappoll_stark_pk";

/** Get or generate a local Stark private key (persisted in localStorage). */
function getOrCreatePrivateKey(userId: string): string {
  const storageKey = `${PRIVATE_KEY_STORAGE_KEY}_${userId}`;
  let pk = localStorage.getItem(storageKey);
  if (!pk) {
    // Generate a random 252-bit private key (Stark-curve compatible)
    const bytes = crypto.getRandomValues(new Uint8Array(31));
    pk = "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(storageKey, pk);
  }
  return pk;
}

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
  const onboardingRef = useRef(false);

  // Sync Privy auth state → create Starkzap wallet with local signer
  useEffect(() => {
    if (!ready) return;

    if (authenticated && privyUser && !onboardingRef.current) {
      onboardingRef.current = true;
      const userId = privyUser.wallet?.address || privyUser.id;

      const email = privyUser.email?.address;
      const loginMethod: "email" | "google" | "twitter" = privyUser.twitter
        ? "twitter"
        : "email";

      // Set basic user info immediately (balance will update after onboard)
      setUser({
        id: userId,
        walletAddress: userId,
        email,
        loginMethod,
        strkBalance: 0,
      });

      // Onboard with a local StarkSigner
      const privateKey = getOrCreatePrivateKey(userId);
      sdk
        .onboard({
          strategy: OnboardStrategy.Signer,
          account: { signer: new StarkSigner(privateKey) },
          deploy: "if_needed",
        })
        .then(async (result) => {
          const w = result.wallet;
          setWallet(w);

          // Update wallet address to the actual on-chain address
          const address = w.address ?? userId;
          setUser((prev) =>
            prev ? { ...prev, id: address, walletAddress: address } : null
          );

          // Fetch initial balance
          try {
            const balance = await w.balanceOf(STRK);
            const balanceNum = parseFloat(balance.toUnit());
            setUser((prev) => (prev ? { ...prev, strkBalance: balanceNum } : null));
          } catch (err) {
            console.warn("Initial balance fetch failed:", err);
          }
        })
        .catch((err) => {
          console.error("Starkzap onboard failed:", err);
        })
        .finally(() => {
          onboardingRef.current = false;
        });
    } else if (!authenticated) {
      setUser(null);
      setWallet(null);
      onboardingRef.current = false;
    }
  }, [ready, authenticated, privyUser]);

  // Refresh STRK balance from on-chain
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      const balance = await wallet.balanceOf(STRK);
      const balanceNum = parseFloat(balance.toUnit());
      setUser((prev) => (prev ? { ...prev, strkBalance: balanceNum } : null));
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
    setUser((prev) => (prev ? { ...prev, strkBalance: prev.strkBalance + delta } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, wallet, isConnected: !!user, login, logout, updateBalance, refreshBalance }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
