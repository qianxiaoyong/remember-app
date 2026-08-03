import type { StoryReadingContent } from '@remember/contracts';
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFieldArrayReturn,
} from 'react-hook-form';
import type { ReactElement } from 'react';
import { StoryParagraphItem } from './story-paragraph-item.js';

interface StoryParagraphEditorProps {
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  selectedParagraphIndex: number;
  onSelectParagraph: (index: number) => void;
  translationEnabled: boolean;
  contentIssues: { path: string; message: string }[];
  onRunsSyncError?: ((message: string) => void) | undefined;
  paragraphs: UseFieldArrayReturn<StoryReadingContent, 'story.paragraphs'>;
}

export function StoryParagraphEditor({
  register,
  control,
  setValue,
  selectedParagraphIndex,
  onSelectParagraph,
  translationEnabled,
  contentIssues,
  onRunsSyncError,
  paragraphs,
}: StoryParagraphEditorProps): ReactElement {
  const activeIndex = Math.min(selectedParagraphIndex, Math.max(paragraphs.fields.length - 1, 0));
  const activeField = paragraphs.fields[activeIndex];

  return (
    <div className="edit-story-content">
      {activeField && (
        <StoryParagraphItem
          key={activeField.id}
          paragraphIndex={activeIndex}
          paragraphCount={paragraphs.fields.length}
          register={register}
          control={control}
          setValue={setValue}
          translationEnabled={translationEnabled}
          contentIssues={contentIssues.filter((issue) =>
            issue.path.startsWith(`story.paragraphs[${String(activeIndex)}]`),
          )}
          onRunsSyncError={onRunsSyncError}
          onRemove={() => {
            if (paragraphs.fields.length > 1) {
              paragraphs.remove(activeIndex);
              onSelectParagraph(Math.min(activeIndex, paragraphs.fields.length - 2));
            }
          }}
        />
      )}
    </div>
  );
}
