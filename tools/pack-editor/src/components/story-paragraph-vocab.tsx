import type { StoryReadingContent, StoryTier } from '@remember/contracts';
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useMemo, type ReactElement } from 'react';
import { collectVocabIdsFromRuns, unmarkVocabInRuns } from '../utils/story-runs-markup.js';

const tierOptions: StoryTier[] = ['high', 'mid', 'low'];

interface StoryParagraphVocabProps {
  paragraphIndex: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
}

export function StoryParagraphVocab({
  paragraphIndex,
  register,
  control,
  setValue,
}: StoryParagraphVocabProps): ReactElement {
  const sidebar = useFieldArray({ control, name: 'sidebar' });
  const sidebarValues = useWatch({ control, name: 'sidebar' });
  const allParagraphs = useWatch({ control, name: 'story.paragraphs' });
  const runs = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}.runs` as `story.paragraphs.${number}.runs`,
  });

  const paragraphVocabIds = useMemo(() => collectVocabIdsFromRuns(runs), [runs]);

  const vocabRows = paragraphVocabIds.flatMap((vocabId) => {
    const sidebarIndex = sidebarValues.findIndex((entry) => entry.vocabId === vocabId);
    if (sidebarIndex < 0) {
      return [];
    }
    const field = sidebar.fields[sidebarIndex];
    if (field === undefined) {
      return [];
    }
    return [{ field, sidebarIndex, vocabId }];
  });

  function removeFromParagraph(sidebarIndex: number, vocabId: string): void {
    const unmarked = unmarkVocabInRuns(runs, vocabId);
    setValue(
      `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>,
      unmarked,
      { shouldDirty: true },
    );

    const stillUsed = allParagraphs.some((paragraph, paragraphIdx) => {
      const targetRuns = paragraphIdx === paragraphIndex ? unmarked : paragraph.runs;
      return targetRuns.some((run) => run.kind === 'word' && run.vocabId === vocabId);
    });
    if (!stillUsed) {
      sidebar.remove(sidebarIndex);
    }
  }

  return (
    <div className="edit-story-block edit-story-block-vocab">
      <div className="edit-story-block-title">本段用词（{String(vocabRows.length)}）</div>

      {vocabRows.length === 0 ? (
        <p className="field-helper">在正文中选中文字，点「标记为可点词」后词条会出现在这里。</p>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table data-table-compact">
            <thead>
              <tr>
                <th>vocabId</th>
                <th>headword</th>
                <th>ipa</th>
                <th>pos</th>
                <th>definitionZh</th>
                <th>tier</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {vocabRows.map(({ field, sidebarIndex, vocabId }) => (
                <tr key={field.id}>
                  <td>
                    <input
                      {...register(
                        `sidebar.${String(sidebarIndex)}.vocabId` as FieldPath<StoryReadingContent>,
                      )}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(
                        `sidebar.${String(sidebarIndex)}.headword` as FieldPath<StoryReadingContent>,
                      )}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(
                        `sidebar.${String(sidebarIndex)}.ipa` as FieldPath<StoryReadingContent>,
                      )}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(
                        `sidebar.${String(sidebarIndex)}.pos` as FieldPath<StoryReadingContent>,
                      )}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(
                        `sidebar.${String(sidebarIndex)}.definitionZh` as FieldPath<StoryReadingContent>,
                      )}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <select
                      {...register(
                        `sidebar.${String(sidebarIndex)}.tier` as FieldPath<StoryReadingContent>,
                      )}
                      className="select input-sm"
                    >
                      {tierOptions.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        removeFromParagraph(sidebarIndex, vocabId);
                      }}
                    >
                      取消标记
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function slugFromSelection(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function createStorySidebarEntry(
  headword: string,
  vocabId: string,
  tier: StoryReadingContent['sidebar'][number]['tier'] = 'high',
): StoryReadingContent['sidebar'][number] {
  return {
    vocabId,
    headword,
    ipa: '-',
    pos: '-',
    definitionZh: headword,
    tier,
  };
}
