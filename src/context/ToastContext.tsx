import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X, Trophy, Flame, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'streak' | 'rank';

interface ToastLink {
  label: string;
  href?: string;
}

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  link?: ToastLink;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, link?: ToastLink) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const config: Record<ToastType, { icon: LucideIcon; color: string; title: string }> = {
  success: {
    icon: CheckCircle,
    color: '#3CB371',
    title: 'Success',
  },
  error: {
    icon: XCircle,
    color: '#E45A5A',
    title: 'Action needed',
  },
  warning: {
    icon: AlertCircle,
    color: '#F3C98B',
    title: 'Heads up',
  },
  info: {
    icon: Info,
    color: '#F3C98B',
    title: 'Update',
  },
  achievement: {
    icon: Star,
    color: '#F3C98B',
    title: 'Achievement unlocked',
  },
  streak: {
    icon: Flame,
    color: '#F0B429',
    title: 'Streak update',
  },
  rank: {
    icon: Trophy,
    color: '#D88C3A',
    title: 'Rank update',
  },
};

interface NotificationItemProps {
  toast: Toast;
  onRemove: (id: number) => void;
}

function NotificationItem({ toast, onRemove }: NotificationItemProps) {
  const cfg = config[toast.type];
  const Icon = cfg.icon;

  return (
    <div
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
      className="notification-toast pointer-events-auto grid grid-cols-[auto,minmax(0,1fr),auto] gap-3.5 rounded-2xl border px-4 py-3.5 shadow-[0_24px_70px_rgba(0,0,0,0.48),0_0_0_1px_rgba(255,255,255,0.035),inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-4.5"
      style={{
        background: `linear-gradient(135deg, ${cfg.color}18 0%, rgba(9, 7, 5, 0) 34%), #15110D`,
        borderColor: 'rgba(255, 180, 90, 0.15)',
      }}
    >
      <div
        className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border"
        style={{
          backgroundColor: `${cfg.color}17`,
          borderColor: `${cfg.color}42`,
          color: cfg.color,
          boxShadow: `0 0 22px ${cfg.color}1f`,
        }}
        aria-hidden="true"
      >
        <Icon size={19} strokeWidth={2.35} />
      </div>

      <div className="min-w-0 space-y-1 pr-1">
        <p className="font-heading text-[13px] font-semibold leading-snug tracking-[-0.01em] text-text-primary">
          {cfg.title}
        </p>
        <p className="break-words text-sm leading-5 text-[#D9E4F7]">{toast.message}</p>
        {toast.link && (
          <span
            className="inline-flex pt-0.5 text-xs font-semibold leading-none"
            style={{ color: cfg.color }}
          >
            {toast.link.label}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="-mr-1 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/[0.07] hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-cyan"
        aria-label={`Dismiss ${cfg.title.toLowerCase()} notification`}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

interface NotificationContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

function NotificationContainer({ toasts, onRemove }: NotificationContainerProps) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-[max(1.25rem,env(safe-area-inset-top))] z-[9999] flex w-[min(90vw,28rem)] -translate-x-1/2 flex-col gap-3 sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:w-[min(28rem,calc(100vw-2rem))]">
      {toasts.map((toast) => (
        <NotificationItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function NotificationPortal({ toasts, onRemove }: NotificationContainerProps) {
  return createPortal(<NotificationContainer toasts={toasts} onRemove={onRemove} />, document.body);
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, link?: ToastLink) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message, link }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <NotificationPortal toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
