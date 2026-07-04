import React, { type HTMLAttributes, type ReactNode } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  tone?: 'default' | 'strong' | 'gold';
}

const toneClasses: Record<NonNullable<SurfaceProps['tone']>, string> = {
  default: 'premium-surface',
  strong: 'premium-surface-strong',
  gold: 'bg-gold/[0.03] border-gold/30 shadow-gold-glow',
};

const Surface: React.FC<SurfaceProps> = ({
  children,
  className = '',
  padded = true,
  tone = 'default',
  ...props
}) => (
  <div
    className={`rounded-2xl ${toneClasses[tone]} ${padded ? 'p-6' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Surface;
