import type { StoryParagraph } from '@remember/contracts';
import {
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { StoryReadingContent } from '@remember/contracts';
import { fetchAudioDurationMs, packAssetUrl } from '../api/local-api-client.js';
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
  packId: string;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
}

export function StoryTimelineEditor({
  packId,
  register,
  control,
  setValue,
}: StoryTimelineEditorProps): ReactElement {
  const lesson = useWatch({ control, name: 'lesson' });
  const paragraphs = useWatch({ control, name: 'story.paragraphs' });
  const watchedContent = useWatch({ control });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timelineEnabled = paragraphs.some(
    (paragraph) => paragraph.audioStartMs !== undefined || paragraph.audioEndMs !== undefined,
  );

  const timelineIssues =
    watchedContent.lesson && watchedContent.story && watchedContent.sidebar
      ? collectStoryContentIssues(watchedContent as StoryReadingContent, {
          ...(durationMs > 0 ? { primaryAudioDurationMs: durationMs } : {}),
        }).filter((issue) => issue.path.includes('audio'))
      : [];

  const track = buildSegmentTrack(paragraphs, durationMs);
  const primaryAudio = lesson.primaryAudio.trim();
  const audioUrl = primaryAudio ? packAssetUrl(packId, primaryAudio) : '';

  useEffect(() => {
    if (!primaryAudio) {
      setDurationMs(0);
      return;
    }
    let cancelled = false;
    void fetchAudioDurationMs(packId, primaryAudio)
      .then((value) => {
        if (!cancelled) {
          setDurationMs(value);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [packId, primaryAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onTimeUpdate = (): void => {
      setCurrentMs(Math.round(audio.currentTime * 1000));
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioUrl]);

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
    const slice = count > 0 && durationMs > 0 ? Math.floor(durationMs / count) : 5000;
    for (let index = 0; index < count; index += 1) {
      const start = index * slice;
      const end =
        index === count - 1
          ? durationMs > 0
            ? durationMs
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

  function setFromPlayback(field: 'audioStartMs' | 'audioEndMs'): void {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const ms = Math.round(audio.currentTime * 1000);
    setValue(
      `story.paragraphs.${String(selectedIndex)}.${field}` as FieldPath<StoryReadingContent>,
      ms,
      { shouldDirty: true },
    );
  }

  function playSegment(): void {
    const audio = audioRef.current;
    const paragraph = paragraphs[selectedIndex];
    const startMs = paragraph?.audioStartMs;
    const endMs = paragraph?.audioEndMs;
    if (!audio || startMs === undefined || endMs === undefined) {
      return;
    }
    audio.currentTime = startMs / 1000;
    void audio.play();
    const onTimeUpdate = (): void => {
      if (Math.round(audio.currentTime * 1000) >= endMs) {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
  }

  const hasTimelineIssue = timelineIssues.some((issue) =>
    issue.path.startsWith(`story.paragraphs[${String(selectedIndex)}]`),
  );

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
        为每段正文绑定音频起止时间（App 跟读高亮用）。流程：播放主音频 → 点下方色块选段 →
        拖动到位置后点「设为起点/终点」→ 保存。
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
              disabled={!audioUrl}
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) {
                  return;
                }
                if (audio.paused) {
                  void audio.play();
                } else {
                  audio.pause();
                }
              }}
            >
              ▶ 播放
            </button>
            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} preload="metadata" className="sr-only" />
            )}
            <input
              type="range"
              className="edit-timeline-slider"
              min={0}
              max={durationMs || 1}
              value={currentMs}
              onChange={(event) => {
                const audio = audioRef.current;
                const nextMs = Number.parseInt(event.target.value, 10);
                setCurrentMs(nextMs);
                if (audio) {
                  audio.currentTime = nextMs / 1000;
                }
              }}
            />
            <span className="field-helper edit-timeline-time">
              {formatMs(currentMs)} / {formatMs(durationMs)}
            </span>
          </div>
          {loadError && <p className="field-error">{loadError}</p>}

          <div className="edit-timeline-track">
            {track.map((segment) => (
              <button
                key={`${segment.label}-${String(segment.paragraphIndex)}`}
                type="button"
                title={segment.label}
                onClick={() => {
                  setSelectedIndex(segment.paragraphIndex);
                }}
                className={
                  segment.paragraphIndex === selectedIndex
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

          <div className="edit-timeline-current">
            <div className="edit-timeline-current-title">编辑段落 #{selectedIndex + 1}</div>
            <div className="edit-timeline-ms-grid">
              <label className="field-label field-label-compact">
                起点 ms
                <input
                  type="number"
                  className="input input-sm"
                  {...register(
                    `story.paragraphs.${String(selectedIndex)}.audioStartMs` as FieldPath<StoryReadingContent>,
                    { valueAsNumber: true },
                  )}
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFromPlayback('audioStartMs');
                }}
              >
                设为起点
              </button>
              <label className="field-label field-label-compact">
                终点 ms
                <input
                  type="number"
                  className="input input-sm"
                  {...register(
                    `story.paragraphs.${String(selectedIndex)}.audioEndMs` as FieldPath<StoryReadingContent>,
                    { valueAsNumber: true },
                  )}
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFromPlayback('audioEndMs');
                }}
              >
                设为终点
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={playSegment}>
                ▶ 试听本段
              </button>
            </div>
          </div>

          {timelineIssues
            .filter((issue) => issue.path.startsWith(`story.paragraphs[${String(selectedIndex)}]`))
            .map((issue) => (
              <p key={`${issue.path}:${issue.message}`} className="field-error">
                {issue.message}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
