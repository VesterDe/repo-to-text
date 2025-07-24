import { vi, describe, test, expect, beforeEach, type MockInstance, type Mocked } from 'vitest';
import { ConfigLoader, DEFAULT_CONFIG } from './ConfigLoader.js';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

const mockFs = {
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  statSync: vi.fn(),
} as Mocked<FileSystem>;

type ReadFile = FileHandler['readFile'];
type Exists = FileHandler['exists'];

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;
  let fh: FileHandler;
  let readFileSpy: MockInstance<ReadFile>;
  let existsSpy: MockInstance<Exists>;
  beforeEach(() => {
    fh = new FileHandler(mockFs);
    configLoader = new ConfigLoader(fh);
    readFileSpy = vi.spyOn(fh, 'readFile');
    existsSpy = vi.spyOn(fh, 'exists');
  });

  test('should return default config when no config files exist', async () => {
    existsSpy.mockReturnValue(false);
    const config = await configLoader.loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  test('should load and merge config from provided path', async () => {
    existsSpy.mockImplementation((path) => path === 'custom-config.json');
    readFileSpy.mockReturnValue('{ "include": ["src/**/*.ts"] }');

    const config = await configLoader.loadConfig('custom-config.json');
    expect(config.include).toEqual(['src/**/*.ts']);
    expect(config.exclude).toEqual(DEFAULT_CONFIG.exclude);
  });

  test('should load and merge config from default path when no config provided', async () => {
    existsSpy.mockImplementation((path) => path === 'repo-to-text.json');
    readFileSpy.mockReturnValue('{ "exclude": ["dist/**"] }');

    const config = await configLoader.loadConfig();
    expect(config.include).toEqual(DEFAULT_CONFIG.include);
    expect(config.exclude).toEqual(expect.arrayContaining([...DEFAULT_CONFIG.exclude, 'dist/**']));
  });

  test('should prioritize provided config over default config', async () => {
    existsSpy.mockReturnValue(true);
    readFileSpy.mockImplementation((path) => {
      if (path === 'custom-config.json') {
        return '{ "include": ["src/**/*.ts"] }';
      }
      if (path === 'repo-to-text.json') {
        return '{ "include": ["lib/**/*.js"] }';
      }
      return '';
    });

    const config = await configLoader.loadConfig('custom-config.json');
    expect(config.include).toEqual(['src/**/*.ts']);
  });

  test('should fall back to defaults with warning on invalid custom config', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    existsSpy.mockReturnValue(true);
    readFileSpy.mockImplementation(() => { throw new Error('Invalid JSON'); });

    const config = await configLoader.loadConfig('custom-config.json');
    expect(config).toEqual(DEFAULT_CONFIG);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid config at custom-config.json'),
    );

    consoleSpy.mockRestore();
  });

  test('should merge excludes but override includes when provided in config', async () => {
    existsSpy.mockReturnValue(true);
    readFileSpy.mockReturnValue('{ "include": ["src/**/*.ts"], "exclude": ["dist/**", "coverage/**"] }');

    const config = await configLoader.loadConfig('custom-config.json');

    expect(config.include).toEqual(['src/**/*.ts']);

    expect(config.exclude).toEqual([...DEFAULT_CONFIG.exclude, 'dist/**', 'coverage/**']);
  });
});
 