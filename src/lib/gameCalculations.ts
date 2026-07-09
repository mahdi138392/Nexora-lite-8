export type CategoryType = 'general' | 'football' | 'ai';
export type DifficultyType = 'easy' | 'medium' | 'hard';

export const XP_TABLE: Record<CategoryType, Record<DifficultyType, number>> = {
  general: { easy: 10, medium: 20, hard: 40 },
  football: { easy: 10, medium: 20, hard: 40 },
  ai: { easy: 15, medium: 30, hard: 60 },
};

export const STREAK_BONUS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

export type GameRankType = 'Beginner' | 'Bronze' | 'Silver' | 'Gold';

export function calcLevel(xp: number): number {
  return Math.floor(xp / 100);
}

export function calcLevelProgress(xp: number): number {
  return xp % 100;
}

export function calcXPToNext(xp: number): number {
  return (Math.floor(xp / 100) + 1) * 100 - xp;
}

export function calcRankScore(xp: number, correct: number, total: number): number {
  const acc = total > 0 ? correct / total : 0;
  return Math.round(xp * 0.5 + correct * 10 + acc * 100 + total * 2);
}

export function calcRank(score: number): GameRankType {
  if (score >= 1000) return 'Gold';
  if (score >= 500) return 'Silver';
  if (score >= 200) return 'Bronze';
  return 'Beginner';
}
