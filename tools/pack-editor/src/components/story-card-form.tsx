import { storyReadingContentSchema, type StoryReadingContent } from '@remember/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { useMemo, useState, type ReactElement } from 'react';
import { StoryAudioProvider } from '../context/story-audio-context.js';
import { normalizeStoryContent } from '../utils/normalize-story-content.js';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';
import { StoryLessonFields } from './story-lesson-fields.js';
import { StoryParagraphEditor } from './story-paragraph-editor.js';
import { StoryTimelineEditor } from './story-timeline-editor.js';
import { Toast } from './toast.js';
import { useStoryAudio } from '../context/story-audio-context.js';

export const STORY_CARD_FORM_ID = 'story-card-form';

interface StoryCardFormProps {
  packId: string;
  defaultValues: StoryReadingContent;
  onSubmit: (content: StoryReadingContent) => Promise<void>;
}

function StoryCardFormBody({ packId, defaultValues, onSubmit }: StoryCardFormProps): ReactElement {
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState(0);
  const [contentIssues, setContentIssues] = useState<{ path: string; message: string }[]>([]);
  const [checkToast, setCheckToast] = useState<string | null>(null);
  const audio = useStoryAudio();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<StoryReadingContent>({
    resolver: zodResolver(storyReadingContentSchema),
    defaultValues,
  });

  const paragraphs = useFieldArray({ control, name: 'story.paragraphs' });
  const watchedContent = useWatch({ control });

  const translationEnabled = useMemo(() => {
    const items = watchedContent.story?.paragraphs ?? [];
    return items.some((paragraph) => paragraph.translationZh !== undefined);
  }, [watchedContent]);

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

  function selectParagraph(index: number): void {
    setSelectedParagraphIndex(index);
  }

  function refreshContentIssues(): void {
    const values = getValues();
    const issues = collectStoryContentIssues(values, {
      ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
    });
    setContentIssues(issues);
    if (issues.length === 0) {
      setCheckToast('检查完成，未发现问题');
      window.setTimeout(() => {
        setCheckToast(null);
      }, 2000);
    }
  }

  return (
    <>
      {checkToast && <Toast message={checkToast} variant="mini" />}
      <form
        id={STORY_CARD_FORM_ID}
        className="card-panel edit-form edit-story-form"
        onSubmit={(event) => {
          void handleSubmit(async (values) => {
            await onSubmit(
              normalizeStoryContent(values, {
                ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
              }),
            );
          })(event);
        }}
      >
        <StoryLessonFields packId={packId} register={register} control={control} errors={errors} />
        <div className="edit-reveal-body edit-story-body-stack">
          <StoryTimelineEditor
            control={control}
            register={register}
            setValue={setValue}
            getValues={getValues}
            selectedParagraphIndex={selectedParagraphIndex}
            onSelectParagraph={selectParagraph}
            translationEnabled={translationEnabled}
            onToggleTranslation={toggleTranslation}
            onAddParagraph={() => {
              paragraphs.append({ runs: [{ kind: 'text', text: ' ' }] });
              selectParagraph(paragraphs.fields.length);
            }}
            onCheckRules={refreshContentIssues}
            contentIssues={contentIssues}
          />
          <StoryParagraphEditor
            register={register}
            control={control}
            setValue={setValue}
            selectedParagraphIndex={selectedParagraphIndex}
            onSelectParagraph={selectParagraph}
            translationEnabled={translationEnabled}
            contentIssues={contentIssues}
            paragraphs={paragraphs}
          />
        </div>
      </form>
    </>
  );
}

export function StoryCardForm(props: StoryCardFormProps): ReactElement {
  const lesson = props.defaultValues.lesson;

  return (
    <StoryAudioProvider packId={props.packId} primaryAudio={lesson.primaryAudio}>
      <StoryCardFormBody {...props} />
    </StoryAudioProvider>
  );
}
