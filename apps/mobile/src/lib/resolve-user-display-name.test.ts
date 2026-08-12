import { describe, expect, it } from 'vitest';
import { resolveUserDisplayName } from './resolve-user-display-name';

describe('resolveUserDisplayName', () => {
  it('maps legacy guardian labels to 用户', () => {
    expect(resolveUserDisplayName('监护人')).toBe('用户');
    expect(resolveUserDisplayName('监护人账号')).toBe('用户');
    expect(resolveUserDisplayName(undefined)).toBe('用户');
  });

  it('keeps custom names', () => {
    expect(resolveUserDisplayName('小明爸爸')).toBe('小明爸爸');
  });
});
