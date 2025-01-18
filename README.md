# repo-to-text-watcher

For when you want to throw your entire repo at an LLM, but it isn't public so you can't use public web app solutions.

This CLI tool dumps the contents of repository files into a single annotated text file. It respects `.gitignore` patterns and allows custom configuration for file inclusion/exclusion. Also has a watch mode.

Inspired by [https://github.com/kirill-markin/repo-to-text](https://github.com/kirill-markin/repo-to-text) and web based solutions.

## Installation

```bash
npm install -D repo-to-text
```

## Usage

Basic usage:
```bash
npx repo-to-text
```

Watch mode:
```bash
npx repo-to-text --watch
```

This will create a `repo-contents.txt` file with all repository contents and update it automatically when files change.

### Options

- `-o, --output <path>`: Specify output file path (default: "repo-contents.txt")
- `-c, --config <path>`: Specify a custom config file path
- `-w, --watch`: Watch for file changes and update output file automatically
- `-t, --no-tree`: Disable directory tree structure at the top of the output (enabled by default)
- `-v, --version`: Output the version number
- `-h, --help`: Display help information

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

Note: CLI options take precedence over configuration file settings.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT