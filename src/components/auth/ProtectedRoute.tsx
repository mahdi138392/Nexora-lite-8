import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConnected, isConnecting, connectWallet } = useWallet();

  if (isConnected) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div
        className="premium-surface-strong rounded-2xl p-10 max-w-sm w-full text-center"
        style={{ border: '1px solid rgba(139,92,246,0.2)' }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-purple/10 mb-6 mx-auto">
          <Lock size={40} className="text-brand-purple" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Connect Your Wallet
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          You need to connect MetaMask to access this page.
          Any network is accepted for login.
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="premium-button w-full py-4 text-white rounded-xl font-bold text-lg disabled:opacity-60 hover:scale-[1.02] transition-transform"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        <a href="/" className="block text-brand-purple text-sm mt-4 hover:underline">
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default ProtectedRoute;
