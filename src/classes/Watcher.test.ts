import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { Watcher } from './Watcher.js';
import { TextDumper } from './TextDumper.js';
import { FileHandler } from './FileHandler.js';
import { ConfigLoader } from './ConfigLoader.js';
import { RepositoryScanner } from './RepositoryScanner.js';
import { ContentGenerator } from './ContentGenerator.js';
import type { FileSystem, GlobFunction } from '../types.js';

const mockFs = {
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn()
} as jest.Mocked<FileSystem>;

const mockGlob = jest.fn().mockImplementation(async () => []) as jest.MockedFunction<GlobFunction>;

const mockChokidar = {
  watch: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis()
  }),
  FSWatcher: jest.fn()
};

describe('Watcher', () => {
  let watcher: Watcher;
  let mockTextDumper: TextDumper;
  let mockFileHandler: FileHandler;
  let mockConfigLoader: ConfigLoader;
  let mockRepositoryScanner: RepositoryScanner;
  let mockContentGenerator: ContentGenerator;
  let loadConfigMock: jest.MockedFunction<ConfigLoader['loadConfig']>;
  let generateTextDumpMock: jest.MockedFunction<TextDumper['generateTextDump']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    mockConfigLoader = new ConfigLoader(mockFileHandler);
    mockRepositoryScanner = new RepositoryScanner(mockFileHandler, mockGlob);
    mockContentGenerator = new ContentGenerator(mockFileHandler);

    mockTextDumper = new TextDumper(
      mockConfigLoader,
      mockRepositoryScanner,
      mockContentGenerator,
      mockFileHandler
    );

    loadConfigMock = jest.fn(() => ({
      include: ['**/*'],
      exclude: ['node_modules/**'],
      output: { path: 'output.txt' },
      watch: { debounceMs: 300 }
    })) as jest.MockedFunction<ConfigLoader['loadConfig']>;
    generateTextDumpMock = jest.fn(async () => 'output.txt') as jest.MockedFunction<TextDumper['generateTextDump']>;

    jest.spyOn(mockConfigLoader, 'loadConfig').mockImplementation(loadConfigMock);
    jest.spyOn(mockTextDumper, 'generateTextDump').mockImplementation(generateTextDumpMock);

    watcher = new Watcher(mockTextDumper, mockChokidar as any);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should setup file watching', async () => {
    const options = { output: 'output.txt' };
    const watchInstance = await watcher.watch(options);

    expect(mockChokidar.watch).toHaveBeenCalled();
    expect((watchInstance as any).on).toHaveBeenCalledWith('add', expect.any(Function));
    expect((watchInstance as any).on).toHaveBeenCalledWith('change', expect.any(Function));
    expect((watchInstance as any).on).toHaveBeenCalledWith('unlink', expect.any(Function));
  });
}); 