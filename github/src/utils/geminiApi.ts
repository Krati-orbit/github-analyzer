/**
 * Gemini API utility module for the GitAnalyze application.
 * 
 * WORKFLOW:
 * 1. receives sanitized profile and repository data from githubApi.ts.
 * 2. prepares summaries of repositories, languages, and recent activities.
 * 3. constructs a detailed, role-based prompt specifying strict JSON output formats.
 * 4. invokes the Google Gemini API (gemini-3.1-flash-lite) with the prompt.
 * 5. parses and validates the returned JSON response and returns it to App.tsx.
 */

import type { GitHubData } from './githubApi';

/**
 * Interface representing a tailored job recommendation produced by Gemini AI.
 */
export interface JobRecommendation {
  role: string;             // Specific career role (e.g., Frontend Developer, DevOps Engineer)
  companyType: string;      // Recommended company profile (e.g., AI Startup, Enterprise FinTech)
  matchPercentage: number;  // Matching score (50-100) based on repository complexity
  whyYouMatch: string;      // Detailed explanation referencing languages, stars, or contributions
  keySkills: string[];      // Array of 3-5 specific skills demonstrated in their GitHub profile
}

/**
 * Interface representing the detailed profile analysis produced by Gemini AI.
 */
export interface AIAnalysisResult {
  summary: string;          // Insightful recruiter-style summary of the developer's profile
  strengths: string[];      // 3 technical/workflow strengths identified in the code
  improvements: string[];   // 3 recommendations for profile/codebase improvement
  bestProject: {            // Breakdown of the developer's highest-scored repository
    name: string;
    score: number;
    isPersonalOrCollaborative: string;
    languagesUsed: string;
    isProductionReady: string;
    problemSolved: string;
    whyBest: string;
  };
  careerSuggestion: string; // Tailored long-term career path suggestion
  motivation: string;       // Unique, encouraging motivational quote
}

/**
 * Analyzes the parsed GitHub profile, repos, and activity data using Gemini AI.
 * 
 * @param githubData The unified data fetched from GitHub API
 * @param apiKey Google Gemini API Key
 * @returns AIAnalysisResult containing summary, strengths, improvements, best project details, and motivation
 */
