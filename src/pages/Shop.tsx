import React, { useState, useEffect } from 'react';
import {
  Zap,
  Check,
  Loader2,
  Wallet,
  X,
  AlertCircle,
  Link2,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

type ItemType = 'xp_booster' | 'premium_pass';

interface PurchaseError {
  code?: number;
  message?: string;
}

function getPurchaseError(err: unknown): PurchaseError {
  return err instanceof Error ? err : (err as PurchaseError);
}

interface ConfirmModalProps {
  itemType: ItemType;
  itemName: string;
  price: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  success: boolean;
  error: string | null;
  txHash: string | null;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  itemName,
  price,
  onClose,
  onConfirm,
  loading,
  success,
  error,
  txHash,
}) => {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(9,7,5,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden premium-surface-strong rounded-3xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={48} className="text-brand-purple animate-spin mx-auto mb-4" />
            <p className="text-text-primary font-medium mb-1">Waiting for wallet confirmation...</p>
            <p className="text-text-secondary text-sm">Confirm the transaction in MetaMask</p>
          </div>
        ) : success ? (
          <div className="text-center py-3">
            <div className="mb-4 animate-bounce">
              <Check size={64} className="text-success-emerald mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-success-emerald mb-2">Purchase Successful!</h3>
            <p className="text-text-secondary text-sm mb-4">{itemName} is now active on your account.</p>
            {txHash && (
              <a
                href={`https://explorer.ritualfoundation.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive-cyan hover:underline"
              >
                <Link2 size={14} />
                View on Explorer
              </a>
            )}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 premium-button text-white rounded-xl font-semibold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-3">
            <div className="mb-4">
              <X size={64} className="text-danger mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-danger mb-2">Purchase Failed</h3>
            <p className="text-text-secondary text-sm mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 py-3 premium-button text-white rounded-xl font-semibold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-secondary-layer hover:border-brand-purple text-text-primary rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="eyebrow-label text-gold text-xs">Ritual checkout</p>
                <h3 className="text-2xl font-black text-text-primary">Confirm Exchange</h3>
              </div>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-bg-primary/35 border border-white/5 rounded-2xl">
                <span className="text-text-secondary">Item</span>
                <span className="text-text-primary font-medium">{itemName}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-bg-primary/35 border border-white/5 rounded-2xl">
                <span className="text-text-secondary">Price</span>
                <span className="text-text-primary font-bold">{price} RITUAL</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-interactive-cyan">
                <Link2 size={16} />
                <span>Transaction on Ritual Testnet</span>
              </div>
              <p className="text-sm text-gold flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>Ensure you have enough RITUAL in your wallet</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 py-3 premium-button text-white rounded-xl font-semibold transition-all"
              >
                Confirm exchange
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-secondary-layer hover:border-brand-purple text-text-primary rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Shop: React.FC = () => {
  const { isConnected, isCorrectNetwork, connectWallet, switchToRitual, checkLiveNetwork, purchaseItem, getRitualBalance } = useWallet();
  const { xpBoosterActive, xpBoosterExpiry, premiumStatus, setXPBooster, setPremium } = useGame();
  const { showToast } = useToast();

  const [loadingBooster, setLoadingBooster] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [boosterError, setBoosterError] = useState<string | null>(null);
  const [premiumError, setPremiumError] = useState<string | null>(null);
  const [ritualBalance, setRitualBalance] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    open: boolean;
    itemType: ItemType | null;
    loading: boolean;
    success: boolean;
    error: string | null;
    txHash: string | null;
  }>({ open: false, itemType: null, loading: false, success: false, error: null, txHash: null });

  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork) {
      setRitualBalance(null);
      return;
    }

    let active = true;
    const fetchBalance = async () => {
      const bal = await getRitualBalance();
      if (active) setRitualBalance(bal);
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isConnected, isCorrectNetwork, getRitualBalance]);

  useEffect(() => {
    if (!xpBoosterExpiry) return;
    const update = () => {
      const diff = xpBoosterExpiry - Date.now();
      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown({ hours, minutes });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [xpBoosterExpiry]);

  const getItemName = (itemType: ItemType) =>
    itemType === 'xp_booster' ? 'XP Booster' : 'Premium Pass';

  const handleBuy = async (itemType: ItemType) => {
    const price = itemType === 'xp_booster' ? '0.01' : '0.05';
    const setLoading = itemType === 'xp_booster' ? setLoadingBooster : setLoadingPremium;
    const setError = itemType === 'xp_booster' ? setBoosterError : setPremiumError;

    setLoading(true);
    setError(null);

    try {
      const txHash = await purchaseItem(price, itemType);

      if (itemType === 'xp_booster') {
        setXPBooster(txHash);
      } else {
        setPremium(txHash);
      }

      showToast('success', `${getItemName(itemType)} purchased successfully!`, {
        label: 'View on Explorer →',
        href: `https://explorer.ritualfoundation.org/tx/${txHash}`,
      });

      setModalState({
        open: true,
        itemType,
        loading: false,
        success: true,
        error: null,
        txHash,
      });
    } catch (err: unknown) {
      const purchaseError = getPurchaseError(err);
      if (purchaseError.message === 'WRONG_NETWORK') {
        setError('⚠️ Switch to Ritual Network to complete this purchase');
      } else if (purchaseError.code === 4001 || purchaseError.message?.includes('user rejected')) {
        showToast('error', 'Transaction rejected by user.');
      } else {
        showToast('error', purchaseError.message || 'Transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAndRetry = async (itemType: ItemType) => {
    await switchToRitual();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (itemType === 'xp_booster') setBoosterError(null);
    else setPremiumError(null);
    handleBuy(itemType);
  };

  const openConfirmModal = async (itemType: ItemType) => {
    const isOnRitual = await checkLiveNetwork();
    if (!isOnRitual) {
      if (itemType === 'xp_booster') {
        setBoosterError('⚠️ Switch to Ritual Network to complete this purchase');
      } else {
        setPremiumError('⚠️ Switch to Ritual Network to complete this purchase');
      }
      return;
    }
    setModalState({
      open: true,
      itemType,
      loading: false,
      success: false,
      error: null,
      txHash: null,
    });
  };

  const handleModalConfirm = async () => {
    if (!modalState.itemType) return;
    const itemType = modalState.itemType;
    setModalState((prev) => ({ ...prev, loading: true, error: null }));

    const price = itemType === 'xp_booster' ? '0.01' : '0.05';

    try {
      const txHash = await purchaseItem(price, itemType);
      if (itemType === 'xp_booster') {
        setXPBooster(txHash);
      } else {
        setPremium(txHash);
      }
      showToast('success', `${getItemName(itemType)} purchased successfully!`, {
        label: 'View on Explorer →',
        href: `https://explorer.ritualfoundation.org/tx/${txHash}`,
      });
      setModalState({
        open: true,
        itemType,
        loading: false,
        success: true,
        error: null,
        txHash,
      });
    } catch (err: unknown) {
      const purchaseError = getPurchaseError(err);
      setModalState({
        open: true,
        itemType,
        loading: false,
        success: false,
        error: purchaseError.code === 4001 ? 'Transaction rejected by user.' : purchaseError.message || 'Transaction failed. Please try again.',
        txHash: null,
      });
    }
  };

  const closeModal = () => {
    setModalState({ open: false, itemType: null, loading: false, success: false, error: null, txHash: null });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-transparent pt-16 lg:pt-24 pb-36 lg:pb-10 flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-5 sm:p-6 lg:p-6 text-center max-w-md w-full" style={{ border: '1px solid rgba(216,140,58,0.2)' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple/10 mb-6">
            <Wallet size={32} className="text-brand-purple" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Connect your wallet to access the Shop</h2>
          <p className="text-text-secondary mb-6 text-sm">Purchase XP Boosters and Premium Pass using Ritual Testnet.</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 premium-button text-white rounded-xl font-semibold transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const items = [
    {
      type: 'xp_booster' as const,
      name: 'XP Booster',
      rarity: 'Ritual-paid · Rare',
      price: '0.01',
      icon: Zap,
      accent: '#FBBF24',
      frame: 'border-gold/30 bg-gold/[0.035]',
      description: 'A 24-hour momentum charge for players ready to grind challenges.',
      benefits: ['1.5× XP multiplier on all correct answers', 'Runs for 24 hours after purchase', 'Stacks value across every category and tier'],
      active: xpBoosterActive,
      loading: loadingBooster,
      error: boosterError,
      activeLabel: `Active — ${countdown.hours}h ${countdown.minutes}m remaining`,
      cta: 'Charge booster',
    },
    {
      type: 'premium_pass' as const,
      name: 'Premium Pass',
      rarity: 'Premium · Legendary',
      price: '0.05',
      icon: Crown,
      accent: '#D88C3A',
      frame: 'border-brand-purple/35 bg-brand-purple/[0.04]',
      description: 'Permanent prestige for your identity, profile, and leaderboard presence.',
      benefits: ['Premium badge on profile', 'Special status in leaderboard rows', 'Permanent account recognition', 'Never expires'],
      active: premiumStatus,
      loading: loadingPremium,
      error: premiumError,
      activeLabel: 'Premium active',
      cta: 'Unlock premium',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent pt-16 lg:pt-24 pb-36 lg:pb-10">
      <main className="lg:pl-60 product-page-enter">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <section className="relative overflow-hidden rounded-3xl premium-surface-strong p-5 lg:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(251,191,36,0.18),transparent_30%),radial-gradient(circle_at_82%_5%,rgba(243,201,139,0.14),transparent_34%)]" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/25 px-4 py-2 text-xs font-black text-gold mb-4">
                  <Gem size={15} /> In-game economy
                </div>
                <h1 className="mobile-hero-title font-black text-text-primary">Ritual Shop</h1>
                {isConnected && isCorrectNetwork && (
                  <p className="mt-3 text-sm font-bold text-success-emerald">
                    Your balance:{' '}
                    {ritualBalance !== null
                      ? `${parseFloat(ritualBalance).toFixed(4)} RITUAL`
                      : 'Loading...'}
                  </p>
                )}
                <p className="mt-3 max-w-2xl text-text-secondary">Exchange Ritual testnet value for boosts, permanence, and visible prestige inside Nexora.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-bg-primary/35 border border-white/5 p-4">
                  <p className="text-xs text-text-secondary">Wallet state</p>
                  <p className="mt-1 font-black text-success-emerald">Connected</p>
                </div>
                <div className={`rounded-2xl border p-4 ${isCorrectNetwork ? 'bg-success-emerald/10 border-success-emerald/25' : 'bg-gold/10 border-gold/25'}`}>
                  <p className="text-xs text-text-secondary">Payment rail</p>
                  <p className={`mt-1 font-black ${isCorrectNetwork ? 'text-success-emerald' : 'text-gold'}`}>{isCorrectNetwork ? 'Ritual ready' : 'Switch required'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.type} className={`relative overflow-hidden rounded-3xl premium-surface p-5 border ${item.frame}`}>
                  <div className="absolute right-5 top-5 rounded-full bg-bg-primary/50 border border-white/10 px-3 py-1 text-[10px] font-black text-text-secondary">{item.rarity}</div>
                  <div className="flex items-start gap-4 pr-24">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-bg-primary/45" style={{ boxShadow: `0 18px 50px ${item.accent}30` }}>
                      <Icon size={34} style={{ color: item.accent }} fill={item.type === 'premium_pass' ? 'currentColor' : 'none'} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-text-primary">{item.name}</h2>
                      <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4 rounded-2xl bg-bg-primary/35 border border-white/5 p-4">
                    <div>
                      <p className="eyebrow-label text-xs text-text-secondary">Price</p>
                      <p className="stat-number mt-1 text-3xl font-black text-text-primary">{item.price}</p>
                    </div>
                    <p className="mb-1 rounded-full bg-gold/10 px-3 py-1 text-sm font-black text-gold">RITUAL</p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {item.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 text-sm text-text-secondary">
                        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-success-emerald" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {item.active ? (
                      <button disabled className="w-full rounded-2xl bg-success-emerald py-3 font-black text-white">✓ {item.activeLabel}</button>
                    ) : item.loading ? (
                      <button disabled className="w-full rounded-2xl bg-brand-purple/60 py-3 font-black text-white flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Processing exchange</button>
                    ) : (
                      <button onClick={() => openConfirmModal(item.type)} className="w-full rounded-2xl premium-button py-3 font-black text-white transition-transform hover:scale-[1.01]">{item.cta} — {item.price} RITUAL</button>
                    )}
                  </div>

                  {item.error && (
                    <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/10 p-4">
                      <p className="text-sm font-bold text-gold">{item.error}</p>
                      <button onClick={() => handleSwitchAndRetry(item.type)} className="mt-3 rounded-xl border border-interactive-cyan/40 px-4 py-2 text-sm font-bold text-interactive-cyan">Switch Network</button>
                      <p className="mt-2 text-xs text-text-secondary">
                        If nothing happens after tapping Switch Network, open MetaMask,
                        manually select the Ritual network from your network list, then
                        come back and tap the purchase button again.
                      </p>
                      <div className="mt-3 rounded-xl border border-interactive-cyan/25 bg-secondary-layer p-3 text-xs text-text-secondary">
                        <p className="mb-2">
                          If the automatic switch doesn't work, manually add/select this
                          network in your wallet app:
                        </p>
                        <ul className="mb-3 space-y-0.5 font-mono">
                          <li>Network Name: Ritual</li>
                          <li>RPC URL: https://rpc.ritualfoundation.org</li>
                          <li>Chain ID: 1979</li>
                          <li>Currency Symbol: RITUAL</li>
                        </ul>
                        <button
                          onClick={async () => {
                            const ok = await checkLiveNetwork();
                            if (ok) {
                              setBoosterError(null);
                              setPremiumError(null);
                            }
                          }}
                          className="rounded-lg border border-interactive-cyan/40 px-3 py-1.5 font-bold text-interactive-cyan"
                        >
                          I've switched — Check Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section className="rounded-3xl premium-surface p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-interactive-cyan" />
              <div>
                <p className="font-black text-text-primary">Free play stays open</p>
                <p className="text-sm text-text-secondary">Challenges remain playable without purchases; paid items amplify prestige and progress.</p>
              </div>
            </div>
            <span className="rounded-full bg-interactive-cyan/10 px-3 py-1 text-xs font-black text-interactive-cyan">Free · Premium · Ritual-paid</span>
          </section>
        </div>
      </main>

      {modalState.open && modalState.itemType && (
        <ConfirmModal
          itemType={modalState.itemType}
          itemName={getItemName(modalState.itemType)}
          price={modalState.itemType === 'xp_booster' ? '0.01' : '0.05'}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
          loading={modalState.loading}
          success={modalState.success}
          error={modalState.error}
          txHash={modalState.txHash}
        />
      )}
    </div>
  );
};

export default Shop;
