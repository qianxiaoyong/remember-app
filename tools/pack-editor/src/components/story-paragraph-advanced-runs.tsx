import type { StoryReadingContent, StoryTier } from '@remember/contracts';
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import type { ReactElement } from 'react';

const tierOptions: StoryTier[] = ['high', 'mid', 'low'];

interface StoryParagraphAdvancedRunsProps {
  paragraphIndex: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  sidebarOptions: StoryReadingContent['sidebar'];
}

export function StoryParagraphAdvancedRuns({
  paragraphIndex,
  register,
  control,
  setValue,
  sidebarOptions,
}: StoryParagraphAdvancedRunsProps): ReactElement {
  const runs = useFieldArray({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}.runs` as `story.paragraphs.${number}.runs`,
  });

  return (
    <details className="edit-story-advanced-runs">
      <summary className="edit-story-advanced-runs-summary">高级 · run 行列表</summary>
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
      <div className="edit-story-advanced-runs-actions">
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
            runs.append({
              kind: 'word',
              surface: '',
              glossZh: '',
              tier: 'high',
              vocabId: '',
            });
          }}
        >
          + word run
        </button>
      </div>
    </details>
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
    <div className="edit-inline-row edit-story-run-row">
      <select
        {...register(kindPath)}
        className="select input-sm"
        onChange={(event) => {
          const nextKind = event.target.value;
          if (nextKind === 'text') {
            setValue(`${base}.kind` as FieldPath<StoryReadingContent>, 'text', {
              shouldDirty: true,
            });
            setValue(`${base}.text` as FieldPath<StoryReadingContent>, '', { shouldDirty: true });
          } else {
            setValue(`${base}.kind` as FieldPath<StoryReadingContent>, 'word', {
              shouldDirty: true,
            });
            setValue(`${base}.surface` as FieldPath<StoryReadingContent>, '', {
              shouldDirty: true,
            });
            setValue(`${base}.glossZh` as FieldPath<StoryReadingContent>, '', {
              shouldDirty: true,
            });
            setValue(`${base}.tier` as FieldPath<StoryReadingContent>, 'high', {
              shouldDirty: true,
            });
            setValue(`${base}.vocabId` as FieldPath<StoryReadingContent>, '', {
              shouldDirty: true,
            });
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
            setValue(`${base}.tier` as FieldPath<StoryReadingContent>, entry.tier, {
              shouldDirty: true,
            });
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
          <select
            {...register(`${base}.tier` as FieldPath<StoryReadingContent>)}
            className="select input-sm"
          >
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
