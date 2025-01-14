import { join } from 'path';
import type { Config } from '../types.js';
import { FileHandler } from './FileHandler.js';

export const DEFAULT_CONFIG: Config = {
  include: ['**/*'],
  exclude: [
    'node_modules/**',
    '.git/**',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
  ],
  output: {
    path: 'repo-contents.txt'
  },
  watch: {
    debounceMs: 300
  }
};

export class ConfigLoader {
  constructor(private fileHandler: FileHandler) {}

  loadConfig(configPath?: string): Config {
    // First try the provided config path
    if (configPath && this.fileHandler.exists(configPath)) {
      try {
        const configContent = this.fileHandler.readFile(configPath);
        console.log("configContent", configContent);
        return { ...DEFAULT_CONFIG, ...JSON.parse(configContent) };
      } catch (error) {
        throw new Error(`Failed to load config file: ${(error as Error).message}`);
      }
    }

    // Then try the default config file
    const defaultConfigPath = join(process.cwd(), 'repo-to-text.json');
    if (this.fileHandler.exists(defaultConfigPath)) {
      try {
        const configContent = this.fileHandler.readFile(defaultConfigPath);
        return { ...DEFAULT_CONFIG, ...JSON.parse(configContent) };
      } catch (error) {
        throw new Error(`Failed to load default config file: ${(error as Error).message}`);
      }
    }

    // Fall back to default config
    return DEFAULT_CONFIG;
  }
} 