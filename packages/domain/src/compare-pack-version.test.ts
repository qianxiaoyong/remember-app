import { describe, expect, it } from 'vitest';
import { isPackVersionOlder } from './compare-pack-version.js';

describe('isPackVersionOlder', () => {
  it('detects patch bump', () => {
    expect(isPackVersionOlder('1.0.0', '1.0.1')).toBe(true);
  });

  it('detects minor bump', () => {
    expect(isPackVersionOlder('1.0.4', '1.1.0')).toBe(true);
  });

  it('returns false when equal', () => {
    expect(isPackVersionOlder('1.0.0', '1.0.0')).toBe(false);
  });

  it('returns false when installed is newer', () => {
    expect(isPackVersionOlder('2.0.0', '1.9.9')).toBe(false);
  });
});
