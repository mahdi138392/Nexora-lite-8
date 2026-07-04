import {
  Gamepad2,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  ShoppingBag,
  Trophy,
  User,
} from 'lucide-react';

export interface AppNavItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/challenge', icon: Gamepad2, label: 'Challenge' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/shop', icon: ShoppingBag, label: 'Shop' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const APP_SHELL_PATHS = APP_NAV_ITEMS.map((item) => item.path);
