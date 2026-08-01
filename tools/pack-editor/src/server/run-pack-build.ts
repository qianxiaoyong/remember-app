import { spawn } from 'node:child_process';
import { getPackBuilderRoot } from './paths.js';

export function runPackBuild(
  packId: string,
  outputPath: string,
): Promise<{ stdout: string; stderr: string }> {
  const packBuilderRoot = getPackBuilderRoot();
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
      [
        'exec',
        'node',
        'dist/cli.js',
        'build',
        '--source',
        `source/${packId}`,
        '--output',
        outputPath,
      ],
      { cwd: packBuilderRoot, shell: process.platform === 'win32' },
    );

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(stderr || stdout || `build exited with code ${String(code)}`));
    });
  });
}
