import { relative } from 'path';
import type { Options } from '../types.js';
import { ConfigLoader } from './ConfigLoader.js';
import { RepositoryScanner } from './RepositoryScanner.js';
import { ContentGenerator } from './ContentGenerator.js';
import { FileHandler } from './FileHandler.js';

export class TextDumper {
  constructor(
    public configLoader: ConfigLoader,
    private repositoryScanner: RepositoryScanner,
    private contentGenerator: ContentGenerator,
    private fileHandler: FileHandler
  ) {}

  async generateTextDump(options: Options): Promise<string> {
    const config = this.configLoader.loadConfig(options.config);
    const outputPath = options.output || config.output?.path;
    const relativeOutputPath = relative(process.cwd(), outputPath);
    config.exclude.push(relativeOutputPath);

    const ig = this.repositoryScanner.createIgnore('.gitignore', config.exclude);
    const files = await this.repositoryScanner.getFiles(config.include, config.exclude);
    const filteredFiles = files.filter(file => !ig.ignores(file));

    const content = this.contentGenerator.generateContent(filteredFiles);
    this.fileHandler.writeFile(outputPath, content);

    return outputPath;
  }
} 