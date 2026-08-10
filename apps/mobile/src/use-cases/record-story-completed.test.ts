import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('./resolve-content-pack-id', () => ({
  resolveContentPackId: vi.fn((packId: string) => packId),
}));

vi.mock('./insert-activity-event', () => ({
  insertActivityEvent: vi.fn(),
}));

import { insertActivityEvent } from './insert-activity-event';
import { recordStoryCompleted } from './record-story-completed';

describe('recordStoryCompleted', () => {
  it('writes story_completed with title and playback payload', () => {
    const now = new Date('2026-08-14T20:30:00+08:00');

    recordStoryCompleted({
      catalogPackId: 'story-test-pack',
      knowledgeId: 'story-test-pack:en:story:c1',
      titleZh: '第一篇',
      positionMs: 120_000,
      durationMs: 120_000,
      now,
    });

    expect(insertActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'story_completed',
        packId: 'story-test-pack',
        knowledgeId: 'story-test-pack:en:story:c1',
        displayLabel: '第一篇',
        localDate: '2026-08-14',
        payload: { positionMs: 120_000, durationMs: 120_000 },
      }),
    );
  });
});
