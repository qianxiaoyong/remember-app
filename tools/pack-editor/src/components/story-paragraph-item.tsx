import type { StoryReadingContent } from '@remember/contracts';
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import type { ReactElement } from 'react';
import { useStoryAudio } from '../context/story-audio-context.js';
import { applyWordMarkAtSelection, runsToPlainText } from '../utils/story-runs-markup.js';
import { formatAudioTimeMs, formatSegmentDurationSeconds } from '../utils/format-audio-time.js';
import { StoryParagraphBodyEditor } from './story-paragraph-body-editor.js';
import { StoryParagraphPreview } from './story-paragraph-preview.js';
import { slugFromSelection, StoryParagraphVocab } from './story-paragraph-vocab.js';

interface StoryParagraphItemProps {
  paragraphIndex: number;
  paragraphCount: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  translationEnabled: boolean;
  contentIssues: { path: string; message: string }[];
  onRemove: () => void;
}

export function StoryParagraphItem({
  paragraphIndex,
  paragraphCount,
  register,
  control,
  setValue,
  translationEnabled,
  contentIssues,
  onRemove,
}: StoryParagraphItemProps): ReactElement {
  const audio = useStoryAudio();
  const sidebarFieldArray = useFieldArray({ control, name: 'sidebar' });
  const runs = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}.runs` as `story.paragraphs.${number}.runs`,
  });
  const sidebar = useWatch({ control, name: 'sidebar' });
  const paragraph = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}` as `story.paragraphs.${number}`,
  });

  const hasIssue = contentIssues.length > 0;
  const startMs = Number(paragraph.audioStartMs);
  const endMs = Number(paragraph.audioEndMs);
  const hasStartMs = Number.isFinite(startMs);
  const hasEndMs = Number.isFinite(endMs);
  const segmentDuration =
    hasStartMs && hasEndMs ? formatSegmentDurationSeconds(startMs, endMs) : null;
  const segmentSpanMs = hasStartMs && hasEndMs && endMs > startMs ? endMs - startMs : null;
  const isThisSegmentActive =
    segmentSpanMs !== null &&
    audio.segmentPreview?.startMs === startMs &&
    audio.segmentPreview?.endMs === endMs;
  const runsPath =
    `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>;

  function markSelection(input: {
    selectedText: string;
    selectionStart: number;
    selectionEnd: number;
  }): void {
    const headword = input.selectedText.trim();
    const existingEntry = sidebar.find(
      (entry) => entry.headword.toLowerCase() === headword.toLowerCase(),
    );
    let vocabId: string;
    let nextSidebar = sidebar;
    if (existingEntry) {
      vocabId = existingEntry.vocabId;
    } else {
      const baseId = slugFromSelection(headword) || 'word';
      vocabId = baseId;
      let suffix = 2;
      while (sidebar.some((entry) => entry.vocabId === vocabId)) {
        vocabId = `${baseId}-${String(suffix)}`;
        suffix += 1;
      }
      nextSidebar = [
        ...sidebar,
        {
          vocabId,
          headword,
          ipa: '',
          pos: '',
          definitionZh: '',
          tier: 'high' as const,
        },
      ];
      sidebarFieldArray.append({
        vocabId,
        headword,
        ipa: '',
        pos: '',
        definitionZh: '',
        tier: 'high',
      });
    }

    const plain = runsToPlainText(runs);
    const nextRuns = applyWordMarkAtSelection({
      runs,
      selectionStart: input.selectionStart,
      selectionEnd: input.selectionEnd,
      vocabId,
      sidebar: nextSidebar,
    });
    if (runsToPlainText(nextRuns) === plain && nextRuns === runs) {
      return;
    }
    setValue(runsPath, nextRuns, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div
      className="edit-story-paragraph-card"
      style={hasIssue ? { borderColor: 'var(--color-danger)' } : undefined}
    >
      <div className="edit-story-paragraph-header">
        <span className="edit-story-paragraph-title">
          段落 #{paragraphIndex + 1} / 共 {paragraphCount} 段
        </span>
        <div className="edit-story-paragraph-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={paragraphCount <= 1}
            onClick={onRemove}
          >
            删段
          </button>
        </div>
      </div>

      <div className="edit-story-paragraph-scroll">
        <div className="edit-story-block edit-story-block-preview">
          <div className="edit-story-block-title">预览</div>
          <StoryParagraphPreview runs={runs} />
        </div>

        <StoryParagraphBodyEditor
          paragraphIndex={paragraphIndex}
          runs={runs}
          sidebar={sidebar}
          setValue={setValue}
          onMarkSelection={markSelection}
        />

        {translationEnabled && (
          <div className="edit-story-block edit-story-block-translation">
            <label className="field-label field-label-compact">
              段译
              <textarea
                {...register(
                  `story.paragraphs.${String(paragraphIndex)}.translationZh` as FieldPath<StoryReadingContent>,
                )}
                className="input"
                rows={2}
              />
            </label>
          </div>
        )}

        <div className="edit-story-block edit-story-block-timeline">
          <div className="edit-story-block-title">本段时间轴</div>
          <div className="edit-paragraph-timeline">
            <span className="edit-paragraph-timeline-item">
              <span className="edit-paragraph-timeline-label">起点</span>
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
        </div>

        <StoryParagraphVocab
          paragraphIndex={paragraphIndex}
          register={register}
          control={control}
          setValue={setValue}
        />

        {contentIssues.map((issue) => (
          <p key={`${issue.path}:${issue.message}`} className="field-error">
            {issue.message}
          </p>
        ))}
      </div>
    </div>
  );
}
