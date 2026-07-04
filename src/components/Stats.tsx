import React from 'react';
import { Layers, BarChart3, Award } from 'lucide-react';

const stats = [
  {
    icon: Layers,
    value: '3',
    label: 'Categories',
    description: 'Science, Technology, Culture',
  },
  {
    icon: BarChart3,
    value: '3',
    label: 'Difficulty Levels',
    description: 'Beginner, Intermediate, Expert',
  },
  {
    icon: Award,
    value: '4',
    label: 'Rank Tiers',
    description: 'Bronze, Silver, Gold, Diamond',
  },
];

const Stats: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neon-divider mb-12" />
        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="premium-surface rounded-2xl p-6 text-center group hover:border-interactive-cyan/35 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg premium-badge mb-4 group-hover:bg-brand-purple/20 transition-colors duration-300">
                <stat.icon size={24} className="text-brand-purple" />
              </div>

              {/* Value */}
              <div className="text-4xl lg:text-5xl font-bold text-text-primary mb-1">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-lg font-semibold text-text-primary mb-1">
                {stat.label}
              </div>

              {/* Description */}
              <div className="text-sm text-text-secondary">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
