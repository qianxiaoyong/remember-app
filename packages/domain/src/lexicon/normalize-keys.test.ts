import { describe, expect, it } from 'vitest';
import { normalizeFormKey, normalizeLemmaKey } from './normalize-keys.js';

describe('normalizeLemmaKey', () => {
  it('小写并 trim', () => {
    expect(normalizeLemmaKey('  Go  ')).toBe('go');
    expect(normalizeLemmaKey("Don't")).toBe("don't");
  });

  it('拒绝空串与非法字符', () => {
    expect(normalizeLemmaKey('')).toBeNull();
    expect(normalizeLemmaKey('   ')).toBeNull();
    expect(normalizeLemmaKey('hello world')).toBeNull();
    expect(normalizeLemmaKey('café')).toBeNull();
  });
});

describe('normalizeFormKey', () => {
  it('与 lemma key 规则一致', () => {
    expect(normalizeFormKey('Went.')).toBeNull();
    expect(normalizeFormKey('went')).toBe('went');
  });
});
