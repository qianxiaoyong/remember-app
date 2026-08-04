import { buildStoryKnowledgeId } from '@remember/contracts';
import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import type { ReactElement } from 'react';
import type { StoryReadingContent } from '@remember/contracts';
import { TtsSynthesizeButton } from './tts-synthesize-button.js';
import { suggestLessonAudioPath } from '../utils/suggest-audio-path.js';

interface StoryLessonFieldsProps {
  packId: string;
  register: ReturnType<typeof import('react-hook-form').useForm<StoryReadingContent>>['register'];
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  errors: ReturnType<
    typeof import('react-hook-form').useForm<StoryReadingContent>
  >['formState']['errors'];
}

export function StoryLessonFields({
  packId,
  register,
  control,
  setValue,
  errors,
}: StoryLessonFieldsProps): ReactElement {
  const lessonCode = useWatch({ control, name: 'lesson.code' });
  const lessonTitleEn = useWatch({ control, name: 'lesson.titleEn' });
  const knowledgeIdPreview = (() => {
    const code = typeof lessonCode === 'string' ? lessonCode.trim() : '';
    if (!code) {
      return '（填写课号后生成）';
    }
    try {
      return buildStoryKnowledgeId(packId, code);
    } catch {
      return '（课号格式无效）';
    }
  })();

  return (
    <div className="edit-prompt-band edit-story-lesson-band">
      <div className="edit-story-lesson-head">
        <div className="edit-phase-label">Lesson · 课程信息</div>
        <p className="field-helper edit-story-knowledge-id">
          knowledgeId：<code>{knowledgeIdPreview}</code>
        </p>
      </div>
      <div className="edit-story-lesson-row">
        <label className="field-label field-label-compact">
          课号
          <input {...register('lesson.code')} className="input input-sm" placeholder="C1" />
          {errors.lesson?.code && <ErrorText message={errors.lesson.code.message} />}
        </label>
        <label className="field-label field-label-compact">
          英文标题
          <input {...register('lesson.titleEn')} className="input input-sm" />
          {errors.lesson?.titleEn && <ErrorText message={errors.lesson.titleEn.message} />}
        </label>
        <label className="field-label field-label-compact">
          中文标题
          <input {...register('lesson.titleZh')} className="input input-sm" />
          {errors.lesson?.titleZh && <ErrorText message={errors.lesson.titleZh.message} />}
        </label>
        <label className="field-label field-label-compact">
          封面图
          <input
            {...register('lesson.coverImage')}
            className="input input-sm"
            placeholder="assets/images/…"
          />
          {errors.lesson?.coverImage && <ErrorText message={errors.lesson.coverImage.message} />}
        </label>
        <label className="field-label field-label-compact">
          主音频
          <div className="edit-inline-row">
            <input
              {...register('lesson.primaryAudio')}
              className="input input-sm"
              placeholder="assets/audio/…"
            />
            <TtsSynthesizeButton
              packId={packId}
              text={lessonTitleEn}
              relativePath={suggestLessonAudioPath(
                typeof lessonCode === 'string' ? lessonCode : '',
              )}
              onPathGenerated={(path) => {
                setValue('lesson.primaryAudio', path, { shouldDirty: true });
              }}
            />
          </div>
          {errors.lesson?.primaryAudio && (
            <ErrorText message={errors.lesson.primaryAudio.message} />
          )}
        </label>
      </div>
    </div>
  );
}

function ErrorText({ message }: { message: string | undefined }): ReactElement | null {
  if (!message) {
    return null;
  }
  return <span className="field-error">{message}</span>;
}
