import { glob } from 'glob';
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';
import ignore from 'ignore';
import chokidar, { FSWatcher } from 'chokidar';
import chalk from 'chalk';
import {
  Config,
  FileSystem,
  Options,
  Dependencies,
  GlobFunction
} from './types.js';

export * from './types.js';

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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

export class FileHandler {
  constructor(private fs: FileSystem = { readFileSync, writeFileSync, existsSync, statSync }) { }

  readFile(path: string): string {
    return this.fs.readFileSync(path, 'utf8');
  }

  writeFile(path: string, content: string): void {
    this.fs.writeFileSync(path, content);
  }

  exists(path: string): boolean {
    return this.fs.existsSync(path);
  }

  isFile(path: string): boolean {
    try {
      const stats = this.fs.statSync(path);
      return stats.isFile();
    } catch (error) {
      if ((error as { code?: string }).code === 'EISDIR') return false;
      throw error;
    }
  }
}

export class ConfigLoader {
  constructor(private fileHandler: FileHandler) { }

  loadConfig(configPath?: string): Config {
    // First try the provided config path
    if (configPath && this.fileHandler.exists(configPath)) {
      try {
        const configContent = this.fileHandler.readFile(configPath);
        return { ...DEFAULT_CONFIG, ...JSON.parse(configContent) };
      } catch (error) {
        throw new Error(`Failed to load config file: ${(error as Error).message}`);
      }
    }

    // Then try the default config file
    const defaultConfigPath = join(process.cwd(), 'repo-to-text.json');
    if (this.fileHandler.exists(defaultConfigPath)) {
      try {
        const fileConfig = require(defaultConfigPath);
        return { ...DEFAULT_CONFIG, ...fileConfig };
      } catch (error) {
        throw new Error(`Failed to load default config file: ${(error as Error).message}`);
      }
    }

    // Fall back to default config
    return DEFAULT_CONFIG;
  }
}

export class RepositoryScanner {
  constructor(
    private fileHandler: FileHandler,
    private globImpl: GlobFunction = glob
  ) { }

  async getFiles(include: string[], exclude: string[]): Promise<string[]> {
    const files = await this.globImpl(include, {
      ignore: exclude,
      dot: true,
      nodir: true
    });
    return files;
  }

  createIgnore(gitignorePath: string, excludePatterns: string[]): ReturnType<typeof ignore> {
    const ig = ignore();

    if (this.fileHandler.exists(gitignorePath)) {
      ig.add(this.fileHandler.readFile(gitignorePath));
    }

    ig.add(excludePatterns);
    return ig;
  }
}

export class ContentGenerator {
  constructor(private fileHandler: FileHandler) { }

  generateContent(files: string[]): string {
    let output = '';

    for (const file of files) {
      try {
        if (!this.fileHandler.isFile(file)) continue;

        const content = this.fileHandler.readFile(file);
        output += `\n${'='.repeat(80)}\n`;
        output += `FILE: ${file}\n`;
        output += `${'='.repeat(80)}\n\n`;
        output += content;
        output += '\n';
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not read file ${file}: ${(error as Error).message}`));
      }
    }

    return output;
  }
}

export class TextDumper {
  constructor(
    public configLoader: ConfigLoader,
    private repositoryScanner: RepositoryScanner,
    private contentGenerator: ContentGenerator,
    private fileHandler: FileHandler
  ) { }

  async generateTextDump(options: Options): Promise<string> {
    const config = this.configLoader.loadConfig(options.config);
    const outputPath = options.output || config.output?.path;
    const relativeOutputPath = relative(process.cwd(), outputPath);
    config.exclude.push(relativeOutputPath);

    const ig = this.repositoryScanner.createIgnore('.gitignore', config.exclude);
    const files = await this.repositoryScanner.getFiles(config.include, config.exclude);
    const filteredFiles = files.filter(file => !ig.ignores(file));

    const content = this.contentGenerator.generateContent(filteredFiles);
    this.fileHandler.writeFile(outputPath, content);

    return outputPath;
  }
}

export class Watcher {
  constructor(
    private textDumper: TextDumper,
    private chokidarImpl: typeof chokidar = chokidar
  ) { }

  async watch(options: Options): Promise<FSWatcher> {
    const config = this.textDumper.configLoader.loadConfig(options.config);
    const outputPath = options.output || config.output?.path || DEFAULT_CONFIG.output.path;
    const debounceMs = config.watch?.debounceMs || DEFAULT_CONFIG.watch.debounceMs;

    await this.textDumper.generateTextDump(options);
    console.log(chalk.green(`✨ Initial content dumped to ${outputPath}`));
    console.log(chalk.gray(`Debounce set to ${debounceMs}ms`));

    const watcher = this.chokidarImpl.watch(config.include, {
      ignored: [
        ...config.exclude,
        outputPath,
        '**/node_modules/**',
        '**/.git/**'
      ],
      ignoreInitial: true,
      persistent: true
    });

    const debouncedUpdate = debounce(async () => {
      try {
        await this.textDumper.generateTextDump(options);
        console.log(chalk.green(`✨ Updated ${outputPath}`));
      } catch (error) {
        console.error(chalk.red(`Error updating on change: ${(error as Error).message}`));
      }
    }, debounceMs);

    const handleChange = (path: string) => {
      console.log(chalk.blue(`📝 File changed: ${path}`));
      debouncedUpdate();
    };

    watcher
      .on('add', handleChange)
      .on('change', handleChange)
      .on('unlink', handleChange)
      .on('error', error => {
        console.error(chalk.red(`Watcher error: ${error}`));
      });

    return watcher;
  }
}

export function createInstances(customDeps: Dependencies = {}) {
  const fileHandler = new FileHandler(customDeps.fs);
  const configLoader = new ConfigLoader(fileHandler);
  const repositoryScanner = new RepositoryScanner(fileHandler, customDeps.glob);
  const contentGenerator = new ContentGenerator(fileHandler);
  const textDumper = new TextDumper(configLoader, repositoryScanner, contentGenerator, fileHandler);
  const watcher = new Watcher(textDumper, customDeps.chokidar);

  return {
    fileHandler,
    configLoader,
    repositoryScanner,
    contentGenerator,
    textDumper,
    watcher
  };
}

export async function generateTextDump(options: Options): Promise<string> {
  const { textDumper } = createInstances();
  return textDumper.generateTextDump(options);
}

export async function watchRepository(options: Options): Promise<FSWatcher> {
  const { watcher } = createInstances();
  return watcher.watch(options);
} 