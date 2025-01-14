import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Ignore } from 'ignore';
import { RepositoryScanner, ContentGenerator, FileHandler, FileSystem, GlobFunction } from './index.js';

type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

const mockFs = {
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn()
} as jest.Mocked<FileSystem>;

const mockGlob = jest.fn().mockImplementation(async () => []) as jest.MockedFunction<GlobFunction>;

describe('RepositoryScanner', () => {
  let scanner: RepositoryScanner;
  let mockFileHandler: FileHandler;
  let readFileMock: MockFunction<FileHandler['readFile']>;
  let existsMock: MockFunction<FileHandler['exists']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    scanner = new RepositoryScanner(mockFileHandler, mockGlob);
    readFileMock = jest.fn() as MockFunction<FileHandler['readFile']>;
    existsMock = jest.fn() as MockFunction<FileHandler['exists']>;
    jest.spyOn(mockFileHandler, 'readFile').mockImplementation(readFileMock);
    jest.spyOn(mockFileHandler, 'exists').mockImplementation(existsMock);
    jest.clearAllMocks();
  });

  test('should get files using glob', async () => {
    const files = ['file1.js', 'file2.js'];
    mockGlob.mockImplementation(async () => files);

    const result = await scanner.getFiles(['**/*.js'], ['node_modules']);
    expect(result).toEqual(files);
    expect(mockGlob).toHaveBeenCalledWith(['**/*.js'], expect.any(Object));
  });

  test('should create ignore instance with gitignore', () => {
    existsMock.mockReturnValue(true);
    readFileMock.mockReturnValue('node_modules/\n.git/');

    const ig = scanner.createIgnore('.gitignore', ['*.test.js']);
    expect(ig.ignores('node_modules/file.js')).toBe(true);
    expect(ig.ignores('src/file.js')).toBe(false);
    expect(ig.ignores('file.test.js')).toBe(true);
  });
});

describe('ContentGenerator', () => {
  let generator: ContentGenerator;
  let mockFileHandler: FileHandler;
  let readFileMock: MockFunction<FileHandler['readFile']>;
  let isFileMock: MockFunction<FileHandler['isFile']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    generator = new ContentGenerator(mockFileHandler);
    readFileMock = jest.fn() as MockFunction<FileHandler['readFile']>;
    isFileMock = jest.fn() as MockFunction<FileHandler['isFile']>;
    jest.spyOn(mockFileHandler, 'readFile').mockImplementation(readFileMock);
    jest.spyOn(mockFileHandler, 'isFile').mockImplementation(isFileMock);
  });

  test('should generate content for files', () => {
    isFileMock.mockReturnValue(true);
    readFileMock.mockReturnValue('file content');

    const content = generator.generateContent(['file1.js', 'file2.js']);
    expect(content).toContain('FILE: file1.js');
    expect(content).toContain('file content');
    expect(readFileMock).toHaveBeenCalledTimes(2);
  });

  test('should skip non-files', () => {
    isFileMock.mockReturnValue(false);

    generator.generateContent(['dir']);
    expect(readFileMock).not.toHaveBeenCalled();
  });
}); 