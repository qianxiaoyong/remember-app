import { describe, expect, it, vi } from 'vitest';

vi.mock('./resolve-app-launch-target', () => ({
  resolveAppLaunchTarget: vi.fn(() => ({ kind: 'library' })),
}));

import { resolveAppLaunchTarget } from './resolve-app-launch-target';
import { resolveInitialRoutePath } from './resolve-initial-route-path';

describe('resolveInitialRoutePath', () => {
  it('无活跃任务时进入我的知识库', () => {
    vi.mocked(resolveAppLaunchTarget).mockReturnValue({ kind: 'library' });
    expect(resolveInitialRoutePath()).toBe('/library');
  });

  it('有 pending 任务时进入学习页', () => {
    vi.mocked(resolveAppLaunchTarget).mockReturnValue({
      kind: 'study',
      packId: 'remember-test-pack',
    });
    expect(resolveInitialRoutePath()).toBe('/study?packId=remember-test-pack');
  });
});
