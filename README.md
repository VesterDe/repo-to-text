# repo-to-text-watcher

For when you want to throw your entire repo, or just a folder, at an LLM, but it isn't public so you can't use public web app solutions.

This CLI tool dumps the contents of repository files into a single annotated text file. It respects `.gitignore` patterns and allows custom configuration for file inclusion/exclusion. Also has a watch mode, and an interactive mode, for when you want a very specific bunch of files dumped.

If you're in a hurry, just use

```bash
bunx repo-to-text-watcher . #or npx
```

In any folder and a repo-contents.txt file will appear there.

Inspired by [https://github.com/kirill-markin/repo-to-text](https://github.com/kirill-markin/repo-to-text) and web based solutions.

## Installation

```bash
bun install -D repo-to-text-watcher # or npm
```

## Usage

Basic usage:
```bash
bunx repo-to-text-watcher # or npx
```

Watch mode:
```bash
bunx repo-to-text-watcher --watch # or npx
```

This will create a `repo-contents.txt` file with all repository contents and update it automatically when files change.

### Options

- `-o, --output <path>`: Specify output file path (default: "repo-contents.txt")
- `-c, --config <path>`: Specify a custom config file path
- `-w, --watch`: Watch for file changes and update output file automatically
- `-t, --no-tree`: Disable directory tree structure at the top of the output (enabled by default)
- `-i, --interactive`: Interactively select files and folders to include
- `-v, --version`: Output the version number
- `-h, --help`: Display help information

Interactive mode uses `fzf` under the hood, so if it is not present in your system, the command will gracefully fail.

### Configuration

You can configure the tool using a JSON configuration file. The tool looks for configuration in the following order:

1. Custom config file specified via `-c, --config` option
2. Default config file named `repo-to-text.json` in the current directory
3. Built-in default configuration

Example configuration file (`repo-to-text.json`):
```json
{
  "include": [
    "src/**/*.js",
    "lib/**/*.js"
  ],
  "exclude": [
    "**/*.test.js",
    "**/*.spec.js"
  ],
  "output": {
    "path": "custom-output.txt"
  },
  "watch": {
    "debounceMs": 300
  },
  "tree": {
    "enabled": true
  }
}
```

The configuration supports:
- `include`: Array of glob patterns for files to include (also determines which files to watch in watch mode)
- `exclude`: Array of glob patterns for files to exclude
- `output.path`: Default output file path (can be overridden by CLI option)
- `watch.debounceMs`: Debounce time in milliseconds for watch mode (default: 300ms)
- `tree.enabled`: Whether to include directory tree structure at the top of the output (default: true)

Default behavior:
- Excludes files in `node_modules/`
- Respects `.gitignore` patterns if present
- Includes all files except those explicitly excluded
- Automatically excludes the output file to prevent recursive scanning
- Default output path is `repo-contents.txt`
- Includes directory tree structure at the top of the output
- In watch mode:
  - Monitors files matching the include patterns
  - Updates output file on changes after debounce period
  - Default debounce of 300ms to prevent rapid updates

Default exclusions by category:
- **Dependencies and Build Outputs**: `node_modules/**`, `dist/**`, `build/**`, `out/**`, `target/**`, `bin/**`, `lib/**`
- **Package Manager Files**: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`
- **Version Control**: `.git/**`, `.svn/**`, `.hg/**`
- **Cache and Temporary Files**: `.cache/**`, `.tmp/**`, `tmp/**`, `.temp/**`, `temp/**`
- **Test Coverage and Reports**: `coverage/**`, `.nyc_output/**`, `junit.xml`
- **IDE and Editor Files**: `.idea/**`, `.vscode/**`, `.vs/**`, `*.sublime-*`, `*.swp`, `*.swo`
- **Logs**: `logs/**`, `*.log`, `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`
- **Environment and Secrets**: `.env*`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`, `*.cert`
- **Documentation Builds**: `docs/_build/**`, `docs/_site/**`, `site/**`, `_site/**`
- **Images**: `**/*.{jpg,jpeg,png,gif,svg,ico,webp,bmp,tiff,tif}`
- **Other Media**: `**/*.{mp3,mp4,wav,avi,mov,mkv,flv,m4a,m4v,wmv,webm}`
- **Binary and Compiled Files**: `**/*.{exe,dll,so,dylib,bin,obj,o,pyc,class}`
- **Archives**: `**/*.{zip,tar,gz,7z,rar,jar,war,ear}`

Note: CLI options take precedence over configuration file settings.

## Testing

This project uses [Vitest](httpshttps://vitest.dev/) for testing. To run the tests, use the following command:

```bash
bun run test # or npm
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT