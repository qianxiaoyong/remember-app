import { describe, expect, it } from 'vitest';
import {
  clearRemoteCoverImageSourceCacheForTests,
  resolveRemoteCoverImageSource,
} from './catalog-cover-image-source-cache';

describe('resolveRemoteCoverImageSource', () => {
  it('returns the same object for the same uri', () => {
    clearRemoteCoverImageSourceCacheForTests();
    const first = resolveRemoteCoverImageSource('https://cdn.example.com/cover.jpg');
    const second = resolveRemoteCoverImageSource('https://cdn.example.com/cover.jpg');
    expect(first).toBe(second);
  });

  it('trims uri before caching', () => {
    clearRemoteCoverImageSourceCacheForTests();
    const first = resolveRemoteCoverImageSource('https://cdn.example.com/cover.jpg');
    const second = resolveRemoteCoverImageSource('  https://cdn.example.com/cover.jpg  ');
    expect(first).toBe(second);
  });
});
