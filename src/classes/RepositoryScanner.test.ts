import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { RepositoryScanner } from './RepositoryScanner.js';
import { FileHandler } from './FileHandler.js';
import type { FileSystem, GlobFunction } from '../types.js';

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
  let readFileMock: jest.MockedFunction<FileHandler['readFile']>;
  let existsMock: jest.MockedFunction<FileHandler['exists']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    scanner = new RepositoryScanner(mockFileHandler, mockGlob);
    readFileMock = jest.fn() as jest.MockedFunction<FileHandler['readFile']>;
    existsMock = jest.fn() as jest.MockedFunction<FileHandler['exists']>;
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