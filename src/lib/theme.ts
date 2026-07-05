export const typography = {
  heading: 'font-heading tracking-[-0.035em] leading-[1.06]',
  body: 'leading-7 text-text-secondary',
  eyebrow: 'eyebrow-label',
  metric: 'stat-number',
} as const;

export const spacing = {
  page: 'px-4 sm:px-6 lg:px-8',
  section: 'py-16 lg:py-24',
  card: 'p-6',
  cardLg: 'p-6 lg:p-8',
  stack: 'space-y-6',
} as const;

export const radius = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-[1.5rem]',
  xl: 'rounded-[2rem]',
  full: 'rounded-full',
} as const;

export const shadows = {
  premium: 'shadow-premium',
  purple: 'shadow-purple-glow',
  cyan: 'shadow-cyan-glow',
  gold: 'shadow-gold-glow',
} as const;

export const surfaces = {
  default: 'premium-surface',
  strong: 'premium-surface-strong',
  gold: 'bg-gold/[0.03] border border-gold/30 shadow-gold-glow',
  quiet: 'bg-bg-primary/35 border border-white/5',
} as const;

export const controls = {
  focus: 'focus-ring',
  lift: 'interactive-lift',
  buttonBase: 'interactive-lift rounded-2xl px-4 py-3 font-black transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-60',
} as const;
