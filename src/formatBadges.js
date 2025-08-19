import { fetchAvatarBase64 } from "./fetch.js";
import { defaultBadges } from "./badges.js";

function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/[<>&"']/g, (char) => ({
      '<': '&lt;',
      '>': '&gt;', 
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    }[char]))
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 200); // Limit length to prevent DoS
}

function sanitizeNumber(num) {
  const parsed = parseInt(num, 10);
  if (isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return Math.min(parsed, 9000); // Cap at reasonable limit
}

export function formatMarkdown(contributors) {
  return contributors.map(c => {
    const badges = c.badges.map(b => `\`${b.label}\``).join(" ");
    return `- [![${c.login} avatar](${c.avatarUrl}?s=40)](https://github.com/${c.login}) [@${c.login}](https://github.com/${c.login}) — ${c.commits} commits ${badges}`;
  }).join("\n");
}

export async function formatSVG(contributors, options = "vertical") {
    // Handle both string and object parameters for backward compatibility
    const layout = typeof options === 'string' ? options : (options.layout || "vertical");
    const title = typeof options === 'object' ? (options.title || "🏆 Top Contributors") : "🏆 Top Contributors";
    const padding = 10;
    const rowHeight = 50;
    const headerHeight = 45;
    const svgLines = [];
    let contentWidth, contentHeight;
  
    // Pre-fetch all avatars as Base64
    const avatars = await Promise.all(
      contributors.map(c => fetchAvatarBase64(c.login))
    );
  
    if (layout === "vertical") {
      // Calculate actual content width needed
      const maxBadges = Math.max(...contributors.map(c => defaultBadges(c, 1).length));
      const badgeStartX = 220;
      const badgeWidth = 90;
      const badgeSpacing = 95;
      const actualContentWidth = badgeStartX + (maxBadges * badgeSpacing) - (badgeSpacing - badgeWidth);
      contentWidth = actualContentWidth;
      contentHeight = headerHeight + rowHeight * contributors.length;
      
      contributors.forEach((c, i) => {
        const y = headerHeight + padding + i * rowHeight;
        const avatar = avatars[i];
        const badges = defaultBadges(c, i + 1);
  
        let badgeSVG = "";
        badges.forEach((b, j) => {
          const bx = badgeStartX + j * badgeSpacing;
          badgeSVG += `
            <rect x="${bx}" y="${y - 8}" rx="6" ry="6" width="${badgeWidth}" height="22" fill="${sanitizeText(b.color)}" />
            <text x="${bx + badgeWidth/2}" y="${y + 3}" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${sanitizeText(b.label)}</text>
          `;
        });
  
        svgLines.push(`
          <g>
            <a href="https://github.com/${sanitizeText(c.login)}">
              <image href="${avatar}" x="${padding}" y="${y - 20}" width="40" height="40" clip-path="circle(20)" />
              <text x="${padding + 55}" y="${y}" font-size="14" font-family="sans-serif" fill="#333">@${sanitizeText(c.login)}</text>
              <text x="${padding + 55}" y="${y + 16}" font-size="12" font-family="sans-serif" fill="#666">${sanitizeNumber(c.commits)} commits</text>
              ${badgeSVG}
            </a>
          </g>
        `);
      });
    } else { // horizontal layout
      const contributorsPerRow = Math.min(contributors.length, 3);
      const rows = Math.ceil(contributors.length / contributorsPerRow);
      // Calculate actual width needed: avatar + text + badges
      const actualColWidth = 160; // Reduced from 170
      contentWidth = contributorsPerRow * actualColWidth;
      contentHeight = headerHeight + rows * (rowHeight + 60);
      
      contributors.forEach((c, i) => {
        const col = i % contributorsPerRow;
        const row = Math.floor(i / contributorsPerRow);
        const x = padding + col * actualColWidth;
        const y = headerHeight + padding + row * (rowHeight + 60);
        const avatar = avatars[i];
        const badges = defaultBadges(c, i + 1);
  
        let badgeSVG = "";
        badges.forEach((b, j) => {
          const by = y + 45 + j * 25;
          badgeSVG += `
            <rect x="${x}" y="${by}" rx="6" ry="6" width="90" height="20" fill="${sanitizeText(b.color)}" />
            <text x="${x + 45}" y="${by + 10}" font-size="11" fill="white" text-anchor="middle" dominant-baseline="middle">${sanitizeText(b.label)}</text>
          `;
        });
  
        svgLines.push(`
          <g>
            <a href="https://github.com/${sanitizeText(c.login)}">
              <image href="${avatar}" x="${x}" y="${y}" width="40" height="40" clip-path="circle(20)" />
              <text x="${x + 50}" y="${y + 15}" font-size="14" font-family="sans-serif" fill="#333">@${sanitizeText(c.login)}</text>
              <text x="${x + 50}" y="${y + 30}" font-size="12" font-family="sans-serif" fill="#666">${sanitizeNumber(c.commits)} commits</text>
              ${badgeSVG}
            </a>
          </g>
        `);
      });
    }

    const totalWidth = contentWidth + padding * 2;
    const totalHeight = contentHeight + padding;
  
    return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">
    <defs>
      <clipPath id="avatar-clip">
        <circle cx="20" cy="20" r="20"/>
      </clipPath>
    </defs>
    
    <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" rx="12" ry="12" fill="white" stroke="#e1e5e9" stroke-width="1"/>
    
    <text x="${padding}" y="${padding + 24}" font-size="18" font-weight="700" font-family="sans-serif" fill="#24292f">${sanitizeText(title)}</text>
    ${svgLines.join("")}
  </svg>
  `;
  }
  


  
  