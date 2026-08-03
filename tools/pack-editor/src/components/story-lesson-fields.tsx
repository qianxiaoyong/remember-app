import { buildStoryKnowledgeId } from '@remember/contracts';
import { useWatch, type Control } from 'react-hook-form';
import type { ReactElement } from 'react';
import type { StoryReadingContent } from '@remember/contracts';

interface StoryLessonFieldsProps {
  packId: string;
  register: ReturnType<typeof import('react-hook-form').useForm<StoryReadingContent>>['register'];
  control: Control<StoryReadingContent>;
  errors: ReturnType<
    typeof import('react-hook-form').useForm<StoryReadingContent>
  >['formState']['errors'];
}

export function StoryLessonFields({
  packId,
  register,
  control,
  errors,
}: StoryLessonFieldsProps): ReactElement {
  const lessonCode = useWatch({ control, name: 'lesson.code' }) ?? '';
  let knowledgeIdPreview = '';
  try {
    knowledgeIdPreview = lessonCode.trim()
      ? buildStoryKnowledgeId(packId, lessonCode)
      : '（填写课号后生成）';
  } catch {
    knowledgeIdPreview = '（课号格式无效）';
  }

  return (
    <div className="edit-prompt-band">
      <div className="edit-phase-label">Lesson · 课程信息</div>
      <div className="edit-prompt-grid">
        <label className="field-label">
          课号 code
          <input {...register('lesson.code')} className="input input-sm" placeholder="C1" />
          {errors.lesson?.code && <ErrorText message={errors.lesson.code.message} />}
        </label>
        <label className="field-label">
          英文标题
          <input {...register('lesson.titleEn')} className="input input-sm" />
          {errors.lesson?.titleEn && <ErrorText message={errors.lesson.titleEn.message} />}
        </label>
        <label className="field-label">
          中文标题
          <input {...register('lesson.titleZh')} className="input input-sm" />
          {errors.lesson?.titleZh && <ErrorText message={errors.lesson.titleZh.message} />}
        </label>
        <label className="field-label">
          封面图
          <span className="field-helper">assets/images/…</span>
          <input {...register('lesson.coverImage')} className="input input-sm" />
          {errors.lesson?.coverImage && <ErrorText message={errors.lesson.coverImage.message} />}
        </label>
        <label className="field-label">
          主音频
          <span className="field-helper">assets/audio/…</span>
          <input {...register('lesson.primaryAudio')} className="input input-sm" />
          {errors.lesson?.primaryAudio && (
            <ErrorText message={errors.lesson.primaryAudio.message} />
          )}
        </label>
      </div>
      <p className="field-helper" style={{ marginTop: 'var(--space-2)' }}>
        knowledgeId（只读）：<code>{knowledgeIdPreview}</code>
      </p>
    </div>
  );
}

function ErrorText({ message }: { message: string | undefined }): ReactElement | null {
  if (!message) {
    return null;
  }
  return <span className="field-error">{message}</span>;
}
