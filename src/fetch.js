import fetch from "node-fetch";

export async function fetchContributors(repo, token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${repo}/contributors?per_page=10`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.map(u => ({
    login: u.login,
    avatarUrl: u.avatar_url,
    commits: u.contributions
  }));
}


// Default badge generator
export function defaultBadgeGenerator(contributor) {
    return [{ label: "Top Contributor", color: "#2ea44f" }];
  }
  