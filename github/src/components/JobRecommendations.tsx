import React from 'react';
import type { JobRecommendation } from '../utils/geminiApi';

interface JobRecommendationsProps {
  recommendations: JobRecommendation[];
}

export const JobRecommendations: React.FC<JobRecommendationsProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  // Let's define cyber color classes for the cards
  const CARD_ACCENTS = [
    {
      glowClass: 'hover:border-cyber-neon/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]',
      dotClass: 'bg-cyber-neon',
      textAccentClass: 'text-cyber-neon',
      bgGlowClass: 'from-cyber-neon/10 via-transparent to-transparent',
      borderClass: 'border-cyber-neon/20'
    },
    {
      glowClass: 'hover:border-cyber-purple/40 hover:shadow-[0_0_20px_rgba(123,47,255,0.15)]',
      dotClass: 'bg-cyber-purple',
      textAccentClass: 'text-cyber-purple',
      bgGlowClass: 'from-cyber-purple/10 via-transparent to-transparent',
      borderClass: 'border-cyber-purple/20'
    },
    {
      glowClass: 'hover:border-cyber-pink/40 hover:shadow-[0_0_20px_rgba(255,0,127,0.15)]',
      dotClass: 'bg-cyber-pink',
      textAccentClass: 'text-cyber-pink',
      bgGlowClass: 'from-cyber-pink/10 via-transparent to-transparent',
      borderClass: 'border-cyber-pink/20'
    }
  ];

  return (
    <div className="w-full my-8 relative z-10 animate-fade-in text-left">
      {/* Dossier Header */}
      <h3 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-cyber-neon animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Targeted Job Match Recommendations
      </h3>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((job, index) => {
          const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
          return (
            <div
              key={index}
              className={`glass-card rounded-xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${accent.glowClass}`}
            >
              {/* Laser Line and Corner Dot */}
              <div className={`absolute top-0 right-0 w-3 h-3 ${accent.dotClass} opacity-70`}></div>
              <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${accent.bgGlowClass}`}></div>

              <div>
                {/* Header: Role & Match Percentage */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">
                      {job.companyType}
                    </span>
                    <h4 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wide leading-tight">
                      {job.role}
                    </h4>
                  </div>
                  
                  {/* Match Percentage circular/badge indicator */}
                  <div className="flex-shrink-0 text-center">
                    <span className={`block text-2xl font-rajdhani font-extrabold ${accent.textAccentClass}`}>
                      {job.matchPercentage}%
                    </span>
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold font-mono">
                      MATCH
                    </span>
                  </div>
                </div>

                {/* Match Bar */}
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6 border border-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-transparent to-current ${accent.textAccentClass}`}
                    style={{ 
                      width: `${job.matchPercentage}%`,
                      backgroundColor: 'currentColor'
                    }}
                  ></div>
                </div>

                {/* Reason / Why you match */}
                <div className="p-4 rounded bg-black/40 border border-white/5 mb-6">
                  <span className={`text-[10px] uppercase font-rajdhani font-bold tracking-widest block mb-1.5 ${accent.textAccentClass}`}>
                    Match Justification
                  </span>
                  <p className="text-white/80 text-sm font-medium leading-relaxed font-space">
                    {job.whyYouMatch}
                  </p>
                </div>
              </div>

              {/* Required/Demonstrated Skills Tags */}
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono block mb-2">
                  Demonstrated Stack Match
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.keySkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-white/5 text-white/80 border border-white/10 text-xs px-2.5 py-1 rounded font-mono font-medium tracking-wide"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
