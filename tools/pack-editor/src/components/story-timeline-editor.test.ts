import type { StoryParagraph } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import { buildParagraphNavTrack, buildSegmentTrack } from './story-timeline-editor.js';

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

describe('buildParagraphNavTrack', () => {
  it('始终按数组顺序均分', () => {
    const paragraphs: StoryParagraph[] = [
      { runs: [{ kind: 'text', text: 'A' }] },
      { runs: [{ kind: 'text', text: 'B' }] },
      { runs: [{ kind: 'text', text: 'C' }] },
    ];
    expect(buildParagraphNavTrack(paragraphs)).toEqual([
      { paragraphIndex: 0, leftPct: 0, widthPct: 100 / 3, label: '段1' },
      { paragraphIndex: 1, leftPct: 100 / 3, widthPct: 100 / 3, label: '段2' },
      { paragraphIndex: 2, leftPct: (100 / 3) * 2, widthPct: 100 / 3, label: '段3' },
    ]);
  });

  it('有 ms 时也按数组顺序均分，不用比例轨道', () => {
    const paragraphs: StoryParagraph[] = [
      { runs: [{ kind: 'text', text: 'A' }], audioStartMs: 0, audioEndMs: 3000 },
      { runs: [{ kind: 'text', text: 'B' }], audioStartMs: 3000, audioEndMs: 10000 },
    ];
    expect(buildParagraphNavTrack(paragraphs)).toEqual([
      { paragraphIndex: 0, leftPct: 0, widthPct: 50, label: '段1' },
      { paragraphIndex: 1, leftPct: 50, widthPct: 50, label: '段2' },
    ]);
  });
});
