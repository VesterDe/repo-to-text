import { jest, describe, test, expect } from '@jest/globals';
import type { Ignore } from 'ignore';
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

describe('TextDumper', () => {
  let dumper: TextDumper;
  let mockFileHandler: FileHandler;
  let mockConfigLoader: ConfigLoader;
  let mockRepositoryScanner: RepositoryScanner;
  let mockContentGenerator: ContentGenerator;
  let writeFileMock: jest.MockedFunction<FileHandler['writeFile']>;
  let generateContentMock: jest.MockedFunction<ContentGenerator['generateContent']>;
  let loadConfigMock: jest.MockedFunction<ConfigLoader['loadConfig']>;
  let createIgnoreMock: jest.MockedFunction<RepositoryScanner['createIgnore']>;
  let getFilesMock: jest.MockedFunction<RepositoryScanner['getFiles']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    mockConfigLoader = new ConfigLoader(mockFileHandler);
    mockRepositoryScanner = new RepositoryScanner(mockFileHandler, mockGlob);
    mockContentGenerator = new ContentGenerator(mockFileHandler);

    loadConfigMock = jest.fn(() => ({
      include: ['**/*'],
      exclude: ['node_modules/**'],
      output: { path: 'output.txt' },
      watch: { debounceMs: 300 }
    })) as jest.MockedFunction<ConfigLoader['loadConfig']>;

    createIgnoreMock = jest.fn().mockReturnValue({
      ignores: jest.fn().mockReturnValue(false),
      add: jest.fn(),
      filter: jest.fn(),
      createFilter: jest.fn(),
      test: jest.fn()
    } as unknown as Ignore) as jest.MockedFunction<RepositoryScanner['createIgnore']>;

    getFilesMock = jest.fn(async () => ['file1.js']) as jest.MockedFunction<RepositoryScanner['getFiles']>;
    generateContentMock = jest.fn(() => 'content') as jest.MockedFunction<ContentGenerator['generateContent']>;
    writeFileMock = jest.fn() as jest.MockedFunction<FileHandler['writeFile']>;

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
    const options = { output: 'output.txt' };
    const outputPath = await dumper.generateTextDump(options);

    expect(outputPath).toBe('output.txt');
    expect(generateContentMock).toHaveBeenCalled();
    expect(writeFileMock).toHaveBeenCalledWith('output.txt', 'content');
  });

  test('should include tree structure when includeTree option is true', async () => {
    const options = { output: 'output.txt', includeTree: true };
    getFilesMock.mockResolvedValueOnce(['file1.js', 'src/file2.js']);
    generateContentMock.mockReturnValueOnce('file contents');
    
    const outputPath = await dumper.generateTextDump(options);

    expect(outputPath).toBe('output.txt');
    expect(writeFileMock).toHaveBeenCalledWith('output.txt', expect.stringContaining('Directory Tree:'));
    expect(writeFileMock).toHaveBeenCalledWith('output.txt', expect.stringContaining('file contents'));
  });

  test('should not include tree structure when includeTree option is false', async () => {
    const options = { output: 'output.txt', includeTree: false };
    getFilesMock.mockResolvedValueOnce(['file1.js', 'src/file2.js']);
    generateContentMock.mockReturnValueOnce('file contents');
    
    const outputPath = await dumper.generateTextDump(options);

    expect(outputPath).toBe('output.txt');
    expect(writeFileMock).toHaveBeenCalledWith('output.txt', 'file contents');
    expect(writeFileMock).not.toHaveBeenCalledWith('output.txt', expect.stringContaining('Directory Tree:'));
  });
}); 