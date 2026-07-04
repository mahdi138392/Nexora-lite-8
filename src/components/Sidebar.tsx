import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { APP_NAV_ITEMS } from '../lib/navigation';

const Sidebar: React.FC = () => {
  const { walletAddress, disconnectWallet } = useWallet();
  const { pathname } = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-16 w-60 bg-secondary-layer z-40">
        <nav className="flex-1 py-6 px-3">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-purple/10 border-l-[3px] border-brand-purple text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card/50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Wallet Info */}
        <div className="p-4 border-t border-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">{walletAddress}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="flex items-center gap-2 text-text-secondary hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary-layer border-t border-card z-50 pb-safe">
        <div className="flex items-center justify-around py-2">
          {APP_NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-brand-purple'
                    : 'text-text-secondary'
                }`}
              >
                <item.icon size={22} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
