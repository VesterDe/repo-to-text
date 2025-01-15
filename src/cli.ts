#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { generateTextDump, watchRepository } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

program
  .version(packageJson.version)
  .description('Dump repository file contents into a single annotated text file')
  .option('-c, --config <path>', 'path to config file')
  .option('-o, --output <path>', 'output file path')
  .option('-w, --watch', 'watch for file changes and update output file')
  .parse(process.argv);

const options = program.opts();

try {
  if (options.watch) {
    console.log(chalk.blue('Watching repository for changes...'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
    await watchRepository(options);
  } else {
    const outputPath = await generateTextDump(options);
    console.log(chalk.green(`✨ Repository contents have been dumped to ${outputPath}`));
  }
} catch (error) {
  console.error(chalk.red('Error:'), (error as Error).message);
  process.exit(1);
} 