/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  saveAchievementDB,
  saveChallengeDB,
  saveTransactionDB,
  syncUserToDB,
} from '../lib/database';
import {
  calcLevel,
  calcLevelProgress,
  calcXPToNext,
  calcRankScore,
  calcRank,
} from '../lib/gameCalculations';
import { getToday, normalizeStreakTimestamp } from '../lib/streak';

// ============== TYPES ==============

export type RankType = 'Beginner' | 'Bronze' | 'Silver' | 'Gold';
export type CategoryType = 'general' | 'football' | 'ai';
export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface ChallengeRecord {
  id: string;
  category: CategoryType;
  difficulty: DifficultyType;
  isCorrect: boolean;
  xpEarned: number;
  timestamp: string;
}

export interface Transaction {
  hash: string;
  type: 'xp_booster' | 'premium_pass';
  amount: string;
  timestamp: number;
}

export interface ServerAnswerResult {
  isCorrect: boolean;
  xpEarned: number;
  streakBonus: number;
  newStreak: number;
  totalXP: number;
  correctAnswers: number;
  totalChallenges: number;
  category: CategoryType;
  difficulty: DifficultyType;
}

export interface GameState {
  totalXP: number;
  level: number;
  levelProgress: number;
  xpToNextLevel: number;
  rank: RankType;
  rankScore: number;
  streak: number;
  lastActiveDate: number | null;
  correctAnswers: number;
  totalChallenges: number;
  accuracy: number;
  achievements: string[];
  premiumStatus: boolean;
  premiumPurchasedAt: string | null;
  xpBoosterActive: boolean;
  xpBoosterExpiry: number | null;
  challengeHistory: ChallengeRecord[];
  transactions: Transaction[];
}

// ============== CONSTANTS ==============

const STORAGE_KEY = 'nexora_game_v2';

// ============== CALCULATIONS ==============

export const RANK_COLORS: Record<RankType, string> = {
  Beginner: '#64748B',
  Bronze: '#B87333',
  Silver: '#C0C0C0',
  Gold: '#FBBF24',
};

// ============== ACHIEVEMENTS ==============

export const ACHIEVEMENTS = [
  {
    id: 'first_login',
    name: 'First Login',
    icon: '🚀',
    desc: 'Connected wallet for the first time',
  },
  {
    id: 'first_correct',
    name: 'First Correct Answer',
    icon: '✅',
    desc: 'Got your first answer right',
  },
  { id: 'level_5', name: 'Reach Level 5', icon: '⭐', desc: 'Reached Level 5' },
  { id: 'rank_bronze', name: 'Bronze Rank', icon: '🥉', desc: 'Achieved Bronze rank' },
  { id: 'rank_silver', name: 'Silver Rank', icon: '🥈', desc: 'Achieved Silver rank' },
  { id: 'rank_gold', name: 'Gold Rank', icon: '🥇', desc: 'Achieved Gold rank' },
  {
    id: 'streak_5',
    name: '5-Day Streak',
    icon: '🔥',
    desc: 'Completed a full 5-day streak cycle',
  },
  {
    id: 'buy_premium',
    name: 'Premium Member',
    icon: '💎',
    desc: 'Purchased Premium Pass',
  },
];

function checkAchievements(state: GameState): string[] {
  const newUnlocks: string[] = [];
  const checks: Array<{ id: string; pass: boolean }> = [
    { id: 'first_correct', pass: state.correctAnswers >= 1 },
    { id: 'level_5', pass: state.level >= 5 },
    {
      id: 'rank_bronze',
      pass: ['Bronze', 'Silver', 'Gold'].includes(state.rank),
    },
    { id: 'rank_silver', pass: ['Silver', 'Gold'].includes(state.rank) },
    { id: 'rank_gold', pass: state.rank === 'Gold' },
    { id: 'streak_5', pass: state.streak === 5 },
    { id: 'buy_premium', pass: state.premiumStatus },
  ];
  checks.forEach(({ id, pass }) => {
    if (pass && !state.achievements.includes(id)) {
      newUnlocks.push(id);
    }
  });
  return newUnlocks;
}

// ============== INITIAL STATE ==============

const INITIAL_STATE: GameState = {
  totalXP: 0,
  level: 0,
  levelProgress: 0,
  xpToNextLevel: 100,
  rank: 'Beginner',
  rankScore: 0,
  streak: 0,
  lastActiveDate: null,
  correctAnswers: 0,
  totalChallenges: 0,
  accuracy: 0,
  achievements: [],
  premiumStatus: false,
  premiumPurchasedAt: null,
  xpBoosterActive: false,
  xpBoosterExpiry: null,
  challengeHistory: [],
  transactions: [],
};

function loadFromStorage(walletAddr?: string): GameState {
  try {
    const key = walletAddr
      ? `${STORAGE_KEY}_${walletAddr.toLowerCase()}`
      : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_STATE,
        ...parsed,
        lastActiveDate: normalizeStreakTimestamp(parsed.lastActiveDate),
      };
    }
  } catch {
    // ignore
  }
  return { ...INITIAL_STATE };
}

function saveToStorage(state: GameState, walletAddr?: string) {
  try {
    const key = walletAddr
      ? `${STORAGE_KEY}_${walletAddr.toLowerCase()}`
      : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// ============== CONTEXT INTERFACE ==============

interface GameContextType {
  gameState: GameState;
  applyServerResult: (result: ServerAnswerResult) => void;
  unlockAchievement: (id: string) => void;
  setPremium: (txHash: string) => void;
  setXPBooster: (txHash: string) => void;
  addTransaction: (tx: Transaction) => void;
  loadStateForWallet: (addr: string) => void;
  loadFromDBState: (partial: Partial<GameState>) => void;
  resetGame: () => void;
  levelUpSignal: number | null;
  rankUpSignal: RankType | null;
  xpGainSignal: number | null;
  newAchievementSignal: string | null;
  streakBonusSignal: { day: number; xp: number } | null;
  clearSignals: () => void;
  xpBoosterActive: boolean;
  xpBoosterExpiry: number | null;
  premiumStatus: boolean;
  transactions: Transaction[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// ============== PROVIDER ==============

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => loadFromStorage());
  const [walletAddr, setWalletAddr] = useState<string>('');
  const currentWalletRef = useRef('');
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();
  const [levelUpSignal, setLevelUpSignal] = useState<number | null>(null);
  const [rankUpSignal, setRankUpSignal] = useState<RankType | null>(null);
  const [xpGainSignal, setXpGainSignal] = useState<number | null>(null);
  const [newAchievementSignal, setNewAchievementSignal] = useState<string | null>(
    null
  );
  const [streakBonusSignal, setStreakBonusSignal] = useState<{
    day: number;
    xp: number;
  } | null>(null);

  // Auto-save on state change
  useEffect(() => {
    saveToStorage(gameState, walletAddr || undefined);
  }, [gameState, walletAddr]);

  // Keep multiple tabs aligned with the newest persisted state.
  useEffect(() => {
    const key = walletAddr ? `${STORAGE_KEY}_${walletAddr.toLowerCase()}` : STORAGE_KEY;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        setGameState({
          ...INITIAL_STATE,
          ...parsed,
          lastActiveDate: normalizeStreakTimestamp(parsed.lastActiveDate),
        });
      } catch {
        // Ignore malformed cross-tab updates.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [walletAddr]);

  // Debounced Supabase sync on state change
  useEffect(() => {
    if (!currentWalletRef.current) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncUserToDB(currentWalletRef.current, gameState);
    }, 1500);
    return () => clearTimeout(syncTimer.current);
  }, [gameState]);

  // XP Booster expiry check every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.xpBoosterActive && gameState.xpBoosterExpiry) {
        if (Date.now() > gameState.xpBoosterExpiry) {
          setGameState((prev) => ({ ...prev, xpBoosterActive: false }));
        }
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [gameState.xpBoosterActive, gameState.xpBoosterExpiry]);

  const updateState = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setGameState((prev) => {
        const prevLevel = prev.level;
        const prevRank = prev.rank;
        const next = updater(prev);
        const level = calcLevel(next.totalXP);
        const levelProgress = calcLevelProgress(next.totalXP);
        const xpToNextLevel = calcXPToNext(next.totalXP);
        const rankScore = calcRankScore(
          next.totalXP,
          next.correctAnswers,
          next.totalChallenges
        );
        const rank = calcRank(rankScore);
        const accuracy =
          next.totalChallenges > 0
            ? next.correctAnswers / next.totalChallenges
            : 0;
        const xpBoosterActive =
          next.xpBoosterExpiry !== null && Date.now() < next.xpBoosterExpiry;

        const computed: GameState = {
          ...next,
          level,
          levelProgress,
          xpToNextLevel,
          rankScore,
          rank,
          accuracy,
          xpBoosterActive,
        };

        if (level > prevLevel) setLevelUpSignal(level);
        if (rank !== prevRank) setRankUpSignal(rank);

        const newUnlocks = checkAchievements(computed);
        if (newUnlocks.length > 0) {
          computed.achievements = [...computed.achievements, ...newUnlocks];
          setNewAchievementSignal(newUnlocks[0]);
        }

        return computed;
      });
    },
    []
  );

  const applyServerResult = useCallback((result: ServerAnswerResult) => {
    setGameState((prev) => {
      const prevLevel = prev.level;
      const prevRank = prev.rank;

      const level = calcLevel(result.totalXP);
      const levelProgress = calcLevelProgress(result.totalXP);
      const xpToNextLevel = calcXPToNext(result.totalXP);
      const rankScore = calcRankScore(
        result.totalXP,
        result.correctAnswers,
        result.totalChallenges
      );
      const rank = calcRank(rankScore);
      const accuracy =
        result.totalChallenges > 0
          ? result.correctAnswers / result.totalChallenges
          : 0;

      const record: ChallengeRecord = {
        id: Date.now().toString(),
        category: result.category,
        difficulty: result.difficulty,
        isCorrect: result.isCorrect,
        xpEarned: result.xpEarned,
        timestamp: new Date().toISOString(),
      };

      const computed: GameState = {
        ...prev,
        totalXP: result.totalXP,
        level,
        levelProgress,
        xpToNextLevel,
        rank,
        rankScore,
        accuracy,
        correctAnswers: result.correctAnswers,
        totalChallenges: result.totalChallenges,
        streak: result.newStreak,
        lastActiveDate: getToday(),
        challengeHistory: [record, ...prev.challengeHistory].slice(0, 100),
      };

      if (level > prevLevel) setLevelUpSignal(level);
      if (rank !== prevRank) setRankUpSignal(rank);
      if (result.xpEarned > 0) setXpGainSignal(result.xpEarned);
      if (result.streakBonus > 0) {
        setStreakBonusSignal({ day: result.newStreak, xp: result.streakBonus });
      }

      const newUnlocks = checkAchievements(computed);
      if (newUnlocks.length > 0) {
        computed.achievements = [...computed.achievements, ...newUnlocks];
        setNewAchievementSignal(newUnlocks[0]);
      }

      return computed;
    });

    if (currentWalletRef.current) {
      saveChallengeDB(currentWalletRef.current, {
        id: Date.now().toString(),
        category: result.category,
        difficulty: result.difficulty,
        isCorrect: result.isCorrect,
        xpEarned: result.xpEarned,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const unlockAchievement = useCallback(
    (id: string) => {
      if (gameState.achievements.includes(id)) return;
      setGameState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, id],
      }));
      setNewAchievementSignal(id);
      if (currentWalletRef.current) {
        const achievement = ACHIEVEMENTS.find((item) => item.id === id);
        saveAchievementDB(currentWalletRef.current, id, achievement?.name ?? id);
      }
    },
    [gameState.achievements]
  );

  const setPremium = useCallback(
    (txHash: string) => {
      const ts = new Date().toISOString();
      const newTx: Transaction = {
        hash: txHash,
        type: 'premium_pass',
        amount: '0.05',
        timestamp: Date.now(),
      };
      updateState((prev) => ({
        ...prev,
        premiumStatus: true,
        premiumPurchasedAt: ts,
        transactions: [newTx, ...prev.transactions],
      }));
      if (currentWalletRef.current) {
        saveTransactionDB(currentWalletRef.current, newTx);
      }
    },
    [updateState]
  );

  const setXPBooster = useCallback((txHash: string) => {
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    const newTx: Transaction = {
      hash: txHash,
      type: 'xp_booster',
      amount: '0.01',
      timestamp: Date.now(),
    };
    setGameState((prev) => ({
      ...prev,
      xpBoosterActive: true,
      xpBoosterExpiry: expiry,
      transactions: [newTx, ...prev.transactions],
    }));
    if (currentWalletRef.current) {
      saveTransactionDB(currentWalletRef.current, newTx);
    }
  }, []);

  const addTransaction = useCallback((tx: Transaction) => {
    setGameState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));
  }, []);

  const loadStateForWallet = useCallback((addr: string) => {
    currentWalletRef.current = addr;
    setWalletAddr(addr);
    const saved = loadFromStorage(addr);
    setGameState(saved);
  }, []);

  const loadFromDBState = useCallback((partial: Partial<GameState>) => {
    setGameState((prev) => {
      const merged = { ...prev, ...partial, lastActiveDate: normalizeStreakTimestamp(partial.lastActiveDate ?? prev.lastActiveDate) };
      const level = calcLevel(merged.totalXP);
      const levelProgress = calcLevelProgress(merged.totalXP);
      const xpToNextLevel = calcXPToNext(merged.totalXP);
      const rankScore = calcRankScore(
        merged.totalXP,
        merged.correctAnswers,
        merged.totalChallenges
      );
      const rank = calcRank(rankScore);
      const accuracy =
        merged.totalChallenges > 0
          ? merged.correctAnswers / merged.totalChallenges
          : 0;
      return {
        ...merged,
        level,
        levelProgress,
        xpToNextLevel,
        rankScore,
        rank,
        accuracy,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({ ...INITIAL_STATE });
    setWalletAddr('');
    currentWalletRef.current = '';
  }, []);

  const clearSignals = useCallback(() => {
    setLevelUpSignal(null);
    setRankUpSignal(null);
    setXpGainSignal(null);
    setNewAchievementSignal(null);
    setStreakBonusSignal(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        applyServerResult,
        unlockAchievement,
        setPremium,
        setXPBooster,
        addTransaction,
        loadStateForWallet,
        loadFromDBState,
        resetGame,
        levelUpSignal,
        rankUpSignal,
        xpGainSignal,
        newAchievementSignal,
        streakBonusSignal,
        clearSignals,
        xpBoosterActive: gameState.xpBoosterActive,
        xpBoosterExpiry: gameState.xpBoosterExpiry,
        premiumStatus: gameState.premiumStatus,
        transactions: gameState.transactions,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
};
