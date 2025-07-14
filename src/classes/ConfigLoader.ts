import { join } from 'path';
import type { Config } from '../types.js';
import { FileHandler } from './FileHandler.js';

export const DEFAULT_CONFIG: Config = {
  include: ['**/*'],
  exclude: [
    // Dependencies and build outputs
    'node_modules/**',
    'dist/**',
    'build/**',
    'out/**',
    'target/**',
    'bin/**',
    'lib/**',
    
    // Package manager files
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    
    // Version control
    '.git/**',
    '.svn/**',
    '.hg/**',
    
    // Cache and temporary files
    '.cache/**',
    '.tmp/**',
    'tmp/**',
    '.temp/**',
    'temp/**',
    
    // Test coverage and reports
    'coverage/**',
    '.nyc_output/**',
    'junit.xml',
    
    // IDE and editor files
    '.idea/**',
    '.vscode/**',
    '.vs/**',
    '*.sublime-*',
    '*.swp',
    '*.swo',
    
    // Logs
    'logs/**',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    
    // Environment and secrets
    '.env*',
    '.env.local',
    '.env.*.local',
    '*.pem',
    '*.key',
    '*.cert',
    
    // Documentation builds
    'docs/_build/**',
    'docs/_site/**',
    'site/**',
    '_site/**',
    
    // Image files
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    '**/*.webp',
    '**/*.bmp',
    '**/*.tiff',
    '**/*.tif',
    
    // Other media files
    '**/*.mp3',
    '**/*.mp4',
    '**/*.wav',
    '**/*.avi',
    '**/*.mov',
    '**/*.mkv',
    '**/*.flv',
    '**/*.m4a',
    '**/*.m4v',
    '**/*.wmv',
    '**/*.webm',
    
    // Binary and compiled files
    '**/*.exe',
    '**/*.dll',
    '**/*.so',
    '**/*.dylib',
    '**/*.bin',
    '**/*.obj',
    '**/*.o',
    '**/*.pyc',
    '**/*.class',
    
    // Archives
    '**/*.zip',
    '**/*.tar',
    '**/*.gz',
    '**/*.7z',
    '**/*.rar',
    '**/*.jar',
    '**/*.war',
    '**/*.ear',

    // OS specific files
    '**/*.DS_Store',
    '**/*.Thumbs.db',
    '**/*.AppleDouble',
  ],
  output: {
    path: 'repo-contents.txt'
  },
  watch: {
    debounceMs: 300
  },
  tree: {
    enabled: true
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