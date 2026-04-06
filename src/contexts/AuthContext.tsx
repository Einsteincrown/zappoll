import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { UserProfile } from "@/types/poll";
import { usePrivy } from "@privy-io/react-auth";
import { sdk, STRK } from "@/lib/starkzap";
import { StarkSigner, OnboardStrategy, accountPresets } from "starkzap";

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
      const authUserId = privyUser.id;

      const email = privyUser.email?.address;
      const loginMethod: "email" | "google" | "twitter" = privyUser.twitter
        ? "twitter"
        : "email";

      // Onboard with a local StarkSigner
      const privateKey = getOrCreatePrivateKey(authUserId);
      sdk
        .onboard({
          strategy: OnboardStrategy.Signer,
          account: { signer: new StarkSigner(privateKey) },
          accountPreset: accountPresets.argentXV050,
          deploy: "if_needed",
        })
        .then(async (result) => {
          const w = result.wallet;
          const address = w.address;

          if (!address || !address.startsWith("0x")) {
            throw new Error(`Invalid Starknet wallet address returned: ${String(address)}`);
          }

          setWallet(w);

          // Fetch initial balance
          let balanceNum = 0;
          try {
            const balance = await w.balanceOf(STRK);
            balanceNum = parseFloat(balance.toUnit());
          } catch (err) {
            console.warn("Initial balance fetch failed:", err);
          }

          setUser({
            id: address,
            walletAddress: address,
            email,
            loginMethod,
            strkBalance: balanceNum,
          });
        })
        .catch((err) => {
          console.error("Starkzap onboard failed:", err);
          setUser(null);
          setWallet(null);
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
      value={{ user, wallet, isConnected: !!user && !!wallet, login, logout, updateBalance, refreshBalance }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
