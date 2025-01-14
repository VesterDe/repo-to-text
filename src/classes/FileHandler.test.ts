import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Stats } from 'fs';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

const mockFs = {
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn()
} as jest.Mocked<FileSystem>;

describe('FileHandler', () => {
  let fileHandler: FileHandler;

  beforeEach(() => {
    fileHandler = new FileHandler(mockFs);
    jest.clearAllMocks();
  });

  test('should read file', () => {
    mockFs.readFileSync.mockReturnValue('file content');
    expect(fileHandler.readFile('test.txt')).toBe('file content');
    expect(mockFs.readFileSync).toHaveBeenCalledWith('test.txt', 'utf8');
  });

  test('should write file', () => {
    fileHandler.writeFile('test.txt', 'content');
    expect(mockFs.writeFileSync).toHaveBeenCalledWith('test.txt', 'content');
  });

  test('should check if file exists', () => {
    mockFs.existsSync.mockReturnValue(true);
    expect(fileHandler.exists('test.txt')).toBe(true);
  });

  test('should check if path is file', () => {
    mockFs.statSync.mockReturnValue({ isFile: () => true } as Stats);
    expect(fileHandler.isFile('test.txt')).toBe(true);
  });

  test('should handle directory check', () => {
    mockFs.statSync.mockImplementation(() => {
      const error: NodeJS.ErrnoException = new Error();
      error.code = 'EISDIR';
      throw error;
    });
    expect(fileHandler.isFile('dir')).toBe(false);
  });
}); 