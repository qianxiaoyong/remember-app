import { describe, expect, it } from 'vitest';
import {
  canJumpParagraph,
  findActiveParagraphIndex,
  getLastParagraphEndMs,
  hasParagraphTimeline,
  resolveParagraphJumpMs,
} from './story-follow-along.js';

const paragraphsWithTimeline = [
  { runs: [{ kind: 'text' as const, text: 'A' }], audioStartMs: 0, audioEndMs: 1000 },
  { runs: [{ kind: 'text' as const, text: 'B' }], audioStartMs: 1000, audioEndMs: 2500 },
  { runs: [{ kind: 'text' as const, text: 'C' }], audioStartMs: 2500, audioEndMs: 4000 },
];

describe('story-follow-along', () => {
  it('无时间轴时 hasParagraphTimeline 为 false', () => {
    expect(hasParagraphTimeline([{ runs: [{ kind: 'text', text: 'A' }] }])).toBe(false);
  });

  it('findActiveParagraphIndex 按 position 命中段', () => {
    expect(findActiveParagraphIndex(paragraphsWithTimeline, 500)).toBe(0);
    expect(findActiveParagraphIndex(paragraphsWithTimeline, 1000)).toBe(1);
    expect(findActiveParagraphIndex(paragraphsWithTimeline, 3999)).toBe(2);
  });

  it('播放到末尾时返回最后一段', () => {
    expect(findActiveParagraphIndex(paragraphsWithTimeline, 4000)).toBe(2);
    expect(findActiveParagraphIndex(paragraphsWithTimeline, 9999)).toBe(2);
  });

  it('getLastParagraphEndMs 返回最后 audioEndMs', () => {
    expect(getLastParagraphEndMs(paragraphsWithTimeline)).toBe(4000);
    expect(getLastParagraphEndMs([{ runs: [{ kind: 'text', text: 'A' }] }])).toBeNull();
  });

  it('resolveParagraphJumpMs 跳到相邻段起点', () => {
    expect(resolveParagraphJumpMs(paragraphsWithTimeline, 500, 'next')).toBe(1000);
    expect(resolveParagraphJumpMs(paragraphsWithTimeline, 1500, 'prev')).toBe(0);
    expect(resolveParagraphJumpMs(paragraphsWithTimeline, 3000, 'next')).toBe(2500);
  });

  it('canJumpParagraph 在首尾段边界禁用', () => {
    expect(canJumpParagraph(paragraphsWithTimeline, 500, 'prev')).toBe(false);
    expect(canJumpParagraph(paragraphsWithTimeline, 3000, 'next')).toBe(false);
    expect(canJumpParagraph(paragraphsWithTimeline, 1500, 'next')).toBe(true);
  });
});
