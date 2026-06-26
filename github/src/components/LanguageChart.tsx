import React from 'react';
import type { LanguageStat } from '../utils/githubApi';

interface LanguageChartProps {
  languages: LanguageStat[];
}

const NEON_COLORS = [
  '#00ff88', // Neon Green
  '#7b2fff', // Neon Purple
  '#ff007f', // Neon Pink
  '#00f0ff', // Neon Cyan
  '#ffaa00', // Neon Orange
  '#eeff00', // Neon Yellow
];

export const LanguageChart: React.FC<LanguageChartProps> = ({ languages }) => {
  if (!languages || languages.length === 0) {
    return null;
  }

  // Take top 6 languages, combine others if any
  const topLangs = languages.slice(0, 5);
  const remainingCount = languages.slice(5).reduce((sum, item) => sum + item.count, 0);
  const remainingPct = languages.slice(5).reduce((sum, item) => sum + item.percentage, 0);

  if (remainingCount > 0) {
    topLangs.push({
      language: 'Others',
      count: remainingCount,
      percentage: remainingPct
    });
  }

  // Circular math
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  let accumulatedPercentage = 0;

  return (
    <div className="glass-card p-6 md:p-8 rounded-xl border border-white/5 relative z-10 w-full hover:border-cyber-purple/40 hover:shadow-[0_0_20px_rgba(123,47,255,0.15)] animate-fade-in my-8">
      {/* Corner borders */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyber-purple"></div>
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyber-purple"></div>

      <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.003 9.003 0 1020.95 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        Language Core Distribution
      </h3>

      <div className="flex flex-col md:flex-row items-center justify-around gap-8">
        
        {/* Donut SVG Chart */}
        <div className="relative w-44 h-44 md:w-48 md:h-48 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            {/* Dark inner track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="fill-transparent stroke-black/50"
              strokeWidth="10"
            />
            {topLangs.map((lang, index) => {
              const color = NEON_COLORS[index % NEON_COLORS.length];
              const pct = lang.percentage;
              const strokeLength = (pct / 100) * circumference;
              const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
              
              accumulatedPercentage += pct;

              return (
                <circle
                  key={lang.language}
                  cx="60"
                  cy="60"
                  r={radius}
                  className="fill-transparent transition-all duration-1000 ease-out"
                  stroke={color}
                  strokeWidth="10"
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 3px ${color}80)`
                  }}
                />
              );
            })}
          </svg>

          {/* Central core overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-rajdhani">Primary</span>
            <span className="text-xl font-rajdhani font-bold text-cyber-neon tracking-wide uppercase">
              {topLangs[0]?.language}
            </span>
            <span className="text-sm font-mono text-white/60">
              {topLangs[0]?.percentage}%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {topLangs.map((lang, index) => {
            const color = NEON_COLORS[index % NEON_COLORS.length];
            return (
              <div 
                key={lang.language}
                className="flex items-center justify-between p-3 rounded bg-black/30 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span 
                    className="w-3 h-3 rounded-full inline-block" 
                    style={{ 
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`
                    }}
                  ></span>
                  <span className="font-rajdhani text-base font-bold text-white uppercase tracking-wider">
                    {lang.language}
                  </span>
                </div>
                <span className="font-mono text-sm text-white/70 font-semibold bg-white/5 px-2 py-0.5 rounded">
                  {lang.percentage}%
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
