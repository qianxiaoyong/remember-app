import { describe, expect, it } from 'vitest';
import { resolveSourceDir } from './paths.js';

describe('resolveSourceDir', () => {
  it('拒绝路径逃逸 packId', () => {
    const result = resolveSourceDir('../../../etc/passwd');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it('接受合法 packId', () => {
    const result = resolveSourceDir('remember-test-pack');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.path).toMatch(/remember-test-pack$/);
    }
  });
});
