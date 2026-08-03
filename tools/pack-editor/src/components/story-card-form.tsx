import { storyReadingContentSchema, type StoryReadingContent } from '@remember/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type RefObject,
} from 'react';
import { StoryAudioProvider } from '../context/story-audio-context.js';
import { normalizeStoryContent } from '../utils/normalize-story-content.js';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';
import { syncWordRunTiersFromSidebar } from '../utils/sync-word-run-tiers.js';
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
  checkRulesRef?: RefObject<(() => void) | null>;
}

function StoryCardFormBody({
  packId,
  defaultValues,
  onSubmit,
  checkRulesRef,
}: StoryCardFormProps): ReactElement {
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

  function collectIssuesFromForm(): ReturnType<typeof collectStoryContentIssues> {
    const synced = syncWordRunTiersFromSidebar(getValues());
    return collectStoryContentIssues(synced, {
      ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
    });
  }

  const refreshContentIssues = useCallback((): void => {
    const issues = collectIssuesFromForm();
    setContentIssues(issues);
    if (issues.length === 0) {
      setCheckToast('检查完成，未发现问题');
      window.setTimeout(() => {
        setCheckToast(null);
      }, 2000);
    }
  }, [audio.durationMs, getValues]);

  useEffect(() => {
    if (!checkRulesRef) {
      return undefined;
    }
    checkRulesRef.current = refreshContentIssues;
    return () => {
      checkRulesRef.current = null;
    };
  }, [checkRulesRef, refreshContentIssues]);

  function showFormValidationError(): void {
    setCheckToast('表单字段校验失败，请检查标红字段');
  }

  return (
    <>
      {checkToast && <Toast message={checkToast} variant="mini" />}
      <form
        id={STORY_CARD_FORM_ID}
        className="card-panel edit-form edit-story-form"
        onSubmit={(event) => {
          void handleSubmit(
            async (values) => {
              const synced = syncWordRunTiersFromSidebar(values);
              const issues = collectStoryContentIssues(synced, {
                ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
              });
              if (issues.length > 0) {
                setContentIssues(issues);
                setCheckToast('请先修复检查规则中的问题再保存');
                return;
              }
              setValue('story.paragraphs', synced.story.paragraphs, { shouldDirty: true });
              await onSubmit(
                normalizeStoryContent(synced, {
                  ...(audio.durationMs > 0 ? { primaryAudioDurationMs: audio.durationMs } : {}),
                }),
              );
            },
            () => {
              showFormValidationError();
            },
          )(event);
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
            onRunsSyncError={(message) => {
              setCheckToast(message);
            }}
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
