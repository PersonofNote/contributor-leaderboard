#!/usr/bin/env node
import { Command } from "commander";
import { fetchContributors } from "../src/fetch.js";
import { formatMarkdown, formatSVG} from "../src/formatBadges.js";
import { defaultBadgeGenerator } from "../src/badges.js";
import fs from "fs";

const program = new Command();

program
  .name("contrib")
  .description("Generate GitHub contributor leaderboard")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate a leaderboard for a repo")
  .requiredOption("-r, --repo <repo>", "GitHub repo in owner/name format")
  .option("-l, --limit <number>", "Number of contributors to show", "3")
  .option("-or, --orientation <name>", "Horizontal or vertical", "horizontal")
  .option("-t, --token <token>", "GitHub token for higher rate limits")
  .option("-f, --format <format>", "output format: markdown or svg", "svg")
  .option("-o, --out <file>", "write output to file instead of stdout")
  .option("--badge-gen <path>", "optional JS file exporting a badge generator function")
  .action(async (opts) => {
    try {
      const contributors = await fetchContributors(opts.repo, opts.token, opts.limit);

      // Load custom badge generator if provided
      let badgeGen = defaultBadgeGenerator;
      if (opts.badgeGen) {
        badgeGen = (await import(opts.badgeGen)).default;
      }

      // Attach badges
      contributors.forEach(c => c.badges = badgeGen(c));

      let output;
      if (opts.format === "svg") {
        output = formatSVG(contributors);
      } else {
        output = formatMarkdown(contributors);
      }

      const defaultOutFile = opts.format === "svg" ? "leaderboard.svg" : undefined;
      const outFile = opts.out || defaultOutFile;

      if (outFile) {
        fs.writeFileSync(outFile, output);
        console.log(`Output written to ${outFile}`);
      } else {
        console.log(output);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  });

program.parse();
