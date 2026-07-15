import React, { useEffect, useState } from 'react';
import { useGame, ACHIEVEMENTS } from '../../context/GameContext';
import { useToast } from '../../context/ToastContext';

const GameNotifications: React.FC = () => {
  const {
    levelUpSignal,
    rankUpSignal,
    xpGainSignal,
    newAchievementSignal,
    streakBonusSignal,
    clearLevelUpSignal,
    clearRankUpSignal,
    clearXpGainSignal,
    clearAchievementSignal,
    clearStreakBonusSignal,
  } = useGame();
  const { showToast } = useToast();

  // Level Up Overlay State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelNum, setLevelNum] = useState<number | null>(null);

  // XP Float State
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState<number | null>(null);

  // Level Up Effect
  useEffect(() => {
    if (levelUpSignal !== null) {
      setLevelNum(levelUpSignal);
      setShowLevelUp(true);
      const t = setTimeout(() => {
        setShowLevelUp(false);
        clearLevelUpSignal();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [levelUpSignal, clearLevelUpSignal]);

  // XP Float Effect
  useEffect(() => {
    if (xpGainSignal !== null) {
      setXpAmount(xpGainSignal);
      setShowXP(true);
      const t = setTimeout(() => {
        setShowXP(false);
        clearXpGainSignal();
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [xpGainSignal, clearXpGainSignal]);

  // Achievement Toast Effect
  useEffect(() => {
    if (newAchievementSignal) {
      const ach = ACHIEVEMENTS.find((a: { id: string }) => a.id === newAchievementSignal);
      if (ach) {
        showToast('achievement', 'Achievement Unlocked!', {
          label: `${ach.icon} ${ach.name}`,
        });
      }
      clearAchievementSignal();
    }
  }, [newAchievementSignal, showToast, clearAchievementSignal]);

  // Streak Bonus Toast Effect
  useEffect(() => {
    if (streakBonusSignal) {
      showToast('streak', `Day ${streakBonusSignal.day} Streak!`, {
        label: `+${streakBonusSignal.xp} XP Bonus`,
      });
      clearStreakBonusSignal();
    }
  }, [streakBonusSignal, showToast, clearStreakBonusSignal]);

  // Rank Up Toast Effect
  useEffect(() => {
    if (rankUpSignal) {
      showToast('rank', 'Rank Up!', {
        label: `You are now ${rankUpSignal}`,
      });
      clearRankUpSignal();
    }
  }, [rankUpSignal, showToast, clearRankUpSignal]);

  return (
    <>
      {/* Level Up Overlay */}
      {showLevelUp && levelNum !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(9,7,5,0.95)', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            setShowLevelUp(false);
            clearLevelUpSignal();
          }}
        >
          <div className="pointer-events-none text-center">
            <h1
              className="stat-number text-4xl sm:text-5xl font-black mb-3"
              style={{
                background: 'linear-gradient(135deg, #D88C3A, #F3C98B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              LEVEL UP!
            </h1>
            <p className="text-text-secondary text-xl">You reached Level</p>
            <p
              className="stat-number text-5xl sm:text-6xl font-black mt-2"
              style={{
                background: 'linear-gradient(135deg, #D88C3A, #F3C98B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {levelNum}
            </p>
            <p className="text-text-secondary text-xs opacity-40 mt-8">
              Click anywhere to continue
            </p>
          </div>
        </div>
      )}

      {/* XP Float */}
      {showXP && xpAmount !== null && (
        <div
          className="fixed left-1/2 z-[150] pointer-events-none"
          style={{
            top: '33%',
            transform: 'translateX(-50%)',
            animation: 'floatUp 1.8s ease-out forwards',
          }}
        >
          <p
            className="stat-number text-3xl font-black text-gold"
            style={{
              textShadow: '0 0 20px rgba(251,191,36,0.8)',
            }}
          >
            +{xpAmount} XP ⚡
          </p>
        </div>
      )}
    </>
  );
};

export default GameNotifications;
