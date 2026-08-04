import { vocabularyContentSchema, type VocabularyContent } from '@remember/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, type FieldPath } from 'react-hook-form';
import type { ReactElement } from 'react';

export const VOCABULARY_CARD_FORM_ID = 'vocabulary-card-form';

interface VocabularyCardFormProps {
  defaultValues: VocabularyContent;
  onSubmit: (content: VocabularyContent) => Promise<void>;
}

function normalizeVocabularyContent(values: VocabularyContent): VocabularyContent {
  const prompt = { ...values.prompt };
  const ipa = prompt.phonetic?.ipa.trim() ?? '';
  if (!ipa) {
    delete prompt.phonetic;
  } else {
    const dialect = prompt.phonetic?.dialect;
    prompt.phonetic = dialect ? { ipa, dialect } : { ipa };
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

  const mnemonicText = values.reveal.mnemonic?.text.trim() ?? '';
  if (mnemonicText) {
    reveal.mnemonic = { kind: 'association', text: mnemonicText };
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
    formState: { errors },
  } = useForm<VocabularyContent>({
    resolver: zodResolver(vocabularyContentSchema),
    defaultValues,
  });

  const definitions = useFieldArray({ control, name: 'reveal.definitions' });
  const examples = useFieldArray({ control, name: 'reveal.examples' });

  return (
    <form
      id={VOCABULARY_CARD_FORM_ID}
      className="card-panel edit-form"
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit(normalizeVocabularyContent(values));
        })(event);
      }}
    >
      <div className="edit-prompt-band">
        <div className="edit-phase-label">Prompt · 阶段 A</div>
        <label className="field-label edit-headword-field">
          单词 / 短语
          <input {...register('prompt.headword')} className="input input-headword-inline" />
          {errors.prompt?.headword && <ErrorText message={errors.prompt.headword.message} />}
        </label>
        <div className="edit-prompt-grid">
          <label className="field-label">
            主音频
            <span className="field-helper">assets/audio/…</span>
            <input {...register('prompt.primaryAudio')} className="input input-sm" />
            {errors.prompt?.primaryAudio && (
              <ErrorText message={errors.prompt.primaryAudio.message} />
            )}
          </label>
          <label className="field-label">
            音标 IPA
            <input
              {...register('prompt.phonetic.ipa')}
              className="input input-sm"
              placeholder="/…/"
            />
          </label>
          <label className="field-label">
            口音
            <select
              {...register('prompt.phonetic.dialect')}
              className="select input-sm"
              defaultValue=""
            >
              <option value="">us</option>
              <option value="us">us</option>
              <option value="uk">uk</option>
            </select>
          </label>
          <label className="field-label">
            主图
            <span className="field-helper">可选</span>
            <input {...register('prompt.primaryImage')} className="input input-sm" />
          </label>
        </div>
      </div>

      <div className="edit-reveal-body">
        <div className="edit-phase-label">Reveal · 阶段 B</div>

        <div className="edit-subsection">
          <div className="edit-subsection-head">
            <span className="edit-subsection-title">释义</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                definitions.append({ text: '' });
              }}
            >
              + 添加
            </button>
          </div>
          <div className="edit-definition-list">
            {definitions.fields.map((field, index) => (
              <div key={field.id} className="edit-inline-row">
                <input
                  {...register(
                    `reveal.definitions.${String(index)}.text` as FieldPath<VocabularyContent>,
                  )}
                  className="input input-sm"
                  placeholder="释义"
                />
                <input
                  {...register(
                    `reveal.definitions.${String(index)}.pos` as FieldPath<VocabularyContent>,
                  )}
                  className="input input-sm edit-pos-input"
                  placeholder="词性"
                />
                {definitions.fields.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      definitions.remove(index);
                    }}
                  >
                    删
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="edit-subsection">
          <div className="edit-subsection-head">
            <span className="edit-subsection-title">例句</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                examples.append({ en: '', zh: '' });
              }}
              disabled={examples.fields.length >= 5}
            >
              + 添加
            </button>
          </div>
          <div className="edit-example-list">
            {examples.fields.map((field, index) => (
              <div key={field.id} className="edit-example-item">
                <div className="edit-example-item-head">
                  <span>例句 {index + 1}</span>
                  {examples.fields.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        examples.remove(index);
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="edit-example-en-zh">
                  <input
                    {...register(
                      `reveal.examples.${String(index)}.en` as FieldPath<VocabularyContent>,
                    )}
                    className="input input-sm"
                    placeholder="英文"
                  />
                  <input
                    {...register(
                      `reveal.examples.${String(index)}.zh` as FieldPath<VocabularyContent>,
                    )}
                    className="input input-sm"
                    placeholder="中文"
                  />
                </div>
                <input
                  {...register(
                    `reveal.examples.${String(index)}.audio` as FieldPath<VocabularyContent>,
                  )}
                  className="input input-sm"
                  placeholder="例句音频（可选）"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="edit-optional-row">
          <label className="field-label">
            助记
            <input {...register('reveal.mnemonic.text')} className="input input-sm" />
          </label>
          <label className="field-label">
            词形说明
            <input {...register('reveal.inflectionNote')} className="input input-sm" />
          </label>
        </div>
      </div>
    </form>
  );
}

function ErrorText({ message }: { message: string | undefined }): ReactElement | null {
  if (!message) {
    return null;
  }
  return <span className="field-error">{message}</span>;
}
