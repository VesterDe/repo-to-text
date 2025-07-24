import { describe, test, expect, beforeEach } from 'vitest';
import { TreeGenerator } from './TreeGenerator.js';

describe('TreeGenerator', () => {
  let treeGenerator: TreeGenerator;

  beforeEach(() => {
    treeGenerator = new TreeGenerator();
  });

  test('should generate empty tree for no files', () => {
    const result = treeGenerator.generateTree([]);
    expect(result).toBe('');
  });

  test('should generate tree for single file', () => {
    const result = treeGenerator.generateTree(['file.txt']);
    expect(result).toBe('Directory Tree:\n.\n└── file.txt\n');
  });

  test('should generate tree for multiple files in root', () => {
    const result = treeGenerator.generateTree(['file1.txt', 'file2.txt']);
    expect(result).toBe('Directory Tree:\n.\n├── file1.txt\n└── file2.txt\n');
  });

  test('should generate tree for nested directories', () => {
    const files = [
      'src/index.ts',
      'src/types.ts',
      'src/classes/TreeGenerator.ts',
      'src/classes/TextDumper.ts',
      'package.json',
    ];
    const expected = `Directory Tree:\n.\n├── package.json\n└── src\n    ├── classes\n    │   ├── TextDumper.ts\n    │   └── TreeGenerator.ts\n    ├── index.ts\n    └── types.ts\n`;
    const result = treeGenerator.generateTree(files);
    expect(result).toBe(expected);
  });

  test('should handle deep nesting and multiple branches', () => {
    const files = [
      'src/a/deep/path/file1.ts',
      'src/a/deep/path/file2.ts',
      'src/b/other/file3.ts',
      'src/b/file4.ts',
      'root.txt',
    ];
    const expected = `Directory Tree:\n.\n├── root.txt\n└── src\n    ├── a\n    │   └── deep\n    │       └── path\n    │           ├── file1.ts\n    │           └── file2.ts\n    └── b\n        ├── file4.ts\n        └── other\n            └── file3.ts\n`;
    const result = treeGenerator.generateTree(files);
    expect(result).toBe(expected);
  });
});
 