import { vi, describe, test, expect, beforeEach, type Mocked } from 'vitest';
import type { Stats } from 'fs';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

const mockFs: Mocked<FileSystem> = {
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn(),
};

describe('FileHandler', () => {
  let fileHandler: FileHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    fileHandler = new FileHandler(mockFs);
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

  test('should return false for a directory', () => {
    mockFs.statSync.mockReturnValue({ isFile: () => false } as Stats);
    expect(fileHandler.isFile('dir')).toBe(false);
  });

  test('should throw an error if statSync fails for reasons other than EISDIR', () => {
    const error = new Error('Something went wrong');
    mockFs.statSync.mockImplementation(() => {
      throw error;
    });
    expect(() => fileHandler.isFile('error-path')).toThrow(error);
  });
});