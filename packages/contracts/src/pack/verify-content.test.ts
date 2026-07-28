import { describe, expect, it } from 'vitest';
import { PackVerificationError } from './errors.js';
import {
  validateLexiconEntries,
  validatePackCards,
  type PackCardRecord,
  type PackLexiconRecord,
} from './verify-content.js';

const manifestPaths = new Set(['assets/audio/picture.mp3']);

const validCardContent = JSON.stringify({
  prompt: {
    headword: 'picture',
    primaryAudio: 'assets/audio/picture.mp3',
  },
  reveal: {
    definitions: [{ text: '图片' }],
    examples: [{ en: 'She drew a picture.', zh: '她画了一幅画。' }],
  },
});

function makeCard(overrides: Partial<PackCardRecord> = {}): PackCardRecord {
  return {
    knowledgeId: 'remember-test-pack:en:word:picture',
    cardType: 'vocabulary',
    sortOrder: 1,
    content: validCardContent,
    ...overrides,
  };
}

function makeLexicon(overrides: Partial<PackLexiconRecord> = {}): PackLexiconRecord {
  return {
    surfaceForm: 'picture',
    displayForm: 'picture',
    definitions: JSON.stringify([{ text: '图片' }]),
    ipa: null,
    formNote: null,
    audioUrl: null,
    ...overrides,
  };
}

describe('validatePackCards', () => {
  it('拒绝非 vocabulary 的 cardType', () => {
    expect(() =>
      validatePackCards(
        'remember-test-pack',
        [makeCard({ cardType: 'choice' })],
        manifestPaths,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('接受 vocabulary 行并返回 packCardRowSchema 结果', () => {
    const rows = validatePackCards(
      'remember-test-pack',
      [makeCard()],
      manifestPaths,
    );
    expect(rows[0]?.cardType).toBe('vocabulary');
  });
});

describe('validateLexiconEntries', () => {
  it('拒绝未规范化的 surfaceForm', () => {
    expect(() => validateLexiconEntries([makeLexicon({ surfaceForm: 'Picture' })])).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('拒绝 normalize 后为 null 的 surfaceForm', () => {
    expect(() => validateLexiconEntries([makeLexicon({ surfaceForm: '...' })])).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('接受已规范化的 surfaceForm', () => {
    const entries = validateLexiconEntries([makeLexicon()]);
    expect(entries[0]?.surfaceForm).toBe('picture');
  });
});
