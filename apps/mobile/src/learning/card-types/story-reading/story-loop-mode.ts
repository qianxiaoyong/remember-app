import type { StoryReadingContent } from '@remember/contracts';
import { findActiveParagraphIndex, hasParagraphTimeline } from './story-follow-along';

export type StoryLoopMode = 'none' | 'paragraph' | 'lesson';

type StoryParagraph = StoryReadingContent['story']['paragraphs'][number];

const LOOP_END_THRESHOLD_MS = 120;

export function cycleStoryLoopMode(mode: StoryLoopMode): StoryLoopMode {
  if (mode === 'none') {
    return 'paragraph';
  }
  if (mode === 'paragraph') {
    return 'lesson';
  }
  return 'none';
}

export function storyLoopModeLabel(mode: StoryLoopMode): string {
  if (mode === 'paragraph') {
    return '段';
  }
  if (mode === 'lesson') {
    return '篇';
  }
  return '关';
}

export function storyLoopModeAccessibilityLabel(mode: StoryLoopMode): string {
  if (mode === 'paragraph') {
    return '循环模式：本段循环';
  }
  if (mode === 'lesson') {
    return '循环模式：本篇循环';
  }
  return '循环模式：不循环';
}

export function resolveLoopSeekMs(input: {
  mode: StoryLoopMode;
  positionMs: number;
  durationMs: number;
  paragraphs: StoryParagraph[];
}): number | null {
  if (input.mode === 'none') {
    return null;
  }

  if (input.mode === 'lesson') {
    if (input.durationMs <= 0) {
      return null;
    }
    if (input.positionMs >= input.durationMs - LOOP_END_THRESHOLD_MS) {
      return 0;
    }
    return null;
  }

  if (!hasParagraphTimeline(input.paragraphs)) {
    return null;
  }

  const activeIndex = findActiveParagraphIndex(input.paragraphs, input.positionMs);
  if (activeIndex === null) {
    return null;
  }

  const paragraph = input.paragraphs[activeIndex];
  if (paragraph?.audioEndMs === undefined || paragraph.audioStartMs === undefined) {
    return null;
  }

  if (input.positionMs >= paragraph.audioEndMs - LOOP_END_THRESHOLD_MS) {
    return paragraph.audioStartMs;
  }

  return null;
}
