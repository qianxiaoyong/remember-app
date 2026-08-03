import type { StoryReadingContent } from '@remember/contracts';
import {
  useWatch,
  type Control,
  type FieldPath,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useEffect, type ReactElement } from 'react';
import { useStoryAudio } from '../context/story-audio-context.js';
import { useMiniConfirm } from '../hooks/use-mini-confirm.js';
import {
  applySegmentTimelineToParagraphs,
  canSetSegmentStart,
  clearSegmentTimelineFrom,
  recomputeSegmentTimeline,
} from '../utils/recompute-segment-timeline.js';
import { formatAudioTimeMs, formatSegmentDurationSeconds } from '../utils/format-audio-time.js';

interface StorySegmentTimelineProps {
  paragraphIndex: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  getValues: UseFormGetValues<StoryReadingContent>;
}

export function StorySegmentTimeline({
  paragraphIndex,
  register,
  control,
  setValue,
  getValues,
}: StorySegmentTimelineProps): ReactElement {
  const audio = useStoryAudio();
  const { askConfirm, miniConfirmDialog } = useMiniConfirm();
  const allParagraphs = useWatch({ control, name: 'story.paragraphs' });
  const paragraph = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}` as `story.paragraphs.${number}`,
  });

  const segmentLabel = `段${String(paragraphIndex + 1)}`;
  const startMs = Number(paragraph.audioStartMs);
  const endMs = Number(paragraph.audioEndMs);
  const hasStartMs = Number.isFinite(startMs);
  const hasEndMs = Number.isFinite(endMs);
  const segmentDuration =
    hasStartMs && hasEndMs ? formatSegmentDurationSeconds(startMs, endMs) : null;
  const segmentSpanMs = hasStartMs && hasEndMs && endMs > startMs ? endMs - startMs : null;
  const isThisSegmentActive =
    segmentSpanMs !== null &&
    audio.segmentPreview !== null &&
    audio.segmentPreview.startMs === startMs &&
    audio.segmentPreview.endMs === endMs;
  const canSetStart = canSetSegmentStart(paragraphIndex, allParagraphs);
  const canClearTimeline = hasStartMs;
  const startFieldPath =
    `story.paragraphs.${String(paragraphIndex)}.audioStartMs` as FieldPath<StoryReadingContent>;
  const startField = register(startFieldPath, { valueAsNumber: true });

  useEffect(() => {
    if (audio.durationMs <= 0) {
      return;
    }
    const paragraphs = getValues('story.paragraphs');
    const recomputed = recomputeSegmentTimeline(paragraphs, audio.durationMs);
    const changed = recomputed.some((item, index) => {
      const current = paragraphs[index];
      return item.audioStartMs !== current?.audioStartMs || item.audioEndMs !== current?.audioEndMs;
    });
    if (!changed) {
      return;
    }
    writeParagraphs(recomputed);
  }, [audio.durationMs, getValues, setValue]);

  function writeParagraphs(paragraphs: StoryReadingContent['story']['paragraphs']): void {
    for (let index = 0; index < paragraphs.length; index += 1) {
      const item = paragraphs[index];
      if (item === undefined) {
        continue;
      }
      setValue(`story.paragraphs.${String(index)}` as FieldPath<StoryReadingContent>, item, {
        shouldDirty: true,
      });
    }
  }

  function applyStartMs(startMsValue: number): void {
    const paragraphs = getValues('story.paragraphs');
    const updated = applySegmentTimelineToParagraphs({
      paragraphs,
      paragraphIndex,
      startMs: startMsValue,
      durationMs: audio.durationMs,
    });
    writeParagraphs(updated);
  }

  function clearTimeline(): void {
    const paragraphs = getValues('story.paragraphs');
    const updated = clearSegmentTimelineFrom(paragraphs, paragraphIndex, audio.durationMs);
    writeParagraphs(updated);
  }

  return (
    <>
      {miniConfirmDialog}
      <div className="edit-story-audio-segment-row">
      <span className="edit-paragraph-timeline-item">
        <span className="edit-paragraph-timeline-label">{segmentLabel}起点</span>
        <span className="edit-paragraph-timeline-value">
          {hasStartMs ? formatAudioTimeMs(startMs) : '--:--'}
        </span>
        <input
          type="number"
          className="input input-sm edit-paragraph-timeline-ms"
          placeholder="ms"
          title="毫秒"
          disabled={!canSetStart}
          {...startField}
          onBlur={(event) => {
            void startField.onBlur(event);
            const ms = Number.parseInt(event.target.value, 10);
            if (!Number.isFinite(ms) || !canSetStart) {
              return;
            }
            applyStartMs(ms);
          }}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!canSetStart}
          title={canSetStart ? undefined : '请按顺序从段1开始标起点，或先标前一段'}
          onClick={() => {
            const ms = audio.getPlaybackMs();
            if (ms !== null) {
              applyStartMs(ms);
            }
          }}
        >
          设为起点
        </button>
      </span>

      <span className="edit-paragraph-timeline-sep" aria-hidden="true">
        →
      </span>

      <span className="edit-paragraph-timeline-item">
        <span className="edit-paragraph-timeline-label">{segmentLabel}终点</span>
        <span className="edit-paragraph-timeline-value">
          {hasEndMs ? formatAudioTimeMs(endMs) : '--:--'}
        </span>
        <span className="edit-paragraph-timeline-ms-readonly">
          {hasEndMs ? String(Math.round(endMs)) : '—'}
        </span>
      </span>

      <span className="edit-paragraph-timeline-sep" aria-hidden="true">
        ·
      </span>

      <span className="edit-paragraph-timeline-item">
        <span className="edit-paragraph-timeline-label">时长</span>
        <span className="edit-paragraph-timeline-duration">{segmentDuration ?? '--'}</span>
      </span>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={segmentSpanMs === null}
        onClick={() => {
          if (hasStartMs && hasEndMs && endMs > startMs) {
            audio.toggleSegmentPreview(startMs, endMs);
          }
        }}
      >
        {isThisSegmentActive && audio.isPlaying ? '⏸ 暂停' : '▶ 试听本段'}
      </button>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={!canClearTimeline}
        title={
          canClearTimeline ? '清除本段及之后各段的时间轴，便于从本段起重新标定' : '本段尚未设置起点'
        }
        onClick={() => {
          askConfirm({
            message: '确定删除本段时间轴？本段及之后各段的时间轴将被清除。',
            confirmLabel: '删除',
            onConfirm: clearTimeline,
          });
        }}
      >
        删除本段时间轴
      </button>
    </div>
    </>
  );
}
