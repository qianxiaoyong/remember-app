import { describe, expect, it, vi } from 'vitest';

vi.mock('./vocabulary/parse-content.js', () => ({
  VocabularyCardRenderer: () => null,
}));

import { resolveCardTypeDefinition } from './registry.js';

describe('cardTypeRegistry', () => {
  it('vocabulary 已注册且 reviewMode 为 sm2', () => {
    const def = resolveCardTypeDefinition('vocabulary');
    expect(def?.reviewMode).toBe('sm2');
  });

  it('未知 type 返回 null', () => {
    expect(resolveCardTypeDefinition('story_reading')).toBeNull();
  });
});
