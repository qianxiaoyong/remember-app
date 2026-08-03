import type { StoryReadingContent } from '@remember/contracts';
import {
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import type { ReactElement } from 'react';
import { useStoryAudio } from '../context/story-audio-context.js';
import { formatAudioTimeMs, formatSegmentDurationSeconds } from '../utils/format-audio-time.js';

interface StorySegmentTimelineProps {
  paragraphIndex: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
}

export function StorySegmentTimeline({
  paragraphIndex,
  register,
  control,
  setValue,
}: StorySegmentTimelineProps): ReactElement {
  const audio = useStoryAudio();
  const paragraph = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}` as `story.paragraphs.${number}`,
  });

  const segmentLabel = `段${String(paragraphIndex + 1)}`;
  const startMs = Number(paragraph?.audioStartMs);
  const endMs = Number(paragraph?.audioEndMs);
  const hasStartMs = Number.isFinite(startMs);
  const hasEndMs = Number.isFinite(endMs);
  const segmentDuration =
    hasStartMs && hasEndMs ? formatSegmentDurationSeconds(startMs, endMs) : null;
  const segmentSpanMs = hasStartMs && hasEndMs && endMs > startMs ? endMs - startMs : null;
  const isThisSegmentActive =
    segmentSpanMs !== null &&
    audio.segmentPreview?.startMs === startMs &&
    audio.segmentPreview?.endMs === endMs;

  return (
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
          {...register(
            `story.paragraphs.${String(paragraphIndex)}.audioStartMs` as FieldPath<StoryReadingContent>,
            { valueAsNumber: true },
          )}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            const ms = audio.getPlaybackMs();
            if (ms !== null) {
              setValue(
                `story.paragraphs.${String(paragraphIndex)}.audioStartMs` as FieldPath<StoryReadingContent>,
                ms,
                { shouldDirty: true },
              );
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
        <span className="edit-paragraph-timeline-label">终点</span>
        <span className="edit-paragraph-timeline-value">
          {hasEndMs ? formatAudioTimeMs(endMs) : '--:--'}
        </span>
        <input
          type="number"
          className="input input-sm edit-paragraph-timeline-ms"
          placeholder="ms"
          title="毫秒"
          {...register(
            `story.paragraphs.${String(paragraphIndex)}.audioEndMs` as FieldPath<StoryReadingContent>,
            { valueAsNumber: true },
          )}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            const ms = audio.getPlaybackMs();
            if (ms !== null) {
              setValue(
                `story.paragraphs.${String(paragraphIndex)}.audioEndMs` as FieldPath<StoryReadingContent>,
                ms,
                { shouldDirty: true },
              );
            }
          }}
        >
          设为终点
        </button>
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
    </div>
  );
}
