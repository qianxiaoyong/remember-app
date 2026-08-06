import { describe, expect, it } from 'vitest';
import { resolveInitialRoutePath } from './resolve-initial-route-path';

describe('resolveInitialRoutePath', () => {
  it('冷启动一律进入我的知识库', () => {
    expect(resolveInitialRoutePath()).toBe('/library');
  });
});
