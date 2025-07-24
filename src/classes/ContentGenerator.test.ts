import { vi, describe, test, expect, beforeEach, type MockInstance, type Mocked } from 'vitest';
import { ContentGenerator } from './ContentGenerator.js';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

const mockFs = {
  readFileSync: vi.fn().mockReturnValue(''),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn()
} as Mocked<FileSystem>;

describe('ContentGenerator', () => {
  let generator: ContentGenerator;
  let fh: FileHandler;

  type ReadFile = FileHandler['readFile'];
  type IsFile = FileHandler['isFile'];
  let readFileSpy: MockInstance<ReadFile>;
  let isFileSpy: MockInstance<IsFile>;

  beforeEach(() => {
    fh = new FileHandler(mockFs);
    generator = new ContentGenerator(fh);

    readFileSpy = vi.spyOn(fh, 'readFile');
    isFileSpy = vi.spyOn(fh, 'isFile');
  });

  test('should generate content for files', () => {
    isFileSpy.mockReturnValue(true);
    readFileSpy.mockReturnValue('file content');

    const content = generator.generateContent(['file1.js', 'file2.js']);
    expect(content).toContain('FILE: file1.js');
    expect(content).toContain('file content');
    expect(readFileSpy).toHaveBeenCalledTimes(2);
  });

  test('should skip non-files', () => {
    isFileSpy.mockReturnValue(false);

    generator.generateContent(['dir']);
    expect(readFileSpy).not.toHaveBeenCalled();
  });
}); 