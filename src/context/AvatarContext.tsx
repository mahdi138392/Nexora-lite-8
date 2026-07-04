import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AvatarOption {
  id: string;
  seed: string;
}

// Using DiceBear "notionists" style — clean, modern, flat illustrated
// human portraits, sharp vector (infinitely HD), no cartoonish look.
export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'a1', seed: 'Phoenix-2026' },
  { id: 'a2', seed: 'Cypher-Nova' },
  { id: 'a3', seed: 'Blaze-Ryder' },
  { id: 'a4', seed: 'Vortex-Kai' },
  { id: 'a5', seed: 'Aurora-Sky' },
  { id: 'a6', seed: 'Nova-Ember' },
  { id: 'a7', seed: 'Lyra-Frost' },
  { id: 'a8', seed: 'Echo-Star' },
];

const STORAGE_KEY = 'nexora_avatar_seed_v2';

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=8B5CF6,38BDF8,1E293B&backgroundType=gradientLinear`;
}

function getDefaultSeedForWallet(walletAddress: string): string {
  if (!walletAddress) return AVATAR_OPTIONS[0].seed;
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    hash = (hash * 31 + walletAddress.charCodeAt(i)) % 1000003;
  }
  const index = Math.abs(hash) % AVATAR_OPTIONS.length;
  return AVATAR_OPTIONS[index].seed;
}

interface AvatarContextType {
  avatarSeed: string | null;
  setAvatarSeed: (seed: string) => void;
  assignDefaultIfMissing: (walletAddress: string) => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avatarSeed, setAvatarSeedState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setAvatarSeed = useCallback((seed: string) => {
    setAvatarSeedState(seed);
    try {
      localStorage.setItem(STORAGE_KEY, seed);
    } catch {
      // ignore
    }
  }, []);

  const assignDefaultIfMissing = useCallback((walletAddress: string) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        setAvatarSeedState(existing);
        return;
      }
    } catch {
      // ignore
    }
    const defaultSeed = getDefaultSeedForWallet(walletAddress);
    setAvatarSeed(defaultSeed);
  }, [setAvatarSeed]);

  return (
    <AvatarContext.Provider value={{ avatarSeed, setAvatarSeed, assignDefaultIfMissing }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('useAvatar must be inside AvatarProvider');
  return ctx;
};
