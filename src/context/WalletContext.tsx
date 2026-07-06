/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useGame } from './GameContext';
import { useAvatar } from './AvatarContext';
import type { GameState, RankType } from './GameContext';
import {
  ensureUser,
  loadAchievementsDB,
  loadTransactionsDB,
  loadUserFromDB,
} from '../lib/database';

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface WalletError {
  code?: number;
}

const RITUAL_CHAIN_ID = '0x7BB';
const RITUAL_NETWORK = {
  chainId: '0x7BB',
  chainName: 'Ritual',
  nativeCurrency: {
    name: 'RITUAL',
    symbol: 'RITUAL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ritualfoundation.org'],
  blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
};

const FEE_RECIPIENT = '0xd06bC18129a8be9af885E7E63B1B95FB19c261b3';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  switchToRitual: () => Promise<void>;
  checkLiveNetwork: () => Promise<boolean>;
  getRitualBalance: () => Promise<string>;
  purchaseItem: (
    price: string,
    itemType: 'xp_booster' | 'premium_pass'
  ) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { showToast } = useToast();
  const { hydrateAvatarForWallet } = useAvatar();
  const {
    loadFromDBState,
    loadStateForWallet,
    resetGame,
    unlockAchievement,
  } = useGame();

  const loadSupabaseState = useCallback(async (address: string) => {
    try {
      await ensureUser(address);
      const [dbUser, dbAchievements, dbTransactions] = await Promise.all([
        loadUserFromDB(address),
        loadAchievementsDB(address),
        loadTransactionsDB(address),
      ]);

      if (dbUser) {
        const merged: Partial<GameState> = {
          totalXP: dbUser.total_xp,
          level: dbUser.level,
          rank: dbUser.rank as RankType,
          rankScore: dbUser.rank_score,
          streak: dbUser.streak,
          lastActiveDate: dbUser.last_active_date
            ? new Date(dbUser.last_active_date).getTime()
            : null,
          correctAnswers: dbUser.correct_answers,
          totalChallenges: dbUser.total_challenges,
          premiumStatus: dbUser.premium_status,
          premiumPurchasedAt: dbUser.premium_purchased_at,
          xpBoosterActive: dbUser.xp_booster_active,
          xpBoosterExpiry: dbUser.xp_booster_expiry
            ? new Date(dbUser.xp_booster_expiry).getTime()
            : null,
          achievements: dbAchievements,
          transactions: dbTransactions,
        };
        loadStateForWallet(address);
        loadFromDBState(merged);
        hydrateAvatarForWallet(address, dbUser.avatar_id);
      } else {
        hydrateAvatarForWallet(address);
      }
    } catch {
      hydrateAvatarForWallet(address);
      console.warn('[DB] Supabase unavailable, using local data');
    }
  }, [hydrateAvatarForWallet, loadFromDBState, loadStateForWallet]);

  const connectWallet = useCallback(async (): Promise<boolean> => {
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!window.ethereum && isMobileDevice) {
      const currentUrl = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
      return false;
    }

    if (!window.ethereum) {
      showToast('error', 'Please install MetaMask to continue');
      return false;
    }
    try {
      setIsConnecting(true);
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (!accounts || accounts.length === 0) return false;
      const address = accounts[0];
      setWalletAddress(address);
      setIsConnected(true);
      localStorage.setItem('nexora_wallet', address.toLowerCase());
      loadStateForWallet(address);
      unlockAchievement('first_login');
      await loadSupabaseState(address);
      const chainId = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      setIsCorrectNetwork(chainId === RITUAL_CHAIN_ID);
      return true;
    } catch (err: unknown) {
      if ((err as WalletError).code === 4001) {
        showToast('error', 'Connection rejected by user.');
      } else {
        showToast('error', 'Failed to connect. Please try again.');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [loadStateForWallet, loadSupabaseState, showToast, unlockAchievement]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress('');
    setIsCorrectNetwork(false);
    localStorage.removeItem('nexora_wallet');
    resetGame();
  }, [resetGame]);

  const switchToRitual = async () => {
    if (!window.ethereum) {
      showToast('error', 'Please install MetaMask to continue');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: RITUAL_CHAIN_ID }],
      });
    } catch (err: unknown) {
      const code = (err as WalletError)?.code;
      if (code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [RITUAL_NETWORK],
          });
        } catch {
          showToast(
            'error',
            'Failed to add Ritual network. Please add it manually in your wallet settings.'
          );
        }
      }
      // For other error codes, do not show an error immediately —
      // some mobile wallets report an error even when the switch
      // actually completes a moment later. Fall through to polling.
    }

    // Poll for up to 10 seconds (checking every second), since mobile
    // wallet browsers often need a few seconds for the user to notice
    // and tap the confirmation prompt.
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const chainId = (await window.ethereum.request({
          method: 'eth_chainId',
        })) as string;
        if (chainId === RITUAL_CHAIN_ID) {
          setIsCorrectNetwork(true);
          showToast('success', 'Switched to Ritual Network');
          return;
        }
      } catch {
        // ignore transient errors while polling
      }
    }

    setIsCorrectNetwork(false);
    showToast(
      'error',
      'Network switch did not complete. Please open your wallet app, manually select the Ritual network, then return to this page.'
    );
  };

  const checkLiveNetwork = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    try {
      const chainId = (await window.ethereum.request({
        method: 'eth_chainId',
      })) as string;
      const isCorrect = chainId === RITUAL_CHAIN_ID;
      setIsCorrectNetwork(isCorrect);
      return isCorrect;
    } catch {
      return false;
    }
  }, []);

  const getRitualBalance = useCallback(async (): Promise<string> => {
    if (!window.ethereum || !walletAddress) return '0';

    const { ethers } = await import('ethers');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('[Wallet] getRitualBalance failed:', err);
      return '0';
    }
  }, [walletAddress]);

  const purchaseItem = useCallback(async (
    price: string,
    itemType: 'xp_booster' | 'premium_pass'
  ): Promise<string> => {
    void itemType;
    if (!window.ethereum) {
      throw new Error('NO_WALLET');
    }
    const chainId = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
    if (chainId !== RITUAL_CHAIN_ID) {
      throw new Error('WRONG_NETWORK');
    }

    const { ethers } = await import('ethers');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      console.log('[Purchase] Signer address:', signerAddress);
      console.log('[Purchase] Chain ID:', chainId);
      console.log('[Purchase] Sending', price, 'RITUAL to', FEE_RECIPIENT);

      const balance = await provider.getBalance(signerAddress);
      console.log('[Purchase] Current balance (wei):', balance.toString());

      const tx = await signer.sendTransaction({
        to: FEE_RECIPIENT,
        value: ethers.parseEther(price),
      });

      console.log('[Purchase] Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('[Purchase] Transaction confirmed:', tx.hash);
      return tx.hash;
    } catch (err: unknown) {
      console.error('[Purchase] Full error object:', err);
      const purchaseError = err as { reason?: string; shortMessage?: string; message?: string };
      const reason =
        purchaseError?.reason || purchaseError?.shortMessage || purchaseError?.message || 'Unknown error';
      throw new Error(`PURCHASE_FAILED: ${reason}`);
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const ethereum = window.ethereum;

    const savedWallet = localStorage.getItem('nexora_wallet');
    if (savedWallet) {
      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts) => {
          const typedAccounts = accounts as string[];
          if (
            typedAccounts.length > 0 &&
            typedAccounts[0].toLowerCase() === savedWallet.toLowerCase()
          ) {
            setWalletAddress(typedAccounts[0]);
            setIsConnected(true);
            loadStateForWallet(typedAccounts[0]);
            loadSupabaseState(typedAccounts[0]);
            ethereum
              .request({ method: 'eth_chainId' })
              .then((chainId) => {
                setIsCorrectNetwork((chainId as string) === RITUAL_CHAIN_ID);
              });
          }
        });
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const typedAccounts = accounts as string[];
      if (typedAccounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletAddress(typedAccounts[0]);
        localStorage.setItem('nexora_wallet', typedAccounts[0].toLowerCase());
        loadStateForWallet(typedAccounts[0]);
        loadSupabaseState(typedAccounts[0]);
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      setIsCorrectNetwork((chainId as string) === RITUAL_CHAIN_ID);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet, loadStateForWallet, loadSupabaseState]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletAddress,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchToRitual,
        checkLiveNetwork,
        getRitualBalance,
        purchaseItem,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
