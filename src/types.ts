import type { FSWatcher, WatchOptions } from 'chokidar';
import type { Stats, PathOrFileDescriptor } from 'fs';

export interface Config {
  include: string[];
  exclude: string[];
  output: {
    path: string;
  };
  watch: {
    debounceMs: number;
  };
}

export interface FileSystem {
  readFileSync(path: PathOrFileDescriptor, options: BufferEncoding | { encoding: BufferEncoding; flag?: string }): string;
  writeFileSync(path: string, content: string): void;
  existsSync(path: string): boolean;
  statSync(path: string): Stats;
}

export interface Options {
  config?: string;
  output?: string;
}

export type GlobOptions = {
  ignore?: string[];
  dot?: boolean;
  nodir?: boolean;
};

export type GlobFunction = {
  (pattern: string | string[], options?: GlobOptions): Promise<string[]>;
};

export interface Dependencies {
  fs?: FileSystem;
  glob?: GlobFunction;
  chokidar?: {
    watch(paths: string | readonly string[], options?: WatchOptions): FSWatcher;
    FSWatcher: typeof FSWatcher;
  };
} 