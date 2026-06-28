/**
 * GitHub API utility module for the GitAnalyze application.
 * 
 * WORKFLOW:
 * 1. Fetches public profile metadata of a specified user.
 * 2. Fetches up to 100 repositories, filtering out forks.
 * 3. Rates repositories using a scoring algorithm (`scoreProject`) based on stars, forks, README existence, description depth, recent updates, and languages.
 * 4. For the highest scoring original repo, fetches full README details and breakdown of languages.
 * 5. Aggregates overall language distribution percentages.
 * 6. Fetches recent user activity/events (pushes, creates, forks, stars).
 * 7. Combines and returns everything to the App component.
 */

/**
 * Interface representing a user's GitHub profile metadata.
 */
export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  followers: number;
  following: number;
  location: string | null;
  publicReposCount: number;
  createdAt: string;
  htmlUrl: string;
}

/**
 * Interface representing a GitHub repository with custom scoring attributes.
 */
export interface GitHubRepo {
  name: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  isFork: boolean;
  size: number;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  has_readme: boolean;
  updated_at: string;
  topics: string[];
  watchers_count: number;
  score?: number; // Calculated dynamically by scoreProject
}

/**
 * Interface representing the percentage distribution of a language across repositories.
 */
export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
}

/**
 * Interface representing a recent contribution activity event.
 */
export interface GitHubActivity {
  type: string;
  repo: string;
  createdAt: string;
  description: string;
}

/**
 * Aggregated GitHub dataset ready for AI analysis.
 */
export interface GitHubData {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  languages: LanguageStat[];
  totalStars: number;
  recentActivity: GitHubActivity[];
  bestRepoLanguages?: string[];
  bestRepoReadme?: string | null;
}

/**
 * Prepares HTTP headers for the GitHub REST API, injecting the authorization token if configured in the environment.
 */
const getHeaders = () => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token && token.trim() !== '') {
    headers['Authorization'] = `token ${token.trim()}`;
  }
  return headers;
};

/**
 * Fetches all necessary developer profile data, repository statistics, and activities.
 * 
 * @param username The GitHub handle to look up
 * @returns Fully populated GitHubData structure
 */
