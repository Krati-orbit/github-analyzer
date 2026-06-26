import React from 'react';
import type { GitHubRepo } from '../utils/githubApi';

interface RepoCardsProps {
  repos: GitHubRepo[];
}

export const RepoCards: React.FC<RepoCardsProps> = ({ repos }) => {
  if (!repos || repos.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        No public repositories found.
      </div>
    );
  }

  // Sort by stars descending and take top 6
  const topRepos = [...repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6);

  return (
    <div className="w-full my-8 relative z-10 animate-fade-in">
      <h3 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-cyber-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Top Repositories Showcase
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topRepos.map((repo) => (
          <div 
            key={repo.name} 
            className="glass-card rounded-xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1.5 hover:border-cyber-neon/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300"
          >
            {/* Top right cyan dot */}
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-cyber-neon opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div>
              {/* Repository Title */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <a 
                  href={repo.htmlUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-lg md:text-xl font-rajdhani font-bold text-white hover:text-cyber-neon hover:underline truncate block tracking-wide"
                >
                  {repo.name}
                </a>
                
                {/* External link icon */}
                <a 
                  href={repo.htmlUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-white/40 hover:text-cyber-neon transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Repository Description */}
              <p className="text-white/70 text-sm font-medium mb-6 line-clamp-3 min-h-[4.5rem]">
                {repo.description || 'No description provided for this project.'}
              </p>
            </div>

            {/* Repository Metadata */}
            <div className="flex items-center justify-between text-xs pt-4 border-t border-white/5 font-mono text-white/50">
              
              {/* Language Tag */}
              {repo.language ? (
                <span className="bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">
                  {repo.language}
                </span>
              ) : (
                <span className="bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">
                  N/A
                </span>
              )}

              {/* Stars & Forks */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 hover:text-cyber-neon transition-colors">
                  <svg className="w-3.5 h-3.5 text-cyber-neon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {repo.stars}
                </span>
                
                <span className="flex items-center gap-1 hover:text-cyber-pink transition-colors">
                  <svg className="w-3.5 h-3.5 text-cyber-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  {repo.forks}
                </span>
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
