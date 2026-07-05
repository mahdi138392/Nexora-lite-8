import React, { type HTMLAttributes, type ReactNode } from 'react';
import { radius, spacing, surfaces } from '../../lib/theme';
import { cx } from '../../lib/ui';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  tone?: 'default' | 'strong' | 'gold' | 'quiet';
  reveal?: boolean;
}

const Surface: React.FC<SurfaceProps> = ({
  children,
  className = '',
  padded = true,
  tone = 'default',
  reveal = true,
  ...props
}) => (
  <div
    className={cx(radius.md, surfaces[tone], padded && spacing.card, reveal && 'product-reveal', className)}
    {...props}
  >
    {children}
  </div>
);

export default Surface;
