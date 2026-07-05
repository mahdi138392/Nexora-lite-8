import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, ExternalLink, Wallet, Wifi, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import AppShell from '../components/ui/AppShell';
import Surface from '../components/ui/Surface';
import { useWallet } from '../context/WalletContext';

interface Prefs {
  xpAnimations: boolean;
  notifications: boolean;
  autoAdvance: boolean;
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem('nexora_prefs');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { xpAnimations: true, notifications: true, autoAdvance: false };
}

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 rounded-full border transition-all duration-200 ${checked ? 'border-brand-purple/50 bg-brand-purple shadow-[0_10px_24px_rgba(0,0,0,0.24)]' : 'border-white/10 bg-secondary-layer'}`}
    aria-pressed={checked}
  >
    <span
      className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-200"
      style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
    />
  </button>
);

const Settings: React.FC = () => {
  const { walletAddress, isConnected, isCorrectNetwork, disconnectWallet, switchToRitual } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  function handleCopy() {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updatePref(key: keyof Prefs, val: boolean) {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    localStorage.setItem('nexora_prefs', JSON.stringify(next));
  }

  return (
    <>
    <AppShell maxWidth="3xl">
          <section className="relative overflow-hidden rounded-[2rem] premium-surface-strong p-6 mb-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(243,201,139,0.14),transparent_35%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-interactive-cyan/10 border border-interactive-cyan/25 px-3 py-1 text-xs font-black text-interactive-cyan mb-3">
                <SlidersHorizontal size={13} /> Control panel
              </div>
              <h1 className="font-heading text-4xl font-black text-text-primary tracking-[-0.03em]">Settings</h1>
              <p className="mt-2 text-text-secondary">Minimal controls for wallet safety, network readiness, and local preferences.</p>
            </div>
          </section>

          {/* Account Card */}
          <Surface className="mb-6">
            <h2 className="font-black text-xl text-text-primary mb-5 flex items-center gap-2"><Wallet className="text-brand-purple" /> Account & network</h2>

            <div className="py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-secondary-layer">
              <div>
                <p className="text-text-primary font-medium text-sm">Connected Wallet</p>
                <p className="text-text-secondary text-xs mt-0.5">Your Web3 identity</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-secondary">
                  {walletAddress ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4) : '—'}
                </span>
                <button onClick={handleCopy} className="bg-secondary-layer rounded-lg p-1.5 hover:text-brand-purple transition">
                  {copied ? <Check size={14} className="text-success-emerald" /> : <Copy size={14} className="text-text-secondary" />}
                </button>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-success-emerald">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-emerald" /> Connected
                  </span>
                )}
              </div>
            </div>

            <div className="py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-secondary-layer">
              <div>
                <p className="text-text-primary font-medium text-sm">Network</p>
                <p className="text-text-secondary text-xs mt-0.5">Current blockchain network</p>
              </div>
              {isCorrectNetwork ? (
                <span className="text-xs px-3 py-1 rounded-full bg-interactive-cyan/10 text-interactive-cyan border border-interactive-cyan/30">
                  Ritual Testnet
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
                    Not on Ritual
                  </span>
                  <button onClick={switchToRitual} className="text-interactive-cyan text-xs font-medium hover:underline">
                    Switch
                  </button>
                </div>
              )}
            </div>

            <div className="py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <p className="text-danger font-medium text-sm">Disconnect Wallet</p>
                <p className="text-text-secondary text-xs mt-0.5">Your progress will be saved</p>
              </div>
              <button
                onClick={() => setShowDisconnect(true)}
                className="border border-danger/50 text-danger rounded-xl px-4 py-2 text-sm hover:bg-danger/10 transition"
              >
                Disconnect
              </button>
            </div>
          </Surface>

          {/* Preferences Card */}
          <Surface className="mb-6">
            <h2 className="font-black text-xl text-text-primary mb-1 flex items-center gap-2"><ShieldCheck className="text-success-emerald" /> Preferences</h2>
            <p className="text-text-secondary text-xs mb-5">Saved in your browser</p>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-bg-primary/25 border border-white/5 p-4">
                <div>
                  <p className="text-text-primary font-medium text-sm">XP Animations</p>
                  <p className="text-text-secondary text-xs mt-0.5">Show floating +XP on correct answers</p>
                </div>
                <Toggle checked={prefs.xpAnimations} onChange={(v) => updatePref('xpAnimations', v)} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-bg-primary/25 border border-white/5 p-4">
                <div>
                  <p className="text-text-primary font-medium text-sm">Streak Notifications</p>
                  <p className="text-text-secondary text-xs mt-0.5">Remind when streak is at risk</p>
                </div>
                <Toggle checked={prefs.notifications} onChange={(v) => updatePref('notifications', v)} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-bg-primary/25 border border-white/5 p-4">
                <div>
                  <p className="text-text-primary font-medium text-sm">Auto-advance</p>
                  <p className="text-text-secondary text-xs mt-0.5">Automatically move to next challenge</p>
                </div>
                <Toggle checked={prefs.autoAdvance} onChange={(v) => updatePref('autoAdvance', v)} />
              </div>
            </div>
          </Surface>

          {/* About Card */}
          <Surface>
            <h2 className="font-black text-xl text-text-primary mb-5 flex items-center gap-2"><Wifi className="text-interactive-cyan" /> About Nexora</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Version</span>
                <span className="text-text-primary">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Network</span>
                <span className="text-text-primary">Ritual (Chain ID: 1979)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">RPC</span>
                <span className="text-text-primary">rpc.ritualfoundation.org</span>
              </div>
            </div>

            <div className="flex gap-5 mt-5">
              <a href="https://explorer.ritualfoundation.org" target="_blank" rel="noopener noreferrer"
                className="text-interactive-cyan text-sm hover:underline flex items-center gap-1">
                Explorer <ExternalLink size={12} />
              </a>
              <a href="https://x.com/Metipax" target="_blank" rel="noopener noreferrer"
                className="text-interactive-cyan text-sm hover:underline flex items-center gap-1">
                X <ExternalLink size={12} />
              </a>
              <a href="https://discord.gg/yfdVK6dU" target="_blank" rel="noopener noreferrer"
                className="text-interactive-cyan text-sm hover:underline flex items-center gap-1">
                Discord <ExternalLink size={12} />
              </a>
            </div>

            <p className="text-center text-xs text-text-secondary opacity-60 mt-6 pt-4 border-t border-secondary-layer">
              Built by Meti pax
            </p>
          </Surface>
      </AppShell>

      {/* Disconnect Modal */}
      {showDisconnect && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(9,7,5,0.9)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowDisconnect(false)}
        >
          <div
            className="premium-surface-strong rounded-[2rem] p-8 max-w-sm w-full text-center"
            style={{ border: '1px solid rgba(216,140,58,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle size={40} className="text-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary">Disconnect Wallet?</h3>
            <p className="text-text-secondary text-sm mt-2 mb-6">
              Your XP, level, and achievements are saved. Reconnect anytime to restore everything.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { disconnectWallet(); setShowDisconnect(false); }}
                className="flex-1 py-3 bg-danger text-white rounded-xl font-semibold"
              >
                Disconnect
              </button>
              <button
                onClick={() => setShowDisconnect(false)}
                className="flex-1 py-3 bg-secondary-layer text-text-primary rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
