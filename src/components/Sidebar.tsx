import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAvatar } from '../context/AvatarContext';
import { avatarUrl } from '../lib/avatars';
import { APP_NAV_ITEMS } from '../lib/navigation';
import { cx } from '../lib/ui';

function shortAddr(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No wallet';
}

const Sidebar: React.FC = () => {
  const { walletAddress, disconnectWallet, isConnected } = useWallet();
  const { avatarId } = useAvatar();
  const { pathname } = useLocation();

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-16 w-60 premium-surface border-r border-white/10 z-40">
        <nav className="flex-1 py-5 px-3 space-y-1" aria-label="Primary navigation">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'group interactive-lift focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold',
                  isActive
                    ? 'bg-brand-purple/[0.14] text-text-primary shadow-purple-glow ring-1 ring-brand-purple/25'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                )}
              >
                <span className={cx('flex h-9 w-9 items-center justify-center rounded-xl transition-colors', isActive ? 'bg-brand-purple/20 text-interactive-cyan' : 'bg-white/[0.025] text-text-secondary group-hover:text-interactive-cyan')}>
                  <item.icon size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-2xl border border-white/5 bg-bg-primary/35 p-3">
          <div className="flex items-center gap-2 min-w-0">
            {isConnected ? (
              <img src={avatarUrl(avatarId)} alt="Selected avatar" className="h-9 w-9 rounded-xl border border-brand-purple/25 bg-secondary-layer object-cover" />
            ) : (
              <Wallet size={16} className="text-text-secondary" />
            )}
            <span className="truncate text-xs font-bold text-text-primary">{shortAddr(walletAddress)}</span>
          </div>
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-danger/25 px-3 py-2 text-sm font-bold text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut size={15} />
              Disconnect
            </button>
          )}
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 premium-surface border-t border-white/10 z-50 pb-safe" aria-label="Mobile navigation">
        <div className="flex items-stretch gap-1 overflow-x-auto px-2 py-2">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'focus-ring flex min-w-[74px] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition-all',
                  isActive
                    ? 'bg-brand-purple/15 text-interactive-cyan ring-1 ring-brand-purple/25'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
