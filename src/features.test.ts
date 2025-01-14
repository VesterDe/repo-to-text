import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import type { Ignore } from 'ignore';
import {
  TextDumper,
  Watcher,
  createInstances,
  FileHandler,
  ConfigLoader,
  RepositoryScanner,
  ContentGenerator,
  DEFAULT_CONFIG,
  FileSystem,
  Options,
  Dependencies,
  GlobFunction
} from './index.js';

type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

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

describe('TextDumper', () => {
  let dumper: TextDumper;
  let mockFileHandler: FileHandler;
  let mockConfigLoader: ConfigLoader;
  let mockRepositoryScanner: RepositoryScanner;
  let mockContentGenerator: ContentGenerator;
  let writeFileMock: MockFunction<FileHandler['writeFile']>;
  let generateContentMock: MockFunction<ContentGenerator['generateContent']>;
  let loadConfigMock: MockFunction<ConfigLoader['loadConfig']>;
  let createIgnoreMock: MockFunction<RepositoryScanner['createIgnore']>;
  let getFilesMock: MockFunction<RepositoryScanner['getFiles']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    mockConfigLoader = new ConfigLoader(mockFileHandler);
    mockRepositoryScanner = new RepositoryScanner(mockFileHandler, mockGlob);
    mockContentGenerator = new ContentGenerator(mockFileHandler);

    loadConfigMock = (jest.fn(() => DEFAULT_CONFIG) as unknown) as MockFunction<ConfigLoader['loadConfig']>;
    createIgnoreMock = jest.fn().mockReturnValue({
      ignores: jest.fn().mockReturnValue(false),
      add: jest.fn(),
      filter: jest.fn(),
      createFilter: jest.fn(),
      test: jest.fn()
    } as unknown as Ignore) as MockFunction<RepositoryScanner['createIgnore']>;
    getFilesMock = (jest.fn(async () => ['file1.js']) as unknown) as MockFunction<RepositoryScanner['getFiles']>;
    generateContentMock = (jest.fn(() => 'content') as unknown) as MockFunction<ContentGenerator['generateContent']>;
    writeFileMock = (jest.fn() as unknown) as MockFunction<FileHandler['writeFile']>;

    jest.spyOn(mockConfigLoader, 'loadConfig').mockImplementation(loadConfigMock);
    jest.spyOn(mockRepositoryScanner, 'createIgnore').mockImplementation(createIgnoreMock);
    jest.spyOn(mockRepositoryScanner, 'getFiles').mockImplementation(getFilesMock);
    jest.spyOn(mockContentGenerator, 'generateContent').mockImplementation(generateContentMock);
    jest.spyOn(mockFileHandler, 'writeFile').mockImplementation(writeFileMock);

    dumper = new TextDumper(
      mockConfigLoader,
      mockRepositoryScanner,
      mockContentGenerator,
      mockFileHandler
    );
  });

  test('should generate text dump', async () => {
    const options: Options = { output: 'output.txt' };
    const outputPath = await dumper.generateTextDump(options);

    expect(outputPath).toBe('output.txt');
    expect(generateContentMock).toHaveBeenCalled();
    expect(writeFileMock).toHaveBeenCalledWith('output.txt', 'content');
  });
});

describe('Watcher', () => {
  let watcher: Watcher;
  let mockTextDumper: TextDumper;
  let mockFileHandler: FileHandler;
  let mockConfigLoader: ConfigLoader;
  let mockRepositoryScanner: RepositoryScanner;
  let mockContentGenerator: ContentGenerator;
  let loadConfigMock: MockFunction<ConfigLoader['loadConfig']>;
  let generateTextDumpMock: MockFunction<TextDumper['generateTextDump']>;

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

    loadConfigMock = (jest.fn(() => DEFAULT_CONFIG) as unknown) as MockFunction<ConfigLoader['loadConfig']>;
    generateTextDumpMock = (jest.fn(async () => 'output.txt') as unknown) as MockFunction<TextDumper['generateTextDump']>;

    jest.spyOn(mockConfigLoader, 'loadConfig').mockImplementation(loadConfigMock);
    jest.spyOn(mockTextDumper, 'generateTextDump').mockImplementation(generateTextDumpMock);

    watcher = new Watcher(mockTextDumper, mockChokidar as any);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should setup file watching', async () => {
    const options: Options = { output: 'output.txt' };
    const watchInstance = await watcher.watch(options);

    expect(mockChokidar.watch).toHaveBeenCalled();
    expect((watchInstance as any).on).toHaveBeenCalledWith('add', expect.any(Function));
    expect((watchInstance as any).on).toHaveBeenCalledWith('change', expect.any(Function));
    expect((watchInstance as any).on).toHaveBeenCalledWith('unlink', expect.any(Function));
  });
});

describe('createInstances', () => {
  test('should create instances with custom dependencies', () => {
    const customDeps: Dependencies = {
      fs: mockFs,
      glob: mockGlob,
      chokidar: mockChokidar as any
    };

    const instances = createInstances(customDeps);

    expect(instances.fileHandler).toBeInstanceOf(FileHandler);
    expect(instances.configLoader).toBeInstanceOf(ConfigLoader);
    expect(instances.repositoryScanner).toBeInstanceOf(RepositoryScanner);
    expect(instances.contentGenerator).toBeInstanceOf(ContentGenerator);
    expect(instances.textDumper).toBeInstanceOf(TextDumper);
    expect(instances.watcher).toBeInstanceOf(Watcher);
  });
}); 