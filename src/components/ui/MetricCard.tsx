import React, { type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/ui';
import { radius, typography } from '../../lib/theme';
import Surface from './Surface';

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'strong' | 'gold' | 'quiet';
  align?: 'left' | 'center';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  helper,
  icon,
  tone = 'default',
  align = 'center',
  className,
  ...props
}) => (
  <Surface
    tone={tone}
    reveal={false}
    className={cx('p-4', radius.md, align === 'center' ? 'text-center' : 'text-left', className)}
    {...props}
  >
    {icon && <div className="mb-3 flex justify-center text-interactive-cyan">{icon}</div>}
    <div className={typography.metric}>{value}</div>
    <p className="mt-1 text-xs text-text-secondary">{label}</p>
    {helper && <p className="mt-2 text-xs text-text-secondary/80">{helper}</p>}
  </Surface>
);

export default MetricCard;
