import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ConfigLoader, DEFAULT_CONFIG } from './ConfigLoader.js';
import { FileHandler } from './FileHandler.js';
import type { FileSystem } from '../types.js';

const mockFs = {
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn()
} as jest.Mocked<FileSystem>;

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;
  let mockFileHandler: FileHandler;
  let readFileMock: jest.MockedFunction<FileHandler['readFile']>;
  let existsMock: jest.MockedFunction<FileHandler['exists']>;

  beforeEach(() => {
    mockFileHandler = new FileHandler(mockFs);
    configLoader = new ConfigLoader(mockFileHandler);
    readFileMock = jest.fn() as jest.MockedFunction<FileHandler['readFile']>;
    existsMock = jest.fn() as jest.MockedFunction<FileHandler['exists']>;
    jest.spyOn(mockFileHandler, 'readFile').mockImplementation(readFileMock);
    jest.spyOn(mockFileHandler, 'exists').mockImplementation(existsMock);
  });

  test('should return default config when no config files exist', () => {
    existsMock.mockReturnValue(false);
    expect(configLoader.loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  test('should load and merge config from provided path', () => {
    existsMock.mockImplementation((path) => path === 'custom-config.json');
    readFileMock.mockReturnValue('{"include": ["src/**/*.ts"]}');
    
    const config = configLoader.loadConfig('custom-config.json');
    expect(config.include).toEqual(['src/**/*.ts']);
    expect(config.exclude).toEqual(DEFAULT_CONFIG.exclude);
  });

  test('should load and merge config from default path when no config provided', () => {
    existsMock.mockImplementation((path) => path === 'repo-to-text.json');
    readFileMock.mockReturnValue('{"exclude": ["dist/**"]}');
    
    const config = configLoader.loadConfig();
    expect(config.include).toEqual(DEFAULT_CONFIG.include);
    expect(config.exclude).toEqual(['dist/**']);
  });

  test('should prioritize provided config over default config', () => {
    existsMock.mockReturnValue(true);
    readFileMock.mockImplementation((path) => {
      if (path === 'custom-config.json') {
        return '{"include": ["src/**/*.ts"]}';
      }
      if (path === 'repo-to-text.json') {
        return '{"include": ["lib/**/*.js"]}';
      }
      return '';
    });
    
    const config = configLoader.loadConfig('custom-config.json');
    expect(config.include).toEqual(['src/**/*.ts']);
  });

  test('should throw error on invalid config in provided path', () => {
    existsMock.mockReturnValue(true);
    readFileMock.mockReturnValue('invalid json');
    
    expect(() => configLoader.loadConfig('custom-config.json')).toThrow('Failed to load config file');
  });

  test('should throw error on invalid default config', () => {
    existsMock.mockImplementation((path) => path === 'repo-to-text.json');
    readFileMock.mockReturnValue('invalid json');
    
    expect(() => configLoader.loadConfig()).toThrow('Failed to load default config file');
  });
}); 