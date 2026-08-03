import type { StoryReadingContent, StoryRun } from '@remember/contracts';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { FieldPath, UseFormSetValue } from 'react-hook-form';
import { runsToPlainText, syncRunsToPlainText } from '../utils/story-runs-markup.js';

interface SelectionRange {
  start: number;
  end: number;
  text: string;
}

interface StoryParagraphBodyEditorProps {
  paragraphIndex: number;
  runs: StoryRun[];
  sidebar: StoryReadingContent['sidebar'];
  setValue: UseFormSetValue<StoryReadingContent>;
  onMarkSelection: (input: {
    selectedText: string;
    selectionStart: number;
    selectionEnd: number;
    plainText: string;
  }) => void;
}

export function StoryParagraphBodyEditor({
  paragraphIndex,
  runs,
  sidebar,
  setValue,
  onMarkSelection,
}: StoryParagraphBodyEditorProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [plainText, setPlainText] = useState(() => runsToPlainText(runs));
  const plainTextRef = useRef(plainText);
  plainTextRef.current = plainText;
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);

  const runsPath =
    `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>;

  useEffect(() => {
    setPlainText(runsToPlainText(runs));
  }, [runs]);

  function commitPlainText(next: string): void {
    setPlainText(next);
    const synced = syncRunsToPlainText(runs, next, sidebar);
    setValue(runsPath, synced, { shouldDirty: true });
  }

  useEffect(() => {
    const form = textareaRef.current?.form;
    if (!form) {
      return undefined;
    }
    function handleSubmit(): void {
      commitPlainText(plainTextRef.current);
    }
    form.addEventListener('submit', handleSubmit);
    return () => {
      form.removeEventListener('submit', handleSubmit);
    };
  }, [paragraphIndex, runs, sidebar, setValue, runsPath]);

  function refreshSelection(): void {
    const textarea = textareaRef.current;
    if (!textarea) {
      setSelectionRange(null);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      setSelectionRange(null);
      return;
    }
    setSelectionRange({
      start,
      end,
      text: textarea.value.slice(start, end),
    });
  }

  function markSelection(): void {
    if (!selectionRange?.text.trim()) {
      return;
    }
    onMarkSelection({
      selectedText: selectionRange.text.trim(),
      selectionStart: selectionRange.start,
      selectionEnd: selectionRange.end,
      plainText,
    });
    setSelectionRange(null);
  }

  return (
    <div className="edit-story-block edit-story-block-body">
      <label className="field-label field-label-compact">
        正文
        <textarea
          ref={textareaRef}
          className="input edit-story-body-textarea"
          rows={4}
          value={plainText}
          onChange={(event) => {
            setPlainText(event.target.value);
          }}
          onBlur={() => {
            commitPlainText(plainText);
          }}
          onSelect={refreshSelection}
          onMouseUp={refreshSelection}
          onKeyUp={refreshSelection}
        />
      </label>

      {selectionRange?.text.trim() && (
        <div className="edit-story-mark-toolbar">
          <span className="field-helper">「{selectionRange.text.trim()}」</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={markSelection}
          >
            标记为可点词
          </button>
        </div>
      )}
    </div>
  );
}
