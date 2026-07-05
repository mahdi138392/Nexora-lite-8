import React, { useState } from 'react';
import { Copy, Check, Shield, Receipt, ExternalLink, Flame, Crown, Trophy, Sparkles, WalletCards } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useGame, RANK_COLORS, ACHIEVEMENTS } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';
import { useAvatar } from '../context/AvatarContext';
import { avatarUrl } from '../lib/avatars';
import AvatarPickerModal from '../components/profile/AvatarPickerModal';
import EmptyState from '../components/profile/EmptyState';
import InventoryList from '../components/profile/InventoryList';
import MetricCard from '../components/ui/MetricCard';
import ProfileStatCard from '../components/profile/ProfileStatCard';
import StreakProgress from '../components/profile/StreakProgress';
import { formatTimestamp, shortenAddress } from '../lib/format';


const Profile: React.FC = () => {
  const { gameState } = useGame();
  const { walletAddress } = useWallet();
  const { avatarId, setAvatarId } = useAvatar();
  const [copied, setCopied] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const rankColor = RANK_COLORS[gameState.rank] || RANK_COLORS.Beginner;
  const nextRank = gameState.rank === 'Beginner' ? 'Bronze' : gameState.rank === 'Bronze' ? 'Silver' : gameState.rank === 'Silver' ? 'Gold' : null;
  const rankThresholds: Record<string, number> = { Bronze: 200, Silver: 500, Gold: 1000 };
  const prevThreshold: Record<string, number> = { Bronze: 0, Silver: 200, Gold: 500 };
  const rankProgress = nextRank
    ? Math.min(100, ((gameState.rankScore - prevThreshold[nextRank]) / (rankThresholds[nextRank] - prevThreshold[nextRank])) * 100)
    : 100;

  const catCounts = { general: 0, football: 0, ai: 0 };
  gameState.challengeHistory.forEach((c) => { catCounts[c.category]++; });
  const total = gameState.totalChallenges || 1;

  function handleCopy() {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 lg:pt-24 pb-20 lg:pb-8">
      <Sidebar />
      <main className="lg:pl-60 product-page-enter">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <div className="relative overflow-hidden premium-surface-strong rounded-[2rem] p-6 lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(216,140,58,0.18),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(251,191,36,0.14),transparent_30%)]" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                {avatarId ? (
                  <img
                    src={avatarUrl(avatarId)}
                    alt="Avatar"
                    className="w-24 h-24 rounded-3xl flex-shrink-0 bg-secondary-layer ring-2 ring-brand-purple/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-brand flex items-center justify-center text-white text-2xl font-black flex-shrink-0 ring-2 ring-brand-purple/30">
                    0x
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-brand-purple text-xs font-medium mt-2 hover:underline"
                >
                  {avatarId ? 'Change Avatar' : 'Choose Avatar'}
                </button>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-purple/10 border border-brand-purple/25 px-3 py-1 text-xs font-black text-brand-purple mb-3">
                  <Sparkles size={13} /> Collectible player profile
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-text-primary text-xl font-black break-all">{shortenAddress(walletAddress)}</span>
                  <button type="button" onClick={handleCopy} className="bg-secondary-layer rounded-lg p-1.5" aria-label="Copy wallet address">
                    {copied ? <Check size={14} className="text-success-emerald" /> : <Copy size={14} className="text-text-secondary" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1"
                    style={{ backgroundColor: `${rankColor}1A`, border: `1px solid ${rankColor}` }}>
                    <Shield size={14} style={{ color: rankColor }} /> <span style={{ color: rankColor }}>{gameState.rank}</span>
                  </span>
                  <span className="bg-brand-purple/10 text-brand-purple rounded-full px-3 py-1 text-sm">Lvl {gameState.level}</span>
                  {gameState.premiumStatus && (
                    <span className="bg-gold/10 text-gold border border-gold/30 rounded-full px-3 py-1 text-sm">⭐ Premium</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                <div className="rounded-2xl bg-bg-primary/35 border border-white/5 p-4">
                  <WalletCards size={18} className="text-interactive-cyan mb-2" />
                  <p className="text-xs text-text-secondary">Identity</p>
                  <p className="font-black text-text-primary">Wallet-bound</p>
                </div>
                <div className="rounded-2xl bg-gold/10 border border-gold/25 p-4">
                  <Crown size={18} className="text-gold mb-2" />
                  <p className="text-xs text-text-secondary">Status</p>
                  <p className="font-black text-gold">{gameState.premiumStatus ? 'Premium' : 'Standard'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ProfileStatCard className="text-gold">⚡ {gameState.totalXP} XP</ProfileStatCard>
            <ProfileStatCard className="text-brand-purple">Level {gameState.level}</ProfileStatCard>
            <ProfileStatCard className="" textStyle={{ color: rankColor }}>{gameState.rank}</ProfileStatCard>
            <ProfileStatCard className="text-interactive-cyan">{gameState.totalChallenges} Done</ProfileStatCard>
          </div>

          {/* Progress */}
          <div className="premium-surface rounded-[1.5rem] p-6">
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary text-sm">Progress to Next Level</span>
              <span className="text-gold text-sm font-semibold">{gameState.totalXP} / {(gameState.level + 1) * 100} XP</span>
            </div>
            <div className="h-3 bg-secondary-layer rounded-full">
              <div className="h-3 bg-gradient-brand rounded-full transition-all" style={{ width: `${gameState.levelProgress}%` }} />
            </div>
            <p className="text-text-secondary text-xs mt-2">{gameState.xpToNextLevel} XP to Level {gameState.level + 1}</p>

            <div className="border-t border-secondary-layer my-5" />

            {nextRank ? (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary text-sm">Progress to Next Rank</span>
                  <span className="text-sm font-semibold" style={{ color: RANK_COLORS[nextRank as keyof typeof RANK_COLORS] }}>
                    {gameState.rank} → {nextRank}
                  </span>
                </div>
                <div className="h-3 bg-secondary-layer rounded-full">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${rankProgress}%`, backgroundColor: RANK_COLORS[nextRank as keyof typeof RANK_COLORS] }} />
                </div>
              </>
            ) : (
              <p className="text-gold text-center font-bold">🏆 Maximum Rank Achieved!</p>
            )}
          </div>

          {/* Streak */}
          <div className="premium-surface rounded-[1.5rem] p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Flame size={28} className="text-primary" />
                <span className="stat-number text-3xl font-black text-primary">{gameState.streak} Day Streak</span>
              </div>
              <span className="text-gold text-xs">150 XP potential</span>
            </div>
            <StreakProgress streak={gameState.streak} />
            <p className="text-center text-xs text-text-secondary mt-4">Complete all 5 days → <span className="text-gold font-bold">150 XP bonus!</span></p>
          </div>

          {/* Achievements */}
          <div className="premium-surface rounded-[1.5rem] p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="font-black text-2xl text-text-primary">Trophy Case</h2><Trophy className="text-gold" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = gameState.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-2xl p-4 transition-all ${unlocked ? 'bg-gold/10 shadow-gold-glow' : 'bg-secondary-layer/70 opacity-60'}`}
                    style={{ border: unlocked ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(216,140,58,0.1)' }}
                  >
                    <span className={`text-3xl block ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                    <p className="text-xs font-semibold text-text-primary mt-2">{ach.name}</p>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 mt-2 inline-block ${unlocked ? 'bg-gold/15 text-gold' : 'bg-card text-text-secondary'}`}>
                      {unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Items */}
          <div className="premium-surface rounded-[1.5rem] p-6">
            <h2 className="font-black text-2xl text-text-primary mb-4">Inventory</h2>
            <InventoryList premiumStatus={gameState.premiumStatus} xpBoosterActive={gameState.xpBoosterActive} />
          </div>

          {/* Statistics */}
          <div className="premium-surface rounded-[1.5rem] p-6">
            <h2 className="font-black text-2xl text-text-primary mb-5">Performance Map</h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <MetricCard label="Total" value={<span className="font-bold text-text-primary">{gameState.totalChallenges}</span>} />
              <MetricCard label="Correct" value={<span className="font-bold text-success-emerald">{gameState.correctAnswers}</span>} />
              <MetricCard label="Accuracy" value={<span className="font-bold text-brand-purple">{Math.round(gameState.accuracy * 100)}%</span>} />
            </div>
            <div className="space-y-3">
              {[
                { label: 'General Knowledge', count: catCounts.general, color: '#F3C98B' },
                { label: 'Football', count: catCounts.football, color: '#10B981' },
                { label: 'AI & Technology', count: catCounts.ai, color: '#D88C3A' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-36">{c.label}</span>
                  <div className="flex-1 h-2 bg-secondary-layer rounded-full">
                    <div className="h-2 rounded-full" style={{ width: `${(c.count / total) * 100}%`, backgroundColor: c.color }} />
                  </div>
                  <span className="text-xs text-text-secondary w-8 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="premium-surface rounded-[1.5rem] p-6">
            <h2 className="font-black text-2xl text-text-primary mb-5">Ritual Ledger</h2>
            {gameState.transactions.length === 0 ? (
              <EmptyState icon={<Receipt size={40} />} message="No transactions yet." />
            ) : (
              <div className="divide-y divide-secondary-layer">
                {gameState.transactions.map((tx) => (
                  <div key={tx.hash} className="flex justify-between py-3">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.type === 'xp_booster' ? 'bg-gold/15 text-gold' : 'bg-brand-purple/15 text-brand-purple'}`}>
                        {tx.type === 'xp_booster' ? 'XP Booster' : 'Premium Pass'}
                      </span>
                      <p className="text-text-secondary text-xs mt-1">{formatTimestamp(tx.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold text-sm font-bold">{tx.amount} RITUAL</p>
                      <a
                        href={`https://explorer.ritualfoundation.org/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-interactive-cyan text-xs flex items-center gap-1 justify-end"
                      >
                        View <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {showAvatarPicker && (
        <AvatarPickerModal
          avatarId={avatarId}
          onClose={() => setShowAvatarPicker(false)}
          onSelect={(selectedAvatarId) => {
            setAvatarId(selectedAvatarId, walletAddress);
            setShowAvatarPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
