import type { StoryReadingContent, StoryTier } from '@remember/contracts';
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import { unmarkVocabInRuns } from '../utils/story-runs-markup.js';
import { countStoryTierStats, formatStoryTierLegend } from '../utils/story-tier-stats.js';

const tierOptions: StoryTier[] = ['high', 'mid', 'low'];

interface StoryLessonVocabDialogProps {
  open: boolean;
  onClose: () => void;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
}

export function StoryLessonVocabDialog({
  open,
  onClose,
  register,
  control,
  setValue,
}: StoryLessonVocabDialogProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const sidebar = useFieldArray({ control, name: 'sidebar' });
  const sidebarValues = useWatch({ control, name: 'sidebar' }) ?? [];
  const allParagraphs = useWatch({ control, name: 'story.paragraphs' }) ?? [];

  const tierStats = useMemo(() => countStoryTierStats(sidebarValues), [sidebarValues]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function removeSidebarEntry(sidebarIndex: number, vocabId: string): void {
    for (let paragraphIndex = 0; paragraphIndex < allParagraphs.length; paragraphIndex += 1) {
      const runs = allParagraphs[paragraphIndex]?.runs ?? [];
      const unmarked = unmarkVocabInRuns(runs, vocabId);
      if (unmarked !== runs) {
        setValue(
          `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>,
          unmarked,
          { shouldDirty: true },
        );
      }
    }
    sidebar.remove(sidebarIndex);
  }

  return (
    <div
      className="dialog-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="dialog-panel dialog-panel-wide story-lesson-vocab-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-lesson-vocab-title"
        tabIndex={-1}
      >
        <div className="story-lesson-vocab-dialog-header">
          <div>
            <h2 id="story-lesson-vocab-title">本课词频</h2>
            <p className="story-lesson-vocab-dialog-subtitle">
              共 {String(sidebarValues.length)} 词
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="story-tier-legend-row">
          {tierOptions.map((tier) => (
            <span key={tier} className={`story-tier-legend-chip story-tier-legend-chip-${tier}`}>
              {formatStoryTierLegend(tierStats, tier)}
            </span>
          ))}
        </div>

        {sidebar.fields.length === 0 ? (
          <p className="field-helper">暂无本课用词。在段落正文中标记可点词后，词条会出现在这里。</p>
        ) : (
          <div className="data-table-wrap story-lesson-vocab-table-wrap">
            <table className="data-table data-table-compact">
              <thead>
                <tr>
                  <th className="story-vocab-tier-bar-cell" aria-hidden="true" />
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
                {sidebar.fields.map((field, sidebarIndex) => {
                  const tier = sidebarValues[sidebarIndex]?.tier ?? 'high';
                  return (
                    <tr key={field.id}>
                      <td className="story-vocab-tier-bar-cell" aria-hidden="true">
                        <span className={`story-vocab-tier-bar story-vocab-tier-bar-${tier}`} />
                      </td>
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
                            const vocabId = sidebarValues[sidebarIndex]?.vocabId ?? '';
                            if (vocabId) {
                              removeSidebarEntry(sidebarIndex, vocabId);
                            } else {
                              sidebar.remove(sidebarIndex);
                            }
                          }}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              sidebar.append({
                vocabId: 'new-word',
                headword: '',
                ipa: '',
                pos: '',
                definitionZh: '',
                tier: 'high',
              });
            }}
          >
            + 添加词条
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
