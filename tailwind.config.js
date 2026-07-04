/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#07111F',
        'bg-elevated': '#0B1628',
        'card': '#111D33',
        'secondary-layer': '#17243A',
        'brand-purple': '#9B6DFF',
        'interactive-cyan': '#37D5FF',
        'success-emerald': '#2DE39B',
        'gold': '#FFD166',
        'text-primary': '#F4F8FF',
        'text-secondary': '#9EACC4',
        'border-soft': 'rgba(159, 180, 216, 0.14)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        numeric: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 24px 80px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(155, 109, 255, 0.12)',
        'purple-glow': '0 0 32px rgba(155, 109, 255, 0.22)',
        'cyan-glow': '0 0 30px rgba(55, 213, 255, 0.18)',
        'gold-glow': '0 0 28px rgba(255, 209, 102, 0.18)',
      },
      boxShadow: {
        'premium': '0 24px 80px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(155, 109, 255, 0.12)',
        'purple-glow': '0 0 32px rgba(155, 109, 255, 0.22)',
        'cyan-glow': '0 0 30px rgba(55, 213, 255, 0.18)',
        'gold-glow': '0 0 28px rgba(255, 209, 102, 0.18)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #9B6DFF 0%, #37D5FF 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD166 0%, #FF8F70 100%)',
        'gradient-surface': 'linear-gradient(145deg, rgba(20, 34, 58, 0.92), rgba(9, 18, 33, 0.88))',
        'gradient-hero': 'radial-gradient(circle at 20% 10%, rgba(155, 109, 255, 0.28), transparent 34%), radial-gradient(circle at 80% 15%, rgba(55, 213, 255, 0.20), transparent 30%), linear-gradient(180deg, #07111F 0%, #0A1424 54%, #07111F 100%)',
      },
    },
  },
  plugins: [],
};
