import type { FileSystem } from '../types.js';

export class FileHandler {
  constructor(private fs: FileSystem = {
    readFileSync: (path, options) => require('fs').readFileSync(path, options),
    writeFileSync: (path, content) => require('fs').writeFileSync(path, content),
    existsSync: (path) => require('fs').existsSync(path),
    statSync: (path) => require('fs').statSync(path)
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