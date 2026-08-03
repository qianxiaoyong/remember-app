import type { StoryReadingContent } from '@remember/contracts';
import {
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import type { ReactElement } from 'react';
import type { StoryTimelineAudio } from '../hooks/use-story-timeline-audio.js';
import { StoryParagraphAdvancedRuns } from './story-paragraph-advanced-runs.js';
import { StoryParagraphMarkupEditor } from './story-paragraph-markup-editor.js';
import { StoryParagraphPreview } from './story-paragraph-preview.js';

interface StoryParagraphItemProps {
  paragraphIndex: number;
  paragraphCount: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  sidebarOptions: StoryReadingContent['sidebar'];
  translationEnabled: boolean;
  timelineEnabled: boolean;
  selected: boolean;
  onSelect: () => void;
  contentIssues: { path: string; message: string }[];
  audio: StoryTimelineAudio;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function StoryParagraphItem({
  paragraphIndex,
  paragraphCount,
  register,
  control,
  setValue,
  sidebarOptions,
  translationEnabled,
  timelineEnabled,
  selected,
  onSelect,
  contentIssues,
  audio,
  onMoveUp,
  onMoveDown,
  onRemove,
}: StoryParagraphItemProps): ReactElement {
  const runs = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}.runs` as `story.paragraphs.${number}.runs`,
  });
  const paragraph = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}` as `story.paragraphs.${number}`,
  });
  const hasIssue = contentIssues.length > 0;

  const startMs = paragraph.audioStartMs;
  const endMs = paragraph.audioEndMs;

  return (
    <div
      className={
        selected
          ? 'card-panel edit-story-paragraph-card is-selected'
          : 'card-panel edit-story-paragraph-card'
      }
      style={hasIssue ? { borderColor: 'var(--color-danger)' } : undefined}
      onClick={onSelect}
    >
      <div className="edit-subsection-head">
        <span className="edit-subsection-title">段落 #{paragraphIndex + 1}</span>
        <div className="edit-story-paragraph-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={paragraphIndex === 0}
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp();
            }}
          >
            ↑
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={paragraphIndex >= paragraphCount - 1}
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown();
            }}
          >
            ↓
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={paragraphCount <= 1}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          >
            删段
          </button>
        </div>
      </div>

      <StoryParagraphPreview runs={runs} />
      <StoryParagraphMarkupEditor
        paragraphIndex={paragraphIndex}
        runs={runs}
        sidebar={sidebarOptions}
        setValue={setValue}
      />

      {translationEnabled && (
        <label className="field-label field-label-compact">
          段译
          <textarea
            {...register(
              `story.paragraphs.${String(paragraphIndex)}.translationZh` as FieldPath<StoryReadingContent>,
            )}
            className="input"
            rows={2}
            onClick={(event) => {
              event.stopPropagation();
            }}
          />
        </label>
      )}

      {timelineEnabled && (
        <div
          className="edit-story-paragraph-timeline"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="edit-story-paragraph-timeline-title">本段时间轴</div>
          <div className="edit-timeline-ms-grid">
            <label className="field-label field-label-compact">
              起点 ms
              <input
                type="number"
                className="input input-sm"
                {...register(
                  `story.paragraphs.${String(paragraphIndex)}.audioStartMs` as FieldPath<StoryReadingContent>,
                  { valueAsNumber: true },
                )}
              />
            </label>
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
            <label className="field-label field-label-compact">
              终点 ms
              <input
                type="number"
                className="input input-sm"
                {...register(
                  `story.paragraphs.${String(paragraphIndex)}.audioEndMs` as FieldPath<StoryReadingContent>,
                  { valueAsNumber: true },
                )}
              />
            </label>
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
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={startMs === undefined || endMs === undefined}
              onClick={() => {
                if (startMs !== undefined && endMs !== undefined) {
                  audio.playSegment(startMs, endMs);
                }
              }}
            >
              ▶ 试听本段
            </button>
          </div>
        </div>
      )}

      <StoryParagraphAdvancedRuns
        paragraphIndex={paragraphIndex}
        register={register}
        control={control}
        setValue={setValue}
        sidebarOptions={sidebarOptions}
      />

      {contentIssues.map((issue) => (
        <p key={`${issue.path}:${issue.message}`} className="field-error">
          {issue.message}
        </p>
      ))}
    </div>
  );
}
