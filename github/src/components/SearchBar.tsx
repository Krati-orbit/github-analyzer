import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
}

const PLACEHOLDERS = [
  'torvalds',
  'gaearon',
  'yyx990803',
  'tj',
  'mrdoob',
  'danabramov',
  'ruanyf'
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [username, setUsername] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect for placeholder
  useEffect(() => {
    let timer: any;
    const currentFullText = PLACEHOLDERS[placeholderIndex];

    const type = () => {
      if (isDeleting) {
        setPlaceholder(currentFullText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else {
        setPlaceholder(currentFullText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }

      // Handle transitions
      if (!isDeleting && charIndex === currentFullText.length) {
        // Pause at full word
        timer = setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
        timer = setTimeout(() => {}, 3000);
      } else {
        timer = setTimeout(type, isDeleting ? 75 : 150);
      }
    };

    timer = setTimeout(type, isDeleting && charIndex === currentFullText.length ? 1500 : 100);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      onSearch(username.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 relative z-10 animate-fade-in">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Glow backdrop effect */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-cyber-neon to-cyber-purple rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative flex w-full items-center bg-black/80 rounded-lg border border-white/10 p-1.5 focus-within:border-cyber-neon/80 focus-within:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-300">
          
          {/* GitHub Icon prefix */}
          <div className="pl-3 pr-2 text-white/50">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
            </svg>
          </div>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={`Analyze username, e.g. ${placeholder}|`}
            className="flex-1 bg-transparent px-4 py-3 text-white text-lg placeholder-white/40 focus:outline-none font-space font-medium"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="relative flex items-center justify-center px-6 py-3 font-rajdhani text-lg font-bold uppercase tracking-wider text-black bg-cyber-neon rounded-md cursor-pointer hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Decoding...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
