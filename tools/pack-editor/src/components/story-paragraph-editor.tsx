import type { StoryReadingContent } from '@remember/contracts';
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useMemo, useState, type ReactElement } from 'react';
import type { StoryTimelineAudio } from '../hooks/use-story-timeline-audio.js';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';
import { StoryParagraphItem } from './story-paragraph-item.js';

interface StoryParagraphEditorProps {
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  selectedParagraphIndex: number;
  onSelectParagraph: (index: number) => void;
  timelineEnabled: boolean;
  audio: StoryTimelineAudio;
}

export function StoryParagraphEditor({
  register,
  control,
  setValue,
  selectedParagraphIndex,
  onSelectParagraph,
  timelineEnabled,
  audio,
}: StoryParagraphEditorProps): ReactElement {
  const paragraphs = useFieldArray({ control, name: 'story.paragraphs' });
  const watchedContent = useWatch({ control });
  const [contentIssues, setContentIssues] = useState<{ path: string; message: string }[]>([]);

  const translationEnabled = useMemo(() => {
    const items = watchedContent.story?.paragraphs ?? [];
    return items.some((paragraph) => paragraph.translationZh !== undefined);
  }, [watchedContent]);

  const sidebarOptions = (watchedContent.sidebar ?? []) as StoryReadingContent['sidebar'];

  function toggleTranslation(enabled: boolean): void {
    for (let index = 0; index < paragraphs.fields.length; index += 1) {
      const path =
        `story.paragraphs.${String(index)}.translationZh` as FieldPath<StoryReadingContent>;
      if (enabled) {
        setValue(path, '', { shouldDirty: true });
      } else {
        setValue(path, undefined, { shouldDirty: true });
      }
    }
  }

  function refreshContentIssues(): void {
    if (!watchedContent.lesson || !watchedContent.story || !watchedContent.sidebar) {
      return;
    }
    setContentIssues(
      collectStoryContentIssues(watchedContent as StoryReadingContent, {
        ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
      }),
    );
  }

  return (
    <div className="edit-subsection">
      <div className="edit-subsection-head">
        <span className="edit-subsection-title">Story · 段落</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            paragraphs.append({ runs: [{ kind: 'text', text: '' }] });
          }}
        >
          + 添加段落
        </button>
      </div>

      <p className="field-helper edit-story-section-hint">
        每段一张卡片：上方预览 App 上色效果，下方用标记编辑正文（默认）；选中文字可快速插入
        [[vocabId]]。段译与时间轴起止在本卡内编辑。
      </p>

      <label className="field-label edit-story-translation-toggle">
        <input
          type="checkbox"
          checked={translationEnabled}
          onChange={(event) => {
            toggleTranslation(event.target.checked);
          }}
        />{' '}
        启用段下翻译（全段必须有 translationZh）
      </label>

      {paragraphs.fields.map((field, paragraphIndex) => (
        <StoryParagraphItem
          key={field.id}
          paragraphIndex={paragraphIndex}
          paragraphCount={paragraphs.fields.length}
          register={register}
          control={control}
          setValue={setValue}
          sidebarOptions={sidebarOptions}
          translationEnabled={translationEnabled}
          timelineEnabled={timelineEnabled}
          selected={paragraphIndex === selectedParagraphIndex}
          onSelect={() => {
            onSelectParagraph(paragraphIndex);
          }}
          contentIssues={contentIssues.filter((issue) =>
            issue.path.startsWith(`story.paragraphs[${String(paragraphIndex)}]`),
          )}
          audio={audio}
          onMoveUp={() => {
            if (paragraphIndex > 0) {
              paragraphs.move(paragraphIndex, paragraphIndex - 1);
            }
          }}
          onMoveDown={() => {
            if (paragraphIndex < paragraphs.fields.length - 1) {
              paragraphs.move(paragraphIndex, paragraphIndex + 1);
            }
          }}
          onRemove={() => {
            if (paragraphs.fields.length > 1) {
              paragraphs.remove(paragraphIndex);
            }
          }}
        />
      ))}

      <button type="button" className="btn btn-ghost btn-sm" onClick={refreshContentIssues}>
        检查交叉规则
      </button>
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
