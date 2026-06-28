import React, { useEffect, useState } from 'react';
import { calculateScoreBreakdown } from '../utils/githubApi';
import type { GitHubRepo } from '../utils/githubApi';

interface ScoreAuditDrawerProps {
  repo: GitHubRepo | null;
  onClose: () => void;
}

export const ScoreAuditDrawer: React.FC<ScoreAuditDrawerProps> = ({ repo, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Manage mount/unmount and sliding transitions
  useEffect(() => {
    if (repo) {
      setIsRendered(true);
      // Small timeout to allow transition to trigger after mount
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [repo]);

  if (!isRendered || !repo) return null;

  const breakdown = calculateScoreBreakdown(repo);

  // Determine quality level based on score
  let qualityLevel = 'PROTOTYPE';
  let levelColor = 'text-white/60';
  let levelBorder = 'border-white/20';
  let levelBg = 'bg-white/5';
  
  if (breakdown.totalScore >= 120) {
    qualityLevel = 'ELITE CODEBASE';
    levelColor = 'text-cyber-neon';
    levelBorder = 'border-cyber-neon/40';
    levelBg = 'bg-cyber-neon/5';
  } else if (breakdown.totalScore >= 60) {
    qualityLevel = 'PRODUCTION READY';
    levelColor = 'text-cyber-purple';
    levelBorder = 'border-cyber-purple/40';
    levelBg = 'bg-cyber-purple/5';
  } else if (breakdown.totalScore >= 20) {
    qualityLevel = 'SOLID LAB PROJECT';
    levelColor = 'text-cyber-pink';
    levelBorder = 'border-cyber-pink/40';
    levelBg = 'bg-cyber-pink/5';
  }

  // Compile actionable recommendations
  const recommendations: { text: string; points: string; type: 'warning' | 'info' }[] = [];

  if (!breakdown.readmeValue) {
    recommendations.push({
      text: 'Add a README.md file to document usage, setup, and features.',
      points: '+10 pts',
      type: 'warning',
    });
  }

  if (!breakdown.descriptionValue) {
    recommendations.push({
      text: 'Write a concise repository description in your project settings.',
      points: '+5 pts',
      type: 'warning',
    });
  }

  if (breakdown.topicsCount === 0) {
    recommendations.push({
      text: 'Assign repository topics/tags (e.g. react, typescript) to improve search discovery.',
      points: '+2 pts each',
      type: 'warning',
    });
  }

  if (breakdown.recentUpdateDays > 90) {
    const gainStr = breakdown.recentUpdateDays > 180 ? '+10 pts max' : '+5 pts max';
    recommendations.push({
      text: `Push a new commit or update dependencies (last activity was ${breakdown.recentUpdateDays} days ago).`,
      points: gainStr,
      type: 'warning',
    });
  }

  if (!breakdown.languageValue) {
    recommendations.push({
      text: 'Upload code files so GitHub can analyze and classify a primary language.',
      points: '+5 pts',
      type: 'warning',
    });
  }

  // Informative suggestions if the basic metadata is already optimal
  if (breakdown.starsValue === 0) {
    recommendations.push({
      text: 'Promote your project or share it on communities (Reddit, HackerNews) to earn stars.',
      points: '+3 pts / star',
      type: 'info',
    });
  }

  if (breakdown.forksValue === 0) {
    recommendations.push({
      text: 'Format code cleanly and open it for contributions to encourage forks.',
      points: '+2 pts / fork',
      type: 'info',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end no-print">
      
      {/* Dark blur backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-out Drawer Panel */}
      <div 
        className={`relative z-10 w-full sm:w-[500px] md:w-[600px] h-full bg-[#0a0a0a]/95 border-l border-white/10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0, 255, 136, 0.05) 0%, transparent 50%)'
        }}
      >
        
        {/* Futuristic Top Scanner Lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-neon to-transparent animate-pulse"></div>

        {/* Drawer Header */}
        <header className="px-6 pt-8 pb-4 border-b border-white/5 flex items-start justify-between">
          <div className="text-left">
            <span className="font-mono text-[9px] text-cyber-neon tracking-widest uppercase font-bold block mb-1">
              Telemetry Scanner // Score Audit
            </span>
            <h2 className="text-2xl font-rajdhani font-extrabold text-white uppercase tracking-wider select-all">
              {repo.name}
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-cyber-pink hover:bg-white/5 border border-transparent hover:border-cyber-pink/20 rounded transition-all duration-200 cursor-pointer"
            aria-label="Close telemetry drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8 scrollbar">

          {/* Points Overview Hero Section */}
          <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-lg bg-black/40 border border-white/5 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 pointer-events-none"></div>
            
            <div className="text-left flex-1">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block font-bold mb-1">
                Quality Index Status
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                  {breakdown.totalScore}
                </span>
                <span className="text-sm font-mono text-white/40 font-bold">PTS</span>
              </div>
              
              <div className={`mt-3 inline-block px-3 py-1 text-xs font-mono font-bold border rounded tracking-wider ${levelColor} ${levelBorder} ${levelBg}`}>
                {qualityLevel}
              </div>
            </div>

            {/* Circular score gauge */}
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  className="stroke-white/5" 
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  className="stroke-cyber-neon" 
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - Math.min(251.2, (breakdown.totalScore / 150) * 251.2)}
                  style={{ transition: 'stroke-dashoffset 1s ease-out-in' }}
                />
              </svg>
              <div className="absolute font-mono text-[11px] font-bold text-cyber-neon">
                {Math.round(Math.min(100, (breakdown.totalScore / 150) * 100))}%
              </div>
            </div>

          </section>

          {/* Point Telemetry Breakdown Table */}
          <section className="text-left">
            <h3 className="text-sm font-rajdhani font-bold text-white uppercase tracking-wider mb-3">
              Telemetry Point Breakdown
            </h3>
            
            <div className="rounded-lg border border-white/5 overflow-hidden bg-black/20">
              <div className="grid grid-cols-12 bg-white/5 px-4 py-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider border-b border-white/5">
                <div className="col-span-6">Rule Metric</div>
                <div className="col-span-3 text-right">Value</div>
                <div className="col-span-3 text-right">Credits</div>
              </div>

              <div className="divide-y divide-white/5 font-mono text-xs text-white/80">
                
                {/* Stars Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Community Stars</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +3 pts per star</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold">{breakdown.starsValue} ★</div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold text-cyber-neon">+{breakdown.starsPoints}</div>
                </div>

                {/* Forks Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Collaborative Forks</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +2 pts per fork</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold">{breakdown.forksValue}</div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold text-cyber-neon">+{breakdown.forksPoints}</div>
                </div>

                {/* README Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Documentation README</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +10 pts if present</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold">{breakdown.readmeValue ? 'Found' : 'Missing'}</div>
                  <div className={`col-span-3 text-right flex items-center justify-end font-bold ${breakdown.readmePoints > 0 ? 'text-cyber-neon' : 'text-white/20'}`}>
                    +{breakdown.readmePoints}
                  </div>
                </div>

                {/* Primary Language Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Primary Language</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +5 pts if configured</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end truncate font-bold">{breakdown.languageValue || 'N/A'}</div>
                  <div className={`col-span-3 text-right flex items-center justify-end font-bold ${breakdown.languagePoints > 0 ? 'text-cyber-neon' : 'text-white/20'}`}>
                    +{breakdown.languagePoints}
                  </div>
                </div>

                {/* Recent Updates Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Codebase Updates</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: bonus by age up to 10 pts</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end text-[10px] truncate font-bold">
                    {breakdown.recentUpdateDays === 0 ? 'Today' : `${breakdown.recentUpdateDays}d ago`}
                  </div>
                  <div className={`col-span-3 text-right flex items-center justify-end font-bold ${breakdown.recentUpdatePoints > 0 ? 'text-cyber-neon' : 'text-white/20'}`}>
                    +{breakdown.recentUpdatePoints}
                  </div>
                </div>

                {/* Description Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Project Description</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +5 pts if filled</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end truncate font-bold">{breakdown.descriptionValue ? 'Configured' : 'Missing'}</div>
                  <div className={`col-span-3 text-right flex items-center justify-end font-bold ${breakdown.descriptionPoints > 0 ? 'text-cyber-neon' : 'text-white/20'}`}>
                    +{breakdown.descriptionPoints}
                  </div>
                </div>

                {/* Topics Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Repository Topics</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +2 pts per tag</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold">{breakdown.topicsCount} tags</div>
                  <div className={`col-span-3 text-right flex items-center justify-end font-bold ${breakdown.topicsPoints > 0 ? 'text-cyber-neon' : 'text-white/20'}`}>
                    +{breakdown.topicsPoints}
                  </div>
                </div>

                {/* Watchers Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Network Watchers</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +1 pt per watcher</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold">{breakdown.watchersValue}</div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold text-cyber-neon">+{breakdown.watchersPoints}</div>
                </div>

                {/* Visibility Row */}
                <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-semibold text-white">Visibility Mode</span>
                    <span className="text-[10px] text-white/40 font-medium">Credits: +5 pts if Public</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end font-bold">{breakdown.visibilityValue}</div>
                  <div className={`col-span-3 text-right flex items-center justify-end font-bold ${breakdown.visibilityPoints > 0 ? 'text-cyber-neon' : 'text-white/20'}`}>
                    +{breakdown.visibilityPoints}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Actionable Optimization Suggestions */}
          <section className="text-left mb-6">
            <h3 className="text-sm font-rajdhani font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-cyber-pink animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Immediate Optimizations
            </h3>

            {recommendations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg bg-black/30 border flex gap-3 items-start transition-all hover:bg-black/50 ${
                      rec.type === 'warning' ? 'border-cyber-pink/20 hover:border-cyber-pink/40' : 'border-cyber-purple/20 hover:border-cyber-purple/40'
                    }`}
                  >
                    <span className={`font-bold flex-shrink-0 ${rec.type === 'warning' ? 'text-cyber-pink' : 'text-cyber-purple'}`}>
                      {rec.type === 'warning' ? '⚠' : 'ℹ'}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-space font-medium text-white/80 leading-relaxed">
                        {rec.text}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        rec.type === 'warning' ? 'text-cyber-pink border-cyber-pink/20 bg-cyber-pink/5' : 'text-cyber-purple border-cyber-purple/20 bg-cyber-purple/5'
                      }`}>
                        {rec.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-cyber-neon/5 border border-cyber-neon/20 flex gap-3 items-center">
                <span className="text-cyber-neon text-lg">✓</span>
                <p className="text-xs font-space font-semibold text-white/95">
                  Telemetry checks complete. Repository metrics are fully optimized! No immediate actions required.
                </p>
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
};
