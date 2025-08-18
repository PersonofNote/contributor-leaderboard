#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { generateLeaderboard } from "../index.js";

const program = new Command();

program
  .name("contrib")
  .description("CLI to generate contributor leaderboards")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate a leaderboard snippet for the current repo")
  .option("-r, --repo <repo>", "GitHub repo in owner/name format")
  .option("-t, --token <token>", "GitHub personal access token (optional)")
  .action(async (opts) => {
    try {
      const snippet = await generateLeaderboard(opts);
      console.log(
        chalk.green("\n✅ Leaderboard generated! Add this to your README:\n")
      );
      console.log(snippet);
    } catch (err) {
      console.error(chalk.red("❌ Error:"), err.message);
    }
  });

program.parse();
