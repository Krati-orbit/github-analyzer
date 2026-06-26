# Project File Architecture

This document describes the structure and layout of the **GitAnalyze** application codebase.

## Directory Layout

```
github-analyzer/ (Root Repository)
├── .git/                 # Git version control files
├── .gitignore            # Root Git ignore configuration (excludes .env files)
├── README.md             # Core project overview and guide
├── ARCHITECTURE.md       # [This File] Codebase layout & workflow architecture
└── github/               # Main React Application Directory (Vite Project)
    ├── .env.example      # Example environment variables template
    ├── .gitignore        # App-specific Git ignores
    ├── .oxlintrc.json    # Lint configuration for Oxlint
    ├── index.html        # Main HTML entry point
    ├── package.json      # Dependencies and execution scripts
    ├── public/           # Static browser assets (icons, images)
    ├── src/              # Source code directory
    │   ├── App.css       # Global layout styling and custom animations
    │   ├── App.tsx       # Root React Component (Main state orchestrator)
    │   ├── index.css     # Main CSS file (Tailwind directives and theme variables)
    │   ├── main.tsx      # Main application entry file (renders App component)
    │   ├── assets/       # Visual media assets (SVGs, logos)
    │   ├── components/   # Modular React Components
    │   │   ├── AIAnalysis.tsx          # Renders Gemini's Recruiter Dossier Report
    │   │   ├── JobRecommendations.tsx  # Renders the career matching board
    │   │   ├── LanguageChart.tsx       # Renders language percentage bars
    │   │   ├── ProfileCard.tsx         # Renders top profile name and bio
    │   │   ├── RepoCards.tsx           # Renders list of repositories
    │   │   ├── SearchBar.tsx           # Input field for typing GitHub handles
    │   │   └── StatsGrid.tsx           # Grid showcasing cumulative stars/repos
    │   └── utils/        # Backend API wrappers
    │       ├── geminiApi.ts            # Prepares prompts and calls Gemini Pro Lite API
    │       └── githubApi.ts            # Fetches profile metadata and scores repositories
    └── tsconfig.json     # TypeScript compiler options
```

---

## Core Components & Modules

### 1. The Entry Points
* **[main.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/main.tsx)**: Initializes the React environment and mounts the `App` component into the DOM.
* **[App.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/App.tsx)**: Holds the master state (`githubData`, `aiAnalysis`, `jobRecommendations`). Orchestrates loading states and schedules search requests.

### 2. The Data Layer (`src/utils/`)
* **[githubApi.ts](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/utils/githubApi.ts)**:
  * Performs HTTP requests to the GitHub REST API.
  * Runs the **Algorithmic Scoring engine** (`scoreProject`) to grade project quality.
  * Sanitizes and parses README markdown into plain text to save AI tokens.
* **[geminiApi.ts](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/utils/geminiApi.ts)**:
  * Generates structured prompts combining repository lists, scoring data, and readme files.
  * Communicates with `gemini-3.1-flash-lite` to receive structured JSON responses containing developer assessments and career recommendations.

### 3. The UI components (`src/components/`)
* **[SearchBar.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/components/SearchBar.tsx)**: Receives user input and submits searches.
* **[ProfileCard.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/components/ProfileCard.tsx)**: Displays the developer's avatar, name, and location.
* **[StatsGrid.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/components/StatsGrid.tsx)**: Provides immediate feedback on stars, repos, and score highlights.
* **[AIAnalysis.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/components/AIAnalysis.tsx)**: Visualizes AI assessment summary, technical strengths, and areas to improve.
* **[JobRecommendations.tsx](file:///c:/Users/krati/New%20folder%20%2810%29/github/src/components/JobRecommendations.tsx)**: Renders matches for tailored job positions on-demand.
