#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildPackArchive } from './build-pack.js';
import { verifyPackZipFile } from './verify-pack-file.js';
import { writeZip } from './zip-archive.js';

async function runBuild(args: string[]): Promise<void> {
  let sourceDir = 'source/remember-test-pack';
  let outputPath = 'fixtures/remember-test-pack.zip';

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--source') {
      sourceDir = args[index + 1] ?? sourceDir;
      index += 1;
    } else if (args[index] === '--output') {
      outputPath = args[index + 1] ?? outputPath;
      index += 1;
    }
  }

  const entries = await buildPackArchive(resolve(sourceDir));
  const zipBytes = writeZip(entries);
  writeFileSync(resolve(outputPath), zipBytes);
  process.stdout.write(`built ${outputPath}\n`);
}

async function runVerify(args: string[]): Promise<void> {
  const zipPath = args[0];
  if (!zipPath) {
    throw new Error('verify requires a zip path');
  }
  await verifyPackZipFile(resolve(zipPath));
  process.stdout.write(`verified ${zipPath}\n`);
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (command === 'build') {
    await runBuild(rest);
    return;
  }

  if (command === 'verify') {
    const zipArg = rest[0] === '--' ? rest[1] : rest[0];
    if (!zipArg) {
      throw new Error('verify requires a zip path');
    }
    await runVerify([zipArg]);
    return;
  }

  throw new Error('usage: remember-pack-builder <build|verify> ...');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error).code)
      : 'ERROR';
  console.error(`${code}: ${message}`);
  process.exit(1);
});
