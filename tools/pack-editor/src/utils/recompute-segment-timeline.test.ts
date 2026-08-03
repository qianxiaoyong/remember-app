import type { StoryParagraph } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import {
  applySegmentTimelineToParagraphs,
  canSetSegmentStart,
  clearSegmentTimelineFrom,
  countContiguousStartedParagraphs,
  recomputeSegmentTimeline,
} from './recompute-segment-timeline.js';

function paragraph(start?: number, end?: number): StoryParagraph {
  const base: StoryParagraph = { runs: [{ kind: 'text', text: 'x' }] };
  if (start !== undefined && end !== undefined) {
    base.audioStartMs = start;
    base.audioEndMs = end;
  }
  return base;
}

describe('recomputeSegmentTimeline', () => {
  it('仅第一段有起点时终点为主音频时长', () => {
    const result = recomputeSegmentTimeline([paragraph(0, 999)], 137561);
    expect(result[0]?.audioStartMs).toBe(0);
    expect(result[0]?.audioEndMs).toBe(137561);
  });

  it('下一段有起点时本段终点等于下一段起点', () => {
    const result = recomputeSegmentTimeline([paragraph(0, 999), paragraph(9826, 20000)], 137561);
    expect(result[0]?.audioEndMs).toBe(9826);
    expect(result[1]?.audioEndMs).toBe(137561);
  });

  it('未设起点的段不参与时间轴', () => {
    const result = recomputeSegmentTimeline(
      [paragraph(0, 9826), paragraph(undefined, undefined)],
      137561,
    );
    expect(result[0]?.audioEndMs).toBe(137561);
    expect(result[1]?.audioStartMs).toBeUndefined();
    expect(result[1]?.audioEndMs).toBeUndefined();
  });

  it('跳段标起点会被清除', () => {
    const result = recomputeSegmentTimeline(
      [paragraph(0, 9826), paragraph(undefined, undefined), paragraph(18273, 30000)],
      137561,
    );
    expect(result[2]?.audioStartMs).toBeUndefined();
  });

  it('applySegmentTimelineToParagraphs 设置新起点并重算', () => {
    const paragraphs = [paragraph(0, 9826), paragraph(undefined, undefined)];
    const result = applySegmentTimelineToParagraphs({
      paragraphs,
      paragraphIndex: 1,
      startMs: 9826,
      durationMs: 137561,
    });
    expect(result[0]?.audioEndMs).toBe(9826);
    expect(result[1]?.audioStartMs).toBe(9826);
    expect(result[1]?.audioEndMs).toBe(137561);
  });

  it('clearSegmentTimelineFrom 清除本段及之后并重算前段终点', () => {
    const paragraphs = [paragraph(0, 5000), paragraph(5000, 10000), paragraph(10000, 137561)];
    const result = clearSegmentTimelineFrom(paragraphs, 1, 137561);
    expect(result[0]?.audioStartMs).toBe(0);
    expect(result[0]?.audioEndMs).toBe(137561);
    expect(result[1]?.audioStartMs).toBeUndefined();
    expect(result[2]?.audioStartMs).toBeUndefined();
  });

  it('clearSegmentTimelineFrom 只清除末段', () => {
    const paragraphs = [paragraph(0, 9826), paragraph(9826, 137561)];
    const result = clearSegmentTimelineFrom(paragraphs, 1, 137561);
    expect(result[0]?.audioEndMs).toBe(137561);
    expect(result[1]?.audioStartMs).toBeUndefined();
  });
});

describe('canSetSegmentStart', () => {
  it('只允许按顺序标起点', () => {
    const paragraphs = [paragraph(0, 1000), paragraph(undefined, undefined)];
    expect(canSetSegmentStart(0, paragraphs)).toBe(true);
    expect(canSetSegmentStart(1, paragraphs)).toBe(true);
    expect(canSetSegmentStart(2, paragraphs)).toBe(false);
    expect(countContiguousStartedParagraphs(paragraphs)).toBe(1);
  });
});
