import { storyReadingContentSchema, type StoryReadingContent } from '@remember/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { ReactElement } from 'react';
import { normalizeStoryContent } from '../utils/normalize-story-content.js';
import { StoryLessonFields } from './story-lesson-fields.js';
import { StoryParagraphEditor } from './story-paragraph-editor.js';
import { StorySidebarEditor } from './story-sidebar-editor.js';

export const STORY_CARD_FORM_ID = 'story-card-form';

interface StoryCardFormProps {
  packId: string;
  defaultValues: StoryReadingContent;
  onSubmit: (content: StoryReadingContent) => Promise<void>;
}

export function StoryCardForm({
  packId,
  defaultValues,
  onSubmit,
}: StoryCardFormProps): ReactElement {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StoryReadingContent>({
    resolver: zodResolver(storyReadingContentSchema),
    defaultValues,
  });

  return (
    <form
      id={STORY_CARD_FORM_ID}
      className="card-panel edit-form"
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit(normalizeStoryContent(values));
        })(event);
      }}
    >
      <StoryLessonFields
        packId={packId}
        register={register}
        control={control}
        errors={errors}
      />
      <div className="edit-reveal-body">
        <StorySidebarEditor register={register} control={control} />
        <StoryParagraphEditor register={register} control={control} setValue={setValue} />
      </div>
    </form>
  );
}
