import type { StoryParagraph } from '@remember/contracts';
import { useWatch, type Control, type FieldPath, type UseFormSetValue } from 'react-hook-form';
import type { ReactElement } from 'react';
import type { StoryReadingContent } from '@remember/contracts';
import type { StoryTimelineAudio } from '../hooks/use-story-timeline-audio.js';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';

export interface SegmentTrackItem {
  paragraphIndex: number;
  leftPct: number;
  widthPct: number;
  label: string;
}

export function buildSegmentTrack(
  paragraphs: StoryParagraph[],
  durationMs: number,
): SegmentTrackItem[] {
  if (durationMs <= 0) {
    return [];
  }

  return paragraphs.flatMap((paragraph, paragraphIndex) => {
    if (paragraph.audioStartMs === undefined || paragraph.audioEndMs === undefined) {
      return [];
    }
    const span = paragraph.audioEndMs - paragraph.audioStartMs;
    if (span <= 0) {
      return [];
    }
    return [
      {
        paragraphIndex,
        leftPct: (paragraph.audioStartMs / durationMs) * 100,
        widthPct: (span / durationMs) * 100,
        label: `段${String(paragraphIndex + 1)}`,
      },
    ];
  });
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface StoryTimelineEditorProps {
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  selectedParagraphIndex: number;
  onSelectParagraph: (index: number) => void;
  audio: StoryTimelineAudio;
}

export function StoryTimelineEditor({
  control,
  setValue,
  selectedParagraphIndex,
  onSelectParagraph,
  audio,
}: StoryTimelineEditorProps): ReactElement {
  const paragraphs = useWatch({ control, name: 'story.paragraphs' });
  const watchedContent = useWatch({ control });

  const timelineEnabled = paragraphs.some(
    (paragraph) => paragraph.audioStartMs !== undefined || paragraph.audioEndMs !== undefined,
  );

  const timelineIssues =
    watchedContent.lesson && watchedContent.story && watchedContent.sidebar
      ? collectStoryContentIssues(watchedContent as StoryReadingContent, {
          ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
        }).filter((issue) => issue.path.includes('audio'))
      : [];

  const track = buildSegmentTrack(paragraphs, audio.durationMs);
  const hasTimelineIssue = timelineIssues.length > 0;

  function toggleTimeline(enabled: boolean): void {
    if (!enabled) {
      for (let index = 0; index < paragraphs.length; index += 1) {
        setValue(
          `story.paragraphs.${String(index)}.audioStartMs` as FieldPath<StoryReadingContent>,
          undefined,
          { shouldDirty: true },
        );
        setValue(
          `story.paragraphs.${String(index)}.audioEndMs` as FieldPath<StoryReadingContent>,
          undefined,
          { shouldDirty: true },
        );
      }
      return;
    }

    const count = paragraphs.length;
    const slice = count > 0 && audio.durationMs > 0 ? Math.floor(audio.durationMs / count) : 5000;
    for (let index = 0; index < count; index += 1) {
      const start = index * slice;
      const end =
        index === count - 1
          ? audio.durationMs > 0
            ? audio.durationMs
            : slice * (index + 1)
          : (index + 1) * slice;
      setValue(
        `story.paragraphs.${String(index)}.audioStartMs` as FieldPath<StoryReadingContent>,
        start,
        { shouldDirty: true },
      );
      setValue(
        `story.paragraphs.${String(index)}.audioEndMs` as FieldPath<StoryReadingContent>,
        end,
        { shouldDirty: true },
      );
    }
  }

  return (
    <div className="edit-subsection">
      <div className="edit-subsection-head">
        <span className="edit-subsection-title">时间轴</span>
        <label className="edit-timeline-toggle">
          <input
            type="checkbox"
            checked={timelineEnabled}
            onChange={(event) => {
              toggleTimeline(event.target.checked);
            }}
          />
          启用段级跟读
        </label>
      </div>

      <p className="field-helper edit-story-section-hint">
        播放主音频 → 点轨道色块选中段落 → 在对应段落卡内设起点/终点 ms。
      </p>

      {timelineEnabled && (
        <div
          className="card-panel edit-timeline-panel"
          style={hasTimelineIssue ? { borderColor: 'var(--color-danger)' } : undefined}
        >
          <div className="edit-timeline-audio-row">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!audio.audioUrl}
              onClick={audio.togglePlayPause}
            >
              ▶ 播放
            </button>
            {audio.audioUrl && (
              <audio
                ref={audio.audioRef}
                src={audio.audioUrl}
                preload="metadata"
                className="sr-only"
              />
            )}
            <input
              type="range"
              className="edit-timeline-slider"
              min={0}
              max={audio.durationMs || 1}
              value={audio.currentMs}
              onChange={(event) => {
                audio.seekToMs(Number.parseInt(event.target.value, 10));
              }}
            />
            <span className="field-helper edit-timeline-time">
              {formatMs(audio.currentMs)} / {formatMs(audio.durationMs)}
            </span>
          </div>
          {audio.loadError && <p className="field-error">{audio.loadError}</p>}

          <div className="edit-timeline-track">
            {track.map((segment) => (
              <button
                key={`${segment.label}-${String(segment.paragraphIndex)}`}
                type="button"
                title={segment.label}
                onClick={() => {
                  onSelectParagraph(segment.paragraphIndex);
                }}
                className={
                  segment.paragraphIndex === selectedParagraphIndex
                    ? 'edit-timeline-segment is-active'
                    : 'edit-timeline-segment'
                }
                style={{
                  left: `${String(segment.leftPct)}%`,
                  width: `${String(segment.widthPct)}%`,
                }}
              >
                {segment.label}
              </button>
            ))}
          </div>

          <p className="field-helper">
            当前选中：段落 #{selectedParagraphIndex + 1}（起止 ms 在该段落卡内编辑）
          </p>

          {timelineIssues.map((issue) => (
            <p key={`${issue.path}:${issue.message}`} className="field-error">
              {issue.path}: {issue.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
