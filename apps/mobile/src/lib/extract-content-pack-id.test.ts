import { describe, expect, it } from 'vitest';
import { extractContentPackIdFromKnowledgeId } from '../lib/extract-content-pack-id';

describe('extractContentPackIdFromKnowledgeId', () => {
  it('从 knowledgeId 提取 manifest packId', () => {
    expect(extractContentPackIdFromKnowledgeId('remember-test-pack:en:word:picture')).toBe(
      'remember-test-pack',
    );
  });

  it('无冒号时返回 null', () => {
    expect(extractContentPackIdFromKnowledgeId('invalid')).toBeNull();
  });
});
