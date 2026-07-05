const colors = {
  'bg-primary': '#090705',
  'bg-secondary': '#0E0B08',
  'bg-elevated': '#1B1612',
  card: '#1A1510',
  'card-hover': '#241C15',
  'secondary-layer': '#15110D',
  primary: '#D88C3A',
  'primary-hover': '#E9A64E',
  'primary-active': '#C7761E',
  accent: '#F3C98B',
  'brand-purple': '#D88C3A',
  'interactive-cyan': '#F3C98B',
  'success-emerald': '#3CB371',
  gold: '#F3C98B',
  warning: '#F0B429',
  danger: '#E45A5A',
  'text-primary': '#F7F5F3',
  'text-secondary': '#C7C1B8',
  muted: '#8E857A',
  'border-soft': 'rgba(255, 180, 90, 0.15)',
};

const typography = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  heading: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
  numeric: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
};

const shadows = {
  premium: '0 18px 50px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(255, 180, 90, 0.08)',
  'purple-glow': '0 16px 40px rgba(0, 0, 0, 0.28)',
  'cyan-glow': '0 16px 40px rgba(0, 0, 0, 0.28)',
  'gold-glow': '0 16px 42px rgba(216, 140, 58, 0.10)',
};

const backgrounds = {
  'gradient-brand': 'linear-gradient(135deg, #D88C3A 0%, #E9A64E 100%)',
  'gradient-gold': 'linear-gradient(135deg, #D88C3A 0%, #F3C98B 100%)',
  'gradient-surface': 'linear-gradient(145deg, rgba(27, 22, 18, 0.96), rgba(14, 11, 8, 0.92))',
  'gradient-hero': 'radial-gradient(circle at 50% -10%, rgba(216, 140, 58, 0.12), transparent 38rem), linear-gradient(180deg, #090705 0%, #0E0B08 54%, #090705 100%)',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors, fontFamily: typography, boxShadow: shadows, backgroundImage: backgrounds } },
  plugins: [],
};
