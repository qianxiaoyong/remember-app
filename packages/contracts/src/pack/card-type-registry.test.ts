import { describe, expect, it } from 'vitest';
import { PackVerificationError } from './errors.js';
import { parsePackCardContent } from './card-type-registry.js';

const validStoryJson = JSON.stringify({
  lesson: {
    code: 'C1',
    titleEn: 'The Princess and the Pea',
    titleZh: '公主与豌豆',
    coverImage: 'assets/images/c1.png',
    primaryAudio: 'assets/audio/c1.mp3',
  },
  story: {
    paragraphs: [
      {
        runs: [
          { kind: 'text', text: 'Hi ' },
          {
            kind: 'word',
            surface: 'there',
            glossZh: '那里',
            tier: 'low',
            vocabId: 'there',
          },
          { kind: 'text', text: '.' },
        ],
      },
    ],
  },
  sidebar: [
    {
      vocabId: 'there',
      headword: 'there',
      ipa: '/ðeə/',
      pos: 'adv.',
      definitionZh: '那里',
      tier: 'low',
    },
  ],
});

describe('parsePackCardContent', () => {
  it('vocabulary 合法 content 解析成功', () => {
    const json = JSON.stringify({
      prompt: { headword: 'hi', primaryAudio: 'assets/a.mp3' },
      reveal: { definitions: [{ text: '嗨' }], examples: [{ en: 'Hi.', zh: '嗨。' }] },
    });
    const result = parsePackCardContent('vocabulary', json);
    expect(result.cardType).toBe('vocabulary');
    expect(result.content.prompt.headword).toBe('hi');
  });

  it('story_reading 合法 content 解析成功', () => {
    const result = parsePackCardContent('story_reading', validStoryJson);
    expect(result.cardType).toBe('story_reading');
    expect(result.content.lesson.code).toBe('C1');
  });

  it('未知 cardType 抛 PACK_UNSUPPORTED_CARD_TYPE', () => {
    expect(() => parsePackCardContent('choice', '{}')).toThrow(
      expect.objectContaining({
        code: 'PACK_UNSUPPORTED_CARD_TYPE',
      } satisfies Partial<PackVerificationError>),
    );
  });
});
