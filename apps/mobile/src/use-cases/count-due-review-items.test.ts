import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/learning-state-repository', () => ({
  countDueReviewPoolItems: vi.fn(() => 5),
}));

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

import { countDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { countDueReviewItems } from './count-due-review-items';

describe('countDueReviewItems', () => {
  it('返回到期复习词总数', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    expect(countDueReviewItems(now)).toBe(5);
    expect(countDueReviewPoolItems).toHaveBeenCalledWith(now, 'Asia/Shanghai');
  });
});
