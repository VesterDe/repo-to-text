import { vi, describe, test, expect, beforeEach, afterEach, type SpyInstance } from 'vitest';
import { Watcher } from './Watcher.js';
import { TextDumper } from './TextDumper.js';
import { FileHandler } from './FileHandler.js';
import { ConfigLoader } from './ConfigLoader.js';
import { RepositoryScanner } from './RepositoryScanner.js';
import { ContentGenerator } from './ContentGenerator.js';
import { TreeGenerator } from './TreeGenerator.js';
import type { FileSystem } from '../types.js';
import chokidar from 'chokidar';
import { glob } from 'glob';

vi.mock('chokidar');

describe('Watcher', () => {
  let watcher: Watcher;
  let mockTextDumper: TextDumper;
  let watchMock: SpyInstance;
  const onMock = vi.fn();

  beforeEach(() => {
    const mockFs: FileSystem = {
      readFileSync: vi.fn().mockReturnValue(''),
      writeFileSync: vi.fn(),
      existsSync: vi.fn(),
      statSync: vi.fn(),
    };
    const mockFileHandler = new FileHandler(mockFs);
    const mockConfigLoader = new ConfigLoader(mockFileHandler);
    const mockRepositoryScanner = new RepositoryScanner(mockFileHandler, glob);
    const mockContentGenerator = new ContentGenerator(mockFileHandler);
    mockTextDumper = new TextDumper(
      mockConfigLoader,
      mockRepositoryScanner,
      mockContentGenerator,
      mockFileHandler,
      new TreeGenerator()
    );

    watchMock = vi.spyOn(chokidar, 'watch').mockReturnValue({
      on: onMock,
    } as any);

    watcher = new Watcher(mockTextDumper, chokidar);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('should setup file watching', async () => {
    vi.spyOn(mockTextDumper, 'generateTextDump').mockResolvedValue('output.txt');
    onMock.mockReturnThis(); // Ensure 'on' is chainable
    await watcher.watch({});

    expect(watchMock).toHaveBeenCalled();
    expect(onMock).toHaveBeenCalledWith('add', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('change', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('unlink', expect.any(Function));
  });
});
