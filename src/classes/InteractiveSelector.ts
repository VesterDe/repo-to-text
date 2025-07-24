import { spawn, spawnSync } from 'child_process';
import type { Options } from '../types';
import type { ConfigLoader } from './ConfigLoader';
import type { RepositoryScanner } from './RepositoryScanner';
import type { TextDumper } from './TextDumper';

export class InteractiveSelector {
  constructor(
    private configLoader: ConfigLoader,
    private repositoryScanner: RepositoryScanner,
    private textDumper: TextDumper
  ) {}

  private isFzfAvailable(): boolean {
    const result = spawnSync('command', ['-v', 'fzf']);
    return result.status === 0;
  }

  private runFzf(files: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const fzf = spawn('fzf', ['--multi', '--prompt', '> Select files with TAB/Shift-TAB. Press Enter to confirm. ']);
      let output = '';

      fzf.stdout.on('data', (data) => {
        output += data.toString();
      });

      fzf.stderr.on('data', (data) => {
        console.error(`fzf stderr: ${data}`);
      });

      fzf.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim().split('\n').filter(Boolean));
        } else if (code === 130) {
          // fzf exits with 130 when user exits with Ctrl-C
          resolve([]);
        }
        else {
          reject(new Error(`fzf process exited with code ${code}`));
        }
      });

      fzf.stdin.write(files.join('\n'));
      fzf.stdin.end();
    });
  }

  async selectFiles(options: Options): Promise<void> {
    if (!this.isFzfAvailable()) {
      console.error(
        'Error: The "fzf" command is not installed or not in your PATH.'
      );
      console.error('Please install it to use the interactive mode.');
      console.error('See: https://github.com/junegunn/fzf#installation');
      process.exit(1);
    }

    const config = this.configLoader.loadConfig(options.config);
    const files = await this.repositoryScanner.getFiles(
      config.include,
      config.exclude
    );

    try {
      const selectedFiles = await this.runFzf(files);

      if (selectedFiles.length > 0) {
        const outputPath = await this.textDumper.generateTextDump(
          options,
          selectedFiles
        );
        console.log(
          `✨ ${selectedFiles.length} files have been dumped to ${outputPath}`
        );
      } else {
        console.log('No files selected. Exiting.');
      }
    } catch (error) {
      console.error('An error occurred during interactive selection:', error);
      process.exit(1);
    }
  }
}
