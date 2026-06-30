import React, { useEffect, useState } from 'react';

interface CreatorDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanProfile: (username: string) => void;
}

export const CreatorDossierDrawer: React.FC<CreatorDossierDrawerProps> = ({
  isOpen,
  onClose,
  onScanProfile,
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Read developer info from environment variables (or use sensible defaults)
  const name = import.meta.env.VITE_CREATOR_NAME || 'Developer';
  const role = import.meta.env.VITE_CREATOR_ROLE || 'Full-Stack Developer';
  const bio = import.meta.env.VITE_CREATOR_BIO || 'Intelligent Web Applications developer.';
  const email = import.meta.env.VITE_CREATOR_EMAIL || '';
  const linkedin = import.meta.env.VITE_CREATOR_LINKEDIN || '';
  const website = import.meta.env.VITE_CREATOR_WEBSITE || '';
  const resumeUrl = import.meta.env.VITE_CREATOR_RESUME_URL || '';
  const defaultUser = import.meta.env.VITE_DEFAULT_GITHUB_USER || 'Krati-orbit';

  // Core capabilities list based on the tech stack
  const skills = [
    'TypeScript',
    'React 19 & Vite',
    'Tailwind CSS v4',
    'Node.js / Express',
    'Google Gemini AI',
    'Vector Embeddings',
    'GitHub REST API',
    'System Architecture',
  ];

  // Manage mount/unmount and sliding transitions
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleScanClick = () => {
    onScanProfile(defaultUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end no-print">
      {/* Dark blur backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 ease-out cursor-pointer ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-out Drawer Panel */}
      <div
        className={`relative z-10 w-full sm:w-[500px] md:w-[550px] h-full bg-[#0a0a0a]/95 border-l border-white/10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 100% 100%, rgba(123, 47, 255, 0.05) 0%, transparent 50%)',
        }}
      >
        {/* Futuristic Top Scanner Lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent animate-pulse"></div>

        {/* Drawer Header */}
        <header className="px-6 pt-8 pb-4 border-b border-white/5 flex items-start justify-between">
          <div className="text-left">
            <span className="font-mono text-[9px] text-cyber-purple tracking-widest uppercase font-bold block mb-1">
              CREATOR BIO // CLASSIFIED DOSSIER
            </span>
            <h2 className="text-2xl font-rajdhani font-extrabold text-white uppercase tracking-wider">
              {name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-cyber-pink hover:bg-white/5 border border-transparent hover:border-cyber-pink/20 rounded transition-all duration-200 cursor-pointer"
            aria-label="Close dossier drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 scrollbar">
          
          {/* Status & Role Card */}
          <section className="p-5 rounded-lg bg-black/40 border border-white/5 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 pointer-events-none"></div>
            <span className="font-mono text-[9px] text-cyber-neon uppercase tracking-widest block font-bold mb-1">
              Active Designation
            </span>
            <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wide">
              {role}
            </h3>
            <p className="text-white/70 text-sm mt-3 leading-relaxed font-space">
              {bio}
            </p>
          </section>

          {/* Social / Contact Grid */}
          <section className="text-left">
            <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest font-bold mb-3">
              Transmission Channels
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 p-3.5 rounded bg-black/30 border border-white/5 hover:border-cyber-neon/40 hover:bg-cyber-neon/5 transition-all group"
                >
                  <div className="text-cyber-neon group-hover:animate-pulse">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-white/40 font-mono block uppercase">Secure Mail</span>
                    <span className="text-sm font-medium text-white/80">{email}</span>
                  </div>
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded bg-black/30 border border-white/5 hover:border-cyber-purple/40 hover:bg-cyber-purple/5 transition-all group"
                >
                  <div className="text-cyber-purple group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-white/40 font-mono block uppercase">LinkedIn Link</span>
                    <span className="text-sm font-medium text-white/80">{linkedin.replace('https://', '')}</span>
                  </div>
                </a>
              )}

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded bg-black/30 border border-white/5 hover:border-cyber-pink/40 hover:bg-cyber-pink/5 transition-all group"
                >
                  <div className="text-cyber-pink group-hover:rotate-12 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-white/40 font-mono block uppercase">Web Node</span>
                    <span className="text-sm font-medium text-white/80">{website.replace('https://', '')}</span>
                  </div>
                </a>
              )}

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded bg-black/30 border border-white/5 hover:border-white/40 hover:bg-white/5 transition-all group"
                >
                  <div className="text-white/60 group-hover:translate-y-0.5 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-white/40 font-mono block uppercase">Dossier PDF</span>
                    <span className="text-sm font-medium text-white/80 font-rajdhani font-bold tracking-wider">DOWNLOAD RESUME</span>
                  </div>
                </a>
              )}
            </div>
          </section>

          {/* Key Skill Matrices */}
          <section className="text-left">
            <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest font-bold mb-3">
              Neural Skill Matrix
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs font-mono font-medium px-2.5 py-1.5 rounded border border-cyber-purple/20 bg-cyber-purple/5 text-cyber-purple hover:border-cyber-purple/50 hover:bg-cyber-purple/10 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Scan Shortcut Panel */}
        <footer className="p-6 border-t border-white/5 bg-black/40">
          <button
            onClick={handleScanClick}
            className="w-full relative px-6 py-4 font-rajdhani text-lg font-bold uppercase tracking-wider text-black bg-cyber-neon rounded-md cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(0,255,136,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <span>Scan Live Codebase Analysis ({defaultUser})</span>
            <svg
              className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
};
