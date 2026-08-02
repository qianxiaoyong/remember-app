import { describe, expect, it } from 'vitest';
import { PackVerificationError } from './errors.js';
import { parsePackCardContent } from './card-type-registry.js';

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

  it('未知 cardType 抛 PACK_UNSUPPORTED_CARD_TYPE', () => {
    expect(() => parsePackCardContent('story_reading', '{}')).toThrow(
      expect.objectContaining({
        code: 'PACK_UNSUPPORTED_CARD_TYPE',
      } satisfies Partial<PackVerificationError>),
    );
  });
});
