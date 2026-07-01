import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Shield,
  Flame,
  Star,
  CheckCircle,
  XCircle,
  BookOpen,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useGame, type ChallengeRecord } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';

const RANK_COLORS: Record<string, string> = {
  Beginner: '#64748B',
  Bronze: '#B87333',
  Silver: '#C0C0C0',
  Gold: '#FBBF24',
};

const STREAK_BONUS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

function shortAddr(addr: string) {
  return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return d + 'd ago';
  if (h > 0) return h + 'h ago';
  return 'just now';
}

const Dashboard: React.FC = () => {
  const { gameState } = useGame();
  const { walletAddress } = useWallet();

  const rankColor = RANK_COLORS[gameState.rank] || RANK_COLORS.Beginner;
  const nextStreakDay = gameState.streak < 5 ? gameState.streak + 1 : 5;
  const nextStreakXP = STREAK_BONUS[nextStreakDay] || 50;

  return (
    <div className="min-h-screen bg-bg-primary pt-20 lg:pt-24 pb-20 lg:pb-8">
      <Sidebar />
      <main className="lg:pl-60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* BLOCK 1: Premium Banner */}
          {gameState.premiumStatus && (
            <div
              className="rounded-2xl p-4 mb-6 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(139,92,246,0.12))',
                border: '1px solid rgba(251,191,36,0.3)',
              }}
            >
              <Star size={20} className="text-gold" fill="currentColor" />
              <span className="text-gold font-semibold text-sm">
                Premium Member — Enhanced profile & leaderboard status
              </span>
            </div>
          )}

          {/* BLOCK 2: Welcome Banner */}
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/20 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-text-secondary text-sm">Welcome back,</p>
                <p className="text-text-primary font-bold text-xl mt-1">
                  {shortAddr(walletAddress)}
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  Keep your streak alive. New challenges await.
                </p>
              </div>
              <Link
                to="/challenge"
                className="bg-gradient-brand rounded-xl px-5 py-2.5 text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Zap size={16} />
                Start Challenge
              </Link>
            </div>
          </div>

          {/* BLOCK 3: Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card A - Level */}
            <div className="bg-card rounded-2xl p-5 border border-brand-purple/15">
              <p className="text-text-secondary text-xs mb-3">Current Level</p>
              <p className="text-4xl font-black text-brand-purple">{gameState.level}</p>
              <div className="h-2 bg-secondary-layer rounded-full mt-3">
                <div
                  className="h-2 bg-gradient-brand rounded-full transition-all"
                  style={{ width: `${gameState.levelProgress}%` }}
                />
              </div>
              <p className="text-text-secondary text-xs mt-2">
                {gameState.totalXP} / {(gameState.level + 1) * 100} XP
              </p>
              <p className="text-text-secondary text-[11px] opacity-70">
                {gameState.xpToNextLevel} XP to Level {gameState.level + 1}
              </p>
            </div>

            {/* Card B - Rank */}
            <div className="bg-card rounded-2xl p-5 border border-brand-purple/15">
              <p className="text-text-secondary text-xs mb-3">Current Rank</p>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  border: `2px solid ${rankColor}`,
                  backgroundColor: `${rankColor}10`,
                }}
              >
                <Shield size={24} style={{ color: rankColor }} />
              </div>
              <p
                className="text-xl font-bold mt-2"
                style={{ color: rankColor }}
              >
                {gameState.rank}
              </p>
            </div>

            {/* Card C - Streak */}
            <div className="bg-card rounded-2xl p-5 border border-brand-purple/15">
              <p className="text-text-secondary text-xs mb-3">Day Streak</p>
              <div className="flex items-center gap-2">
                <Flame size={28} className="text-orange-500" />
                <p className="text-4xl font-black text-orange-500">{gameState.streak}</p>
              </div>
              <p className="text-text-secondary text-xs mt-2">
                Day {nextStreakDay} → +{nextStreakXP} XP
              </p>
            </div>

            {/* Card D - Total XP */}
            <div
              className="bg-card rounded-2xl p-5"
              style={{
                border: '1px solid rgba(251,191,36,0.25)',
                backgroundColor: 'rgba(251,191,36,0.02)',
              }}
            >
              <p className="text-text-secondary text-xs mb-3">Total XP</p>
              <p className="text-4xl font-black text-gold">
                ⚡ {gameState.totalXP}
              </p>
              <p className="text-text-secondary text-xs mt-2">XP Earned Total</p>
            </div>
          </div>

          {/* BLOCK 4: Quick Challenge + Streak Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left - Quick Challenge */}
            <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
              <h3 className="font-bold text-lg mb-4 text-text-primary">Start a Challenge</h3>
              <div className="space-y-3">
                <Link
                  to="/challenge"
                  className="block bg-secondary-layer rounded-xl p-4 flex items-center justify-between hover:border hover:border-brand-purple/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧠</span>
                    <span className="text-text-primary font-medium">General Knowledge</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-interactive-cyan/10 text-interactive-cyan">
                    10–40 XP
                  </span>
                </Link>

                <Link
                  to="/challenge"
                  className="block bg-secondary-layer rounded-xl p-4 flex items-center justify-between hover:border hover:border-brand-purple/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚽</span>
                    <span className="text-text-primary font-medium">Football</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success-emerald/10 text-success-emerald">
                    10–40 XP
                  </span>
                </Link>

                <Link
                  to="/challenge"
                  className="block bg-secondary-layer rounded-xl p-4 flex items-center justify-between hover:border hover:border-brand-purple/30 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <span className="text-text-primary font-medium">AI & Technology</span>
                    <span className="bg-gold/15 text-gold text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      Best XP
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-purple/10 text-brand-purple">
                    15–60 XP
                  </span>
                </Link>
              </div>
            </div>

            {/* Right - Streak Tracker */}
            <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg text-text-primary">Daily Streak 🔥</h3>
                <span className="text-gold text-xs font-medium">150 XP available</span>
              </div>
              <p className="text-text-secondary text-xs mb-6">
                Complete a challenge each day
              </p>

              {/* 5 Day Circles */}
              <div className="flex justify-between items-start">
                {[1, 2, 3, 4, 5].map((day) => {
                  const streakDay = gameState.streak;
                  const isCompleted = day <= streakDay;
                  const isCurrent = day === streakDay + 1 && streakDay < 5;

                  return (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-brand-purple/15 border-2 border-brand-purple'
                            : isCurrent
                            ? 'bg-interactive-cyan/10 border-2 border-interactive-cyan'
                            : 'bg-secondary-layer border border-brand-purple/10'
                        }`}
                        style={
                          isCurrent
                            ? { boxShadow: '0 0 0 4px rgba(56,189,248,0.15)' }
                            : undefined
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle size={18} className="text-brand-purple" />
                        ) : (
                          <span
                            className={`font-bold text-sm ${
                              isCurrent
                                ? 'text-interactive-cyan'
                                : 'text-text-secondary opacity-40'
                            }`}
                          >
                            {day}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-2">
                        +{STREAK_BONUS[day]}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-text-secondary mt-4">
                Complete all 5 days →{' '}
                <span className="text-gold font-bold">150 XP Bonus</span>
              </p>
            </div>
          </div>

          {/* BLOCK 5: Recent Activity */}
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-primary">Recent Activity</h3>
              <Link to="/profile" className="text-brand-purple text-sm font-medium hover:underline">
                View All
              </Link>
            </div>

            {gameState.challengeHistory.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen size={48} className="text-text-secondary opacity-20 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No activity yet.</p>
                <Link
                  to="/challenge"
                  className="text-brand-purple text-sm font-medium hover:underline"
                >
                  Start your first challenge
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-secondary-layer">
                {gameState.challengeHistory.slice(0, 5).map((record: ChallengeRecord) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.isCorrect
                          ? 'bg-success-emerald/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {record.isCorrect ? (
                        <CheckCircle size={18} className="text-success-emerald" />
                      ) : (
                        <XCircle size={18} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-medium text-sm">
                        {record.isCorrect ? 'Correct Answer' : 'Wrong Answer'}
                      </p>
                      <p className="text-text-secondary text-xs mt-0.5">
                        {record.category} · {record.difficulty}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {record.xpEarned > 0 ? (
                        <span className="text-gold text-sm font-bold">
                          +{record.xpEarned} XP
                        </span>
                      ) : (
                        <span className="text-text-secondary text-sm">—</span>
                      )}
                      <span className="text-text-secondary text-[11px]">
                        {timeAgo(record.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
