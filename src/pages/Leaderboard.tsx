import React, { useState, useEffect, useCallback } from 'react';
import { Crown, Medal, Award, Star, Trophy, Sparkles, UserRound, Timer } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useGame, RANK_COLORS } from '../context/GameContext';
import { getLeaderboardDB, getUserPositionDB } from '../lib/database';
import { avatarUrl, getDefaultAvatarIdForWallet } from '../lib/avatars';
import Sidebar from '../components/Sidebar';
import { Skeleton } from '../components/ui/ProductUI';

interface LBRow {
  wallet_address: string;
  total_xp: number;
  level: number;
  rank: string;
  premium_status: boolean;
  avatar_id?: string | null;
}

type LeaderboardTab = 'daily' | 'weekly' | 'alltime';

const MOCK: LBRow[] = [
  { wallet_address: '0xA3f2000000000000000000000000000000B891', total_xp: 4250, level: 42, rank: 'Gold', premium_status: true, avatar_id: 'nova-hoodie' },
  { wallet_address: '0x7B2c0000000000000000000000000000000D445', total_xp: 3890, level: 38, rank: 'Gold', premium_status: false, avatar_id: 'kai-headphones' },
  { wallet_address: '0x9E1d0000000000000000000000000000000A223', total_xp: 3100, level: 31, rank: 'Silver', premium_status: true, avatar_id: 'amina-hijab' },
  { wallet_address: '0xF4a10000000000000000000000000000000C667', total_xp: 2540, level: 25, rank: 'Silver', premium_status: false, avatar_id: 'luna-glasses' },
  { wallet_address: '0x2D8b0000000000000000000000000000000E112', total_xp: 2100, level: 21, rank: 'Silver', premium_status: true, avatar_id: 'ren-techwear' },
  { wallet_address: '0x6C3e00000000000000000000000000000009934', total_xp: 1780, level: 17, rank: 'Bronze', premium_status: false, avatar_id: 'maya-bucket' },
  { wallet_address: '0xB1f70000000000000000000000000000007723', total_xp: 1420, level: 14, rank: 'Bronze', premium_status: false, avatar_id: 'amir-mask' },
  { wallet_address: '0x3A9d0000000000000000000000000000005581', total_xp: 980, level: 9, rank: 'Bronze', premium_status: false, avatar_id: 'nina-headset' },
  { wallet_address: '0xE5c20000000000000000000000000000001199', total_xp: 650, level: 6, rank: 'Beginner', premium_status: false, avatar_id: 'hana-buns' },
  { wallet_address: '0x8D4f0000000000000000000000000000008845', total_xp: 320, level: 3, rank: 'Beginner', premium_status: false, avatar_id: 'rio-fade' },
];

const tabs: Array<{ id: LeaderboardTab; label: string; hint: string }> = [
  { id: 'daily', label: 'Daily', hint: 'Hot streaks' },
  { id: 'weekly', label: 'Weekly', hint: 'Season push' },
  { id: 'alltime', label: 'All-time', hint: 'Legacy' },
];

const podiumMeta = [
  { place: 1, label: 'Apex', icon: Crown, color: '#FBBF24', height: 'h-36', order: 'md:order-2' },
  { place: 2, label: 'Vanguard', icon: Medal, color: '#C0C0C0', height: 'h-28', order: 'md:order-1' },
  { place: 3, label: 'Challenger', icon: Award, color: '#B87333', height: 'h-24', order: 'md:order-3' },
];

function shortAddr(a: string) {
  return a.length > 10 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;
}

