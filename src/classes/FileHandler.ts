import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import type { FileSystem } from '../types.js';

export class FileHandler {
  constructor(private fs: FileSystem = {
    readFileSync: (path, options) => readFileSync(path, options),
    writeFileSync: (path, content) => writeFileSync(path, content),
    existsSync: (path) => existsSync(path),
    statSync: (path) => statSync(path)
  }) {}

  readFile(path: string): string {
    return this.fs.readFileSync(path, 'utf8');
  }

  writeFile(path: string, content: string): void {
    this.fs.writeFileSync(path, content);
  }

  exists(path: string): boolean {
    return this.fs.existsSync(path);
  }

  isFile(path: string): boolean {
    try {
      const stats = this.fs.statSync(path);
      return stats.isFile();
    } catch (error) {
      if ((error as { code?: string }).code === 'EISDIR') return false;
      throw error;
    }
  }
} 