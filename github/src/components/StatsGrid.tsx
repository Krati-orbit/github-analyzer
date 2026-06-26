import React from 'react';
import type { GitHubRepo } from '../utils/githubApi';

interface StatsGridProps {
  publicReposCount: number;
  totalStars: number;
  topRepo: GitHubRepo | null;
  mostUsedLanguage: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  publicReposCount,
  totalStars,
  topRepo,
  mostUsedLanguage,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-10 my-8 animate-fade-in">
      
      {/* Total Repos Card */}
      <div className="glass-card p-6 rounded-lg border border-white/5 relative group hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-neon"></div>
        <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-bold font-rajdhani mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-cyber-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Total Repositories
        </div>
        <div className="text-4xl md:text-5xl font-rajdhani font-bold text-white group-hover:text-cyber-neon transition-colors duration-300">
          {publicReposCount}
        </div>
      </div>

      {/* Total Stars Card */}
      <div className="glass-card p-6 rounded-lg border border-white/5 relative group hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-purple"></div>
        <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-bold font-rajdhani mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.253.58 1.802l-3.97 2.887a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.97-2.887a1 1 0 00-1.176 0l-3.97 2.887c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.97-2.887c-.779-.55-.379-1.802.58-1.802h4.907a1 1 0 00.95-.69l1.519-4.674z" />
          </svg>
          Total Stars Earned
        </div>
        <div className="text-4xl md:text-5xl font-rajdhani font-bold text-white group-hover:text-cyber-purple transition-colors duration-300">
          {totalStars}
        </div>
      </div>

      {/* Most Used Language Card */}
      <div className="glass-card p-6 rounded-lg border border-white/5 relative group hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-pink"></div>
        <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-bold font-rajdhani mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-cyber-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Primary Language
        </div>
        <div className="text-3xl md:text-4xl font-rajdhani font-bold text-white truncate group-hover:text-cyber-pink transition-colors duration-300">
          {mostUsedLanguage || 'None'}
        </div>
      </div>

      {/* Top Repository Card */}
      <div className="glass-card p-6 rounded-lg border border-white/5 relative group hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-neon"></div>
        <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest font-bold font-rajdhani mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-cyber-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Top Repository
        </div>
        {topRepo ? (
          <div className="flex flex-col justify-between h-14">
            <a 
              href={topRepo.htmlUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-lg md:text-xl font-rajdhani font-bold text-white truncate hover:underline hover:text-cyber-neon block"
            >
              {topRepo.name}
            </a>
            <span className="text-xs text-white/50 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-cyber-purple inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {topRepo.stars} stars
            </span>
          </div>
        ) : (
          <div className="text-xl md:text-2xl font-rajdhani font-bold text-white/30">N/A</div>
        )}
      </div>

    </div>
  );
};
