# Gemini Code Assistant Documentation

This document provides an overview of the `repo-to-text-watcher` repository for the Gemini Code Assistant.

## Repository Purpose

The `repo-to-text-watcher` is a command-line interface (CLI) tool designed to scan a repository or a folder and consolidate the contents of its files into a single, annotated text file. This is particularly useful for providing the context of a private codebase to a Large Language Model (LLM).

It uses Bun instead of npm.

The tool offers several key features:

*   **File Aggregation**: It combines multiple files into one text file, with clear headers indicating the original file path.
*   **Ignore Pattern Support**: It respects `.gitignore` files, allowing for the exclusion of irrelevant files and directories.
*   **Customizable Configuration**: Users can specify custom rules for including or excluding files using glob patterns.
*   **Watch Mode**: It can monitor the repository for any file changes and automatically regenerate the output file, ensuring the text dump is always up-to-date.
*   **Directory Tree Generation**: It can optionally generate a directory tree structure at the beginning of the output file, providing a clear overview of the repository's structure.
*   **Interactive Mode**: It can be run in an interactive mode, allowing the user to select which files and folders to include in the output.

## File Structure and Purpose

The project is structured into several classes, each with a distinct responsibility, to ensure a clean and maintainable codebase.

### Core Classes (`src/classes/`)

*   **`ConfigLoader.ts`**: This class is responsible for loading the configuration for the tool. It starts with a default configuration and merges it with any custom configuration provided by the user through a `repo-to-text.json` file or command-line arguments.

*   **`FileHandler.ts`**: This class acts as a wrapper around the Node.js `fs` module. It provides methods for reading, writing, and checking the existence of files. This abstraction simplifies file system interactions and allows for easier testing by mocking the file system.

*   **`RepositoryScanner.ts`**: This class is responsible for scanning the repository and identifying the files to be included in the output. It uses the `glob` library to match files against the include and exclude patterns defined in the configuration. It also uses the `ignore` library to filter out files listed in the `.gitignore` file.

*   **`ContentGenerator.ts`**: This class takes the list of files provided by the `RepositoryScanner` and generates the final text content. It reads the content of each file and formats it with a header that includes the file's path.

*   **`TreeGenerator.ts`**: This class generates a visual directory tree of the files that will be included in the output. This tree is included at the top of the output file to provide a structural overview of the repository.

*   **`TextDumper.ts`**: This class orchestrates the entire process of creating the text dump. It uses the other classes to load the configuration, scan for files, generate the directory tree and file content, and then write the final output to a file.

*   **`Watcher.ts`**: This class implements the watch mode functionality. It uses the `chokidar` library to monitor the files in the repository for changes. When a change is detected, it triggers the `TextDumper` to regenerate the output file. It also includes a debounce mechanism to prevent excessive updates in a short period.

*   **`InteractiveSelector.ts`**: This class is responsible for presenting an interactive interface to the user, allowing them to select which files and folders to include in the output. It uses native `fzf` to work, whihc must be present on the user's system.

### Entry Points and Types

*   **`src/cli.ts`**: This is the entry point for the command-line interface. It is responsible for parsing the command-line arguments and invoking the appropriate functions to either generate the text dump once or start the watch mode.

*   **`src/index.ts`**: This is the main entry point for the module. It exports the core functions and classes, allowing the tool to be used as a library in other projects. It also includes a factory function to create instances of all the core classes.

*   **`src/types.ts`**: This file defines the TypeScript types and interfaces used throughout the project, ensuring type safety and providing clear definitions for the data structures used.

### Utilities (`src/utils/`)

*   **`debounce.ts`**: This file contains a utility function for debouncing function calls. This is used in the `Watcher` class to prevent the output file from being regenerated too frequently when multiple file changes occur in rapid succession.

### Testing

The project uses `vitest` for running tests. Tests are located alongside the files they are testing, with a `.test.ts` extension. To run the tests, use the `bun test` command.
