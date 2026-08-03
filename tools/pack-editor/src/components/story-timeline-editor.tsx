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

  return paragraphs.flatMap((paragraph, index) => {
    if (paragraph.audioStartMs === undefined || paragraph.audioEndMs === undefined) {
      return [];
    }
    const span = paragraph.audioEndMs - paragraph.audioStartMs;
    if (span <= 0) {
      return [];
    }
    return [
      {
        leftPct: (paragraph.audioStartMs / durationMs) * 100,
        widthPct: (span / durationMs) * 100,
        label: `seg${String(index + 1)}`,
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
  const paragraphs = useWatch({ control, name: 'story.paragraphs' }) ?? [];
  const watchedContent = useWatch({ control });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timelineEnabled = paragraphs.some(
    (paragraph) =>
      paragraph?.audioStartMs !== undefined || paragraph?.audioEndMs !== undefined,
  );

  const timelineIssues = watchedContent
    ? collectStoryContentIssues(watchedContent as StoryReadingContent, {
        ...(durationMs > 0 ? { primaryAudioDurationMs: durationMs } : {}),
      }).filter((issue) => issue.path.includes('audio'))
    : [];

  const track = buildSegmentTrack(paragraphs as StoryParagraph[], durationMs);
  const primaryAudio = lesson?.primaryAudio?.trim() ?? '';
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
      const end = index === count - 1 ? durationMs || slice * (index + 1) : (index + 1) * slice;
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
    if (!audio || !paragraph?.audioStartMs || paragraph.audioEndMs === undefined) {
      return;
    }
    audio.currentTime = paragraph.audioStartMs / 1000;
    void audio.play();
    const endMs = paragraph.audioEndMs;
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
      </div>

      <label className="field-label" style={{ marginBottom: 'var(--space-2)' }}>
        <input
          type="checkbox"
          checked={timelineEnabled}
          onChange={(event) => {
            toggleTimeline(event.target.checked);
          }}
        />{' '}
        全段启用时间轴
      </label>

      {timelineEnabled && (
        <>
          <div className="card-panel" style={{ marginBottom: 'var(--space-3)' }}>
            <div className="edit-subsection-head">
              <span>音频</span>
              {audioUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
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
                  ▶ / ⏸
                </button>
              )}
            </div>
            {loadError && <p className="field-error">{loadError}</p>}
            {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
            <input
              type="range"
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
              style={{ width: '100%' }}
            />
            <p className="field-helper">
              {formatMs(currentMs)} / {formatMs(durationMs)}
            </p>
          </div>

          <div className="card-panel" style={{ marginBottom: 'var(--space-3)' }}>
            <div className="edit-subsection-head">
              <span>段轨道</span>
            </div>
            <div
              style={{
                position: 'relative',
                height: '2rem',
                background: 'var(--color-surface-muted, #eee)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {track.map((segment, index) => (
                <button
                  key={segment.label}
                  type="button"
                  title={segment.label}
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${String(segment.leftPct)}%`,
                    width: `${String(segment.widthPct)}%`,
                    top: 0,
                    bottom: 0,
                    border: 'none',
                    background:
                      index === selectedIndex
                        ? 'var(--color-primary, #2563eb)'
                        : 'var(--color-accent, #93c5fd)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {segment.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="card-panel"
            style={{
              marginBottom: 'var(--space-3)',
              ...(hasTimelineIssue ? { borderColor: 'var(--color-danger)' } : {}),
            }}
          >
            <div className="edit-subsection-head">
              <span>当前段 #{selectedIndex + 1}</span>
            </div>
            <div className="edit-inline-row">
              <label className="field-label">
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
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFromPlayback('audioStartMs')}>
                设为播放位置
              </button>
              <label className="field-label">
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
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFromPlayback('audioEndMs')}>
                设为播放位置
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={playSegment}>
                ▶ 播放本段
              </button>
            </div>
            {timelineIssues
              .filter((issue) => issue.path.startsWith(`story.paragraphs[${String(selectedIndex)}]`))
              .map((issue) => (
                <p key={`${issue.path}:${issue.message}`} className="field-error">
                  {issue.message}
                </p>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
