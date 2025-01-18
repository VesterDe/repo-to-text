#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateTextDump, watchRepository } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

function printHelp() {
  console.log(`
repototext v${packageJson.version}

Dump repository file contents into a single annotated text file

Options:
  -c, --config <path>   Path to config file
  -o, --output <path>   Output file path
  -w, --watch          Watch for file changes and update output file
  -t, --no-tree       Disable directory tree structure at the top of the output (enabled by default)
  -v, --version        Show version number
  -h, --help           Show this help message
`);
}

function parseArgs(args: string[]) {
  const options: { config?: string; output?: string; watch?: boolean; includeTree?: boolean } = {
    includeTree: true
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-c':
      case '--config':
        options.config = nextArg;
        i++;
        break;
      case '-o':
      case '--output':
        options.output = nextArg;
        i++;
        break;
      case '-w':
      case '--watch':
        options.watch = true;
        break;
      case '-t':
      case '--no-tree':
        options.includeTree = false;
        break;
      case '-v':
      case '--version':
        console.log(packageJson.version);
        process.exit(0);
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));

  if (options.watch) {
    console.log('Watching repository for changes...');
    console.log('Press Ctrl+C to stop');
    await watchRepository(options);
  } else {
    const outputPath = await generateTextDump(options);
    console.log(`✨ Repository contents have been dumped to ${outputPath}`);
  }
} catch (error) {
  console.error('Error:', (error as Error).message);
  process.exit(1);
} 