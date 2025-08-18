export function formatMarkdown(contributors) {
  return contributors.map(c => {
    const badges = c.badges.map(b => `\`${b.label}\``).join(" ");
    return `- [![${c.login} avatar](${c.avatarUrl}?s=40)](https://github.com/${c.login}) [@${c.login}](https://github.com/${c.login}) — ${c.commits} commits ${badges}`;
  }).join("\n");
}


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

  
  