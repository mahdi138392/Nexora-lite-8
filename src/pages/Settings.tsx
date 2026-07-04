import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';
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
  <div
    onClick={() => onChange(!checked)}
    className="w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
    style={{ backgroundColor: checked ? '#8B5CF6' : '#273449' }}
  >
    <div
      className="absolute w-5 h-5 top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200"
      style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
    />
  </div>
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
          <h1 className="text-3xl font-bold text-text-primary mb-8">Settings</h1>

          {/* Account Card */}
          <Surface className="mb-6">
            <h2 className="font-bold text-lg text-text-primary mb-5">Account</h2>

            <div className="py-4 flex justify-between items-center border-b border-secondary-layer">
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

            <div className="py-4 flex justify-between items-center border-b border-secondary-layer">
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

            <div className="py-4 flex justify-between items-center">
              <div>
                <p className="text-red-400 font-medium text-sm">Disconnect Wallet</p>
                <p className="text-text-secondary text-xs mt-0.5">Your progress will be saved</p>
              </div>
              <button
                onClick={() => setShowDisconnect(true)}
                className="border border-red-500/50 text-red-400 rounded-xl px-4 py-2 text-sm hover:bg-red-500/10 transition"
              >
                Disconnect
              </button>
            </div>
          </Surface>

          {/* Preferences Card */}
          <Surface className="mb-6">
            <h2 className="font-bold text-lg text-text-primary mb-1">Preferences</h2>
            <p className="text-text-secondary text-xs mb-5">Saved in your browser</p>

            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-text-primary font-medium text-sm">XP Animations</p>
                  <p className="text-text-secondary text-xs mt-0.5">Show floating +XP on correct answers</p>
                </div>
                <Toggle checked={prefs.xpAnimations} onChange={(v) => updatePref('xpAnimations', v)} />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-text-primary font-medium text-sm">Streak Notifications</p>
                  <p className="text-text-secondary text-xs mt-0.5">Remind when streak is at risk</p>
                </div>
                <Toggle checked={prefs.notifications} onChange={(v) => updatePref('notifications', v)} />
              </div>
              <div className="flex justify-between items-center">
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
            <h2 className="font-bold text-lg text-text-primary mb-5">About Nexora</h2>
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
          style={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowDisconnect(false)}
        >
          <div
            className="bg-card rounded-2xl p-8 max-w-sm w-full text-center"
            style={{ border: '1px solid rgba(139,92,246,0.2)' }}
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
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold"
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
