import { vocabularyContentSchema, type VocabularyContent } from '@remember/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import type { CSSProperties, ReactElement } from 'react';

interface VocabularyCardFormProps {
  defaultValues: VocabularyContent;
  onSubmit: (content: VocabularyContent) => Promise<void>;
}

const fieldLabels: Record<string, string> = {
  'prompt.headword': '单词/短语',
  'prompt.primaryAudio': '主音频路径',
  'prompt.phonetic.ipa': '音标 IPA',
  'prompt.phonetic.dialect': '口音',
  'prompt.primaryImage': '主图路径',
  'reveal.definitions': '释义',
  'reveal.examples': '例句',
  'reveal.mnemonic.text': '助记',
  'reveal.inflectionNote': '词形说明',
};

function labelForPath(path: string): string {
  return fieldLabels[path] ?? path;
}

function normalizeVocabularyContent(values: VocabularyContent): VocabularyContent {
  const prompt = { ...values.prompt };
  if (!prompt.phonetic?.ipa?.trim()) {
    delete prompt.phonetic;
  } else if (prompt.phonetic) {
    if (!prompt.phonetic.dialect) {
      delete prompt.phonetic.dialect;
    }
  }
  if (!prompt.primaryImage?.trim()) {
    delete prompt.primaryImage;
  }

  const reveal = {
    ...values.reveal,
    definitions: values.reveal.definitions.filter((item) => item.text.trim()),
    examples: values.reveal.examples
      .filter((item) => item.en.trim() && item.zh.trim())
      .map((item) => ({
        ...item,
        ...(item.audio?.trim() ? { audio: item.audio.trim() } : {}),
      })),
  };

  if (values.reveal.mnemonic?.text?.trim()) {
    reveal.mnemonic = { kind: 'association', text: values.reveal.mnemonic.text.trim() };
  } else {
    delete reveal.mnemonic;
  }

  if (!values.reveal.inflectionNote?.trim()) {
    delete reveal.inflectionNote;
  }

  return vocabularyContentSchema.parse({ prompt, reveal });
}

export function VocabularyCardForm({
  defaultValues,
  onSubmit,
}: VocabularyCardFormProps): ReactElement {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VocabularyContent>({
    resolver: zodResolver(vocabularyContentSchema),
    defaultValues,
  });

  const definitions = useFieldArray({ control, name: 'reveal.definitions' });
  const examples = useFieldArray({ control, name: 'reveal.examples' });

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit(normalizeVocabularyContent(values));
        })(event);
      }}
      style={{ display: 'grid', gap: '1rem' }}
    >
      <fieldset>
        <legend>Prompt（阶段 A）</legend>
        <label style={fieldBlockStyle}>
          {labelForPath('prompt.headword')}
          <input {...register('prompt.headword')} style={inputStyle} />
          {errors.prompt?.headword && <ErrorText message={errors.prompt.headword.message} />}
        </label>
        <label style={fieldBlockStyle}>
          {labelForPath('prompt.primaryAudio')}
          <input {...register('prompt.primaryAudio')} style={inputStyle} />
          {errors.prompt?.primaryAudio && (
            <ErrorText message={errors.prompt.primaryAudio.message} />
          )}
        </label>
        <label style={fieldBlockStyle}>
          {labelForPath('prompt.phonetic.ipa')}
          <input {...register('prompt.phonetic.ipa')} style={inputStyle} />
          {errors.prompt?.phonetic?.ipa && (
            <ErrorText message={errors.prompt.phonetic.ipa.message} />
          )}
        </label>
        <label style={fieldBlockStyle}>
          {labelForPath('prompt.phonetic.dialect')}
          <select {...register('prompt.phonetic.dialect')} style={inputStyle} defaultValue="">
            <option value="">默认 (us)</option>
            <option value="us">us</option>
            <option value="uk">uk</option>
          </select>
        </label>
        <label style={fieldBlockStyle}>
          {labelForPath('prompt.primaryImage')}
          <input {...register('prompt.primaryImage')} style={inputStyle} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Reveal（阶段 B）</legend>
        <div>
          <strong>{labelForPath('reveal.definitions')}</strong>
          {definitions.fields.map((field, index) => (
            <div key={field.id} style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                {...register(`reveal.definitions.${index}.text` as `reveal.definitions.${number}.text`)}
                placeholder="释义"
                style={inputStyle}
              />
              <input
                {...register(`reveal.definitions.${index}.pos` as `reveal.definitions.${number}.pos`)}
                placeholder="词性（可选）"
                style={inputStyle}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => definitions.append({ text: '' })}
            style={{ marginTop: '0.5rem' }}
          >
            添加释义
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <strong>{labelForPath('reveal.examples')}</strong>
          {examples.fields.map((field, index) => (
            <div key={field.id} style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                {...register(`reveal.examples.${index}.en` as `reveal.examples.${number}.en`)}
                placeholder="英文例句"
                style={inputStyle}
              />
              <input
                {...register(`reveal.examples.${index}.zh` as `reveal.examples.${number}.zh`)}
                placeholder="中文例句"
                style={inputStyle}
              />
              <input
                {...register(`reveal.examples.${index}.audio` as `reveal.examples.${number}.audio`)}
                placeholder="例句音频（可选）"
                style={inputStyle}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => examples.append({ en: '', zh: '' })}
            style={{ marginTop: '0.5rem' }}
            disabled={examples.fields.length >= 5}
          >
            添加例句
          </button>
        </div>

        <label style={{ ...fieldBlockStyle, marginTop: '1rem' }}>
          {labelForPath('reveal.mnemonic.text')}
          <input {...register('reveal.mnemonic.text')} style={inputStyle} />
        </label>
        <label style={fieldBlockStyle}>
          {labelForPath('reveal.inflectionNote')}
          <input {...register('reveal.inflectionNote')} style={inputStyle} />
        </label>
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中…' : '保存'}
      </button>
    </form>
  );
}

function ErrorText({ message }: { message: string | undefined }): ReactElement | null {
  if (!message) {
    return null;
  }
  return <span style={{ color: '#c62828', fontSize: '0.875rem' }}>{message}</span>;
}

const fieldBlockStyle: CSSProperties = {
  display: 'grid',
  gap: '0.25rem',
  marginTop: '0.5rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.4rem',
};
