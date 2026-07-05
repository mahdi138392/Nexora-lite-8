import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  ChevronRight,
  CircleDot,
  Flame,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { BrainIcon, FootballIcon, CircuitIcon } from '../components/CategoryIcons';
import { generateQuestion, QuestionData } from '../lib/gemini';
import { useGame } from '../context/GameContext';
import type { CategoryType, DifficultyType } from '../context/GameContext';
import { calculateStreak } from '../lib/streak';

type ChallengeState = 'category' | 'difficulty' | 'loading' | 'question' | 'correct' | 'wrong';

type ResultMeta = {
  isCorrect: boolean;
  xpEarned: number;
  streakXP: number;
  streakDay: number;
};

interface Category {
  id: CategoryType;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  tone: string;
  gradient: string;
  xpRange: string;
  icon: React.FC<{ size?: number; color?: string }>;
  iconColor: string;
  symbol: string;
  hasHighestXP?: boolean;
}

interface Difficulty {
  id: DifficultyType;
  name: string;
  xp: number;
  description: string;
  stakes: string;
  pace: string;
  borderColor: string;
  glow: string;
}

const STREAK_BONUS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

const categories: Category[] = [
  {
    id: 'general',
    name: 'General Knowledge',
    shortName: 'General',
    tagline: 'The Archive Run',
    description: 'Science, history, geography, culture, space, art, and famous facts.',
    tone: 'text-brand-purple',
    gradient: 'from-brand-purple/24 via-brand-purple/8 to-transparent',
    xpRange: '10–40 XP',
    icon: BrainIcon,
    iconColor: '#D88C3A',
    symbol: '🧠',
  },
  {
    id: 'football',
    name: 'Football',
    shortName: 'Football',
    tagline: 'The Arena Trial',
    description: 'World Cup lore, leagues, players, records, and football history.',
    tone: 'text-interactive-cyan',
    gradient: 'from-interactive-cyan/22 via-interactive-cyan/8 to-transparent',
    xpRange: '10–40 XP',
    icon: FootballIcon,
    iconColor: '#F3C98B',
    symbol: '⚽',
  },
  {
    id: 'ai',
    name: 'AI & Emerging Technology',
    shortName: 'AI Tech',
    tagline: 'The Signal Ritual',
    description: 'AI, machine learning, Web3, blockchain, robotics, and future systems.',
    tone: 'text-gold',
    gradient: 'from-gold/18 via-brand-purple/8 to-transparent',
    xpRange: '15–60 XP',
    icon: CircuitIcon,
    iconColor: '#F3C98B',
    symbol: '🤖',
    hasHighestXP: true,
  },
];

const difficulties: Difficulty[] = [
  {
    id: 'easy',
    name: 'Initiate',
    xp: 10,
    description: 'A clean warm-up with familiar facts and quick confidence.',
    stakes: 'Low risk',
    pace: 'Fast read',
    borderColor: '#8E857A',
    glow: 'rgba(142,133,122,0.16)',
  },
  {
    id: 'medium',
    name: 'Adept',
    xp: 20,
    description: 'A sharper test that rewards focus and specific knowledge.',
    stakes: 'Balanced',
    pace: 'Focused',
    borderColor: '#F3C98B',
    glow: 'rgba(243,201,139,0.14)',
  },
  {
    id: 'hard',
    name: 'Oracle',
    xp: 40,
    description: 'High-intensity questions for expert-level momentum.',
    stakes: 'High reward',
    pace: 'Intense',
    borderColor: '#D88C3A',
    glow: 'rgba(216,140,58,0.16)',
  },
];

const optionKeys = ['A', 'B', 'C', 'D'] as const;

function getAdjustedXP(categoryId: CategoryType | undefined, difficulty: Difficulty) {
  if (categoryId !== 'ai') return difficulty.xp;
  if (difficulty.id === 'easy') return 15;
  if (difficulty.id === 'medium') return 30;
  return 60;
}

function getDifficultyLabel(id: DifficultyType) {
  return difficulties.find((difficulty) => difficulty.id === id)?.name ?? id;
}


