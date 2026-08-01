import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { listPackSourceDirs, readPackSource, writePackSource } from './pack-source.js';

describe('pack-source', () => {
  it('writePackSource 后 readPackSource round-trip', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pack-source-'));
    writeFileSync(
      join(dir, 'meta.json'),
      JSON.stringify({ packId: 't', packVersion: '1.0.0', keyId: 'test-v1' }),
    );
    writeFileSync(join(dir, 'cards.json'), '[]');
    writeFileSync(join(dir, 'lexicon.json'), '[]');
    const source = readPackSource(dir);
    source.cards.push({
      kind: 'word',
      sortOrder: 1,
      content: {
        prompt: { headword: 'hi', primaryAudio: 'assets/a.mp3' },
        reveal: { definitions: [{ text: '嗨' }], examples: [{ en: 'Hi.', zh: '嗨。' }] },
      },
    });
    writePackSource(dir, source);
    const reread = readPackSource(dir);
    expect(reread.cards).toHaveLength(1);
    expect(readFileSync(join(dir, 'cards.json'), 'utf8')).toMatch(/\n$/);
    rmSync(dir, { recursive: true });
  });

  it('listPackSourceDirs 只返回含 meta.json 的子目录', () => {
    const root = mkdtempSync(join(tmpdir(), 'pack-list-'));
    const sourceRoot = join(root, 'source');
    mkdirSync(sourceRoot, { recursive: true });
    mkdirSync(join(sourceRoot, 'pack-a'));
    mkdirSync(join(sourceRoot, 'pack-b'));
    mkdirSync(join(sourceRoot, 'empty-dir'));
    writeFileSync(
      join(sourceRoot, 'pack-a', 'meta.json'),
      JSON.stringify({ packId: 'pack-a', packVersion: '1.0.0', keyId: 'test-v1' }),
    );
    writeFileSync(
      join(sourceRoot, 'pack-b', 'meta.json'),
      JSON.stringify({ packId: 'pack-b', packVersion: '1.0.0', keyId: 'test-v1' }),
    );
    expect(listPackSourceDirs(root)).toEqual(['pack-a', 'pack-b']);
    rmSync(root, { recursive: true });
  });
});
