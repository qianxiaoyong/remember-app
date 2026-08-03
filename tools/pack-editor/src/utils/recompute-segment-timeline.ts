import type { StoryParagraph } from '@remember/contracts';

export function countContiguousStartedParagraphs(paragraphs: StoryParagraph[]): number {
  let count = 0;
  for (const paragraph of paragraphs) {
    if (paragraph.audioStartMs === undefined || !Number.isFinite(paragraph.audioStartMs)) {
      break;
    }
    count += 1;
  }
  return count;
}

/** 下一段应标起点的段落索引；全部已标完则返回 null。 */
export function nextSegmentStartIndex(paragraphs: StoryParagraph[]): number | null {
  const count = countContiguousStartedParagraphs(paragraphs);
  if (count >= paragraphs.length) {
    return null;
  }
  return count;
}

export function canSetSegmentStart(paragraphIndex: number, paragraphs: StoryParagraph[]): boolean {
  const contiguous = countContiguousStartedParagraphs(paragraphs);
  return paragraphIndex <= contiguous;
}

export function recomputeSegmentTimeline(
  paragraphs: StoryParagraph[],
  durationMs: number,
): StoryParagraph[] {
  const contiguous = countContiguousStartedParagraphs(paragraphs);

  return paragraphs.map((paragraph, index) => {
    if (index >= contiguous) {
      return stripTimeline(paragraph);
    }

    const start = paragraph.audioStartMs;
    if (start === undefined || !Number.isFinite(start)) {
      return stripTimeline(paragraph);
    }

    const clampedStart = Math.max(0, Math.round(start));

    let nextStart: number | undefined;
    if (index + 1 < contiguous) {
      const candidate = paragraphs[index + 1]?.audioStartMs;
      if (candidate !== undefined && Number.isFinite(candidate)) {
        nextStart = candidate;
      }
    }

    let endMs: number;
    if (nextStart !== undefined) {
      endMs = Math.round(nextStart);
    } else if (durationMs > 0) {
      endMs = durationMs;
    } else if (
      paragraph.audioEndMs !== undefined &&
      Number.isFinite(paragraph.audioEndMs) &&
      paragraph.audioEndMs > clampedStart
    ) {
      endMs = Math.round(paragraph.audioEndMs);
    } else {
      endMs = clampedStart + 1;
    }

    endMs = Math.max(endMs, clampedStart + 1);

    return {
      ...paragraph,
      audioStartMs: clampedStart,
      audioEndMs: endMs,
    };
  });
}

function stripTimeline(paragraph: StoryParagraph): StoryParagraph {
  const next: StoryParagraph = { runs: paragraph.runs };
  if (paragraph.translationZh !== undefined) {
    next.translationZh = paragraph.translationZh;
  }
  return next;
}

export function applySegmentTimelineToParagraphs(
  paragraphs: StoryParagraph[],
  paragraphIndex: number,
  startMs: number,
  durationMs: number,
): StoryParagraph[] {
  const updated = paragraphs.map((paragraph, index) => {
    if (index !== paragraphIndex) {
      return paragraph;
    }
    return {
      ...paragraph,
      audioStartMs: Math.max(0, Math.round(startMs)),
    };
  });
  return recomputeSegmentTimeline(updated, durationMs);
}

/** 清除从 paragraphIndex 起（含）各段的时间轴，并重算此前各段终点。 */
export function clearSegmentTimelineFrom(
  paragraphs: StoryParagraph[],
  paragraphIndex: number,
  durationMs: number,
): StoryParagraph[] {
  const updated = paragraphs.map((paragraph, index) => {
    if (index < paragraphIndex) {
      return paragraph;
    }
    return stripTimeline(paragraph);
  });
  return recomputeSegmentTimeline(updated, durationMs);
}
