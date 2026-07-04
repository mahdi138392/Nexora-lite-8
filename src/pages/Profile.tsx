import React, { useState } from 'react';
import { Copy, Check, Shield, ShoppingBag, Receipt, ExternalLink, Flame } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useGame, RANK_COLORS, ACHIEVEMENTS } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';
import { useAvatar, AVATAR_OPTIONS, avatarUrl } from '../context/AvatarContext';

const STREAK_BONUS: Record<number, number> = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 };

function shortAddr(a: string) {
  return a ? a.slice(0, 6) + '...' + a.slice(-4) : '';
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const Profile: React.FC = () => {
  const { gameState } = useGame();
  const { walletAddress } = useWallet();
  const { avatarSeed, setAvatarSeed } = useAvatar();
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
      <main className="lg:pl-60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <div className="bg-card rounded-2xl p-6 lg:p-8 border border-brand-purple/20">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                {avatarSeed ? (
                  <img
                    src={avatarUrl(avatarSeed)}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full flex-shrink-0 bg-secondary-layer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                    0x
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-brand-purple text-xs font-medium mt-2 hover:underline"
                >
                  {avatarSeed ? 'Change Avatar' : 'Choose Avatar'}
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-text-secondary text-sm break-all">{shortAddr(walletAddress)}</span>
                  <button onClick={handleCopy} className="bg-secondary-layer rounded-lg p-1.5">
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
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-secondary-layer rounded-xl p-4 text-center">
              <p className="text-gold font-bold text-lg">⚡ {gameState.totalXP} XP</p>
            </div>
            <div className="bg-secondary-layer rounded-xl p-4 text-center">
              <p className="text-brand-purple font-bold text-lg">Level {gameState.level}</p>
            </div>
            <div className="bg-secondary-layer rounded-xl p-4 text-center">
              <p className="font-bold text-lg" style={{ color: rankColor }}>{gameState.rank}</p>
            </div>
            <div className="bg-secondary-layer rounded-xl p-4 text-center">
              <p className="text-interactive-cyan font-bold text-lg">{gameState.totalChallenges} Done</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
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
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Flame size={28} className="text-orange-500" />
                <span className="text-3xl font-black text-orange-500">{gameState.streak} Day Streak</span>
              </div>
              <span className="text-gold text-xs">150 XP potential</span>
            </div>
            <div className="flex justify-between items-start">
              {[1, 2, 3, 4, 5].map((day) => {
                const isCompleted = day <= gameState.streak;
                const isCurrent = day === gameState.streak + 1 && gameState.streak < 5;
                return (
                  <div key={day} className="flex flex-col items-center">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-brand-purple/15 border-2 border-brand-purple'
                        : isCurrent ? 'bg-interactive-cyan/10 border-2 border-interactive-cyan'
                        : 'bg-secondary-layer border border-brand-purple/10'
                      }`}
                    >
                      <span className={`font-bold text-xs ${isCurrent ? 'text-interactive-cyan' : 'text-text-secondary opacity-40'}`}>
                        {day}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-1">+{STREAK_BONUS[day]}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-text-secondary mt-4">Complete all 5 days → <span className="text-gold font-bold">150 XP bonus!</span></p>
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
            <h2 className="font-bold text-xl text-text-primary mb-5">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = gameState.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-4 ${unlocked ? 'bg-gold/5' : 'bg-secondary-layer opacity-50'}`}
                    style={{ border: unlocked ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(139,92,246,0.1)' }}
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
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
            <h2 className="font-bold text-xl text-text-primary mb-4">My Items</h2>
            {!gameState.xpBoosterActive && !gameState.premiumStatus ? (
              <div className="text-center py-4">
                <ShoppingBag size={48} className="text-text-secondary opacity-20 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No items yet. Visit the Shop.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gameState.xpBoosterActive && (
                  <div className="bg-secondary-layer rounded-xl p-4 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                      ⚡ XP Booster <span className="bg-success-emerald/15 text-success-emerald text-[10px] px-2 py-0.5 rounded-full">Active</span>
                    </span>
                  </div>
                )}
                {gameState.premiumStatus && (
                  <div className="bg-secondary-layer rounded-xl p-4 flex items-center gap-2">
                    <span className="text-text-primary font-semibold text-sm">⭐ Premium Pass</span>
                    <span className="bg-success-emerald/15 text-success-emerald text-[10px] px-2 py-0.5 rounded-full">Active</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
            <h2 className="font-bold text-xl text-text-primary mb-5">Challenge Statistics</h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-secondary-layer rounded-xl p-4 text-center">
                <p className="text-text-primary font-bold">{gameState.totalChallenges}</p>
                <p className="text-text-secondary text-xs">Total</p>
              </div>
              <div className="bg-secondary-layer rounded-xl p-4 text-center">
                <p className="text-success-emerald font-bold">{gameState.correctAnswers}</p>
                <p className="text-text-secondary text-xs">Correct</p>
              </div>
              <div className="bg-secondary-layer rounded-xl p-4 text-center">
                <p className="text-brand-purple font-bold">{Math.round(gameState.accuracy * 100)}%</p>
                <p className="text-text-secondary text-xs">Accuracy</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'General Knowledge', count: catCounts.general, color: '#38BDF8' },
                { label: 'Football', count: catCounts.football, color: '#10B981' },
                { label: 'AI & Technology', count: catCounts.ai, color: '#8B5CF6' },
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
          <div className="bg-card rounded-2xl p-6 border border-brand-purple/15">
            <h2 className="font-bold text-xl text-text-primary mb-5">Transaction History</h2>
            {gameState.transactions.length === 0 ? (
              <div className="text-center py-4">
                <Receipt size={40} className="text-text-secondary opacity-20 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-layer">
                {gameState.transactions.map((tx) => (
                  <div key={tx.hash} className="flex justify-between py-3">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.type === 'xp_booster' ? 'bg-gold/15 text-gold' : 'bg-brand-purple/15 text-brand-purple'}`}>
                        {tx.type === 'xp_booster' ? 'XP Booster' : 'Premium Pass'}
                      </span>
                      <p className="text-text-secondary text-xs mt-1">{formatDate(tx.timestamp)}</p>
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
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="bg-card rounded-2xl p-6 max-w-sm w-full"
            style={{ border: '1px solid rgba(139,92,246,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-4 text-center">
              Choose Your Avatar
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setAvatarSeed(opt.seed); setShowAvatarPicker(false); }}
                  className={`rounded-xl p-1.5 transition-all ${
                    avatarSeed === opt.seed
                      ? 'border-2 border-brand-purple bg-brand-purple/10'
                      : 'border-2 border-transparent bg-secondary-layer hover:border-brand-purple/40'
                  }`}
                >
                  <img src={avatarUrl(opt.seed)} alt={opt.id} className="w-full rounded-lg" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="w-full mt-5 py-2.5 bg-secondary-layer text-text-primary rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
