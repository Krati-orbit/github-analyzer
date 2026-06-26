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
  score?: number;
}

export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
}

export interface GitHubActivity {
  type: string;
  repo: string;
  createdAt: string;
  description: string;
}

export interface GitHubData {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  languages: LanguageStat[];
  totalStars: number;
  recentActivity: GitHubActivity[];
  bestRepoLanguages?: string[];
  bestRepoReadme?: string | null;
}

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

export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const headers = getHeaders();
  const cleanUsername = username.trim();

  // 1. Fetch Profile
  const profileRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
  if (profileRes.status === 404) {
    throw new Error('User not found');
  }
  if (!profileRes.ok) {
    const errText = await profileRes.text();
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

  // 2. Fetch Repositories (up to 100)
  const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`, { headers });
  if (!reposRes.ok) {
    throw new Error('Failed to fetch repositories');
  }
  const rawRepos = await reposRes.json();

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

  // Identify original repos and score them initially (has_readme = false)
  const originalRepos = repos.filter(r => !r.isFork);

  originalRepos.forEach(r => {
    r.score = scoreProject(r);
  });

  // Sort by initial score descending
  originalRepos.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Verify README for top 8 original repos using HEAD check or full desc fetch if needed
  const topReposToCheck = originalRepos.slice(0, 8);
  await Promise.all(
    topReposToCheck.map(async (repo) => {
      const currentDesc = (repo.description || '').trim();
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
      repo.score = scoreProject(repo);
    })
  );

  // Re-sort originalRepos by final score
  originalRepos.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Select best repo and fetch extra details
  const bestRepo = originalRepos[0];
  let bestRepoLanguages: string[] = [];
  let bestRepoReadme: string | null = null;

  if (bestRepo) {
    try {
      const langRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${bestRepo.name}/languages`, { headers });
      if (langRes.ok) {
        const langData = await langRes.json();
        bestRepoLanguages = Object.keys(langData);
      }
    } catch (err) {
      console.warn(`Could not fetch languages for ${bestRepo.name}`, err);
    }

    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${bestRepo.name}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          const rawContent = atob(readmeData.content.replace(/\s/g, ''));
          let cleanText = rawContent
            .replace(/#+\s+.+/g, '')
            .replace(/\[!\[.+?\]\(.+?\)\]\(.+?\)/g, '')
            .replace(/!\[.+?\]\(.+?\)/g, '')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .replace(/[*_`#\-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          bestRepoReadme = cleanText.substring(0, 1500);
        }
      }
    } catch (err) {
      console.warn(`Could not fetch README for ${bestRepo.name}`, err);
    }
  }

  // Calculate stats
  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);

  // Calculate languages distribution
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

  // 3. Fetch Recent Activities (Events API)
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
        .slice(0, 8); // Keep top 8
    }
  } catch (err) {
    // Suppress events fetch error to avoid breaking profile loading
    console.warn('Could not fetch user events', err);
  }

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

async function checkReadmeExists(owner: string, repo: string, headers: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { method: 'HEAD', headers });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export function scoreProject(repo: GitHubRepo): number {
  let score = 0;

  // Stars & Forks
  score += (repo.stargazers_count || 0) * 3;
  score += (repo.forks_count || 0) * 2;

  // Public ya Private
  // (GitHub API sirf public deta hai)
  score += repo.private ? 0 : 5;

  // README hai ya nahi
  score += repo.has_readme ? 10 : 0;

  // Kitni languages use hui
  score += repo.language ? 5 : 0;

  // Recent activity
  const lastUpdate = new Date(repo.updated_at);
  const daysSince = (Date.now() - lastUpdate.getTime()) / 86400000;
  score += daysSince < 30 ? 10 :    // Last month
           daysSince < 90 ? 5 :     // Last 3 months
           daysSince < 180 ? 2 : 0; // Last 6 months

  // Description hai ya nahi
  score += repo.description ? 5 : 0;

  // Topics/tags hain ya nahi
  score += (repo.topics?.length || 0) * 2;

  // Watchers
  score += (repo.watchers_count || 0) * 1;

  return score;
}

async function fetchReadmeDescription(owner: string, repo: string, headers: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    
    // Base64 decode using atob
    const rawContent = atob(data.content.replace(/\s/g, ''));
    
    // Clean up markdown
    let cleanText = rawContent
      .replace(/#+\s+.+/g, '') // remove headers
      .replace(/\[!\[.+?\]\(.+?\)\]\(.+?\)/g, '') // remove badge images
      .replace(/!\[.+?\]\(.+?\)/g, '') // remove images
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // replace links with link text
      .replace(/[*_`#\-]/g, ' ') // replace markdown symbols with spaces
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
