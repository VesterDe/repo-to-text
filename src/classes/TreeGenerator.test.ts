import { jest, describe, test, expect } from '@jest/globals';
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
      'package.json'
    ];
    const expected =
      `Directory Tree:
.
├── package.json
└── src
    ├── classes
    │   ├── TextDumper.ts
    │   └── TreeGenerator.ts
    ├── index.ts
    └── types.ts
`;
    const result = treeGenerator.generateTree(files);
    expect(result).toBe(expected);
  });

  test('should handle deep nesting and multiple branches', () => {
    const files = [
      'src/a/deep/path/file1.ts',
      'src/a/deep/path/file2.ts',
      'src/b/other/file3.ts',
      'src/b/file4.ts',
      'root.txt'
    ];
    const expected =
      `Directory Tree:
.
├── root.txt
└── src
    ├── a
    │   └── deep
    │       └── path
    │           ├── file1.ts
    │           └── file2.ts
    └── b
        ├── file4.ts
        └── other
            └── file3.ts
`;
    const result = treeGenerator.generateTree(files);
    expect(result).toBe(expected);
  });
}); 