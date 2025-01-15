import { FileHandler } from './FileHandler.js';

export class ContentGenerator {
  constructor(private fileHandler: FileHandler) {}

  generateContent(files: string[]): string {
    let output = '';

    for (const file of files) {
      try {
        if (!this.fileHandler.isFile(file)) continue;

        const content = this.fileHandler.readFile(file);
        output += `\n${'='.repeat(80)}\n`;
        output += `FILE: ${file}\n`;
        output += `${'='.repeat(80)}\n\n`;
        output += content;
        output += '\n';
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${(error as Error).message}`);
      }
    }

    return output;
  }
} 