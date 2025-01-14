export * from './types.js';
export * from './utils/debounce.js';
export * from './classes/FileHandler.js';
export * from './classes/ConfigLoader.js';
export * from './classes/RepositoryScanner.js';
export * from './classes/ContentGenerator.js';
export * from './classes/TextDumper.js';
export * from './classes/Watcher.js';

import type { Dependencies, Options } from './types.js';
import type { FSWatcher } from 'chokidar';
import { FileHandler } from './classes/FileHandler.js';
import { ConfigLoader } from './classes/ConfigLoader.js';
import { RepositoryScanner } from './classes/RepositoryScanner.js';
import { ContentGenerator } from './classes/ContentGenerator.js';
import { TextDumper } from './classes/TextDumper.js';
import { Watcher } from './classes/Watcher.js';

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