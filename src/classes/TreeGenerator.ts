import { basename, dirname, relative } from 'path';

export class TreeGenerator {
  private readonly boxChars = {
    branch: '├── ',
    lastBranch: '└── ',
    vertical: '│   ',
    space: '    '
  };

  generateTree(files: string[]): string {
    if (files.length === 0) return '';

    const sortedFiles = files.sort();
    const tree = ['Directory Tree:', '.'];
    const processedDirs = new Set<string>();

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const relativePath = relative('.', file);
      const parts = relativePath.split('/');
      const isLast = i === sortedFiles.length - 1;

      let prefix = '';
      let currentPath = '';

      for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        const prevPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        // Skip if we've already processed this directory
        if (j < parts.length - 1 && processedDirs.has(currentPath)) {
          prefix += this.hasNextSibling(sortedFiles, i, j) ? this.boxChars.vertical : this.boxChars.space;
          continue;
        }

        // Add indentation
        let line = prefix;

        // Add branch character
        const isLastAtLevel = !this.hasNextSibling(sortedFiles, i, j);
        if (j === 0 && isLast) {
          line += this.boxChars.lastBranch;
        } else {
          line += isLastAtLevel ? this.boxChars.lastBranch : this.boxChars.branch;
        }

        // Add the name
        line += part;

        // Add to tree and update prefix for next level
        tree.push(line);
        if (j < parts.length - 1) {
          processedDirs.add(currentPath);
          prefix += isLastAtLevel ? this.boxChars.space : this.boxChars.vertical;
        }
      }
    }

    return tree.join('\n') + '\n';
  }

  private hasNextSibling(files: string[], currentIndex: number, depth: number): boolean {
    const currentPath = files[currentIndex];
    const currentParts = relative('.', currentPath).split('/');
    if (depth >= currentParts.length) return false;
    
    const currentPrefix = currentParts.slice(0, depth + 1).join('/');

    for (let i = currentIndex + 1; i < files.length; i++) {
      const nextPath = files[i];
      const nextParts = relative('.', nextPath).split('/');
      if (nextParts.length <= depth) continue;
      
      const nextPrefix = nextParts.slice(0, depth + 1).join('/');
      
      // Check if they share the same parent but are different paths
      if (depth === 0 || 
          (currentParts.slice(0, depth).join('/') === nextParts.slice(0, depth).join('/'))) {
        if (currentPrefix !== nextPrefix) {
          return true;
        }
      }
    }
    return false;
  }
} 