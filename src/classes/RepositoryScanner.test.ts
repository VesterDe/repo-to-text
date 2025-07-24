import { vi, describe, test, expect, beforeEach } from 'vitest';
import { RepositoryScanner } from './RepositoryScanner.js';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

vi.mock('glob');

const mockedGlob = vi.fn()

const mockFs: FileSystem = {
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn(),
};

describe('RepositoryScanner', () => {
  let scanner: RepositoryScanner;
  let fileHandler: FileHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    fileHandler = new FileHandler(mockFs);
    scanner = new RepositoryScanner(fileHandler, mockedGlob);
  });

  test('should get files using glob', async () => {
    const files = ['file1.js', 'file2.js'];
    mockedGlob.mockReturnValue(files);

    const result = await scanner.getFiles(['**/*.js'], ['node_modules']);
    expect(result).toEqual(files);
    expect(mockedGlob).toHaveBeenCalledWith(['**/*.js'], { ignore: ['node_modules'], nodir: true, dot: true });
  });

  test('should create ignore instance with gitignore', () => {
    vi.spyOn(fileHandler, 'exists').mockReturnValue(true);
    vi.spyOn(fileHandler, 'readFile').mockReturnValue('node_modules/');

    const igInstance = scanner.createIgnore('.gitignore', ['*.test.js']);
    expect(igInstance.ignores('node_modules/file.js')).toBe(true);
    expect(igInstance.ignores('src/file.js')).toBe(false);
    expect(igInstance.ignores('file.test.js')).toBe(true);
  });
});