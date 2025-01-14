import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ContentGenerator } from './ContentGenerator.js';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

const mockFs = {
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn()
} as jest.Mocked<FileSystem>;

describe('ContentGenerator', () => {
  let generator: ContentGenerator;
  let mockFileHandler: FileHandler;
  let readFileMock: jest.MockedFunction<FileHandler['readFile']>;
  let isFileMock: jest.MockedFunction<FileHandler['isFile']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    generator = new ContentGenerator(mockFileHandler);
    readFileMock = jest.fn() as jest.MockedFunction<FileHandler['readFile']>;
    isFileMock = jest.fn() as jest.MockedFunction<FileHandler['isFile']>;
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