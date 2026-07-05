import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Crown,
  Flame,
  Lock,
  Play,
  Shield,
  Target,
  TrendingUp,
  Wallet,
  XCircle,
  Zap,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useGame, type ChallengeRecord } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';
import { useAvatar } from '../context/AvatarContext';
import { avatarUrl } from '../lib/avatars';

const RANK_COLORS: Record<string, string> = {
  Beginner: '#64748B',
  Bronze: '#B87333',
  Silver: '#C0C0C0',
  Gold: '#FBBF24',
};

const RANK_REQUIREMENTS: Record<string, { next: string; score: number | null }> = {
  Beginner: { next: 'Bronze', score: 200 },
  Bronze: { next: 'Silver', score: 500 },
  Silver: { next: 'Gold', score: 1000 },
  Gold: { next: 'Champion', score: null },
};

const STREAK_BONUS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Knowledge',
  football: 'Football',
  ai: 'AI & Technology',
};

const challengeRoutes = [
  {
    title: 'AI & Technology',
    icon: '🤖',
    xp: '15–60 XP',
    note: 'Best XP route',
    accent: 'border-brand-purple/35 bg-brand-purple/10 text-brand-purple',
  },
  {
    title: 'General Knowledge',
    icon: '🧠',
    xp: '10–40 XP',
    note: 'Balanced climb',
    accent: 'border-interactive-cyan/30 bg-interactive-cyan/10 text-interactive-cyan',
  },
  {
    title: 'Football',
    icon: '⚽',
    xp: '10–40 XP',
    note: 'Fast daily reps',
    accent: 'border-success-emerald/30 bg-success-emerald/10 text-success-emerald',
  },
];

function shortAddr(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Wallet not connected';
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'just now';
}

