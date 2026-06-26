import React from 'react';
import type { GitHubProfile } from '../utils/githubApi';

interface ProfileCardProps {
  profile: GitHubProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const accountDate = new Date(profile.createdAt);
  const yearsActive = ((new Date().getTime() - accountDate.getTime()) / (1000 * 3600 * 24 * 365.25)).toFixed(1);

  return (
    <div className="glass-card w-full rounded-xl border border-white/10 p-6 md:p-8 relative overflow-hidden transition-all duration-300 hover:border-cyber-neon/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] animate-fade-in">
      {/* Corner design accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-neon"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-neon"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-neon"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-neon"></div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        
        {/* Avatar with dynamic pulsing neon border */}
        <div className="relative group flex-shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyber-neon to-cyber-purple rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <img 
            src={profile.avatarUrl} 
            alt={profile.name || profile.login} 
            className="relative w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-2 border-cyber-bg"
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1 text-center md:text-left flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h2 className="text-2xl md:text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                {profile.name || profile.login}
              </h2>
              <a 
                href={profile.htmlUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-cyber-neon hover:text-white font-mono text-sm md:text-base border border-cyber-neon/40 px-2 py-0.5 rounded bg-cyber-neon/5 hover:bg-cyber-neon/20 transition-all duration-300 inline-block self-center"
              >
                @{profile.login}
              </a>
            </div>

            {profile.bio && (
              <p className="text-white/70 text-sm md:text-base font-medium leading-relaxed mb-4 max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Location & Meta info */}
            <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6 text-sm text-white/50 mb-6">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {accountDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>

          {/* Followers, Following, Account Age Info */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-md w-full bg-black/40 p-4 rounded-lg border border-white/5">
            <div className="text-center border-r border-white/10">
              <span className="block text-xl md:text-2xl font-rajdhani font-bold text-cyber-neon">{profile.followers}</span>
              <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest font-bold">Followers</span>
            </div>
            <div className="text-center border-r border-white/10">
              <span className="block text-xl md:text-2xl font-rajdhani font-bold text-cyber-purple">{profile.following}</span>
              <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest font-bold">Following</span>
            </div>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-rajdhani font-bold text-cyber-pink">{yearsActive} yr</span>
              <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest font-bold">Account Age</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
