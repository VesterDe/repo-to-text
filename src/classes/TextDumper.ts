import { relative } from 'path';
import type { Options } from '../types.js';
import type { ConfigLoader } from './ConfigLoader';
import type { RepositoryScanner } from './RepositoryScanner';
import type { ContentGenerator } from './ContentGenerator';
import type { FileHandler } from './FileHandler';
import type { TreeGenerator } from './TreeGenerator';

export class TextDumper {
  constructor(
    public configLoader: ConfigLoader,
    private repositoryScanner: RepositoryScanner,
    private contentGenerator: ContentGenerator,
    private fileHandler: FileHandler,
    private treeGenerator: TreeGenerator
  ) {
  }

  async generateTextDump(
    options: Options,
    files?: string[]
  ): Promise<string> {
    const config = this.configLoader.loadConfig(options.config);
    const outputPath = options.output || config.output?.path;
    const relativeOutputPath = relative(process.cwd(), outputPath);
    config.exclude.push(relativeOutputPath);

    const ig = this.repositoryScanner.createIgnore(
      '.gitignore',
      config.exclude
    );
    const filesToProcess =
      files ||
      (await this.repositoryScanner.getFiles(config.include, config.exclude));
    const filteredFiles = filesToProcess.filter(file => !ig.ignores(file));

    let content = '';

    // Add tree structure if requested via CLI option or config
    if (options.includeTree || config.tree?.enabled) {
      content += this.treeGenerator.generateTree(filteredFiles);
      content += '\n';
    }

    content += this.contentGenerator.generateContent(filteredFiles);
    this.fileHandler.writeFile(outputPath, content);

    return outputPath;
  }
} 