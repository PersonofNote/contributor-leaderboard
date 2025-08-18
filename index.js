import fetch from "node-fetch";
import ora from "ora";
import chalk from "chalk";

export async function generateLeaderboard({ repo, token }) {
  if (!repo) throw new Error("Must specify a repo with --repo owner/name");

  const spinner = ora(`Fetching contributors for ${repo}...`).start();

  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${repo}/contributors?per_page=3`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    spinner.fail();
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  spinner.succeed();

  const top3 = data.slice(0, 3);

  const snippet = [
    "### Top Contributors",
    "",
    ...top3.map(
      (c) =>
        `- [@${c.login}](https://github.com/${c.login}) — ${c.contributions} commits`
    ),
    "",
  ].join("\n");

  return snippet;
}
