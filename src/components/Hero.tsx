import React from 'react';
import { ArrowRight, BarChart3, Loader2, ShieldCheck, Sparkles, Trophy, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useWallet } from '../context/WalletContext';

const trustSignals = [
  { icon: Sparkles, label: 'AI-generated quiz runs' },
  { icon: ShieldCheck, label: 'Wallet-native progress' },
  { icon: Trophy, label: 'Competitive XP ladder' },
];

const Hero: React.FC = () => {
  const { isConnected, isConnecting, connectWallet } = useWallet();
  const navigate = useNavigate();

  const handleCTAClick = async () => {
    if (isConnected) {
      navigate('/dashboard');
    } else {
      const connected = await connectWallet();
      if (connected) navigate('/dashboard');
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero pt-28 lg:pt-32">
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(216, 140, 58, 0.52) 1px, transparent 1px),
            linear-gradient(90deg, rgba(243, 201, 139, 0.34) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute left-1/2 top-[52%] h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      {/* Oversized abstract identity watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35">
        <Logo size={680} watermark className="blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-8rem)] items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="text-center lg:text-left">
            <div className="premium-badge mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-text-secondary">
              <Zap size={15} className="text-gold" />
              <span>Competitive learning for Web3 natives</span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary mb-6 leading-[0.98] tracking-[-0.034em] ">
              Turn knowledge into rank.
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 mb-9 leading-8">
              Nexora Lite turns fast AI challenges into XP, streaks, and public momentum — all anchored to your wallet identity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleCTAClick}
                disabled={isConnecting}
                className="premium-button group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 px-7 py-4 text-white rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isConnecting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Zap size={20} />
                )}
                <span className="text-base sm:text-lg">
                  {isConnecting ? 'Connecting...' : isConnected ? 'Enter Dashboard' : 'Start with Wallet'}
                </span>
              </button>
              <Link
                to="/leaderboard"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.035] px-7 py-4 font-heading font-bold text-text-primary transition-all duration-300 hover:border-interactive-cyan/40 hover:bg-white/[0.06]"
              >
                View Leaderboard
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {trustSignals.map((signal) => (
                <div key={signal.label} className="premium-surface flex items-center justify-center lg:justify-start gap-2 rounded-2xl px-4 py-3 text-sm text-text-secondary">
                  <signal.icon size={16} className="text-interactive-cyan" />
                  <span>{signal.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="premium-surface-strong rounded-[2rem] p-6 shadow-premium">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="eyebrow-label text-text-secondary text-[11px]">Live Progress Loop</p>
                  <h2 className="mt-2 text-2xl font-bold text-text-primary">Challenge → XP → Rank</h2>
                </div>
                <div className="rounded-2xl bg-success-emerald/10 px-3 py-2 text-sm font-semibold text-success-emerald border border-success-emerald/20">
                  Active
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'AI & Emerging Technology', value: '60 XP', color: 'text-brand-purple', width: '92%' },
                  { label: 'Daily streak reserve', value: '+150 XP', color: 'text-gold', width: '74%' },
                  { label: 'Leaderboard pressure', value: 'Top 10', color: 'text-interactive-cyan', width: '64%' },
                ].map((row) => (
                  <div key={row.label} className="rounded-2xl bg-secondary-layer/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-text-primary">{row.label}</span>
                      <span className={`font-numeric text-lg font-extrabold ${row.color}`}>{row.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-primary/70">
                      <div className="h-2 rounded-full bg-gradient-brand" style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-brand-purple/15 bg-brand-purple/10 p-4">
                  <p className="stat-number text-3xl font-black text-brand-purple">3</p>
                  <p className="mt-1 text-xs text-text-secondary">Modes</p>
                </div>
                <div className="rounded-2xl border border-gold/15 bg-gold/10 p-4">
                  <p className="stat-number text-3xl font-black text-gold">5</p>
                  <p className="mt-1 text-xs text-text-secondary">Streak Days</p>
                </div>
                <div className="rounded-2xl border border-interactive-cyan/15 bg-interactive-cyan/10 p-4">
                  <p className="stat-number text-3xl font-black text-interactive-cyan">∞</p>
                  <p className="mt-1 text-xs text-text-secondary">AI Runs</p>
                </div>
              </div>
            </div>
            <BarChart3 className="absolute -bottom-5 -right-5 text-interactive-cyan/30" size={120} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
};

export default Hero;
