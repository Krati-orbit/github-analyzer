import type { GitHubData } from './githubApi';

export interface JobRecommendation {
  role: string;
  companyType: string;
  matchPercentage: number;
  whyYouMatch: string;
  keySkills: string[];
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  bestProject: {
    name: string;
    score: number;
    isPersonalOrCollaborative: string;
    languagesUsed: string;
    isProductionReady: string;
    problemSolved: string;
    whyBest: string;
  };
  careerSuggestion: string;
  motivation: string;
}

export async function analyzeProfileWithGemini(
  githubData: GitHubData,
  apiKey: string
): Promise<AIAnalysisResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is missing or empty. Please check your .env file.');
  }

  // Model selection: we'll use gemini-3.1-flash-lite to avoid quota limits
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  // Find the repo with the highest score (or sort repos by score)
  const sortedReposByScore = [...githubData.repos]
    .filter(r => !r.isFork)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const bestRepo = sortedReposByScore[0] || null;

  // Prepare input summaries for the LLM. Prioritize ORIGINAL repositories, then sort by stars descending.
  const sortedRepos = [...githubData.repos].sort((a, b) => {
    if (a.isFork !== b.isFork) {
      return a.isFork ? 1 : -1;
    }
    return b.stars - a.stars;
  });
  const reposSummary = sortedRepos
    .map(r => `- ${r.name} (${r.isFork ? 'FORK' : 'ORIGINAL'}): ${r.description || 'No description'} (Stars: ${r.stars}, Forks: ${r.forks}, Language: ${r.language || 'N/A'}, Algorithmic Score: ${r.score || 0})`)
    .slice(0, 30) // Limit to top 30 repos to keep request size reasonable
    .join('\n');

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

  const languagesSummary = githubData.languages
    .map(l => `- ${l.language}: ${l.percentage}%`)
    .join('\n');

  const activitiesSummary = githubData.recentActivity
    .map(a => `- [${new Date(a.createdAt).toLocaleDateString()}] ${a.description}`)
    .join('\n');

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

    const parsedResult: AIAnalysisResult = JSON.parse(text.trim());

    // Validate fields exist
    if (!parsedResult.summary || !Array.isArray(parsedResult.strengths) || !Array.isArray(parsedResult.improvements)) {
      throw new Error('Invalid JSON format returned from Gemini');
    }

    return parsedResult;
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    throw new Error(`AI Analysis failed: ${error.message || error}`);
  }
}

export async function recommendJobsWithGemini(
  githubData: GitHubData,
  apiKey: string
): Promise<JobRecommendation[]> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is missing or empty. Please check your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

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

  const languagesSummary = githubData.languages
    .map(l => `- ${l.language}: ${l.percentage}%`)
    .join('\n');

  const activitiesSummary = githubData.recentActivity
    .map(a => `- [${new Date(a.createdAt).toLocaleDateString()}] ${a.description}`)
    .join('\n');

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
