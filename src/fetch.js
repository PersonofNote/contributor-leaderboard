import fetch from "node-fetch";

function validateRepoFormat(repo) {
  if (!repo || typeof repo !== 'string') {
    throw new Error('Repository must be a non-empty string');
  }
  
  // GitHub repo format: owner/repo
  if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repo)) {
    throw new Error('Repository must be in "owner/repo" format');
  }
  
  return repo;
}

export async function fetchContributors(repo, token, limit = 3) {
  const validRepo = validateRepoFormat(repo);
  const validLimit = Math.min(Math.max(parseInt(limit, 10) || 3, 1), 100); // Cap between 1-100
  
  const headers = {
    'User-Agent': 'github-leaderboard-generator/1.0.0',
    ...(token ? { Authorization: `token ${token}` } : {})
  };
  
  const url = `https://api.github.com/repos/${validRepo}/contributors?per_page=${Math.min(validLimit * 2, 100)}`;
  
  try {
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please provide a GitHub token with -t option.');
      }
      if (res.status === 404) {
        throw new Error(`Repository not found: ${validRepo}`);
      }
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    
    // Check rate limit headers
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining && parseInt(remaining, 10) < 10) {
      console.warn(`Warning: GitHub API rate limit low (${remaining} requests remaining)`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from GitHub API');
    }
    
    return data.slice(0, validLimit).map(u => {
      if (!u || typeof u !== 'object') {
        throw new Error('Invalid contributor data from GitHub API');
      }
      
      return {
        login: u.login || 'unknown',
        avatarUrl: u.avatar_url || '',
        commits: u.contributions || 0
      };
    });
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to GitHub API');
    }
    throw error;
  }
}


function validateUsername(username) {
  // GitHub username validation: 1-39 chars, alphanumeric + hyphens, no consecutive hyphens, no leading/trailing hyphens
  if (!username || typeof username !== 'string') {
    throw new Error('Username must be a non-empty string');
  }
  
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    throw new Error(`Invalid GitHub username: ${username}`);
  }
  
  return username;
}

function validateImageSize(size) {
  const validSizes = [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500];
  const numSize = parseInt(size, 10);
  
  if (!validSizes.includes(numSize)) {
    throw new Error(`Invalid image size: ${size}. Must be one of: ${validSizes.join(', ')}`);
  }
  
  return numSize;
}

export async function fetchAvatarBase64(username, size = 40) {
  const validUsername = validateUsername(username);
  const validSize = validateImageSize(size);
  
  const url = `https://github.com/${validUsername}.png?size=${validSize}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch avatar: ${res.status} ${res.statusText}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
    }
    
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error('Received empty image data');
    }
    
    return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
  } catch (error) {
    console.error(`Error fetching avatar for ${validUsername}:`, error.message);
    // Return a fallback data URI for a 1x1 transparent PNG
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}
