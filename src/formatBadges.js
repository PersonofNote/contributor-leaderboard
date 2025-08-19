import { fetchAvatarBase64 } from "./fetch.js";
import { defaultBadges } from "./badges.js";

export function formatMarkdown(contributors) {
  return contributors.map(c => {
    const badges = c.badges.map(b => `\`${b.label}\``).join(" ");
    return `- [![${c.login} avatar](${c.avatarUrl}?s=40)](https://github.com/${c.login}) [@${c.login}](https://github.com/${c.login}) — ${c.commits} commits ${badges}`;
  }).join("\n");
}

/*
export function formatSVG(contributors) {
    const rowHeight = 50;
    const width = 600;
    const height = contributors.length * rowHeight + 40;
  
    const rows = contributors.map((c, i) => {
      const y = 40 + i * rowHeight;
      const badgesSvg = c.badges.map((b, idx) => {
        const bx = 320 + idx * 100;
        return `
          <rect x="${bx}" y="${y-15}" rx="6" ry="6" width="90" height="22" fill="${b.color}"/>
          <text x="${bx+45}" y="${y}" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${b.label}</text>
        `;
      }).join("");
  
      return `
        <a href="https://github.com/${c.login}">
          <image href="${c.avatarUrl}" x="10" y="${y-20}" width="40" height="40" clip-path="circle(20px at center)" />
          <text x="60" y="${y}" font-size="14" fill="black">@${c.login}</text>
          <text x="200" y="${y}" font-size="14" fill="gray">${c.commits} commits</text>
          ${badgesSvg}
        </a>
      `;
    }).join("");
  
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="sans-serif">
      ${rows}
    </svg>`;
  }
*/

export async function formatSVG(contributors, layout = "vertical") {
    const rowHeight = 50;
    const colWidth = 180;
    const width = 600;
    const svgLines = [];
    let height;
  
    // Pre-fetch all avatars as Base64
    const avatars = await Promise.all(
      contributors.map(c => fetchAvatarBase64(c.login))
    );
  
    if (layout === "vertical") {
      height = rowHeight * contributors.length + 40;
      contributors.forEach((c, i) => {
        const y = 40 + i * rowHeight;
        const avatar = avatars[i];
        const badges = defaultBadges(c, i + 1);
  
        let badgeSVG = "";
        badges.forEach((b, j) => {
          const bx = 320 + j * 110;
          badgeSVG += `
            <rect x="${bx}" y="${y - 15}" rx="6" ry="6" width="100" height="22" fill="${b.color}" />
            <text x="${bx + 50}" y="${y}" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${b.label}</text>
          `;
        });
  
        svgLines.push(`
          <g>
            <a href="https://github.com/${c.login}">
              <image href="${avatar}" x="10" y="${y - 20}" width="40" height="40" clip-path="circle(20)" />
              <text x="60" y="${y}" font-size="14" font-family="sans-serif" fill="black">@${c.login} — ${c.commits} commits</text>
              ${badgeSVG}
            </a>
          </g>
        `);
      });
    } else { // horizontal layout
      height = rowHeight + 40;
      contributors.forEach((c, i) => {
        const x = 20 + i * colWidth;
        const y = 40;
        const avatar = avatars[i];
        const badges = defaultBadges(c, i + 1);
  
        let badgeSVG = "";
        badges.forEach((b, j) => {
          const by = y + 30 + j * 25;
          badgeSVG += `
            <rect x="${x}" y="${by}" rx="6" ry="6" width="100" height="22" fill="${b.color}" />
            <text x="${x + 50}" y="${by + 11}" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${b.label}</text>
          `;
        });
  
        svgLines.push(`
          <g>
            <a href="https://github.com/${c.login}">
              <image href="${avatar}" x="${x}" y="${y - 20}" width="40" height="40" clip-path="circle(20)" />
              <text x="${x}" y="${y + 30}" font-size="14" font-family="sans-serif" fill="black">@${c.login} — ${c.commits} commits</text>
              ${badgeSVG}
            </a>
          </g>
        `);
      });
    }
  
    return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <text x="20" y="24" font-size="16" font-weight="700">🏆 Top Contributors</text>
    ${svgLines.join("")}
  </svg>
  `;
  }
  


  
  