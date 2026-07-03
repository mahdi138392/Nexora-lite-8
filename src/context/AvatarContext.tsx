import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AvatarOption {
  id: string;
  seed: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'm1', seed: 'Felix' },
  { id: 'm2', seed: 'Leo' },
  { id: 'm3', seed: 'Max' },
  { id: 'm4', seed: 'Oliver' },
  { id: 'f1', seed: 'Aria' },
  { id: 'f2', seed: 'Luna' },
  { id: 'f3', seed: 'Mia' },
  { id: 'f4', seed: 'Zoe' },
];

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=8B5CF6,38BDF8`;
}

interface AvatarContextType {
  avatarSeed: string | null;
  setAvatarSeed: (seed: string) => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avatarSeed, setAvatarSeedState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nexora_avatar_seed');
    } catch {
      return null;
    }
  });

  const setAvatarSeed = useCallback((seed: string) => {
    setAvatarSeedState(seed);
    try {
      localStorage.setItem('nexora_avatar_seed', seed);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AvatarContext.Provider value={{ avatarSeed, setAvatarSeed }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('useAvatar must be inside AvatarProvider');
  return ctx;
};
