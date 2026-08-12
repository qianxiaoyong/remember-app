import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/learning-state-repository', () => ({
  listDueReviewPoolItems: vi.fn(() => [
    { knowledgeId: 'a:en:word:one', packId: 'a', firstAddedFromPackId: 'a' },
    { knowledgeId: 'b:en:word:two', packId: 'b', firstAddedFromPackId: 'b' },
  ]),
}));

vi.mock('../data/repositories/installed-pack-repository', () => ({
  listInstalledPacks: vi.fn(() => [{ packId: 'a' }]),
}));

vi.mock('./resolve-review-card-context', () => ({
  resolveReviewCardContext: vi.fn((knowledgeId: string) =>
    knowledgeId.startsWith('a:')
      ? { cardDetail: {}, sourcePackId: 'a', sourcePackDisplayName: 'A' }
      : null,
  ),
}));

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

import { listDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { countDueReviewItems } from './count-due-review-items';

describe('countDueReviewItems', () => {
  it('返回可复习的到期词数', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    expect(countDueReviewItems(now)).toBe(1);
    expect(listDueReviewPoolItems).toHaveBeenCalledWith(now, 'Asia/Shanghai');
  });
});
