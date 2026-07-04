import React, { type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/ui';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  tone?: 'default' | 'strong' | 'gold' | 'quiet';
  reveal?: boolean;
}

const toneClasses: Record<NonNullable<SurfaceProps['tone']>, string> = {
  default: 'premium-surface',
  strong: 'premium-surface-strong',
  gold: 'bg-gold/[0.03] border border-gold/30 shadow-gold-glow',
  quiet: 'bg-bg-primary/35 border border-white/5',
};

const Surface: React.FC<SurfaceProps> = ({
  children,
  className = '',
  padded = true,
  tone = 'default',
  reveal = true,
  ...props
}) => (
  <div
    className={cx('rounded-2xl', toneClasses[tone], padded && 'p-6', reveal && 'product-reveal', className)}
    {...props}
  >
    {children}
  </div>
);

export default Surface;
