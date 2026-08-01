import { vocabularyContentSchema } from '@remember/contracts';
import {
  listPackSourceDirs,
  readPackSource,
  writePackSource,
  type PackSourceCard,
} from '@remember/pack-builder/pack-source';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { getPackBuilderRoot, resolveSourceDir } from './paths.js';

interface ValidationIssue {
  sortOrder?: number;
  path: string;
  message: string;
}

interface BuildRequestBody {
  packVersion?: string;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
      continue;
    }
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    }
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

function validatePackSource(sourceDir: string): ValidationIssue[] {
  const source = readPackSource(sourceDir);
  const issues: ValidationIssue[] = [];

  for (const card of source.cards) {
    const parsed = vocabularyContentSchema.safeParse(card.content);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          sortOrder: card.sortOrder,
          path: issue.path.join('.'),
          message: issue.message,
        });
      }
    }

    const audioPath = card.content.prompt.primaryAudio;
    if (audioPath && !existsSync(join(sourceDir, audioPath))) {
      issues.push({
        sortOrder: card.sortOrder,
        path: 'prompt.primaryAudio',
        message: `资源不存在: ${audioPath}`,
      });
    }

    for (const [index, example] of card.content.reveal.examples.entries()) {
      if (example.audio && !existsSync(join(sourceDir, example.audio))) {
        issues.push({
          sortOrder: card.sortOrder,
          path: `reveal.examples[${String(index)}].audio`,
          message: `资源不存在: ${example.audio}`,
        });
      }
    }

    if (
      card.content.prompt.primaryImage &&
      !existsSync(join(sourceDir, card.content.prompt.primaryImage))
    ) {
      issues.push({
        sortOrder: card.sortOrder,
        path: 'prompt.primaryImage',
        message: `资源不存在: ${card.content.prompt.primaryImage}`,
      });
    }
  }

  return issues;
}

function runPackBuild(
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

function handleListPacks(res: ServerResponse): void {
  const packBuilderRoot = getPackBuilderRoot();
  const packIds = listPackSourceDirs(packBuilderRoot);
  const items = packIds.map((packId) => {
    const resolved = resolveSourceDir(packId);
    if (!resolved.ok) {
      return { packId, packVersion: '', cardCount: 0 };
    }
    const source = readPackSource(resolved.path);
    return {
      packId: source.meta.packId,
      packVersion: source.meta.packVersion,
      cardCount: source.cards.length,
    };
  });
  sendJson(res, 200, { items });
}

function handleGetSource(packId: string, res: ServerResponse): void {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }
  sendJson(res, 200, readPackSource(resolved.path));
}

interface SaveCardInput {
  packId: string;
  sortOrderText: string;
  req: IncomingMessage;
  res: ServerResponse;
}

async function handleSaveCard(input: SaveCardInput): Promise<void> {
  const { packId, sortOrderText, req, res } = input;
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  const sortOrder = Number.parseInt(sortOrderText, 10);
  if (Number.isNaN(sortOrder)) {
    sendJson(res, 400, { error: 'invalid sortOrder' });
    return;
  }

  const card = await readJsonBody<PackSourceCard>(req);
  if (card.sortOrder !== sortOrder) {
    sendJson(res, 400, { error: 'sortOrder mismatch' });
    return;
  }

  const parsed = vocabularyContentSchema.safeParse(card.content);
  if (!parsed.success) {
    sendJson(res, 400, {
      error: 'validation failed',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  const source = readPackSource(resolved.path);
  const index = source.cards.findIndex((item) => item.sortOrder === sortOrder);
  if (index < 0) {
    sendJson(res, 404, { error: 'card not found' });
    return;
  }

  source.cards[index] = card;
  writePackSource(resolved.path, source);
  sendJson(res, 200, { ok: true });
}

function handleValidate(packId: string, res: ServerResponse): void {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  const issues = validatePackSource(resolved.path);
  sendJson(res, 200, { ok: issues.length === 0, issues });
}

async function handleBuild(
  packId: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  const body = await readJsonBody<BuildRequestBody>(req);
  const source = readPackSource(resolved.path);
  if (body.packVersion) {
    source.meta.packVersion = body.packVersion;
    writePackSource(resolved.path, source);
  }

  const outputDir = join(getPackBuilderRoot(), 'output');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, `${packId}-${source.meta.packVersion}.zip`);

  try {
    const { stdout } = await runPackBuild(packId, outputPath);
    sendJson(res, 200, { ok: true, outputPath, log: stdout.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 500, { ok: false, error: message });
  }
}

async function handleLocalApi(
  req: IncomingMessage,
  res: ServerResponse,
  urlPath: string,
): Promise<void> {
  const pathname = urlPath.split('?')[0] ?? urlPath;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 2 && segments[0] === 'local-api' && segments[1] === 'packs') {
    if (req.method === 'GET') {
      handleListPacks(res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'source'
  ) {
    if (req.method === 'GET') {
      handleGetSource(segments[2] ?? '', res);
      return;
    }
  }

  if (
    segments.length === 5 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'cards'
  ) {
    if (req.method === 'PUT') {
      await handleSaveCard({
        packId: segments[2] ?? '',
        sortOrderText: segments[4] ?? '',
        req,
        res,
      });
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'validate'
  ) {
    if (req.method === 'POST') {
      handleValidate(segments[2] ?? '', res);
      return;
    }
  }

  if (
    segments.length === 4 &&
    segments[0] === 'local-api' &&
    segments[1] === 'packs' &&
    segments[3] === 'build'
  ) {
    if (req.method === 'POST') {
      await handleBuild(segments[2] ?? '', req, res);
      return;
    }
  }

  sendJson(res, 404, { error: 'not found' });
}

export function createLocalApiMiddleware(): (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith('/local-api/')) {
      next();
      return;
    }

    void handleLocalApi(req, res, url).catch((error: unknown) => {
      if (res.writableEnded) {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      sendJson(res, 500, { error: message });
    });
  };
}
