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
