#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';
import { importEcdictBatch } from './import/import-ecdict-batch.js';

interface CliOptions {
  filePath: string;
  fileVersion: string;
  dryRun: boolean;
  limit?: number;
}

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) {
    return undefined;
  }
  return args[index + 1];
}

function parseCliOptions(args: string[]): CliOptions {
  const filePath = readFlagValue(args, '--file');
  if (!filePath) {
    throw new Error('缺少 --file <path>');
  }

  const limitText = readFlagValue(args, '--limit');
  const limit = limitText ? Number.parseInt(limitText, 10) : undefined;
  if (limitText && (limit === undefined || Number.isNaN(limit) || limit <= 0)) {
    throw new Error('--limit 必须是正整数');
  }

  const options: CliOptions = {
    filePath: resolve(filePath),
    fileVersion: readFlagValue(args, '--version') ?? 'unknown',
    dryRun: args.includes('--dry-run'),
  };
  if (limit !== undefined) {
    options.limit = limit;
  }
  return options;
}

async function runEcdictImport(args: string[]): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('未设置 DATABASE_URL（可从 apps/api/.env 加载）');
  }

  const options = parseCliOptions(args);
  const prisma = new PrismaClient();

  try {
    const result = await importEcdictBatch({
      prisma,
      filePath: options.filePath,
      fileVersion: options.fileVersion,
      dryRun: options.dryRun,
      ...(options.limit !== undefined ? { limit: options.limit } : {}),
    });

    if (result.alreadyCompleted) {
      process.stdout.write(
        `已导入过该文件（sha256=${result.fileSha256}）：` +
          `inserted=${String(result.insertedCount)} skipped=${String(result.skippedCount)} ` +
          `errors=${String(result.errorCount)}\n`,
      );
      return;
    }

    const mode = options.dryRun ? 'dry-run' : 'import';
    process.stdout.write(
      `${mode} 完成 batch=${result.batchId ?? 'none'} sha256=${result.fileSha256} ` +
        `inserted=${String(result.insertedCount)} skipped=${String(result.skippedCount)} ` +
        `errors=${String(result.errorCount)}\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  if (command === 'ecdict') {
    await runEcdictImport(rest);
    return;
  }

  throw new Error(
    '用法: remember-lexicon-import ecdict --file <ecdict.csv> [--version <label>] [--limit N] [--dry-run]',
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ECDICT_IMPORT_FAILED: ${message}`);
  process.exit(1);
});
