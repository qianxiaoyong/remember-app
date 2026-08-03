import { storyReadingContentSchema, vocabularyContentSchema } from '@remember/contracts';
import {
  isStorySourceCard,
  listPackSourceDirs,
  readPackSource,
  writePackSource,
  type PackSourceCard,
} from '@remember/pack-builder/pack-source';
import {
  createStoryCardTemplate,
  suggestNextLessonCode,
} from '../utils/story-card-template.js';
import { mkdirSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { readJsonBody, sendJson } from './json-response.js';
import { getPackBuilderRoot, resolveSourceDir } from './paths.js';
import { runPackBuild } from './run-pack-build.js';
import { validatePackSource } from './validate-pack-source.js';

interface BuildRequestBody {
  packVersion?: string;
}

export function handleListPacks(res: ServerResponse): void {
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

export function handleGetSource(packId: string, res: ServerResponse): void {
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

export async function handleSaveCard(input: SaveCardInput): Promise<void> {
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

  const parsed = isStorySourceCard(card)
    ? storyReadingContentSchema.safeParse(card.content)
    : vocabularyContentSchema.safeParse(card.content);
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

interface CreateCardBody {
  kind?: 'word' | 'phrase';
  cardType?: 'story_reading';
  lessonCode?: string;
}

export async function handleCreateCard(
  packId: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  const body = await readJsonBody<CreateCardBody>(req);
  const source = readPackSource(resolved.path);
  const maxSortOrder = source.cards.reduce((max, card) => Math.max(max, card.sortOrder), 0);

  let newCard: PackSourceCard;
  if (body.cardType === 'story_reading') {
    const existingCodes = source.cards
      .filter(isStorySourceCard)
      .map((card) => card.content.lesson.code);
    const lessonCode = body.lessonCode?.trim() || suggestNextLessonCode(existingCodes);
    newCard = createStoryCardTemplate({ sortOrder: maxSortOrder + 1, lessonCode });
  } else {
    const kind = body.kind === 'phrase' ? 'phrase' : 'word';
    newCard = {
      kind,
      sortOrder: maxSortOrder + 1,
      content: {
        prompt: {
          headword: 'new-word',
          primaryAudio: 'assets/audio/new-word.mp3',
        },
        reveal: {
          definitions: [{ text: '待填写' }],
          examples: [{ en: 'Example sentence.', zh: '例句。' }],
        },
      },
    };
  }

  source.cards.push(newCard);
  writePackSource(resolved.path, source);
  sendJson(res, 201, { card: newCard });
}

export function handleDeleteCard(packId: string, sortOrderText: string, res: ServerResponse): void {
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

  const source = readPackSource(resolved.path);
  const index = source.cards.findIndex((item) => item.sortOrder === sortOrder);
  if (index < 0) {
    sendJson(res, 404, { error: 'card not found' });
    return;
  }

  source.cards.splice(index, 1);
  writePackSource(resolved.path, source);
  sendJson(res, 200, { ok: true });
}

export function handleValidate(packId: string, res: ServerResponse): void {
  const resolved = resolveSourceDir(packId);
  if (!resolved.ok) {
    sendJson(res, resolved.status, { error: resolved.message });
    return;
  }

  const issues = validatePackSource(resolved.path);
  sendJson(res, 200, { ok: issues.length === 0, issues });
}

export async function handleBuild(
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