const Challenge: React.FC = () => {
  const [state, setState] = useState<ChallengeState>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<ResultMeta | null>(null);

  const { gameState, awardXP, addChallenge, checkStreak } = useGame();

  const selectedDifficultyXP = useMemo(
    () => (selectedDifficulty ? getAdjustedXP(selectedCategory?.id, selectedDifficulty) : 0),
    [selectedCategory?.id, selectedDifficulty]
  );

  const resetRound = () => {
    setSelectedAnswer(null);
    setCurrentQuestion(null);
    setResultMeta(null);
    setTimeLeft(30);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setState('difficulty');
    setAiError(null);
  };

  const handleDifficultySelect = useCallback(async (difficulty: Difficulty) => {
    if (!selectedCategory) return;

    const adjustedXP = getAdjustedXP(selectedCategory.id, difficulty);
    setSelectedDifficulty({ ...difficulty, xp: adjustedXP });
    setState('loading');
    setAiError(null);
    resetRound();

    try {
      const q = await generateQuestion(selectedCategory.id, difficulty.id);
      setCurrentQuestion(q);
      setTimeLeft(30);
      setState('question');
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate question.');
      setState('difficulty');
    }
  }, [selectedCategory]);

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !selectedCategory || !selectedDifficulty || isSubmitting) return;
    setIsSubmitting(true);

    const answerKey = selectedAnswer !== null
      ? String.fromCharCode(65 + selectedAnswer) as 'A' | 'B' | 'C' | 'D'
      : null;
    const isCorrect = answerKey !== null && answerKey === currentQuestion.correct;
    const streakPreview = calculateStreak(gameState.streak, gameState.lastActiveDate);
    const shouldAwardStreak = isCorrect && streakPreview.shouldGrantReward;
    const nextStreakDay = shouldAwardStreak ? streakPreview.streak : gameState.streak;
    const streakXP = shouldAwardStreak ? STREAK_BONUS[nextStreakDay] ?? 10 : 0;

    const xpEarned = awardXP(selectedCategory.id, selectedDifficulty.id, isCorrect);

    addChallenge({
      id: Date.now().toString(),
      category: selectedCategory.id,
      difficulty: selectedDifficulty.id,
      isCorrect,
      xpEarned,
      timestamp: new Date().toISOString(),
    });

    if (isCorrect) checkStreak();

    setResultMeta({ isCorrect, xpEarned, streakXP, streakDay: nextStreakDay });

    setTimeout(() => {
      setState(isCorrect ? 'correct' : 'wrong');
      setIsSubmitting(false);
    }, 420);
  }, [
    addChallenge,
    awardXP,
    checkStreak,
    currentQuestion,
    gameState.lastActiveDate,
    gameState.streak,
    isSubmitting,
    selectedAnswer,
    selectedCategory,
    selectedDifficulty,
  ]);

  useEffect(() => {
    if (state !== 'question') return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((previous) => previous - 1), 1000);
    return () => clearTimeout(t);
  }, [handleSubmit, state, timeLeft]);

  const handleBack = () => {
    if (state === 'difficulty') {
      setState('category');
      setSelectedCategory(null);
      setAiError(null);
      resetRound();
    } else if (state === 'question' || state === 'loading') {
      setState('difficulty');
      resetRound();
    }
  };

  const handleNextChallenge = () => {
    if (selectedDifficulty) {
      void handleDifficultySelect(selectedDifficulty);
    }
  };

  const handleGoToDashboard = () => {
    setState('category');
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setAiError(null);
    resetRound();
  };

  const renderShell = (children: React.ReactNode, className = 'max-w-5xl') => (
    <div className="min-h-screen bg-transparent px-4 pb-8 pt-4 lg:pt-0">
      <div className={`${className} mx-auto`}>{children}</div>
    </div>
  );

  const renderCategorySelection = () => renderShell(
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full premium-badge px-4 py-2 text-xs font-black text-interactive-cyan mb-4">
          <Sparkles size={14} /> Core ritual
        </div>
        <h1 className="mobile-hero-title font-black text-text-primary">
          Select your game mode
        </h1>
        <p className="mt-4 text-text-secondary text-base lg:text-lg">
          Pick a ritual lane. Gemini will forge one live question, your answer decides XP, streak momentum, and profile growth.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className="group relative overflow-hidden rounded-[1.75rem] premium-surface p-6 text-left transition-all duration-300 hover:border-brand-purple/50 focus-visible:scale-[1.01]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`} />
            <div className="relative z-10 flex h-full min-h-[248px] flex-col justify-between gap-6">
              <div>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-bg-primary/40 shadow-2xl transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ boxShadow: `0 18px 50px ${category.iconColor}24` }}
                  >
                    <category.icon size={34} color={category.iconColor} />
                    <span className="absolute -right-2 -top-2 text-2xl">{category.symbol}</span>
                  </div>
                  {category.hasHighestXP && (
                    <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-black text-bg-primary shadow-gold-glow">
                      HIGHEST XP
                    </span>
                  )}
                </div>
                <p className={`eyebrow-label text-xs ${category.tone}`}>{category.tagline}</p>
                <h2 className="mt-2 text-2xl font-black text-text-primary">{category.name}</h2>
                <p className="mt-3 text-sm text-text-secondary">{category.description}</p>
              </div>

              <div>
                <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-bg-primary/35 p-2 text-text-secondary">Easy<br /><span className="font-black text-text-primary">{category.id === 'ai' ? '15' : '10'} XP</span></div>
                  <div className="rounded-xl bg-bg-primary/35 p-2 text-text-secondary">Med<br /><span className="font-black text-text-primary">{category.id === 'ai' ? '30' : '20'} XP</span></div>
                  <div className="rounded-xl bg-bg-primary/35 p-2 text-text-secondary">Hard<br /><span className="font-black text-text-primary">{category.id === 'ai' ? '60' : '40'} XP</span></div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-bg-primary/40 px-4 py-3">
                  <span className="text-sm font-bold text-text-primary">Enter mode</span>
                  <span className={`flex items-center gap-1 text-sm font-black ${category.tone}`}>{category.xpRange} <ChevronRight size={16} /></span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDifficultySelection = () => renderShell(
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={18} /> Change mode
      </button>

      <div className="overflow-hidden rounded-3xl premium-surface-strong p-5 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-primary/40"
                style={{ boxShadow: `0 18px 50px ${selectedCategory?.iconColor}28` }}
              >
                {selectedCategory && <selectedCategory.icon size={34} color={selectedCategory.iconColor} />}
              </div>
              <div>
                <p className={`eyebrow-label text-xs ${selectedCategory?.tone}`}>{selectedCategory?.tagline}</p>
                <h1 className="text-3xl font-black text-text-primary">{selectedCategory?.shortName}</h1>
              </div>
            </div>
            <p className="text-text-secondary">Choose the intensity of this ritual. Higher tiers demand more precision and pay out more XP.</p>
          </div>

          <div className="grid gap-3">
            {difficulties.map((difficulty) => {
              const adjustedXP = getAdjustedXP(selectedCategory?.id, difficulty);
              return (
                <button
                  key={difficulty.id}
                  onClick={() => void handleDifficultySelect({ ...difficulty, xp: adjustedXP })}
                  className="group rounded-2xl border bg-bg-primary/30 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.035]"
                  style={{ borderColor: `${difficulty.borderColor}66`, boxShadow: `0 18px 45px ${difficulty.glow}` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-layer">
                        {difficulty.id === 'easy' && <Shield size={22} style={{ color: difficulty.borderColor }} />}
                        {difficulty.id === 'medium' && <Zap size={22} style={{ color: difficulty.borderColor }} />}
                        {difficulty.id === 'hard' && <Trophy size={22} style={{ color: difficulty.borderColor }} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-text-primary">{difficulty.name}</h2>
                          <span className="rounded-full bg-secondary-layer px-2 py-0.5 text-[10px] font-black text-text-secondary">{difficulty.stakes}</span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">{difficulty.description}</p>
                      </div>
                    </div>
                    <div className="min-w-[72px] flex-shrink-0 text-right">
                      <p className="stat-number whitespace-nowrap text-3xl font-black" style={{ color: difficulty.borderColor }}>+{adjustedXP}</p>
                      <p className="break-normal text-xs font-bold text-text-secondary">XP · {difficulty.pace}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {aiError && (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
          <span className="font-bold">Signal interrupted.</span> {aiError}
        </div>
      )}
    </div>
  );

  const renderLoading = () => renderShell(
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl premium-surface-strong p-5 sm:p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(243,201,139,0.16),transparent_42%)]" />
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-brand-purple/30 bg-brand-purple/10">
            <Loader2 size={44} className="animate-spin text-interactive-cyan" />
          </div>
          <p className="eyebrow-label text-interactive-cyan text-xs">Gemini ritual in progress</p>
          <h2 className="mt-2 text-3xl font-black text-text-primary">Forging your question</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            Calibrating category, difficulty, plausible answers, and explanation. Stay locked in.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-3 text-left text-xs text-text-secondary">
            <div className="rounded-2xl bg-bg-primary/40 p-3"><CircleDot size={16} className="mb-2 text-brand-purple" /> Mode<br /><span className="font-black text-text-primary">{selectedCategory?.shortName}</span></div>
            <div className="rounded-2xl bg-bg-primary/40 p-3"><Lock size={16} className="mb-2 text-interactive-cyan" /> Tier<br /><span className="font-black text-text-primary">{selectedDifficulty && getDifficultyLabel(selectedDifficulty.id)}</span></div>
            <div className="rounded-2xl bg-bg-primary/40 p-3"><Star size={16} className="mb-2 text-gold" /> Reward<br /><span className="font-black text-text-primary">+{selectedDifficultyXP} XP</span></div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary-layer">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-brand" />
          </div>
        </div>
      </div>
    </div>,
    'max-w-3xl'
  );

  const renderQuestion = () => {
    const progress = (timeLeft / 30) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const timerColor = timeLeft <= 8 ? '#EF4444' : timeLeft <= 15 ? '#FBBF24' : '#F3C98B';

    return renderShell(
      <div className="max-w-3xl mx-auto space-y-5">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={18} /> Recalibrate
        </button>

        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div className="rounded-2xl premium-surface px-3 py-3 font-bold text-text-primary">{selectedCategory?.shortName}</div>
          <div className="rounded-2xl premium-surface px-3 py-3 font-bold text-text-primary">{selectedDifficulty && getDifficultyLabel(selectedDifficulty.id)}</div>
          <div className="rounded-2xl border border-gold/25 bg-gold/10 px-3 py-3 font-black text-gold">+{selectedDifficultyXP} XP</div>
        </div>

        <div className="overflow-hidden rounded-3xl premium-surface-strong">
          <div className="border-b border-white/5 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow-label text-interactive-cyan text-xs">Live question</p>
                <h1 className="mt-2 text-2xl font-black text-text-primary">Answer before the signal closes</h1>
              </div>
              <div className="relative mx-auto h-16 w-16 shrink-0 sm:h-16 sm:w-16 sm:mx-0">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="45" stroke="rgba(39,52,73,0.95)" strokeWidth="7" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    stroke={timerColor}
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="stat-number text-3xl font-black text-text-primary">{timeLeft}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">sec</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <h2 className="text-xl font-bold leading-relaxed text-text-primary sm:text-2xl">
              {currentQuestion?.question ?? 'Loading...'}
            </h2>

            <div className="mt-7 space-y-3">
              {optionKeys.map((key, index) => {
                const isSelected = selectedAnswer === index;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedAnswer(index)}
                    disabled={isSubmitting}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-interactive-cyan bg-interactive-cyan/10 shadow-[0_0_0_4px_rgba(243,201,139,0.10)]'
                        : 'border-white/5 bg-secondary-layer/80 hover:border-brand-purple/45 hover:bg-white/[0.035]'
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${isSelected ? 'bg-interactive-cyan text-bg-primary' : 'bg-bg-primary/50 text-text-secondary group-hover:text-text-primary'}`}>
                      {key}
                    </div>
                    <span className="font-medium text-text-primary">{currentQuestion?.options[key]}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isSubmitting}
              className={`mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-black text-white transition-all duration-200 ${
                selectedAnswer === null
                  ? 'cursor-not-allowed bg-secondary-layer text-text-secondary'
                  : 'premium-button hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Resolving answer</> : <>Lock answer <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>,
      'max-w-4xl'
    );
  };

  const renderResult = (isCorrect: boolean) => {
    const correctAnswer = currentQuestion ? currentQuestion.options[currentQuestion.correct] : '';
    const earnedXP = resultMeta?.xpEarned ?? 0;
    const streakXP = resultMeta?.streakXP ?? 0;

    return renderShell(
      <div className="flex min-h-[72vh] items-center justify-center">
        <div className={`w-full max-w-3xl overflow-hidden rounded-3xl premium-surface-strong ${isCorrect ? 'border-success-emerald/30' : 'border-danger/25'}`}>
          <div className={`p-7 text-center sm:p-9 ${isCorrect ? 'bg-success-emerald/5' : 'bg-danger/5'}`}>
            <div className={`mx-auto mb-4 flex h-16 w-16 sm:h-16 sm:w-16 items-center justify-center rounded-full ${isCorrect ? 'bg-success-emerald/15 text-success-emerald' : 'bg-danger/15 text-danger'}`}>
              {isCorrect ? <CheckCircle size={58} /> : <XCircle size={58} />}
            </div>
            <p className={`eyebrow-label text-xs ${isCorrect ? 'text-success-emerald' : 'text-danger'}`}>{isCorrect ? 'Ritual complete' : 'Ritual failed'}</p>
            <h1 className="mt-2 text-3xl font-black text-text-primary">{isCorrect ? 'Correct signal' : 'Signal missed'}</h1>
            <p className="mx-auto mt-3 max-w-xl text-text-secondary">
              {isCorrect ? 'Your profile gains momentum. Bank the XP, protect the streak, and keep climbing.' : 'No XP this round. Study the explanation and re-enter the ritual with sharper focus.'}
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
            <div className="rounded-2xl bg-bg-primary/35 p-4 text-center">
              <Star size={22} className="mx-auto mb-2 text-gold" fill="currentColor" />
              <p className="text-xs text-text-secondary">XP gained</p>
              <p className="stat-number mt-1 text-3xl font-black text-gold">+{earnedXP}</p>
            </div>
            <div className="rounded-2xl bg-bg-primary/35 p-4 text-center">
              <Flame size={22} className="mx-auto mb-2 text-primary" />
              <p className="text-xs text-text-secondary">Streak reward</p>
              <p className="stat-number mt-1 text-3xl font-black text-primary">+{streakXP}</p>
            </div>
            <div className="rounded-2xl bg-bg-primary/35 p-4 text-center">
              <Brain size={22} className="mx-auto mb-2 text-interactive-cyan" />
              <p className="text-xs text-text-secondary">Tier cleared</p>
              <p className="mt-1 text-lg font-black text-text-primary">{selectedDifficulty && getDifficultyLabel(selectedDifficulty.id)}</p>
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-6">
            <div className="rounded-2xl border border-white/5 bg-secondary-layer/70 p-5">
              <p className="eyebrow-label text-xs text-text-secondary">Correct answer</p>
              <p className="mt-2 font-black text-text-primary">{currentQuestion?.correct}. {correctAnswer}</p>
              <div className="my-4 h-px bg-white/5" />
              <p className="text-sm leading-relaxed text-text-secondary">{currentQuestion?.explanation}</p>
              {isCorrect && streakXP > 0 && (
                <p className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
                  Day {resultMeta?.streakDay} streak activated for +{streakXP} bonus XP.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleNextChallenge}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl premium-button py-3 font-black text-white transition-transform hover:scale-[1.01]"
              >
                {isCorrect ? 'Continue ritual' : 'Try again'} <RotateCcw size={18} />
              </button>
              <button
                onClick={handleGoToDashboard}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 font-black text-text-primary transition-colors hover:border-brand-purple/45 hover:bg-white/[0.03]"
              >
                Choose new mode <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>,
      'max-w-4xl'
    );
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 lg:pt-24 pb-36 lg:pb-10">
      <main className="lg:pl-60 product-page-enter">
        {state === 'category' && renderCategorySelection()}
        {state === 'difficulty' && renderDifficultySelection()}
        {state === 'loading' && renderLoading()}
        {state === 'question' && renderQuestion()}
        {state === 'correct' && renderResult(true)}
        {state === 'wrong' && renderResult(false)}
      </main>
    </div>
  );
};

export default Challenge;
