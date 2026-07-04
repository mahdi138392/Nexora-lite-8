import React from 'react';
import { Brain, Shield, Trophy } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Challenges',
    description:
      'Adaptive learning experiences powered by cutting-edge AI. Every challenge dynamically adjusts to your skill level.',
    gradient: 'from-brand-purple to-interactive-cyan',
  },
  {
    icon: Shield,
    title: 'Web3 Identity',
    description:
      'Your achievements, your data. Own your competitive identity with blockchain-verified credentials and records.',
    gradient: 'from-interactive-cyan to-success-emerald',
  },
  {
    icon: Trophy,
    title: 'Rank & Compete',
    description:
      'Climb the global leaderboard. Earn ranks from Bronze to Diamond. Prove your skills against the best.',
    gradient: 'from-gold to-brand-purple',
  },
];

const Features: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Why Nexora?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            The next generation of competitive learning, built for the Web3 era.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden p-6 lg:p-8 premium-surface rounded-2xl hover:border-brand-purple/45 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-glow"
            >
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-brand-purple/10 blur-3xl group-hover:bg-interactive-cyan/10 transition-colors" />
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br shadow-premium ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon size={28} className="text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
