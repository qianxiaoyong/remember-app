import type { StoryReadingContent } from '@remember/contracts';
import {
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import {
  applyWordMarkAtSelection,
  collectVocabIdsFromRuns,
  syncRunsToPlainText,
} from '../utils/story-runs-markup.js';
import { insertSidebarEntryAtTierHead } from '../utils/story-sidebar-order.js';
import { prependParagraphVocabId } from '../utils/story-paragraph-vocab-order.js';
import { StoryParagraphBodyEditor } from './story-paragraph-body-editor.js';
import {
  createStorySidebarEntry,
  slugFromSelection,
  StoryParagraphVocab,
} from './story-paragraph-vocab.js';

function trimPlainSelection(
  plain: string,
  selectionStart: number,
  selectionEnd: number,
): { start: number; end: number; text: string } {
  let start = selectionStart;
  let end = selectionEnd;
  while (start < end && /\s/.test(plain[start] ?? '')) {
    start += 1;
  }
  while (end > start && /\s/.test(plain[end - 1] ?? '')) {
    end -= 1;
  }
  return { start, end, text: plain.slice(start, end) };
}

interface StoryParagraphItemProps {
  paragraphIndex: number;
  paragraphCount: number;
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
  setValue: UseFormSetValue<StoryReadingContent>;
  translationEnabled: boolean;
  contentIssues: { path: string; message: string }[];
  onRunsSyncError?: ((message: string) => void) | undefined;
  onRemove: () => void;
}

export function StoryParagraphItem({
  paragraphIndex,
  paragraphCount,
  register,
  control,
  setValue,
  translationEnabled,
  contentIssues,
  onRunsSyncError,
  onRemove,
}: StoryParagraphItemProps): ReactElement {
  const runs = useWatch({
    control,
    name: `story.paragraphs.${String(paragraphIndex)}.runs` as `story.paragraphs.${number}.runs`,
  });
  const sidebar = useWatch({ control, name: 'sidebar' });
  const [vocabDisplayOrder, setVocabDisplayOrder] = useState<string[]>([]);

  useEffect(() => {
    setVocabDisplayOrder(collectVocabIdsFromRuns(runs));
  }, [paragraphIndex]);

  useEffect(() => {
    const ids = collectVocabIdsFromRuns(runs);
    setVocabDisplayOrder((previous) => previous.filter((id) => ids.includes(id)));
  }, [runs]);

  const hasIssue = contentIssues.length > 0;
  const runsPath =
    `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>;
  const sidebarPath = 'sidebar' as FieldPath<StoryReadingContent>;

  function markSelection(input: {
    selectedText: string;
    selectionStart: number;
    selectionEnd: number;
    plainText: string;
  }): void {
    const headword = input.selectedText.trim();
    if (!headword) {
      return;
    }

    const existingEntry = sidebar.find(
      (entry) => entry.headword.toLowerCase() === headword.toLowerCase(),
    );
    let vocabId: string;
    let nextSidebar = sidebar;
    if (existingEntry) {
      vocabId = existingEntry.vocabId;
    } else {
      const baseId = slugFromSelection(headword) || 'word';
      vocabId = baseId;
      let suffix = 2;
      while (sidebar.some((entry) => entry.vocabId === vocabId)) {
        vocabId = `${baseId}-${String(suffix)}`;
        suffix += 1;
      }
      nextSidebar = insertSidebarEntryAtTierHead(
        sidebar,
        createStorySidebarEntry(headword, vocabId),
      );
    }

    const syncedRuns = syncRunsToPlainText(runs, input.plainText, nextSidebar);
    const trimmedStart = trimPlainSelection(
      input.plainText,
      input.selectionStart,
      input.selectionEnd,
    );
    if (!trimmedStart.text) {
      return;
    }

    const nextRuns = applyWordMarkAtSelection({
      runs: syncedRuns,
      selectionStart: trimmedStart.start,
      selectionEnd: trimmedStart.end,
      vocabId,
      sidebar: nextSidebar,
    });

    if (!collectVocabIdsFromRuns(nextRuns).includes(vocabId)) {
      return;
    }

    if (nextSidebar !== sidebar) {
      setValue(sidebarPath, nextSidebar, { shouldDirty: true });
    }
    setValue(runsPath, nextRuns, { shouldDirty: true });
    setVocabDisplayOrder((previous) =>
      prependParagraphVocabId(previous, vocabId, collectVocabIdsFromRuns(nextRuns)),
    );
  }

  return (
    <div
      className="edit-story-paragraph-card"
      style={hasIssue ? { borderColor: 'var(--color-danger)' } : undefined}
    >
      <div className="edit-story-paragraph-header">
        <span className="edit-story-paragraph-title">
          段落 #{paragraphIndex + 1} / 共 {paragraphCount} 段
        </span>
        <div className="edit-story-paragraph-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={paragraphCount <= 1}
            onClick={onRemove}
          >
            删段
          </button>
        </div>
      </div>

      <div className="edit-story-paragraph-scroll">
        <StoryParagraphBodyEditor
          paragraphIndex={paragraphIndex}
          runs={runs}
          sidebar={sidebar}
          setValue={setValue}
          onRunsSyncError={onRunsSyncError}
          onMarkSelection={markSelection}
        />

        {translationEnabled && (
          <div className="edit-story-block edit-story-block-translation">
            <label className="field-label field-label-compact">
              段译
              <textarea
                {...register(
                  `story.paragraphs.${String(paragraphIndex)}.translationZh` as FieldPath<StoryReadingContent>,
                )}
                className="input"
                rows={2}
              />
            </label>
          </div>
        )}

        <StoryParagraphVocab
          paragraphIndex={paragraphIndex}
          register={register}
          control={control}
          setValue={setValue}
          vocabDisplayOrder={vocabDisplayOrder}
          onVocabRemovedFromParagraph={(vocabId) => {
            setVocabDisplayOrder((previous) => previous.filter((id) => id !== vocabId));
          }}
        />

        {contentIssues.map((issue) => (
          <p key={`${issue.path}:${issue.message}`} className="field-error">
            {issue.message}
          </p>
        ))}
      </div>
    </div>
  );
}
