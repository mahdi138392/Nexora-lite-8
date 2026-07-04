import React, { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/ui';

interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: 'default' | 'strong' | 'gold' | 'quiet';
  reveal?: boolean;
}

const cardTones: Record<NonNullable<ProductCardProps['tone']>, string> = {
  default: 'premium-surface',
  strong: 'premium-surface-strong',
  gold: 'bg-gold/[0.035] border border-gold/30 shadow-gold-glow',
  quiet: 'bg-bg-primary/35 border border-white/5',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  children,
  className,
  tone = 'default',
  reveal = true,
  ...props
}) => (
  <div
    className={cx('rounded-[1.5rem]', cardTones[tone], reveal && 'product-reveal', className)}
    {...props}
  >
    {children}
  </div>
);

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: 'purple' | 'cyan' | 'gold' | 'green' | 'muted';
}

const pillTones: Record<NonNullable<PillProps['tone']>, string> = {
  purple: 'bg-brand-purple/10 border-brand-purple/25 text-brand-purple',
  cyan: 'bg-interactive-cyan/10 border-interactive-cyan/25 text-interactive-cyan',
  gold: 'bg-gold/10 border-gold/25 text-gold',
  green: 'bg-success-emerald/10 border-success-emerald/25 text-success-emerald',
  muted: 'bg-white/[0.035] border-white/10 text-text-secondary',
};

export const Pill: React.FC<PillProps> = ({ children, className, tone = 'muted', ...props }) => (
  <span
    className={cx('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black', pillTones[tone], className)}
    {...props}
  >
    {children}
  </span>
);

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const buttonVariants: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary: 'premium-button text-white',
  secondary: 'border border-white/10 bg-white/[0.035] text-text-primary hover:border-brand-purple/45',
  danger: 'border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  className,
  variant = 'primary',
  ...props
}) => (
  <button
    className={cx('interactive-lift rounded-2xl px-4 py-3 font-black transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-60', buttonVariants[variant], className)}
    {...props}
  >
    {children}
  </button>
);

export const Skeleton: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cx('skeleton-shimmer rounded-2xl bg-secondary-layer/70', className)} {...props} />
);
