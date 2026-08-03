import { isStorySourceCard, readPackSource } from '@remember/pack-builder/pack-source';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getPackBuilderRoot } from './paths.js';
import { validateStorySourceCard } from './story-source-validation.js';

describe('validateStorySourceCard', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pack-editor-story-validation-'));
    const fixtureDir = join(getPackBuilderRoot(), 'source', 'story-test-pack');
    cpSync(fixtureDir, tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('拒绝 ../ 路径', () => {
    const card = readPackSource(tempDir).cards[0];
    if (!card || !isStorySourceCard(card)) {
      throw new Error('expected story card fixture');
    }
    const invalid = structuredClone(card);
    invalid.content.lesson.coverImage = '../etc/passwd';

    const issues = validateStorySourceCard(tempDir, invalid);
    expect(issues.some((issue) => issue.message.includes('illegal asset path'))).toBe(true);
  });

  it('拒绝非 assets/ 路径', () => {
    const card = readPackSource(tempDir).cards[0];
    if (!card || !isStorySourceCard(card)) {
      throw new Error('expected story card fixture');
    }
    const invalid = structuredClone(card);
    invalid.content.lesson.primaryAudio = 'evil.txt';

    const issues = validateStorySourceCard(tempDir, invalid);
    expect(issues.some((issue) => issue.message.includes('illegal asset path'))).toBe(true);
  });
});
