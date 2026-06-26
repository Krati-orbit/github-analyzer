import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProfileCard } from './components/ProfileCard';
import { StatsGrid } from './components/StatsGrid';
import { LanguageChart } from './components/LanguageChart';
import { RepoCards } from './components/RepoCards';
import { AIAnalysis } from './components/AIAnalysis';
import { JobRecommendations } from './components/JobRecommendations';
import { fetchGitHubData } from './utils/githubApi';
import type { GitHubData } from './utils/githubApi';
import { analyzeProfileWithGemini, recommendJobsWithGemini } from './utils/geminiApi';
import type { AIAnalysisResult, JobRecommendation } from './utils/geminiApi';

interface Particle {
  id: number;
  top: string;
  left: string;
  size: string;
  delay: string;
}

function App() {
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[] | null>(null);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate star particles on mount
  useEffect(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 2.5 + 1}px`,
        delay: `${Math.random() * 3}s`
      });
    }
    setParticles(list);
  }, []);

  // Parse URL query parameter on mount for sharing functionality
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUsername = params.get('u');
    if (sharedUsername) {
      handleSearch(sharedUsername);
    }
  }, []);

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setError(null);
    setGithubData(null);
    setAiAnalysis(null);
    setJobRecommendations(null);
    setJobsError(null);

    // Update URL query parameter
    const newUrl = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(username)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
      // 1. Fetch GitHub data
      const data = await fetchGitHubData(username);
      setGithubData(data);

      // 2. Fetch Gemini AI data
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error(
          'VITE_GEMINI_API_KEY is not defined in your environment (.env file). Cannot perform AI analysis.'
        );
      }
      const analysis = await analyzeProfileWithGemini(data, geminiKey);
      setAiAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchJobRecommendations = async () => {
    if (!githubData) return;
    setIsJobsLoading(true);
    setJobsError(null);
    setJobRecommendations(null);

    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error(
          'VITE_GEMINI_API_KEY is not defined in your environment (.env file). Cannot perform AI job matchmaking.'
        );
      }
      const recommendations = await recommendJobsWithGemini(githubData, geminiKey);
      setJobRecommendations(recommendations);
    } catch (err: any) {
      setJobsError(err.message || 'An unexpected error occurred while recommending jobs.');
    } finally {
      setIsJobsLoading(false);
    }
  };

  const handleShare = () => {
    if (!githubData) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(
      githubData.profile.login
    )}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // Find the top repo from the repos list
  const topRepo = githubData?.repos
    ? [...githubData.repos].sort((a, b) => b.stars - a.stars)[0] || null
    : null;

  return (
    <div className="min-height-screen relative z-10 scanlines overflow-hidden pb-16">
      
      {/* Particle Background */}
      <div className="star-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="star"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Hero Header */}
        <header className="text-center pt-16 pb-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-rajdhani font-extrabold tracking-widest text-white uppercase mb-2">
            Git<span className="text-cyber-neon neon-text-green">Analyze</span>
          </h1>
          <p className="text-sm md:text-base font-mono text-cyber-purple tracking-widest uppercase mb-8">
            Neural Network Github Profiler // Deciphering Codebases
          </p>
          
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </header>

        {/* Error Message Box */}
        {error && (
          <div className="glass-card max-w-2xl mx-auto border-2 border-cyber-pink/50 p-6 rounded-lg text-left my-6 relative animate-fade-in">
            {/* Cyberpunk hazard line */}
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-cyber-pink"></div>
            <h4 className="text-lg font-rajdhani font-bold text-cyber-pink uppercase mb-1">
              SYSTEM ERROR: DECODING_FAILED
            </h4>
            <p className="text-sm font-medium text-white/80 leading-relaxed font-space">
              {error}
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="w-full flex flex-col gap-6 animate-pulse max-w-5xl mx-auto">
            {/* ProfileCard Skeleton */}
            <div className="glass-card h-48 rounded-xl border border-white/5 p-6 flex flex-col md:flex-row gap-6">
              <div className="w-28 h-28 md:w-32 md:h-32 bg-white/10 rounded-full flex-shrink-0"></div>
              <div className="flex-1 flex flex-col gap-3 justify-center">
                <div className="h-6 bg-white/15 w-48 rounded"></div>
                <div className="h-4 bg-white/10 w-full rounded"></div>
                <div className="h-4 bg-white/10 w-3/4 rounded"></div>
              </div>
            </div>

            {/* StatsGrid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card h-24 rounded-lg border border-white/5 p-4 flex flex-col justify-between">
                  <div className="h-3 bg-white/10 w-24 rounded"></div>
                  <div className="h-8 bg-white/15 w-16 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loaded Results Display */}
        {githubData && (
          <main className="max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* Profile Overview Card */}
            <ProfileCard profile={githubData.profile} />

            {/* Stats Grid */}
            <StatsGrid
              publicReposCount={githubData.profile.publicReposCount}
              totalStars={githubData.totalStars}
              topRepo={topRepo}
              mostUsedLanguage={githubData.languages[0]?.language || ''}
            />

            {/* Language chart if distribution is available */}
            {githubData.languages.length > 0 && (
              <LanguageChart languages={githubData.languages} />
            )}

            {/* AI Analysis Dossier from Gemini */}
            {aiAnalysis ? (
              <AIAnalysis analysis={aiAnalysis} />
            ) : (
              // AI Loading skeleton
              <div className="glass-card border-2 border-cyber-purple/20 p-6 md:p-8 rounded-xl flex flex-col gap-4 animate-pulse">
                <div className="h-6 bg-white/15 w-64 rounded"></div>
                <div className="h-4 bg-white/10 w-full rounded"></div>
                <div className="h-4 bg-white/10 w-5/6 rounded"></div>
                <div className="h-4 bg-white/10 w-4/5 rounded"></div>
                <div className="flex items-center justify-center gap-2 mt-4 text-cyber-purple font-rajdhani font-bold text-lg uppercase tracking-wider">
                  <svg className="animate-spin h-5 w-5 text-cyber-purple" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing Neural Cognitive Synthesizer...
                </div>
              </div>
            )}

            {/* AI Job Recommendations Section */}
            {aiAnalysis && (
              <div className="w-full my-8 relative z-10 animate-fade-in text-left">
                {!jobRecommendations && !isJobsLoading && (
                  <div className="glass-card rounded-xl border border-dashed border-cyber-purple/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:border-cyber-purple/80 hover:shadow-[0_0_20px_rgba(123,47,255,0.1)] transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyber-purple animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Unlock Neural Job Match recommendations
                      </h3>
                      <p className="text-white/70 text-sm font-medium leading-relaxed font-space max-w-xl">
                        Analyze the profile's tech stack, repositories, and activity to match with 3 targeted roles and company profiles. Run AI matchmaking on-demand.
                      </p>
                      {jobsError && (
                        <p className="text-cyber-pink text-xs font-semibold mt-2">
                          ERROR: {jobsError}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleFetchJobRecommendations}
                      className="relative px-6 py-3 font-rajdhani text-lg font-bold uppercase tracking-wider text-black bg-cyber-purple rounded-md cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(123,47,255,0.6)] active:scale-95 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                    >
                      Recommend Jobs
                    </button>
                  </div>
                )}

                {isJobsLoading && (
                  <div className="glass-card border border-cyber-purple/20 p-6 md:p-8 rounded-xl flex flex-col gap-6 animate-pulse">
                    <div className="h-6 bg-white/15 w-64 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card border border-white/5 p-6 flex flex-col gap-4">
                          <div className="h-4 bg-white/10 w-24 rounded"></div>
                          <div className="h-6 bg-white/15 w-40 rounded"></div>
                          <div className="h-2 bg-white/10 w-full rounded"></div>
                          <div className="h-16 bg-white/10 w-full rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-cyber-purple font-rajdhani font-bold text-base uppercase tracking-wider">
                      <svg className="animate-spin h-5 w-5 text-cyber-purple" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Career Cognitive Synthesizer...
                    </div>
                  </div>
                )}

                {jobRecommendations && (
                  <JobRecommendations recommendations={jobRecommendations} />
                )}
              </div>
            )}

            {/* Top Repos Showcase */}
            <RepoCards repos={githubData.repos} />

            {/* Share Dossier Section */}
            <section className="flex flex-col items-center justify-center py-8">
              <button
                onClick={handleShare}
                className="relative px-8 py-4 font-rajdhani text-xl font-bold uppercase tracking-wider text-black bg-gradient-to-r from-cyber-neon to-cyber-purple rounded-md cursor-pointer hover:shadow-[0_0_25px_rgba(0,255,136,0.6)] active:scale-95 transition-all duration-300 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.887-2.443m0 0a3.46 3.46 0 11.263-1.61l-4.887 2.443m1.887-.764a3.46 3.46 0 11-1.071-1.916m0 0a3.46 3.46 0 01-1.07 1.916M19.336 17a3.46 3.46 0 11-3.46-3.46A3.46 3.46 0 0119.336 17z" />
                </svg>
                {shareCopied ? 'Link Copied to Clipboard!' : 'Share Neural Analysis'}
              </button>
            </section>

          </main>
        )}

      </div>
    </div>
  );
}

export default App;
