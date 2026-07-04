import React, { type HTMLAttributes, type ReactNode } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  tone?: 'default' | 'strong' | 'gold';
}

const toneClasses: Record<NonNullable<SurfaceProps['tone']>, string> = {
  default: 'bg-card border-brand-purple/15',
  strong: 'bg-card border-brand-purple/20',
  gold: 'bg-gold/[0.02] border-gold/25',
};

const Surface: React.FC<SurfaceProps> = ({
  children,
  className = '',
  padded = true,
  tone = 'default',
  ...props
}) => (
  <div
    className={`rounded-2xl border ${toneClasses[tone]} ${padded ? 'p-6' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Surface;
