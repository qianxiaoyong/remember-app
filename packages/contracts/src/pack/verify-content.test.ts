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
  it('拒绝未知 cardType', () => {
    expect(() =>
      validatePackCards('remember-test-pack', [makeCard({ cardType: 'choice' })], manifestPaths),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_UNSUPPORTED_CARD_TYPE',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('接受 vocabulary 行并返回 packCardRowSchema 结果', () => {
    const cards = [makeCard()];
    const rows = validatePackCards('remember-test-pack', cards, manifestPaths);
    expect(rows).toHaveLength(cards.length);
    expect(rows[0]?.cardType).toBe('vocabulary');
  });

  it('拒绝例句中缺少 headword token 的 vocabulary 卡', () => {
    const badContent = JSON.stringify({
      prompt: {
        headword: 'picture',
        primaryAudio: 'assets/audio/picture.mp3',
      },
      reveal: {
        definitions: [{ text: '图片' }],
        examples: [{ en: 'She drew a cat.', zh: '她画了一只猫。' }],
      },
    });
    expect(() =>
      validatePackCards('remember-test-pack', [makeCard({ content: badContent })], manifestPaths),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('接受短语 headword 且例句含对应 token', () => {
    const phraseContent = JSON.stringify({
      prompt: {
        headword: 'take a picture',
        primaryAudio: 'assets/audio/picture.mp3',
      },
      reveal: {
        definitions: [{ text: '拍照' }],
        examples: [{ en: 'Can you take a picture of us?', zh: '能给我们拍张照吗？' }],
      },
    });
    const rows = validatePackCards(
      'remember-test-pack',
      [
        makeCard({
          knowledgeId: 'remember-test-pack:en:phrase:take-a-picture',
          content: phraseContent,
        }),
      ],
      manifestPaths,
    );
    const row = rows[0];
    expect(row?.cardType).toBe('vocabulary');
    if (row?.cardType !== 'vocabulary') {
      throw new Error('expected vocabulary card');
    }
    expect(row.content.prompt.headword).toBe('take a picture');
  });

  it('接受 story_reading 行', () => {
    const storyContent = JSON.stringify({
      lesson: {
        code: 'C1',
        titleEn: 'Test',
        titleZh: '测试',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: {
        paragraphs: [
          {
            runs: [
              {
                kind: 'word',
                surface: 'hi',
                glossZh: '嗨',
                tier: 'high',
                vocabId: 'hi',
              },
            ],
          },
        ],
      },
      sidebar: [
        {
          vocabId: 'hi',
          headword: 'hi',
          ipa: '/haɪ/',
          pos: 'int.',
          definitionZh: '嗨',
          tier: 'high',
        },
      ],
    });
    const storyManifest = new Set(['assets/images/c1.png', 'assets/audio/c1.mp3']);
    const rows = validatePackCards(
      'story-test-pack',
      [
        {
          knowledgeId: 'story-test-pack:story:c1',
          cardType: 'story_reading',
          sortOrder: 1,
          content: storyContent,
        },
      ],
      storyManifest,
    );
    expect(rows[0]?.cardType).toBe('story_reading');
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