export async function analyzeProfileWithGemini(
  githubData: GitHubData,
  apiKey: string
): Promise<AIAnalysisResult> {
  // Validate that the Gemini API Key is present
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is missing or empty. Please check your .env file.');
  }

  // Target model: gemini-3.1-flash-lite (fast, light, and cost-effective)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  // Step 2.1: Sort original repositories by algorithmic score to identify the "best" project
  const sortedReposByScore = [...githubData.repos]
    .filter(r => !r.isFork)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const bestRepo = sortedReposByScore[0] || null;

  // Step 2.2: Prepare a summarized list of repositories, prioritizing original work
  const sortedRepos = [...githubData.repos].sort((a, b) => {
    if (a.isFork !== b.isFork) {
      return a.isFork ? 1 : -1;
    }
    return b.stars - a.stars;
  });
  
  const reposSummary = sortedRepos
    .map(r => `- ${r.name} (${r.isFork ? 'FORK' : 'ORIGINAL'}): ${r.description || 'No description'} (Stars: ${r.stars}, Forks: ${r.forks}, Language: ${r.language || 'N/A'}, Algorithmic Score: ${r.score || 0})`)
    .slice(0, 30) // Cap at 30 repositories to control context length
    .join('\n');

  // Step 2.3: Build detailed metadata for the developer's best repository
  const bestRepoDetails = bestRepo ? `
BEST PROJECT DETAIL FOR ANALYSIS:
- Name: ${bestRepo.name}
- Algorithmic Score: ${bestRepo.score || 0}
- Primary Language: ${bestRepo.language || 'N/A'}
- Detailed Languages: ${githubData.bestRepoLanguages?.join(', ') || 'N/A'}
- Topics/Tags: ${bestRepo.topics?.join(', ') || 'None'}
- Description: ${bestRepo.description || 'No description'}
- Stars: ${bestRepo.stars} | Forks: ${bestRepo.forks} | Watchers: ${bestRepo.watchers_count}
- README Preview:
${githubData.bestRepoReadme || 'No README content available'}
` : '';

  // Step 2.4: Summarize language usage percentages
  const languagesSummary = githubData.languages
    .map(l => `- ${l.language}: ${l.percentage}%`)
    .join('\n');

  // Step 2.5: Summarize recent GitHub commits/events activity
  const activitiesSummary = githubData.recentActivity
    .map(a => `- [${new Date(a.createdAt).toLocaleDateString()}] ${a.description}`)
    .join('\n');

  // Step 2.6: Construct the prompt for the recruiter persona
  const prompt = `
You are a highly experienced elite technical recruiter and AI career coach. Analyze the following GitHub developer profile data and generate a JSON response representing the developer's profile analysis.

GITHUB DEVELOPER PROFILE:
- Username: ${githubData.profile.login}
- Name: ${githubData.profile.name || 'N/A'}
- Bio: ${githubData.profile.bio || 'No bio provided'}
- Followers: ${githubData.profile.followers} | Following: ${githubData.profile.following}
- Location: ${githubData.profile.location || 'Unknown'}
- Account Created: ${new Date(githubData.profile.createdAt).toLocaleDateString()}
- Total Repos: ${githubData.profile.publicReposCount}
- Total Stars Earned: ${githubData.totalStars}

MOST USED LANGUAGES:
${languagesSummary}

REPOS SHOWCASE:
${reposSummary}

${bestRepoDetails}

RECENT EVENTS/ACTIVITY:
${activitiesSummary}

Instructions:
1. Provide an overall summary of the developer's profile. Write in an insightful, motivating, yet realistic Recruiter tone.
2. List exactly 3 technical or workflow strengths based on their repository history and language stats.
3. List exactly 3 areas of improvement based on their repository setup, lack of descriptions, stargazers, activity distribution, or tech stack breadth/depth.
4. For the selected BEST PROJECT (which is "${bestRepo?.name || 'N/A'}"), analyze it thoroughly using its metadata and README preview to answer the following questions:
   - "isPersonalOrCollaborative": Is the project personal or collaborative? (e.g. explain based on contributors or project scope)
   - "languagesUsed": List the languages used and how many there are.
   - "isProductionReady": Is it production ready? (Evaluate README, code organization, issues, stars, config files)
   - "problemSolved": What specific problem does it solve?
   - "whyBest": Explain why the scoring algorithm rated it as the best project (Score: ${bestRepo?.score || 0}).
5. Provide a realistic career path suggestion (e.g. Frontend Engineer, DevOps Engineer, Full Stack Developer, Systems Programmer, AI/ML Specialist) with a short explanation.
6. Provide a powerful, inspiring, and unique motivational quote/message tailored to this developer.

The output MUST be valid JSON matching the following schema. Return ONLY raw JSON. Do not include markdown wraps like \`\`\`json.

SCHEMA:
{
  "summary": "string",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "bestProject": {
    "name": "string",
    "score": number,
    "isPersonalOrCollaborative": "string",
    "languagesUsed": "string",
    "isProductionReady": "string",
    "problemSolved": "string",
    "whyBest": "string"
  },
  "careerSuggestion": "string",
  "motivation": "string"
}
`;

  try {
    // Step 2.7: Make the HTTP POST request to the Gemini API endpoint
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          // Tell the Gemini model to output strictly structured JSON
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} (${errBody})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API');
    }

    // Step 2.8: Parse the JSON string from the response
    const parsedResult: AIAnalysisResult = JSON.parse(text.trim());

    // Basic structure validation
    if (!parsedResult.summary || !Array.isArray(parsedResult.strengths) || !Array.isArray(parsedResult.improvements)) {
      throw new Error('Invalid JSON format returned from Gemini');
    }

    return parsedResult;
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    throw new Error(`AI Analysis failed: ${error.message || error}`);
  }
}

/**
 * Recommends 3 specific career job roles using Gemini AI based on developer profile and repositories.
 * 
 * @param githubData The unified data fetched from GitHub API
 * @param apiKey Google Gemini API Key
 * @returns Array of exactly 3 JobRecommendation objects
 */
