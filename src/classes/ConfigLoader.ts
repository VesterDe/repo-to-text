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
    let config = { ...DEFAULT_CONFIG };
    
    if (configPath && this.fileHandler.exists(configPath)) {
      try {
        const configContent = this.fileHandler.readFile(configPath);
        const customConfig = JSON.parse(configContent);
        config = this.mergeConfig(config, customConfig);
      } catch (error) {
        console.warn(`Invalid config at ${configPath}, falling back to defaults: ${(error as Error).message}`);
      }
      return config;
    }

    const defaultConfigPath = join(process.cwd(), 'repo-to-text.json');
    if (this.fileHandler.exists(defaultConfigPath)) {
      try {
        const configContent = this.fileHandler.readFile(defaultConfigPath);
        const defaultFileConfig = JSON.parse(configContent);
        config = this.mergeConfig(config, defaultFileConfig);
      } catch (error) {
        console.warn(`Invalid default config at ${defaultConfigPath}, using built-in defaults: ${(error as Error).message}`);
      }
    }

    return config;
  }

  private mergeConfig(base: Config, override: Partial<Config>): Config {
    const merged = {
      ...base,
      ...override,
      include: override.include !== undefined ? override.include : base.include,
      exclude: [...base.exclude],
      output: { ...base.output, ...override.output },
      watch: { ...base.watch, ...override.watch }
    };

    if (override.exclude) {
      merged.exclude.push(...override.exclude);
    }

    return merged;
  }
} 