import type { StoryParagraph } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import { buildSegmentTrack } from './story-timeline-editor.js';

describe('buildSegmentTrack', () => {
  it('按 ms 比例返回段轨道数据', () => {
    const paragraphs: StoryParagraph[] = [
      { runs: [{ kind: 'text', text: 'A' }], audioStartMs: 0, audioEndMs: 5000 },
      { runs: [{ kind: 'text', text: 'B' }], audioStartMs: 5000, audioEndMs: 10000 },
    ];

    const track = buildSegmentTrack(paragraphs, 10000);
    expect(track).toEqual([
      { paragraphIndex: 0, leftPct: 0, widthPct: 50, label: '段1' },
      { paragraphIndex: 1, leftPct: 50, widthPct: 50, label: '段2' },
    ]);
  });

  it('无时间轴段落返回空轨道', () => {
    const paragraphs: StoryParagraph[] = [{ runs: [{ kind: 'text', text: 'A' }] }];
    expect(buildSegmentTrack(paragraphs, 10000)).toEqual([]);
  });
});