function rowAvatar(row: LBRow) {
  return avatarUrl(row.avatar_id ?? getDefaultAvatarIdForWallet(row.wallet_address));
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LBRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<LeaderboardTab>('alltime');
  const [userPos, setUserPos] = useState(0);
  const { walletAddress, isConnected } = useWallet();
  const { gameState } = useGame();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dbTab = tab === 'daily' ? 'weekly' : tab;
      const rows = (await getLeaderboardDB(dbTab)) as unknown as LBRow[];
      setData(rows.length > 0 ? rows : MOCK);
      if (isConnected && walletAddress) {
        const pos = await getUserPositionDB(walletAddress);
        setUserPos(pos);
      }
    } catch {
      setData(MOCK);
    } finally {
      setLoading(false);
    }
  }, [tab, isConnected, walletAddress]);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 60000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3, 12);

  return (
    <div className="min-h-screen bg-transparent pt-20 lg:pt-24 pb-28 lg:pb-10">
      <Sidebar />
      <main className="lg:pl-60 px-4 product-page-enter">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="relative overflow-hidden rounded-[2rem] premium-surface-strong p-6 lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_86%_15%,rgba(216,140,58,0.18),transparent_34%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/25 px-4 py-2 text-xs font-black text-gold mb-4">
                  <Trophy size={15} /> Prestige board
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-text-primary">Leaderboard</h1>
                <p className="mt-3 max-w-2xl text-text-secondary">A competitive hall of signal, streaks, and earned XP. Premium players glow, but rank is won by performance.</p>
              </div>
              <div className="grid grid-cols-3 rounded-2xl bg-bg-primary/35 p-1 border border-white/5">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`rounded-xl px-4 py-3 text-left transition-all ${tab === item.id ? 'bg-gradient-brand text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <span className="block text-sm font-black">{item.label}</span>
                    <span className="block text-[10px] font-bold opacity-75">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-3 md:items-end">
                {podiumMeta.map((meta) => {
                  const row = top3[meta.place - 1];
                  if (!row) return null;
                  const Icon = meta.icon;
                  const isMe = isConnected && row.wallet_address.toLowerCase() === walletAddress.toLowerCase();
                  return (
                    <div key={meta.place} className={`${meta.order} relative overflow-hidden rounded-[1.75rem] premium-surface p-5 text-center ${isMe ? 'ring-2 ring-interactive-cyan' : ''}`}>
                      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 50% 0%, ${meta.color}24, transparent 52%)` }} />
                      <div className="relative z-10">
                        <Icon size={meta.place === 1 ? 38 : 30} className="mx-auto mb-3" style={{ color: meta.color }} fill={meta.place === 1 ? 'currentColor' : 'none'} />
                        <img
                          src={rowAvatar(row)}
                          alt="Player avatar"
                          className="mx-auto mb-3 h-16 w-16 rounded-2xl border border-white/10 bg-secondary-layer object-cover shadow-xl"
                        />
                        <p className="eyebrow-label text-xs" style={{ color: meta.color }}>#{meta.place} · {meta.label}</p>
                        <p className="mt-1 font-mono text-sm text-text-primary">{shortAddr(row.wallet_address)}</p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          {row.premium_status && <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-black text-gold"><Star size={10} className="inline" fill="currentColor" /> Premium</span>}
                          {isMe && <span className="rounded-full bg-interactive-cyan/15 px-2 py-1 text-[10px] font-black text-interactive-cyan">You</span>}
                        </div>
                        <p className="stat-number mt-4 text-4xl font-black" style={{ color: meta.color }}>{row.total_xp.toLocaleString()}</p>
                        <p className="text-xs text-text-secondary">XP · Level {row.level} · {row.rank}</p>
                        <div className={`mt-5 ${meta.height} rounded-t-3xl border-t-2`} style={{ borderColor: meta.color, background: `linear-gradient(180deg, ${meta.color}20, transparent)` }} />
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="premium-surface rounded-[1.75rem] overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                  <div>
                    <h2 className="text-xl font-black text-text-primary">Contender ranks</h2>
                    <p className="text-xs text-text-secondary">Dense competitive view for the next challengers.</p>
                  </div>
                  <Timer size={20} className="text-interactive-cyan" />
                </div>
                <div className="divide-y divide-white/5">
                  {rest.map((row, i) => {
                    const rankColor = RANK_COLORS[row.rank as keyof typeof RANK_COLORS] || '#64748B';
                    const isMe = isConnected && row.wallet_address.toLowerCase() === walletAddress.toLowerCase();
                    return (
                      <div key={row.wallet_address} className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors ${isMe ? 'bg-interactive-cyan/10' : 'hover:bg-white/[0.025]'}`}>
                        <span className={`text-lg font-black ${isMe ? 'text-interactive-cyan' : 'text-text-secondary'}`}>#{i + 4}</span>
                        <div className="flex min-w-0 items-center gap-3">
                          <img src={rowAvatar(row)} alt="Player avatar" className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-secondary-layer object-cover" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-mono text-sm font-bold text-text-primary">{shortAddr(row.wallet_address)}</p>
                              {row.premium_status && <Star size={13} className="text-gold" fill="currentColor" />}
                              {isMe && <span className="rounded-full bg-interactive-cyan/15 px-2 py-0.5 text-[10px] font-black text-interactive-cyan">YOU</span>}
                            </div>
                            <p className="text-xs text-text-secondary">Level {row.level} · <span style={{ color: rankColor }}>{row.rank}</span></p>
                          </div>
                        </div>
                        <p className="text-right font-black text-gold">{row.total_xp.toLocaleString()} XP</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <div className="fixed bottom-16 lg:bottom-0 left-0 w-full z-40 border-t border-brand-purple/30 bg-bg-primary/85 px-4 py-3 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-sm">
          {isConnected ? (
            <>
              <span className="flex items-center gap-2 text-text-secondary"><UserRound size={16} /> Your position <span className="text-interactive-cyan font-black">#{userPos || '—'}</span></span>
              <span style={{ color: RANK_COLORS[gameState.rank] }} className="font-black">{gameState.rank} · Lvl {gameState.level} · {gameState.totalXP.toLocaleString()} XP</span>
            </>
          ) : (
            <span className="mx-auto flex items-center gap-2 text-text-secondary"><Sparkles size={15} /> Connect wallet to reveal your standing</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