function formatDate(ts: number | null) {
  if (!ts) return 'No check-in yet';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const Dashboard: React.FC = () => {
  const { gameState } = useGame();
  const { walletAddress, isConnected, isConnecting, isCorrectNetwork } = useWallet();
  const { avatarId } = useAvatar();

  const rankColor = RANK_COLORS[gameState.rank] || RANK_COLORS.Beginner;
  const nextStreakDay = gameState.streak < 5 ? gameState.streak + 1 : 5;
  const nextStreakXP = STREAK_BONUS[nextStreakDay] || 50;
  const rankTarget = RANK_REQUIREMENTS[gameState.rank] ?? RANK_REQUIREMENTS.Beginner;
  const rankProgress = rankTarget.score
    ? Math.min(100, Math.round((gameState.rankScore / rankTarget.score) * 100))
    : 100;
  const rankScoreRemaining = rankTarget.score
    ? Math.max(rankTarget.score - gameState.rankScore, 0)
    : 0;
  const recentXp = gameState.challengeHistory
    .slice(0, 5)
    .reduce((sum, record) => sum + record.xpEarned, 0);
  const hasActivity = gameState.challengeHistory.length > 0;
  const accuracyPercent = Math.round(gameState.accuracy * 100);
  const commanderName = shortAddr(walletAddress);

  return (
    <div className="min-h-screen bg-transparent pt-20 lg:pt-24 pb-20 lg:pb-8">
      <Sidebar />
      <main className="lg:pl-60 product-page-enter">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] premium-surface-strong p-6 lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(243,201,139,0.18),transparent_30%),radial-gradient(circle_at_15%_15%,rgba(216,140,58,0.22),transparent_32%)]" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="premium-badge rounded-full px-3 py-1 text-xs font-bold text-interactive-cyan">
                    Player Command Center
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCorrectNetwork ? 'bg-success-emerald/10 text-success-emerald' : 'bg-gold/10 text-gold'}`}>
                    {isCorrectNetwork ? 'Ritual network ready' : 'Network check pending'}
                  </span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img src={avatarUrl(avatarId)} alt="Selected avatar" className="h-20 w-20 rounded-3xl border border-brand-purple/30 bg-secondary-layer object-cover shadow-purple-glow" />
                  <div>
                    <p className="text-sm text-text-secondary">Welcome back, commander</p>
                    <h1 className="mt-2 text-3xl lg:text-5xl font-black text-text-primary">
                      {isConnecting ? 'Syncing wallet...' : commanderName}
                    </h1>
                    <p className="mt-3 max-w-2xl text-text-secondary">
                      You are Level {gameState.level} with {gameState.totalXP.toLocaleString()} XP. Push the daily action to move toward Level {gameState.level + 1} and protect your streak.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary-layer/70 border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-[0.08em]"><Wallet size={14} /> Wallet</div>
                    <p className="mt-2 font-bold text-text-primary">{isConnected ? commanderName : 'Connect to sync'}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary-layer/70 border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-[0.08em]"><Shield size={14} /> Rank</div>
                    <p className="mt-2 font-bold" style={{ color: rankColor }}>{gameState.rank}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary-layer/70 border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-[0.08em]"><Flame size={14} /> Streak</div>
                    <p className="mt-2 font-bold text-primary">Day {gameState.streak || 0} · +{nextStreakXP} XP next</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-brand-purple/30 bg-bg-primary/35 p-5 flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Level progress</span>
                    <span>{gameState.levelProgress}%</span>
                  </div>
                  <div className="mt-3 h-4 rounded-full bg-secondary-layer overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-brand shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-all" style={{ width: `${gameState.levelProgress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">
                    {gameState.xpToNextLevel} XP until Level {gameState.level + 1}. Recent movement: <span className="font-bold text-gold">+{recentXp} XP</span> from your latest runs.
                  </p>
                </div>
                <Link to="/challenge" className="premium-button rounded-2xl px-5 py-4 text-white font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  <Play size={18} fill="currentColor" /> Launch Daily Action
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="premium-surface-strong rounded-3xl p-6 border-brand-purple/30">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div>
                  <p className="eyebrow-label text-interactive-cyan text-xs">Next action</p>
                  <h2 className="text-2xl font-black text-text-primary mt-1">Daily challenge board</h2>
                  <p className="text-text-secondary text-sm mt-2">Choose a route, earn XP, and trigger today&apos;s streak bonus.</p>
                </div>
                <div className="rounded-2xl bg-gold/10 border border-gold/25 px-4 py-3 text-right">
                  <p className="text-xs text-text-secondary">Streak reward</p>
                  <p className="text-xl font-black text-gold">+{nextStreakXP} XP</p>
                </div>
              </div>

              <div className="grid gap-3">
                {challengeRoutes.map((challenge, index) => (
                  <Link key={challenge.title} to="/challenge" className={`group rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] hover:bg-white/[0.03] ${challenge.accent}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-bg-primary/40 flex items-center justify-center text-2xl">{challenge.icon}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-text-primary">{challenge.title}</h3>
                          {index === 0 && <span className="rounded-full bg-gold/15 text-gold px-2 py-0.5 text-[10px] font-black">BEST XP</span>}
                        </div>
                        <p className="text-xs text-text-secondary">{challenge.note} · {challenge.xp}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-text-secondary group-hover:text-text-primary" size={20} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="premium-surface rounded-3xl p-6">
              <p className="eyebrow-label text-gold text-xs">Premium status</p>
              <div className="mt-4 flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gameState.premiumStatus ? 'bg-gold/15 text-gold' : 'bg-secondary-layer text-text-secondary'}`}>
                  {gameState.premiumStatus ? <Crown size={28} /> : <Lock size={26} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-primary">{gameState.premiumStatus ? 'Premium profile active' : 'Premium pass locked'}</h2>
                  <p className="text-sm text-text-secondary mt-2">
                    {gameState.premiumStatus
                      ? 'Your account is boosted with enhanced profile and leaderboard status.'
                      : 'Unlock premium in the shop to add more prestige to this player hub.'}
                  </p>
                </div>
              </div>
              <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline">
                {gameState.premiumStatus ? 'Manage perks' : 'View premium pass'} <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="premium-surface rounded-2xl p-5">
              <p className="eyebrow-label text-text-secondary text-[11px] mb-3">Progress & growth</p>
              <p className="stat-number text-4xl font-black text-brand-purple">{gameState.level}</p>
              <p className="text-sm text-text-secondary mt-2">Level {gameState.level + 1} in {gameState.xpToNextLevel} XP</p>
            </div>
            <div className="premium-surface rounded-2xl p-5">
              <p className="eyebrow-label text-text-secondary text-[11px] mb-3">Competitive status</p>
              <p className="stat-number text-3xl font-black" style={{ color: rankColor }}>{gameState.rank}</p>
              <p className="text-sm text-text-secondary mt-2">Score {gameState.rankScore}</p>
            </div>
            <div className="premium-surface rounded-2xl p-5">
              <p className="eyebrow-label text-text-secondary text-[11px] mb-3">Accuracy</p>
              <p className="stat-number text-4xl font-black text-success-emerald">{accuracyPercent}%</p>
              <p className="text-sm text-text-secondary mt-2">{gameState.correctAnswers}/{gameState.totalChallenges} correct</p>
            </div>
            <div className="rounded-2xl p-5 bg-gold/[0.03] border border-gold/30 shadow-gold-glow">
              <p className="eyebrow-label text-text-secondary text-[11px] mb-3">Total XP</p>
              <p className="stat-number text-4xl font-black text-gold">⚡ {gameState.totalXP.toLocaleString()}</p>
              <p className="text-sm text-text-secondary mt-2">Lifetime earned</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="premium-surface rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="eyebrow-label text-primary text-xs">Streak tracking</p>
                  <h2 className="text-xl font-black text-text-primary mt-1">Daily chain</h2>
                </div>
                <span className="text-sm font-bold text-text-secondary">Last: {formatDate(gameState.lastActiveDate)}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                {[1, 2, 3, 4, 5].map((day) => {
                  const isCompleted = day <= gameState.streak;
                  const isCurrent = day === gameState.streak + 1 && gameState.streak < 5;
                  return (
                    <div key={day} className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isCompleted ? 'bg-primary/15 border-primary text-primary' : isCurrent ? 'bg-interactive-cyan/10 border-interactive-cyan text-interactive-cyan shadow-[0_0_0_4px_rgba(243,201,139,0.12)]' : 'bg-secondary-layer border-white/5 text-text-secondary/50'}`}>
                        {isCompleted ? <CheckCircle size={18} /> : <span className="font-black">{day}</span>}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-2">+{STREAK_BONUS[day]}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl bg-secondary-layer/70 p-4 text-sm text-text-secondary flex items-center gap-3">
                <Flame className="text-primary" size={20} />
                Complete all 5 days for <span className="text-gold font-black">150 XP</span> in streak rewards.
              </div>
            </div>

            <div className="premium-surface rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="eyebrow-label text-brand-purple text-xs">Recent activity</p>
                  <h2 className="text-xl font-black text-text-primary mt-1">Battle log</h2>
                </div>
                <Link to="/profile" className="text-brand-purple text-sm font-bold hover:underline">View all</Link>
              </div>

              {!hasActivity ? (
                <div className="py-10 text-center rounded-2xl border border-dashed border-brand-purple/25 bg-brand-purple/[0.03]">
                  <BookOpen size={44} className="text-brand-purple/60 mx-auto mb-3" />
                  <h3 className="font-black text-text-primary">No battle log yet</h3>
                  <p className="text-text-secondary text-sm mt-2 max-w-sm mx-auto">Your first challenge will populate this feed with XP movement, answer results, and category momentum.</p>
                  <Link to="/challenge" className="mt-4 inline-flex items-center gap-2 premium-button rounded-xl px-4 py-2 text-white text-sm font-bold">
                    Start first challenge <Zap size={15} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-secondary-layer">
                  {gameState.challengeHistory.slice(0, 5).map((record: ChallengeRecord) => (
                    <div key={record.id} className="flex items-center gap-3 py-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${record.isCorrect ? 'bg-success-emerald/10' : 'bg-danger/10'}`}>
                        {record.isCorrect ? <CheckCircle size={18} className="text-success-emerald" /> : <XCircle size={18} className="text-danger" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-bold text-sm">{record.isCorrect ? 'Correct answer' : 'Missed answer'}</p>
                        <p className="text-text-secondary text-xs mt-0.5">{CATEGORY_LABELS[record.category] ?? record.category} · {record.difficulty}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={record.xpEarned > 0 ? 'text-gold text-sm font-black' : 'text-text-secondary text-sm'}>{record.xpEarned > 0 ? `+${record.xpEarned} XP` : '—'}</span>
                        <span className="text-text-secondary text-[11px]">{timeAgo(record.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="premium-surface rounded-3xl p-6">
            <div className="grid gap-5 lg:grid-cols-3 lg:items-center">
              <div className="lg:col-span-2">
                <p className="eyebrow-label text-interactive-cyan text-xs">Next reward</p>
                <h2 className="text-2xl font-black text-text-primary mt-1">
                  {rankTarget.score ? `${rankScoreRemaining} rank score to ${rankTarget.next}` : 'Gold rank secured'}
                </h2>
                <p className="text-sm text-text-secondary mt-2">Rank score blends XP, correct answers, accuracy, and volume. Keep playing to improve your competitive profile.</p>
                <div className="mt-4 h-3 rounded-full bg-secondary-layer overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${rankProgress}%`, backgroundColor: rankColor }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-secondary-layer/60 p-3"><TrendingUp className="mx-auto text-interactive-cyan" size={18} /><p className="text-xs text-text-secondary mt-2">Growth</p></div>
                <div className="rounded-2xl bg-secondary-layer/60 p-3"><Award className="mx-auto" style={{ color: rankColor }} size={18} /><p className="text-xs text-text-secondary mt-2">Rank</p></div>
                <div className="rounded-2xl bg-secondary-layer/60 p-3"><Target className="mx-auto text-gold" size={18} /><p className="text-xs text-text-secondary mt-2">Action</p></div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
