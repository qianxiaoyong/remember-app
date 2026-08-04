import type { StoryParagraph, StoryReadingContent } from '@remember/contracts';
import {
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useEffect, useState, type ReactElement } from 'react';
import { useStoryAudio } from '../context/story-audio-context.js';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';
import { formatAudioTimeMs } from '../utils/format-audio-time.js';
import { StorySegmentTimeline } from './story-segment-timeline.js';
import { StoryLessonVocabDialog } from './story-lesson-vocab-dialog.js';
import { LexiconWorkbenchDialog } from './lexicon-workbench/lexicon-workbench-dialog.js';

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

/** 段 Tab 导航：始终按数组顺序均分，避免 ms 与段落顺序不一致时 Tab 错位。 */
export function buildParagraphNavTrack(paragraphs: StoryParagraph[]): SegmentTrackItem[] {
  if (paragraphs.length === 0) {
    return [];
  }
  const widthPct = 100 / paragraphs.length;
  return paragraphs.map((_paragraph, paragraphIndex) => ({
    paragraphIndex,
    leftPct: paragraphIndex * widthPct,
    widthPct,
    label: `段${String(paragraphIndex + 1)}`,
  }));
}

interface StoryTimelineEditorProps {
  control: Control<StoryReadingContent>;
  register: UseFormRegister<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  getValues: UseFormGetValues<StoryReadingContent>;
  selectedParagraphIndex: number;
  onSelectParagraph: (index: number) => void;
  translationEnabled: boolean;
  onToggleTranslation: (enabled: boolean) => void;
  onAddParagraph: () => void;
  contentIssues: { path: string; message: string }[];
}

export function StoryTimelineEditor({
  control,
  register,
  setValue,
  getValues,
  selectedParagraphIndex,
  onSelectParagraph,
  translationEnabled,
  onToggleTranslation,
  onAddParagraph,
  contentIssues,
}: StoryTimelineEditorProps): ReactElement {
  const audio = useStoryAudio();
  const paragraphs = useWatch({ control, name: 'story.paragraphs' });
  const watchedContent = useWatch({ control });

  const timelineIssues =
    watchedContent.lesson && watchedContent.story && watchedContent.sidebar
      ? collectStoryContentIssues(watchedContent as StoryReadingContent, {
          ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
        }).filter((issue) => issue.path.includes('audio'))
      : [];

  const track = buildParagraphNavTrack(paragraphs);
  const hasTimelineIssue = timelineIssues.length > 0;
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [sliderMs, setSliderMs] = useState(audio.currentMs);
  const [lessonVocabOpen, setLessonVocabOpen] = useState(false);
  const [lexiconWorkbenchOpen, setLexiconWorkbenchOpen] = useState(false);
  const storyContent = useWatch({ control }) as StoryReadingContent | undefined;
  const sliderMax = Math.max(audio.durationMs, 1);

  useEffect(() => {
    if (!isScrubbing && audio.segmentPreview === null) {
      setSliderMs(audio.currentMs);
    }
  }, [audio.currentMs, audio.segmentPreview, isScrubbing]);

  return (
    <div className="edit-story-audio-band card-panel">
      <div
        className="edit-timeline-track"
        style={hasTimelineIssue ? { outline: '1px solid var(--color-danger)' } : undefined}
      >
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

      <div className="edit-story-audio-controls-row">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!audio.audioUrl}
          onClick={() => {
            if (audio.isPlaying) {
              audio.togglePlayPause();
            } else {
              audio.togglePlayPause(sliderMs);
            }
          }}
        >
          {audio.isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <input
          type="range"
          className="edit-timeline-slider"
          min={0}
          max={sliderMax}
          step={1}
          value={Math.min(sliderMs, sliderMax)}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsScrubbing(true);
            audio.beginScrub();
            setSliderMs(audio.currentMs);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            const ms = Number.parseInt(event.currentTarget.value, 10);
            if (!Number.isNaN(ms)) {
              setSliderMs(ms);
              audio.endScrub(ms);
            } else {
              audio.endScrub(sliderMs);
            }
            setIsScrubbing(false);
          }}
          onPointerCancel={() => {
            audio.endScrub(sliderMs);
            setIsScrubbing(false);
          }}
          onInput={(event) => {
            const ms = Number.parseInt(event.currentTarget.value, 10);
            if (Number.isNaN(ms)) {
              return;
            }
            setSliderMs(ms);
            audio.scrubToMs(ms);
          }}
        />
        <span className="field-helper edit-timeline-time">
          {formatAudioTimeMs(sliderMs)} / {formatAudioTimeMs(audio.durationMs)}
        </span>
        <label className="edit-story-translation-toggle">
          <input
            type="checkbox"
            checked={translationEnabled}
            onChange={(event) => {
              onToggleTranslation(event.target.checked);
            }}
          />
          启用段译
        </label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onAddParagraph}>
          + 添加段落
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-story-lesson-vocab"
          onClick={() => {
            setLessonVocabOpen(true);
          }}
        >
          本课词频
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setLexiconWorkbenchOpen(true);
          }}
        >
          中心词库补词
        </button>
      </div>

      {storyContent && (
        <LexiconWorkbenchDialog
          mode="story"
          open={lexiconWorkbenchOpen}
          onClose={() => {
            setLexiconWorkbenchOpen(false);
          }}
          content={storyContent}
          onApply={(sidebar) => {
            setValue('sidebar', sidebar, { shouldDirty: true });
          }}
        />
      )}

      <StoryLessonVocabDialog
        open={lessonVocabOpen}
        onClose={() => {
          setLessonVocabOpen(false);
        }}
        register={register}
        control={control}
        setValue={setValue}
      />

      <StorySegmentTimeline
        paragraphIndex={selectedParagraphIndex}
        register={register}
        control={control}
        setValue={setValue}
        getValues={getValues}
      />

      {audio.loadError && <p className="field-error">{audio.loadError}</p>}

      {timelineIssues.map((issue) => (
        <p key={`${issue.path}:${issue.message}`} className="field-error">
          {issue.path}: {issue.message}
        </p>
      ))}

      {contentIssues.length > 0 && (
        <ul className="edit-story-issue-list">
          {contentIssues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`}>
              {issue.path}: {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
