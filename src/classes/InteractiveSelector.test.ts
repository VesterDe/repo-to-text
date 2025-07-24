import { vi, describe, test, expect, beforeEach, type Mocked } from 'vitest';
import { InteractiveSelector } from './InteractiveSelector.js';
import type { ConfigLoader } from './ConfigLoader.js';
import type { RepositoryScanner } from './RepositoryScanner.js';
import type { TextDumper } from './TextDumper.js';
import * as child_process from 'node:child_process';
import type { Config, Options } from '../types.js';
import { Writable } from 'node:stream';
import { DEFAULT_CONFIG } from './ConfigLoader.js';

vi.mock('child_process');
const mockedSpawn = child_process.spawn as Mocked<typeof child_process.spawn>;

describe('InteractiveSelector', () => {
  let selector: InteractiveSelector;
  let mockConfigLoader: Mocked<ConfigLoader>;
  let mockRepositoryScanner: Mocked<RepositoryScanner>;
  let mockTextDumper: Mocked<TextDumper>;

  const mockConfig: Config = {
    ...DEFAULT_CONFIG,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfigLoader = {
      loadConfig: vi.fn().mockReturnValue(mockConfig),
    } as unknown as Mocked<ConfigLoader>;

    mockRepositoryScanner = {
      getFiles: vi.fn().mockResolvedValue(['file1.ts', 'file2.ts']),
    } as unknown as Mocked<RepositoryScanner>;

    mockTextDumper = {
      generateTextDump: vi.fn().mockResolvedValue('output.txt'),
    } as unknown as Mocked<TextDumper>;

    selector = new InteractiveSelector(
      mockConfigLoader,
      mockRepositoryScanner,
      mockTextDumper,
    );
  });

  test('should exit if fzf is not available', async () => {
    vi.spyOn(selector as any, 'isFzfAvailable').mockReturnValue(false);
    const mockExit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any);
    const mockConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await selector.selectFiles({} as Options);

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error: The "fzf" command is not installed or not in your PATH.',
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  test('should call TextDumper with selected files', async () => {
    vi.spyOn(selector as any, 'isFzfAvailable').mockReturnValue(true);
    const mockFzfProcess = {
      stdout: {
        on: (event: string, listener: (data: Buffer) => void) => {
          if (event === 'data') listener(Buffer.from('file1.ts\nfile2.ts'));
        },
        setEncoding: vi.fn(),
      },
      stderr: { on: () => {}, setEncoding: vi.fn() },
      on: (event: string, listener: (code: number) => void) => {
        if (event === 'close') listener(0);
      },
      stdin: new Writable(),
    };
    mockedSpawn.mockReturnValue(mockFzfProcess as any);

    await selector.selectFiles({} as Options);

    expect(mockRepositoryScanner.getFiles).toHaveBeenCalled();
    expect(mockTextDumper.generateTextDump).toHaveBeenCalledWith(expect.any(Object), [
      'file1.ts',
      'file2.ts',
    ]);
  });

  test('should not call TextDumper if no files are selected', async () => {
    vi.spyOn(selector as any, 'isFzfAvailable').mockReturnValue(true);
    const mockFzfProcess = {
      stdout: {
        on: (event: string, listener: (data: Buffer) => void) => {
          if (event === 'data') listener(Buffer.from(''));
        },
        setEncoding: vi.fn(),
      },
      stderr: { on: () => {}, setEncoding: vi.fn() },
      on: (event: string, listener: (code: number) => void) => {
        if (event === 'close') listener(0);
      },
      stdin: new Writable(),
    };
    mockedSpawn.mockReturnValue(mockFzfProcess as any);

    await selector.selectFiles({} as Options);

    expect(mockTextDumper.generateTextDump).not.toHaveBeenCalled();
  });
});