import { storyReadingContentSchema } from '@remember/contracts';
import {
  isStorySourceCard,
  readPackSource,
  type PackSourceCard,
} from '@remember/pack-builder/pack-source';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCreateCard, handleSaveCard } from './local-api-handlers.js';
import * as paths from './paths.js';

function createJsonRequest(body: unknown): IncomingMessage {
  return Readable.from([JSON.stringify(body)]) as unknown as IncomingMessage;
}

function captureJsonResponse(): {
  res: ServerResponse;
  read: () => Promise<{ status: number; body: unknown }>;
} {
  let status = 200;
  let payload = '';

  const res = {
    get statusCode() {
      return status;
    },
    set statusCode(value: number) {
      status = value;
    },
    setHeader: vi.fn(),
    end: (data: string) => {
      payload = data;
    },
    writableEnded: false,
  } as unknown as ServerResponse;

  return {
    res,
    read: async () => ({
      status,
      body: JSON.parse(payload) as unknown,
    }),
  };
}

function writeMinimalPackSource(sourceDir: string, cards: PackSourceCard[]): void {
  writeFileSync(
    join(sourceDir, 'meta.json'),
    `${JSON.stringify({ packId: 'story-test-temp', packVersion: '1.0.0', keyId: 'test-v1' }, null, 2)}\n`,
  );
  writeFileSync(join(sourceDir, 'cards.json'), `${JSON.stringify(cards, null, 2)}\n`);
  writeFileSync(join(sourceDir, 'lexicon.json'), '[]\n');
}

describe('local-api story handlers', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pack-editor-story-'));
    vi.spyOn(paths, 'resolveSourceDir').mockReturnValue({ ok: true, path: tempDir });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('POST create story 返回模板', async () => {
    writeMinimalPackSource(tempDir, []);

    const { res, read } = captureJsonResponse();
    await handleCreateCard('story-test-temp', createJsonRequest({ cardType: 'story_reading' }), res);

    const { status, body } = await read();
    expect(status).toBe(201);
    const card = (body as { card: PackSourceCard }).card;
    expect(isStorySourceCard(card)).toBe(true);
    if (isStorySourceCard(card)) {
      expect(card.content.lesson.code).toBe('C1');
      expect(card.content.story.paragraphs).toHaveLength(1);
    }

    const source = readPackSource(tempDir);
    expect(source.cards).toHaveLength(1);
  });

  it('PUT save 合法 story 200', async () => {
    const initial = readPackSource(
      join(paths.getPackBuilderRoot(), 'source', 'story-test-pack'),
    ).cards[0];
    if (!initial || !isStorySourceCard(initial)) {
      throw new Error('expected story card fixture');
    }

    writeMinimalPackSource(tempDir, [initial]);
    const updated = structuredClone(initial);
    updated.content.lesson.titleZh = '测试标题';

    const { res, read } = captureJsonResponse();
    await handleSaveCard({
      packId: 'story-test-temp',
      sortOrderText: String(updated.sortOrder),
      req: createJsonRequest(updated),
      res,
    });

    const { status } = await read();
    expect(status).toBe(200);

    const saved = readPackSource(tempDir).cards[0];
    if (!saved || !isStorySourceCard(saved)) {
      throw new Error('expected saved story card');
    }
    expect(saved.content.lesson.titleZh).toBe('测试标题');
  });

  it('PUT save 非法 tier 400', async () => {
    const initial = readPackSource(
      join(paths.getPackBuilderRoot(), 'source', 'story-test-pack'),
    ).cards[0];
    if (!initial || !isStorySourceCard(initial)) {
      throw new Error('expected story card fixture');
    }

    writeMinimalPackSource(tempDir, [initial]);
    const invalid = structuredClone(initial) as PackSourceCard;
    if (!isStorySourceCard(invalid)) {
      throw new Error('expected story card');
    }
    invalid.content.sidebar[0] = {
      ...invalid.content.sidebar[0]!,
      tier: 'invalid-tier' as 'high',
    };

    const { res, read } = captureJsonResponse();
    await handleSaveCard({
      packId: 'story-test-temp',
      sortOrderText: String(invalid.sortOrder),
      req: createJsonRequest(invalid),
      res,
    });

    const { status, body } = await read();
    expect(status).toBe(400);
    expect(body).toMatchObject({ error: 'validation failed' });
    expect(storyReadingContentSchema.safeParse(invalid.content).success).toBe(false);
  });
});
