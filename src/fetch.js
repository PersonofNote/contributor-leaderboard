import fetch from "node-fetch";

export async function fetchContributors(repo, token, limit = 3) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${repo}/contributors?per_page=10`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.slice(0,limit).map(u => ({
    login: u.login,
    avatarUrl: u.avatar_url,
    commits: u.contributions
  }));
}