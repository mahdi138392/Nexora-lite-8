import React, { type CSSProperties, type ReactNode } from 'react';
import MetricCard from '../ui/MetricCard';

interface ProfileStatCardProps {
  children: ReactNode;
  className?: string;
  label?: ReactNode;
  textStyle?: CSSProperties;
}

const ProfileStatCard: React.FC<ProfileStatCardProps> = ({ children, className = '', label, textStyle }) => (
  <MetricCard
    value={<span className={`font-numeric font-bold text-lg ${className}`} style={textStyle}>{children}</span>}
    label={label ?? ''}
    className={!label ? '[&_p]:hidden' : undefined}
  />
);

export default ProfileStatCard;
