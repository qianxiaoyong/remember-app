import type { StoryReadingContent, StoryTier } from '@remember/contracts';
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useMemo, useState, type ReactElement } from 'react';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';

const tierOptions: StoryTier[] = ['high', 'mid', 'low'];

interface StoryParagraphEditorProps {
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
}

export function StoryParagraphEditor({
  register,
  control,
  setValue,
}: StoryParagraphEditorProps): ReactElement {
  const paragraphs = useFieldArray({ control, name: 'story.paragraphs' });
  const watchedContent = useWatch({ control });
  const [contentIssues, setContentIssues] = useState<
    Array<{ path: string; message: string }>
  >([]);

  const translationEnabled = useMemo(() => {
    const items = watchedContent?.story?.paragraphs ?? [];
    return items.some((paragraph) => paragraph?.translationZh !== undefined);
  }, [watchedContent?.story?.paragraphs]);

  const sidebarOptions = (watchedContent?.sidebar ?? []) as StoryReadingContent['sidebar'];

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
    if (!watchedContent?.lesson || !watchedContent.story || !watchedContent.sidebar) {
      return;
    }
    setContentIssues(
      collectStoryContentIssues(watchedContent as StoryReadingContent),
    );
  }

  return (
    <div className="edit-subsection">
      <div className="edit-subsection-head">
        <span className="edit-subsection-title">Story · 段落与 runs</span>
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

      <label className="field-label" style={{ marginBottom: 'var(--space-3)' }}>
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
        <ParagraphItem
          key={field.id}
          paragraphIndex={paragraphIndex}
          paragraphCount={paragraphs.fields.length}
          register={register}
          control={control}
          setValue={setValue}
          sidebarOptions={sidebarOptions}
          translationEnabled={translationEnabled}
          contentIssues={contentIssues.filter((issue) =>
            issue.path.startsWith(`story.paragraphs[${String(paragraphIndex)}]`),
          )}
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
        <ul style={{ marginTop: 'var(--space-2)', color: 'var(--color-danger)' }}>
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

interface ParagraphItemProps {
  paragraphIndex: number;
  paragraphCount: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  sidebarOptions: StoryReadingContent['sidebar'];
  translationEnabled: boolean;
  contentIssues: Array<{ path: string; message: string }>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function ParagraphItem({
  paragraphIndex,
  paragraphCount,
  register,
  control,
  setValue,
  sidebarOptions,
  translationEnabled,
  contentIssues,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ParagraphItemProps): ReactElement {
  const runs = useFieldArray({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}.runs` as `story.paragraphs.${number}.runs`,
  });
  const hasIssue = contentIssues.length > 0;

  return (
    <div
      className="card-panel"
      style={{
        marginBottom: 'var(--space-3)',
        ...(hasIssue ? { borderColor: 'var(--color-danger)' } : {}),
      }}
    >
      <div className="edit-subsection-head">
        <span className="edit-subsection-title">段落 #{paragraphIndex + 1}</span>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button type="button" className="btn btn-ghost btn-sm" disabled={paragraphIndex === 0} onClick={onMoveUp}>
            ↑
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={paragraphIndex >= paragraphCount - 1}
            onClick={onMoveDown}
          >
            ↓
          </button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={paragraphCount <= 1} onClick={onRemove}>
            删段
          </button>
        </div>
      </div>

      {runs.fields.map((runField, runIndex) => (
        <RunRow
          key={runField.id}
          paragraphIndex={paragraphIndex}
          runIndex={runIndex}
          register={register}
          control={control}
          setValue={setValue}
          sidebarOptions={sidebarOptions}
          canRemove={runs.fields.length > 1}
          onRemove={() => {
            runs.remove(runIndex);
          }}
        />
      ))}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            runs.append({ kind: 'text', text: '' });
          }}
        >
          + text run
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            runs.append({ kind: 'word', surface: '', glossZh: '', tier: 'high', vocabId: '' });
          }}
        >
          + word run
        </button>
      </div>

      {translationEnabled && (
        <label className="field-label" style={{ marginTop: 'var(--space-2)' }}>
          段下翻译
          <textarea
            {...register(
              `story.paragraphs.${String(paragraphIndex)}.translationZh` as FieldPath<StoryReadingContent>,
            )}
            className="input"
            rows={2}
          />
        </label>
      )}

      {contentIssues.map((issue) => (
        <p key={`${issue.path}:${issue.message}`} className="field-error">
          {issue.message}
        </p>
      ))}
    </div>
  );
}

interface RunRowProps {
  paragraphIndex: number;
  runIndex: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  sidebarOptions: StoryReadingContent['sidebar'];
  canRemove: boolean;
  onRemove: () => void;
}

function RunRow({
  paragraphIndex,
  runIndex,
  register,
  control,
  setValue,
  sidebarOptions,
  canRemove,
  onRemove,
}: RunRowProps): ReactElement {
  const kindPath =
    `story.paragraphs.${String(paragraphIndex)}.runs.${String(runIndex)}.kind` as FieldPath<StoryReadingContent>;
  const kind = useWatch({ control, name: kindPath });
  const base = `story.paragraphs.${String(paragraphIndex)}.runs.${String(runIndex)}`;

  return (
    <div className="edit-inline-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
      <select
        {...register(kindPath)}
        className="select input-sm"
        onChange={(event) => {
          const nextKind = event.target.value;
          if (nextKind === 'text') {
            setValue(`${base}.kind` as FieldPath<StoryReadingContent>, 'text', { shouldDirty: true });
            setValue(`${base}.text` as FieldPath<StoryReadingContent>, '', { shouldDirty: true });
          } else {
            setValue(`${base}.kind` as FieldPath<StoryReadingContent>, 'word', { shouldDirty: true });
            setValue(`${base}.surface` as FieldPath<StoryReadingContent>, '', { shouldDirty: true });
            setValue(`${base}.glossZh` as FieldPath<StoryReadingContent>, '', { shouldDirty: true });
            setValue(`${base}.tier` as FieldPath<StoryReadingContent>, 'high', { shouldDirty: true });
            setValue(`${base}.vocabId` as FieldPath<StoryReadingContent>, '', { shouldDirty: true });
          }
        }}
      >
        <option value="text">text</option>
        <option value="word">word</option>
      </select>

      {kind === 'word' && sidebarOptions.length > 0 && (
        <select
          className="select input-sm"
          defaultValue=""
          onChange={(event) => {
            const entry = sidebarOptions.find((item) => item.vocabId === event.target.value);
            if (!entry) {
              return;
            }
            setValue(`${base}.vocabId` as FieldPath<StoryReadingContent>, entry.vocabId, {
              shouldDirty: true,
            });
            setValue(`${base}.surface` as FieldPath<StoryReadingContent>, entry.headword, {
              shouldDirty: true,
            });
            setValue(`${base}.glossZh` as FieldPath<StoryReadingContent>, entry.definitionZh, {
              shouldDirty: true,
            });
            setValue(`${base}.tier` as FieldPath<StoryReadingContent>, entry.tier, { shouldDirty: true });
          }}
        >
          <option value="">从 sidebar 选择…</option>
          {sidebarOptions.map((entry) => (
            <option key={entry.vocabId} value={entry.vocabId}>
              {entry.vocabId}
            </option>
          ))}
        </select>
      )}

      {kind === 'text' ? (
        <textarea
          {...register(`${base}.text` as FieldPath<StoryReadingContent>)}
          className="input input-sm"
          rows={2}
          placeholder="text run"
          style={{ flex: 1, minWidth: '12rem' }}
        />
      ) : (
        <>
          <input
            {...register(`${base}.surface` as FieldPath<StoryReadingContent>)}
            className="input input-sm"
            placeholder="surface"
          />
          <input
            {...register(`${base}.glossZh` as FieldPath<StoryReadingContent>)}
            className="input input-sm"
            placeholder="glossZh"
          />
          <input
            {...register(`${base}.vocabId` as FieldPath<StoryReadingContent>)}
            className="input input-sm"
            placeholder="vocabId"
          />
          <select {...register(`${base}.tier` as FieldPath<StoryReadingContent>)} className="select input-sm">
            {tierOptions.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </>
      )}

      {canRemove && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>
          删
        </button>
      )}
    </div>
  );
}
