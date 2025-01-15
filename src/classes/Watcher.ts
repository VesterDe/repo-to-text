import chokidar, { FSWatcher } from 'chokidar';
import type { Options } from '../types.js';
import { TextDumper } from './TextDumper.js';
import { debounce } from '../utils/debounce.js';
import { DEFAULT_CONFIG } from './ConfigLoader.js';

export class Watcher {
  constructor(
    private textDumper: TextDumper,
    private chokidarImpl: typeof chokidar = chokidar
  ) {}

  async watch(options: Options): Promise<FSWatcher> {
    const config = this.textDumper.configLoader.loadConfig(options.config);
    const outputPath = options.output || config.output?.path || DEFAULT_CONFIG.output.path;
    const debounceMs = config.watch?.debounceMs || DEFAULT_CONFIG.watch.debounceMs;

    await this.textDumper.generateTextDump(options);
    console.log(`✨ Initial content dumped to ${outputPath}`);
    console.log(`Debounce set to ${debounceMs}ms`);

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
        console.log(`✨ Updated ${outputPath}`);
      } catch (error) {
        console.error(`Error updating on change: ${(error as Error).message}`);
      }
    }, debounceMs);

    const handleChange = (path: string) => {
      console.log(`📝 File changed: ${path}`);
      debouncedUpdate();
    };

    watcher
      .on('add', handleChange)
      .on('change', handleChange)
      .on('unlink', handleChange)
      .on('error', error => {
        console.error(`Watcher error: ${error}`);
      });

    return watcher;
  }
} 