export async function recommendJobsWithGemini(
  githubData: GitHubData,
  apiKey: string
): Promise<JobRecommendation[]> {
  // Validate that the Gemini API Key is present
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is missing or empty. Please check your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  // Step 3.1: Sort repositories to showcase the best original works first
  const sortedRepos = [...githubData.repos].sort((a, b) => {
    if (a.isFork !== b.isFork) {
      return a.isFork ? 1 : -1;
    }
    return b.stars - a.stars;
  });
  
  const reposSummary = sortedRepos
    .map(r => `- ${r.name} (${r.isFork ? 'FORK' : 'ORIGINAL'}): ${r.description || 'No description'} (Stars: ${r.stars}, Forks: ${r.forks}, Language: ${r.language || 'N/A'})`)
    .slice(0, 30)
    .join('\n');

  // Step 3.2: Language percentages summary
  const languagesSummary = githubData.languages
    .map(l => `- ${l.language}: ${l.percentage}%`)
    .join('\n');

  // Step 3.3: Activity history summary
  const activitiesSummary = githubData.recentActivity
    .map(a => `- [${new Date(a.createdAt).toLocaleDateString()}] ${a.description}`)
    .join('\n');

  // Step 3.4: Construct the prompt for career matchmaking
  const prompt = `
You are a highly experienced elite technical recruiter and AI career coach. Analyze the following GitHub developer profile data and generate exactly 3 highly suitable, premium job recommendations tailored specifically to their demonstrated skills, technology stack, project complexity, and contribution history.

GITHUB DEVELOPER PROFILE:
- Username: ${githubData.profile.login}
- Name: ${githubData.profile.name || 'N/A'}
- Bio: ${githubData.profile.bio || 'No bio provided'}
- Followers: ${githubData.profile.followers} | Following: ${githubData.profile.following}
- Location: ${githubData.profile.location || 'Unknown'}
- Account Created: ${new Date(githubData.profile.createdAt).toLocaleDateString()}
- Total Repos: ${githubData.profile.publicReposCount}
- Total Stars Earned: ${githubData.totalStars}

MOST USED LANGUAGES:
${languagesSummary}

REPOS SHOWCASE:
${reposSummary}

RECENT EVENTS/ACTIVITY:
${activitiesSummary}

Instructions:
Provide a list of exactly 3 highly relevant, specific job recommendations based on their profile. Each recommendation must include:
1. "role": A specific job title (e.g., Senior Frontend Engineer, AI/ML Platform Engineer, Systems Programmer, DevOps Engineer, Full Stack Developer)
2. "companyType": The ideal type of company or industry environment for this role (e.g., "Early-stage AI Startup", "FinTech Enterprise", "Big Tech Dev Tools Team", "Open Source Software Foundation")
3. "matchPercentage": A realistic matching score (integer between 50 and 100) based on their tech stack, repository count, star count, and activity distribution.
4. "whyYouMatch": A detailed, professional explanation of why their GitHub profile makes them a strong fit for this specific job, referencing their projects, language usage, or star count.
5. "keySkills": A list of exactly 3 to 5 key technical skills required for this job that they have demonstrated proficiency in.

The output MUST be valid JSON matching the following schema. Return ONLY raw JSON. Do not include markdown wraps like \`\`\`json.

SCHEMA:
{
  "jobRecommendations": [
    {
      "role": "string",
      "companyType": "string",
      "matchPercentage": number,
      "whyYouMatch": "string",
      "keySkills": ["string", "string", "string"]
    }
  ]
}
`;

  try {
    // Step 3.5: Execute the fetch call
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} (${errBody})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsedResult = JSON.parse(text.trim());

    if (!parsedResult.jobRecommendations || !Array.isArray(parsedResult.jobRecommendations)) {
      throw new Error('Invalid JSON format returned from Gemini: missing jobRecommendations array');
    }

    return parsedResult.jobRecommendations;
  } catch (error: any) {
    console.error('Gemini API job recommendation call failed:', error);
    throw new Error(`Job recommendation failed: ${error.message || error}`);
  }
}

