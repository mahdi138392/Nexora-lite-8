import React, { type ReactNode } from 'react';
import Sidebar from '../Sidebar';
import { cx } from '../../lib/ui';

interface AppShellProps {
  children: ReactNode;
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl';
  className?: string;
}

const maxWidthClasses: Record<NonNullable<AppShellProps['maxWidth']>, string> = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
};

const AppShell: React.FC<AppShellProps> = ({
  children,
  maxWidth = '5xl',
  className = '',
}) => (
  <div className="min-h-screen bg-transparent pt-20 lg:pt-24 pb-24 lg:pb-8">
    <Sidebar />
    <main className="lg:pl-60 product-page-enter">
      <div className={cx(maxWidthClasses[maxWidth], 'mx-auto px-4 sm:px-6 lg:px-8', className)}>
        {children}
      </div>
    </main>
  </div>
);

export default AppShell;
