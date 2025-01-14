import ignore from 'ignore';
import type { GlobFunction } from '../types.js';
import { FileHandler } from './FileHandler.js';
import { glob } from 'glob';

export class RepositoryScanner {
  constructor(
    private fileHandler: FileHandler,
    private globImpl: GlobFunction = glob
  ) {}

  async getFiles(include: string[], exclude: string[]): Promise<string[]> {
    const files = await this.globImpl(include, {
      ignore: exclude,
      dot: true,
      nodir: true
    });
    return files;
  }

  createIgnore(gitignorePath: string, excludePatterns: string[]): ReturnType<typeof ignore> {
    const ig = ignore();

    if (this.fileHandler.exists(gitignorePath)) {
      ig.add(this.fileHandler.readFile(gitignorePath));
    }

    ig.add(excludePatterns);
    return ig;
  }
} 