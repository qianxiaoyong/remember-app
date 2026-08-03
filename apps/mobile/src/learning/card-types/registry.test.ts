import { describe, expect, it, vi } from 'vitest';

vi.mock('./vocabulary/parse-content.js', () => ({
  VocabularyCardRenderer: () => null,
}));

vi.mock('./story-reading/parse-content.js', () => ({
  StoryReadingCardRenderer: () => null,
}));

import { resolveCardTypeDefinition } from './registry.js';

describe('cardTypeRegistry', () => {
  it('vocabulary 已注册且 reviewMode 为 sm2', () => {
    const def = resolveCardTypeDefinition('vocabulary');
    expect(def?.reviewMode).toBe('sm2');
  });

  it('story_reading 已注册且 reviewMode 为 none', () => {
    const def = resolveCardTypeDefinition('story_reading');
    expect(def?.reviewMode).toBe('none');
    expect(def?.libraryPresentation).toBe('reader');
  });

  it('未知 type 返回 null', () => {
    expect(resolveCardTypeDefinition('choice')).toBeNull();
  });
});
