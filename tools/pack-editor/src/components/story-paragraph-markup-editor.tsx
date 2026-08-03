import type { StoryReadingContent, StoryRun, StorySidebarEntry } from '@remember/contracts';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { FieldPath, UseFormSetValue } from 'react-hook-form';
import {
  markedTextToRuns,
  runsToMarkedText,
  wrapSelectionAsWordToken,
} from '../utils/story-runs-markup.js';

interface StoryParagraphMarkupEditorProps {
  paragraphIndex: number;
  runs: StoryRun[];
  sidebar: StorySidebarEntry[];
  setValue: UseFormSetValue<StoryReadingContent>;
}

export function StoryParagraphMarkupEditor({
  paragraphIndex,
  runs,
  sidebar,
  setValue,
}: StoryParagraphMarkupEditorProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [markedText, setMarkedText] = useState(() => runsToMarkedText(runs, sidebar));
  const [selectionText, setSelectionText] = useState('');
  const [pickVocabId, setPickVocabId] = useState('');

  const runsPath =
    `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>;

  useEffect(() => {
    setMarkedText(runsToMarkedText(runs, sidebar));
  }, [runs, sidebar]);

  function commitMarkedText(next: string): void {
    setMarkedText(next);
    const parsed = markedTextToRuns(next, sidebar);
    setValue(runsPath, parsed, { shouldDirty: true });
  }

  function refreshSelection(): void {
    const textarea = textareaRef.current;
    if (!textarea) {
      setSelectionText('');
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      setSelectionText('');
      return;
    }
    setSelectionText(textarea.value.slice(start, end));
  }

  function applyWordMark(): void {
    const textarea = textareaRef.current;
    if (!textarea || !selectionText.trim() || !pickVocabId) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const token = wrapSelectionAsWordToken({
      selectedText: selectionText,
      vocabId: pickVocabId,
      sidebar,
    });
    const next = current.slice(0, start) + token + current.slice(end);
    commitMarkedText(next);
    setSelectionText('');
    setPickVocabId('');
  }

  return (
    <div className="edit-story-markup">
      <label className="field-label field-label-compact">
        标记编辑
        <span className="field-helper">用 [[vocabId]] 或 [[surface|vocabId]] 标记可点词</span>
        <textarea
          ref={textareaRef}
          className="input edit-story-markup-textarea"
          rows={4}
          value={markedText}
          onChange={(event) => {
            setMarkedText(event.target.value);
          }}
          onBlur={() => {
            commitMarkedText(markedText);
          }}
          onSelect={refreshSelection}
          onMouseUp={refreshSelection}
          onKeyUp={refreshSelection}
        />
      </label>

      {selectionText.trim() && sidebar.length > 0 && (
        <div className="edit-story-mark-toolbar">
          <span className="field-helper">选中「{selectionText.trim()}」→ 标记为可点词：</span>
          <select
            className="select input-sm"
            value={pickVocabId}
            onChange={(event) => {
              setPickVocabId(event.target.value);
            }}
          >
            <option value="">从 sidebar 选词条…</option>
            {sidebar.map((entry) => (
              <option key={entry.vocabId} value={entry.vocabId}>
                {entry.vocabId} — {entry.headword}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={!pickVocabId}
            onClick={applyWordMark}
          >
            插入标记
          </button>
        </div>
      )}
    </div>
  );
}
