import { vi, describe, test, expect, beforeEach } from 'vitest';
import { TextDumper } from './TextDumper.js';
import { FileHandler } from './FileHandler.js';
import { ConfigLoader } from './ConfigLoader.js';
import { RepositoryScanner } from './RepositoryScanner.js';
import { ContentGenerator } from './ContentGenerator.js';
import { TreeGenerator } from './TreeGenerator.js';
import type { Config, FileSystem } from '../types.js';
import { DEFAULT_CONFIG } from './ConfigLoader.js';
import { glob } from 'glob';

describe('TextDumper', () => {
  let dumper: TextDumper;
  let mockConfigLoader: ConfigLoader;
  let mockRepositoryScanner: RepositoryScanner;
  let mockContentGenerator: ContentGenerator;
  let mockTreeGenerator: TreeGenerator;
  let mockFileHandler: FileHandler;

  beforeEach(() => {
    const mockFs: FileSystem = {
      readFileSync: vi.fn().mockReturnValue(''),
      writeFileSync: vi.fn(),
      existsSync: vi.fn(),
      statSync: vi.fn(),
    };
    mockFileHandler = new FileHandler(mockFs);
    mockConfigLoader = new ConfigLoader(mockFileHandler);
    mockRepositoryScanner = new RepositoryScanner(mockFileHandler, glob);
    mockContentGenerator = new ContentGenerator(mockFileHandler);
    mockTreeGenerator = new TreeGenerator();

    dumper = new TextDumper(
      mockConfigLoader,
      mockRepositoryScanner,
      mockContentGenerator,
      mockFileHandler,
      mockTreeGenerator,
    );
  });

  test('should generate text dump', async () => {
    const config: Config = { ...DEFAULT_CONFIG, output: { path: 'output.txt' } };
    vi.spyOn(mockConfigLoader, 'loadConfig').mockReturnValue(config);
    vi.spyOn(mockRepositoryScanner, 'getFiles').mockResolvedValue(['file1.js']);
    const generateContentSpy = vi.spyOn(mockContentGenerator, 'generateContent').mockReturnValue('content');
    const writeFileSpy = vi.spyOn(mockFileHandler, 'writeFile');
    vi.spyOn(mockFileHandler, 'exists').mockReturnValue(false);

    const outputPath = await dumper.generateTextDump({});

    expect(outputPath).toBe('output.txt');
    expect(generateContentSpy).toHaveBeenCalled();
    expect(writeFileSpy).toHaveBeenCalledWith('output.txt', expect.stringContaining('content'));
  });

  test('should include tree structure when includeTree option is true', async () => {
    const config: Config = { ...DEFAULT_CONFIG, output: { path: 'output.txt' }, tree: { enabled: true } };
    vi.spyOn(mockConfigLoader, 'loadConfig').mockReturnValue(config);
    vi.spyOn(mockRepositoryScanner, 'getFiles').mockResolvedValue(['file1.js', 'src/file2.js']);
    const generateTreeSpy = vi.spyOn(mockTreeGenerator, 'generateTree');
    const writeFileSpy = vi.spyOn(mockFileHandler, 'writeFile');
    vi.spyOn(mockFileHandler, 'exists').mockReturnValue(false);

    await dumper.generateTextDump({ includeTree: true });

    expect(generateTreeSpy).toHaveBeenCalled();
    expect(writeFileSpy).toHaveBeenCalledWith('output.txt', expect.stringContaining('Directory Tree:'));
  });

  test('should not include tree structure when includeTree option is false', async () => {
    const config: Config = { ...DEFAULT_CONFIG, output: { path: 'output.txt' }, tree: { enabled: false } };
    vi.spyOn(mockConfigLoader, 'loadConfig').mockReturnValue(config);
    vi.spyOn(mockRepositoryScanner, 'getFiles').mockResolvedValue(['file1.js', 'src/file2.js']);
    const generateTreeSpy = vi.spyOn(mockTreeGenerator, 'generateTree');
    const writeFileSpy = vi.spyOn(mockFileHandler, 'writeFile');
    vi.spyOn(mockFileHandler, 'exists').mockReturnValue(false);

    await dumper.generateTextDump({});

    expect(generateTreeSpy).not.toHaveBeenCalled();
    expect(writeFileSpy).not.toHaveBeenCalledWith('output.txt', expect.stringContaining('Directory Tree:'));
  });
});
