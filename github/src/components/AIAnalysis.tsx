import React from 'react';
import type { AIAnalysisResult, JobRecommendation } from '../utils/geminiApi';

interface AIAnalysisProps {
  analysis: AIAnalysisResult;
  username?: string;
  jobRecommendations?: JobRecommendation[] | null;
  onOpenAuditByName: (repoName: string) => void;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ 
  analysis, 
  username, 
  jobRecommendations,
  onOpenAuditByName
}) => {
  const downloadReport = (format: 'markdown' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify({ analysis, jobRecommendations }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${username || 'github'}_neural_analysis.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const dateStr = new Date().toLocaleDateString();
    let markdown = `# GitAnalyze Neural Profile Analysis - ${username || 'Profile'}\n`;
    markdown += `Generated on: ${dateStr}\n\n`;
    
    markdown += `## Developer Assessment Summary\n`;
    markdown += `${analysis.summary}\n\n`;
    
    markdown += `## Optimal Trajectory Suggestion\n`;
    markdown += `${analysis.careerSuggestion}\n\n`;
    
    markdown += `## Core Capabilities & Strengths\n`;
    analysis.strengths.forEach((str) => {
      markdown += `- ${str}\n`;
    });
    markdown += `\n`;
    
    markdown += `## Vulnerabilities & Areas of Improvement\n`;
    analysis.improvements.forEach((imp) => {
      markdown += `- ${imp}\n`;
    });
    markdown += `\n`;
    
    if (analysis.bestProject) {
      markdown += `## Top Repository Showcase: ${analysis.bestProject.name}\n`;
      markdown += `- **Algorithmic Score:** ${analysis.bestProject.score}\n`;
      markdown += `- **Project Ownership:** ${analysis.bestProject.isPersonalOrCollaborative}\n`;
      markdown += `- **Languages Utilized:** ${analysis.bestProject.languagesUsed}\n`;
      markdown += `- **Production Readiness:** ${analysis.bestProject.isProductionReady}\n`;
      markdown += `- **Problem Addressed:** ${analysis.bestProject.problemSolved}\n`;
      markdown += `- **Selection Rationale:** ${analysis.bestProject.whyBest}\n\n`;
    }
    
    markdown += `## AI Transmission Node\n`;
    markdown += `> "${analysis.motivation}"\n\n`;

    if (jobRecommendations && jobRecommendations.length > 0) {
      markdown += `## Targeted Job Match Recommendations\n\n`;
      jobRecommendations.forEach((job, idx) => {
        markdown += `### ${idx + 1}. ${job.role}\n`;
        markdown += `- **Ideal Company/Industry:** ${job.companyType}\n`;
        markdown += `- **Match Score:** ${job.matchPercentage}%\n`;
        markdown += `- **Match Justification:** ${job.whyYouMatch}\n`;
        markdown += `- **Demonstrated Skills:** ${job.keySkills.join(', ')}\n\n`;
      });
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${username || 'github'}_neural_analysis_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full my-8 relative z-10 animate-fade-in">
      
      {/* Dossier Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 text-left">
        <h3 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <svg className="w-6 h-6 text-cyber-neon animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Gemini Neural Profile Analysis
        </h3>
        
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => downloadReport('markdown')}
            className="px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider text-black bg-cyber-neon rounded-md cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,136,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Markdown
          </button>
          
          <button
            onClick={() => downloadReport('json')}
            className="px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider text-white border border-cyber-purple bg-cyber-purple/10 rounded-md cursor-pointer hover:bg-cyber-purple hover:text-black hover:shadow-[0_0_15px_rgba(123,47,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider text-white border border-cyber-pink bg-cyber-pink/10 rounded-md cursor-pointer hover:bg-cyber-pink hover:text-black hover:shadow-[0_0_15px_rgba(255,0,127,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export PDF (Page)
          </button>
        </div>
      </div>

      {/* Main Analysis Holographic Card */}
      <div className="glass-card rounded-xl border-2 animate-border-glow p-6 md:p-8 relative overflow-hidden">
        
        {/* Futuristic scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

        {/* Top scan lights */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-neon to-transparent animate-pulse"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Left panel - Recruiter Summary & Career Path (8 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Core Summary */}
            <div className="p-5 rounded-lg bg-black/40 border border-white/5 relative">
              <span className="absolute top-2 right-3 font-mono text-[9px] text-cyber-neon uppercase tracking-widest font-bold">
                Status: Complete
              </span>
              <h4 className="text-lg font-rajdhani font-bold text-cyber-neon uppercase tracking-wider mb-2">
                Developer Assessment Summary
              </h4>
              <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Career Suggestion */}
            <div className="p-5 rounded-lg bg-black/40 border border-white/5 relative flex items-start gap-4">
              <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/20 rounded-md text-cyber-purple mt-1 flex-shrink-0">
                <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-rajdhani font-bold text-cyber-purple uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  Optimal Trajectory Suggestion
                </h4>
                <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
                  {analysis.careerSuggestion}
                </p>
              </div>
            </div>

            {/* Best Project Highlight */}
            {analysis.bestProject && (
              <div className="p-6 rounded-lg bg-black/50 border border-cyber-neon/20 relative flex flex-col gap-4 overflow-hidden group hover:border-cyber-neon/40 transition-all duration-300">
                {/* Corner tech lines */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-neon/30 pointer-events-none"></div>
                
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyber-neon/10 border border-cyber-neon/20 rounded text-cyber-neon">
                      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-neon/60 font-mono uppercase tracking-widest block font-bold">Algorithmic Best Project Showcase</span>
                      <h4 className="text-xl font-rajdhani font-bold text-white select-all flex items-center gap-1.5">
                        {analysis.bestProject.name}
                        <button
                          onClick={() => onOpenAuditByName(analysis.bestProject.name)}
                          className="p-1 text-cyber-neon/60 hover:text-cyber-neon hover:bg-cyber-neon/10 rounded transition-all cursor-pointer no-print"
                          title="Open Telemetry Score Audit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                          </svg>
                        </button>
                      </h4>
                    </div>
                  </div>
                  {analysis.bestProject.score !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] text-white/40 font-mono block uppercase tracking-wide">Score Index</span>
                      <span className="text-xl font-mono font-bold text-cyber-neon">
                        {analysis.bestProject.score}
                      </span>
                    </div>
                  )}
                </div>

                {'isPersonalOrCollaborative' in analysis.bestProject ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Ownership */}
                      <div className="p-3.5 rounded bg-black/30 border border-white/5 flex gap-3 hover:border-white/10 transition-colors">
                        <div className="text-cyber-purple font-mono text-sm font-bold mt-0.5">01</div>
                        <div>
                          <h5 className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-0.5 font-bold">Project Ownership</h5>
                          <p className="text-white/80 text-sm font-medium leading-relaxed">{analysis.bestProject.isPersonalOrCollaborative}</p>
                        </div>
                      </div>

                      {/* 2. Languages */}
                      <div className="p-3.5 rounded bg-black/30 border border-white/5 flex gap-3 hover:border-white/10 transition-colors">
                        <div className="text-cyber-neon font-mono text-sm font-bold mt-0.5">02</div>
                        <div>
                          <h5 className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-0.5 font-bold">Languages Utilized</h5>
                          <p className="text-white/80 text-sm font-medium leading-relaxed">{analysis.bestProject.languagesUsed}</p>
                        </div>
                      </div>

                      {/* 3. Production Ready */}
                      <div className="p-3.5 rounded bg-black/30 border border-white/5 flex gap-3 hover:border-white/10 transition-colors">
                        <div className="text-cyber-pink font-mono text-sm font-bold mt-0.5">03</div>
                        <div>
                          <h5 className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-0.5 font-bold">Production Readiness</h5>
                          <p className="text-white/80 text-sm font-medium leading-relaxed">{analysis.bestProject.isProductionReady}</p>
                        </div>
                      </div>

                      {/* 4. Problem Solved */}
                      <div className="p-3.5 rounded bg-black/30 border border-white/5 flex gap-3 hover:border-white/10 transition-colors">
                        <div className="text-cyber-neon/70 font-mono text-sm font-bold mt-0.5">04</div>
                        <div>
                          <h5 className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-0.5 font-bold">Problem Addressed</h5>
                          <p className="text-white/80 text-sm font-medium leading-relaxed">{analysis.bestProject.problemSolved}</p>
                        </div>
                      </div>
                    </div>

                    {/* 5. Why Best */}
                    <div className="p-4 rounded bg-cyber-neon/5 border border-cyber-neon/10 flex gap-3 hover:border-cyber-neon/20 transition-all">
                      <div className="text-cyber-neon font-mono text-sm font-bold mt-0.5">05</div>
                      <div>
                        <h5 className="text-[11px] font-mono text-cyber-neon/80 uppercase tracking-wider mb-1 font-bold">Selection Rationale</h5>
                        <p className="text-white/90 text-sm font-medium leading-relaxed">{analysis.bestProject.whyBest}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  // Fallback for old structure
                  <div className="p-4 rounded bg-cyber-neon/5 border border-cyber-neon/10 flex gap-3">
                    <div className="text-cyber-neon font-mono text-sm font-bold mt-0.5">★</div>
                    <div>
                      <h5 className="text-[11px] font-mono text-cyber-neon/80 uppercase tracking-wider mb-1 font-bold">Project Details</h5>
                      <p className="text-white/90 text-sm font-medium leading-relaxed">{(analysis.bestProject as any).reason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right panel - Strengths & Improvements (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            
            {/* Strengths */}
            <div className="p-5 rounded-lg bg-black/40 border border-white/5">
              <h4 className="text-lg font-rajdhani font-bold text-cyber-neon uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyber-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Core Capabilities
              </h4>
              <ul className="flex flex-col gap-3">
                {analysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-2 text-sm md:text-base font-medium text-white/80">
                    <span className="text-cyber-neon flex-shrink-0 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-5 rounded-lg bg-black/40 border border-white/5">
              <h4 className="text-lg font-rajdhani font-bold text-cyber-pink uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyber-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Vulnerabilities / Improvements
              </h4>
              <ul className="flex flex-col gap-3">
                {analysis.improvements.map((imp, idx) => (
                  <li key={idx} className="flex gap-2 text-sm md:text-base font-medium text-white/80">
                    <span className="text-cyber-pink flex-shrink-0 font-bold">⚠</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Panel - Motivational Message (Styled Quote Box) */}
        <div className="mt-8 p-5 bg-gradient-to-r from-cyber-neon/10 via-cyber-purple/5 to-cyber-pink/10 rounded-lg border border-white/10 relative overflow-hidden flex flex-col items-center text-center">
          {/* Cyber decoration lines */}
          <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-cyber-neon"></div>
          <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-cyber-pink"></div>
          
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono mb-2">
            AI Transmission Node
          </span>
          <p className="text-lg md:text-xl font-rajdhani font-medium text-white max-w-2xl italic leading-relaxed">
            "{analysis.motivation}"
          </p>
        </div>

      </div>
    </div>
  );
};
