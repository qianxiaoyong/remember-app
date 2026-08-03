import { describe, expect, it } from 'vitest';
import {
  orderParagraphVocabIds,
  prependParagraphVocabId,
  removeParagraphVocabId,
} from './story-paragraph-vocab-order.js';

describe('story-paragraph-vocab-order', () => {
  it('prependParagraphVocabId 将新词插到第一行', () => {
    expect(
      prependParagraphVocabId(['not', 'happy', 'marry'], 'wants', [
        'not',
        'happy',
        'wants',
        'marry',
      ]),
    ).toEqual(['wants', 'not', 'happy', 'marry']);
  });

  it('orderParagraphVocabIds 保留 displayOrder，改 tier 不重排', () => {
    expect(
      orderParagraphVocabIds(['wants', 'not', 'happy'], ['not', 'happy', 'wants', 'marry']),
    ).toEqual(['wants', 'not', 'happy', 'marry']);
  });

  it('removeParagraphVocabId 取消标记后移除', () => {
    expect(removeParagraphVocabId(['wants', 'not', 'happy'], 'wants')).toEqual(['not', 'happy']);
  });
});
