import React, { useState, useEffect, useCallback } from 'react';
import { Crown, Medal, Award } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useGame, RANK_COLORS } from '../context/GameContext';
import { getLeaderboardDB, getUserPositionDB } from '../lib/database';
import Sidebar from '../components/Sidebar';

interface LBRow {
  wallet_address: string;
  total_xp: number;
  level: number;
  rank: string;
  premium_status: boolean;
}

const MOCK: LBRow[] = [
  { wallet_address: '0xA3f2000000000000000000000000000000B891', total_xp: 4250, level: 42, rank: 'Gold', premium_status: true },
  { wallet_address: '0x7B2c0000000000000000000000000000000D445', total_xp: 3890, level: 38, rank: 'Gold', premium_status: false },
  { wallet_address: '0x9E1d0000000000000000000000000000000A223', total_xp: 3100, level: 31, rank: 'Silver', premium_status: true },
  { wallet_address: '0xF4a10000000000000000000000000000000C667', total_xp: 2540, level: 25, rank: 'Silver', premium_status: false },
  { wallet_address: '0x2D8b0000000000000000000000000000000E112', total_xp: 2100, level: 21, rank: 'Silver', premium_status: true },
  { wallet_address: '0x6C3e0000000000000000000000000000000 9934', total_xp: 1780, level: 17, rank: 'Bronze', premium_status: false },
  { wallet_address: '0xB1f70000000000000000000000000000007723', total_xp: 1420, level: 14, rank: 'Bronze', premium_status: false },
  { wallet_address: '0x3A9d0000000000000000000000000000005581', total_xp: 980, level: 9, rank: 'Bronze', premium_status: false },
  { wallet_address: '0xE5c20000000000000000000000000000001199', total_xp: 650, level: 6, rank: 'Beginner', premium_status: false },
  { wallet_address: '0x8D4f0000000000000000000000000000008845', total_xp: 320, level: 3, rank: 'Beginner', premium_status: false },
];

function shortAddr(a: string) {
  return a.length > 10 ? a.slice(0, 6) + '...' + a.slice(-4) : a;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LBRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'weekly' | 'alltime'>('alltime');
  const [userPos, setUserPos] = useState(0);
  const { walletAddress, isConnected } = useWallet();
  const { gameState } = useGame();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = (await getLeaderboardDB(tab)) as LBRow[];
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
  const rest = data.slice(3, 10);

  return (
    <div className="min-h-screen bg-bg-primary pt-20 lg:pt-24 pb-24 lg:pb-8">
      <Sidebar />
      <main className="lg:pl-60 px-4">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-text-primary text-center">Leaderboard</h1>
        <p className="text-text-secondary text-center mt-2 mb-8">
          Compete with the best. Prove your knowledge.
        </p>

        <div className="flex justify-center mb-10">
          <div className="bg-secondary-layer rounded-xl p-1 flex">
            {(['alltime', 'weekly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  tab === t ? 'bg-brand-purple text-white' : 'text-text-secondary'
                }`}
              >
                {t === 'alltime' ? 'All-Time' : 'Weekly'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10">
              {top3[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold mb-2">
                    {shortAddr(top3[1].wallet_address).slice(0, 2)}
                  </div>
                  <p className="text-xs text-text-secondary mb-1">{shortAddr(top3[1].wallet_address)}</p>
                  <p className="text-sm font-bold" style={{ color: '#C0C0C0' }}>{top3[1].total_xp} XP</p>
                  <div className="w-24 h-24 rounded-t-xl mt-2 flex items-start justify-center pt-3"
                    style={{ background: 'rgba(192,192,192,0.1)', border: '2px solid rgba(192,192,192,0.3)' }}>
                    <Medal size={28} color="#C0C0C0" />
                  </div>
                </div>
              )}
              {top3[0] && (
                <div className="flex flex-col items-center">
                  <Crown size={24} className="text-gold mb-1" fill="currentColor" />
                  <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold mb-2">
                    {shortAddr(top3[0].wallet_address).slice(0, 2)}
                  </div>
                  <p className="text-xs text-text-secondary mb-1">{shortAddr(top3[0].wallet_address)}</p>
                  <p className="text-base font-bold text-gold">{top3[0].total_xp} XP</p>
                  <div className="w-28 h-32 rounded-t-xl mt-2 flex items-start justify-center pt-4"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 0 30px rgba(251,191,36,0.15)' }}>
                    <span className="text-2xl">🥇</span>
                  </div>
                </div>
              )}
              {top3[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold mb-2">
                    {shortAddr(top3[2].wallet_address).slice(0, 2)}
                  </div>
                  <p className="text-xs text-text-secondary mb-1">{shortAddr(top3[2].wallet_address)}</p>
                  <p className="text-sm font-bold" style={{ color: '#B87333' }}>{top3[2].total_xp} XP</p>
                  <div className="w-24 h-16 rounded-t-xl mt-2 flex items-start justify-center pt-2"
                    style={{ background: 'rgba(184,115,51,0.1)', border: '2px solid rgba(184,115,51,0.3)' }}>
                    <Award size={24} color="#B87333" />
                  </div>
                </div>
              )}
            </div>

            {/* Table rows 4-10 */}
            <div className="space-y-2 mb-24">
              {rest.map((row, i) => {
                const rankColor = RANK_COLORS[row.rank as keyof typeof RANK_COLORS] || '#64748B';
                const isMe = isConnected && row.wallet_address.toLowerCase() === walletAddress.toLowerCase();
                return (
                  <div
                    key={row.wallet_address}
                    className={`bg-card rounded-xl p-4 flex items-center gap-4 ${isMe ? 'border-l-4 border-brand-purple' : ''}`}
                  >
                    <span className="w-8 font-bold text-text-secondary text-sm">#{i + 4}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {shortAddr(row.wallet_address).slice(0, 2)}
                    </div>
                    <span className="flex-1 text-xs font-mono text-text-secondary truncate">
                      {shortAddr(row.wallet_address)}
                    </span>
                    {row.premium_status && <span className="text-gold text-xs">⭐</span>}
                    <span className="text-xs font-medium w-16" style={{ color: rankColor }}>{row.rank}</span>
                    <span className="text-xs text-text-secondary w-14">Lvl {row.level}</span>
                    <span className="text-sm font-bold text-gold w-16 text-right">{row.total_xp} XP</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        </div>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 w-full z-40 bg-secondary-layer/95 backdrop-blur border-t-2 border-brand-purple px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          {isConnected ? (
            <>
              <span className="text-text-secondary">
                Your Position: <span className="text-brand-purple font-bold">#{userPos || '—'}</span>
              </span>
              <span style={{ color: RANK_COLORS[gameState.rank] }} className="font-medium">
                {gameState.rank} · Lvl {gameState.level} · {gameState.totalXP} XP
              </span>
            </>
          ) : (
            <span className="text-text-secondary mx-auto">Connect wallet to see your position</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