export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const headers = getHeaders();
  const cleanUsername = username.trim();

  // Step 1: Fetch user profile metadata
  const profileRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
  if (profileRes.status === 404) {
    throw new Error('User not found');
  }
  if (!profileRes.ok) {
    const errText = await profileRes.text();
    // Handle API rate limits gracefully and suggest token setup
    if (profileRes.status === 403 && errText.includes('rate limit')) {
      throw new Error('GitHub API rate limit exceeded. Please add a VITE_GITHUB_TOKEN to your .env file.');
    }
    throw new Error(`Failed to fetch GitHub profile: ${profileRes.statusText}`);
  }
  const rawProfile = await profileRes.json();

  const profile: GitHubProfile = {
    login: rawProfile.login,
    name: rawProfile.name,
    bio: rawProfile.bio,
    avatarUrl: rawProfile.avatar_url,
    followers: rawProfile.followers,
    following: rawProfile.following,
    location: rawProfile.location,
    publicReposCount: rawProfile.public_repos,
    createdAt: rawProfile.created_at,
    htmlUrl: rawProfile.html_url,
  };

  // Step 2: Fetch up to 100 recent repositories
  const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`, { headers });
  if (!reposRes.ok) {
    throw new Error('Failed to fetch repositories');
  }
  const rawRepos = await reposRes.ok ? await reposRes.json() : [];

  const repos: GitHubRepo[] = rawRepos.map((repo: any) => ({
    name: repo.name,
    htmlUrl: repo.html_url,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    isFork: repo.fork,
    size: repo.size || 0,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    private: repo.private,
    has_readme: false,
    updated_at: repo.updated_at,
    topics: repo.topics || [],
    watchers_count: repo.watchers_count,
  }));

  // Step 3: Run the scoring algorithm on all original (non-fork) repositories
  const originalRepos = repos.filter(r => !r.isFork);

  originalRepos.forEach(r => {
    r.score = scoreProject(r);
  });

  // Sort by initial score descending to find the top candidates
  originalRepos.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Step 4: Perform detailed validation (including README presence) for the top 8 candidates
  const topReposToCheck = originalRepos.slice(0, 8);
  await Promise.all(
    topReposToCheck.map(async (repo) => {
      const currentDesc = (repo.description || '').trim();
      // If the description is empty/suspiciously short, fetch the README summary to populate it
      const needsReadmeFetch = currentDesc === '' || currentDesc === '...' || currentDesc.toLowerCase() === 'test' || currentDesc.length < 12;
      
      if (needsReadmeFetch) {
        const desc = await fetchReadmeDescription(cleanUsername, repo.name, headers);
        if (desc) {
          repo.has_readme = true;
          repo.description = desc;
        } else {
          repo.has_readme = false;
        }
      } else {
        repo.has_readme = await checkReadmeExists(cleanUsername, repo.name, headers);
      }
      // Re-evaluate score with the README metadata included
      repo.score = scoreProject(repo);
    })
  );

  // Re-sort original repos by final score
  originalRepos.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Step 5: For the single BEST repo, fetch detailed languages and README content for Gemini AI context
  const bestRepo = originalRepos[0];
  let bestRepoLanguages: string[] = [];
  let bestRepoReadme: string | null = null;

  if (bestRepo) {
    // 5.1: Fetch language details
    try {
      const langRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${bestRepo.name}/languages`, { headers });
      if (langRes.ok) {
        const langData = await langRes.json();
        bestRepoLanguages = Object.keys(langData);
      }
    } catch (err) {
      console.warn(`Could not fetch languages for ${bestRepo.name}`, err);
    }

    // 5.2: Fetch raw README contents and sanitize markdown syntax to keep token counts small
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${bestRepo.name}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          // Decode Base64 content
          const rawContent = atob(readmeData.content.replace(/\s/g, ''));
          // Strip out markdown headers, images, badges, and extra whitespace
          let cleanText = rawContent
            .replace(/#+\s+.+/g, '')
            .replace(/\[!\[.+?\]\(.+?\)\]\(.+?\)/g, '')
            .replace(/!\[.+?\]\(.+?\)/g, '')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .replace(/[*_`#-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          bestRepoReadme = cleanText.substring(0, 1500); // Limit to 1500 chars to fit prompt size
        }
      }
    } catch (err) {
      console.warn(`Could not fetch README for ${bestRepo.name}`, err);
    }
  }

  // Step 6: Compute total stars and compile overall language usage statistics
  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);

  const languageCounts: Record<string, number> = {};
  let validLangCount = 0;
  repos.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      validLangCount++;
    }
  });

  const languages: LanguageStat[] = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: validLangCount > 0 ? Math.round((count / validLangCount) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Step 7: Fetch the last 15 contribution activities (commits, forks, stars, creates)
  let recentActivity: GitHubActivity[] = [];
  try {
    const eventsRes = await fetch(`https://api.github.com/users/${cleanUsername}/events?per_page=15`, { headers });
    if (eventsRes.ok) {
      const rawEvents = await eventsRes.json();
      recentActivity = rawEvents
        .map((event: any) => {
          let description = '';
          const type = event.type;
          const repo = event.repo.name;

          switch (type) {
            case 'PushEvent':
              const commitCount = event.payload.commits?.length || 0;
              description = `Pushed ${commitCount} commit(s) to ${repo}`;
              break;
            case 'CreateEvent':
              description = `Created ${event.payload.ref_type || 'repository'} in ${repo}`;
              break;
            case 'PullRequestEvent':
              description = `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} pull request in ${repo}`;
              break;
            case 'IssuesEvent':
              description = `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} issue in ${repo}`;
              break;
            case 'WatchEvent':
              description = `Starred repository ${repo}`;
              break;
            case 'ForkEvent':
              description = `Forked repository ${repo}`;
              break;
            default:
              description = `Interacted with ${repo} (${type.replace('Event', '')})`;
          }

          return {
            type,
            repo,
            createdAt: event.created_at,
            description,
          };
        })
        .filter((act: any) => act.description !== '')
        .slice(0, 8); // Keep the top 8 relevant events
    }
  } catch (err) {
    console.warn('Could not fetch user events', err);
  }

  // Return the aggregated dataset
  return {
    profile,
    repos,
    languages,
    totalStars,
    recentActivity,
    bestRepoLanguages,
    bestRepoReadme,
  };
}

/**
 * Checks whether a repository contains a README file using a light HEAD request.
 */
async function checkReadmeExists(owner: string, repo: string, headers: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { method: 'HEAD', headers });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Algorithmic Scoring function to evaluate repository complexity and quality.
 * 
 * SCORING METRICS:
 * - Star count: 3 pts per star
 * - Fork count: 2 pts per fork
 * - Public visibility: 5 pts
 * - README existence: 10 pts
 * - Primary language set: 5 pts
 * - Recent updates: up to 10 pts depending on days elapsed
 * - Description set: 5 pts
 * - Topics/Tags: 2 pts per tag
 * - Watchers count: 1 pt per watcher
 */
/**
 * Detailed breakdown of a repository's quality score components.
 */
export interface ScoreBreakdown {
  starsValue: number;
  starsPoints: number;
  forksValue: number;
  forksPoints: number;
  visibilityValue: string;
  visibilityPoints: number;
  readmeValue: boolean;
  readmePoints: number;
  languageValue: string | null;
  languagePoints: number;
  recentUpdateDays: number;
  recentUpdatePoints: number;
  descriptionValue: string | null;
  descriptionPoints: number;
  topicsCount: number;
  topicsPoints: number;
  watchersValue: number;
  watchersPoints: number;
  totalScore: number;
}

/**
 * Performs detailed calculation of quality score metrics for a given repository.
 */
export function calculateScoreBreakdown(repo: GitHubRepo): ScoreBreakdown {
  const starsValue = repo.stargazers_count || 0;
  const starsPoints = starsValue * 3;

  const forksValue = repo.forks_count || 0;
  const forksPoints = forksValue * 2;

  const visibilityValue = repo.private ? 'Private' : 'Public';
  const visibilityPoints = repo.private ? 0 : 5;

  const readmeValue = repo.has_readme;
  const readmePoints = readmeValue ? 10 : 0;

  const languageValue = repo.language;
  const languagePoints = languageValue ? 5 : 0;

  const lastUpdate = new Date(repo.updated_at);
  const daysSince = Math.max(0, (Date.now() - lastUpdate.getTime()) / 86400000);
  const recentUpdateDays = Math.round(daysSince);
  const recentUpdatePoints = daysSince < 30 ? 10 :    // Last month
                             daysSince < 90 ? 5 :     // Last 3 months
                             daysSince < 180 ? 2 : 0; // Last 6 months

  const descriptionValue = repo.description;
  const descriptionPoints = descriptionValue ? 5 : 0;

  const topicsCount = repo.topics?.length || 0;
  const topicsPoints = topicsCount * 2;

  const watchersValue = repo.watchers_count || 0;
  const watchersPoints = watchersValue * 1;

  const totalScore = starsPoints + forksPoints + visibilityPoints + readmePoints +
                     languagePoints + recentUpdatePoints + descriptionPoints +
                     topicsPoints + watchersPoints;

  return {
    starsValue,
    starsPoints,
    forksValue,
    forksPoints,
    visibilityValue,
    visibilityPoints,
    readmeValue,
    readmePoints,
    languageValue,
    languagePoints,
    recentUpdateDays,
    recentUpdatePoints,
    descriptionValue,
    descriptionPoints,
    topicsCount,
    topicsPoints,
    watchersValue,
    watchersPoints,
    totalScore,
  };
}

export function scoreProject(repo: GitHubRepo): number {
  return calculateScoreBreakdown(repo).totalScore;
}

/**
 * Fetches and cleans README summary description.
 */
async function fetchReadmeDescription(owner: string, repo: string, headers: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    
    // Decode Base64
    const rawContent = atob(data.content.replace(/\s/g, ''));
    
    // Clean markdown elements to construct a clean description snippet
    let cleanText = rawContent
      .replace(/#+\s+.+/g, '') // remove headers
      .replace(/\[!\[.+?\]\(.+?\)\]\(.+?\)/g, '') // remove badge images
      .replace(/!\[.+?\]\(.+?\)/g, '') // remove images
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // replace links with link text
      .replace(/[*_`#-]/g, ' ') // replace markdown symbols with spaces
      .replace(/\s+/g, ' ') // collapse multiple whitespaces
      .trim();
      
    if (cleanText.length > 250) {
      cleanText = cleanText.substring(0, 250) + '...';
    }
    return cleanText || null;
  } catch (err) {
    console.warn(`Could not fetch README for ${repo}`, err);
    return null;
  }
}

