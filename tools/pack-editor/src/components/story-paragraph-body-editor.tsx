import type { StoryReadingContent, StoryRun } from '@remember/contracts';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import type { FieldPath, UseFormSetValue } from 'react-hook-form';
import {
  collectVocabIdsFromRuns,
  runsToPlainText,
  StoryRunsSyncError,
  syncRunsToPlainText,
} from '../utils/story-runs-markup.js';
import { StoryParagraphPreview } from './story-paragraph-preview.js';

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
  const previewRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [surfaceHeight, setSurfaceHeight] = useState<number | undefined>(undefined);
  const [plainText, setPlainText] = useState(() => runsToPlainText(runs));
  const plainTextRef = useRef(plainText);
  plainTextRef.current = plainText;
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const markedCount = collectVocabIdsFromRuns(runs).length;

  const runsPath =
    `story.paragraphs.${String(paragraphIndex)}.runs` as FieldPath<StoryReadingContent>;

  useEffect(() => {
    setPlainText(runsToPlainText(runs));
  }, [runs]);

  const measurePreviewHeight = useCallback((): void => {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }
    setSurfaceHeight(preview.offsetHeight);
  }, []);

  useLayoutEffect(() => {
    if (isEditing) {
      return;
    }
    measurePreviewHeight();
  }, [isEditing, runs, measurePreviewHeight]);

  useEffect(() => {
    if (isEditing) {
      return undefined;
    }
    const preview = previewRef.current;
    if (!preview || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      measurePreviewHeight();
    });
    observer.observe(preview);
    return () => {
      observer.disconnect();
    };
  }, [isEditing, runs, measurePreviewHeight]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    textareaRef.current?.focus();
  }, [isEditing]);

  function commitPlainText(next: string): boolean {
    try {
      setPlainText(next);
      const synced = syncRunsToPlainText(runs, next, sidebar);
      setValue(runsPath, synced, { shouldDirty: true });
      return true;
    } catch (error) {
      if (error instanceof StoryRunsSyncError) {
        return false;
      }
      throw error;
    }
  }

  function enterEditMode(): void {
    measurePreviewHeight();
    setPlainText(runsToPlainText(runs));
    setSelectionRange(null);
    setIsEditing(true);
  }

  function exitEditMode(revert: boolean): void {
    if (revert) {
      setPlainText(runsToPlainText(runs));
    }
    setSelectionRange(null);
    setIsEditing(false);
  }

  function handlePreviewKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      enterEditMode();
    }
  }

  useEffect(() => {
    const form = textareaRef.current?.form;
    if (!form) {
      return undefined;
    }
    function handleSubmit(event: Event): void {
      if (!commitPlainText(plainTextRef.current)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
    form.addEventListener('submit', handleSubmit, { capture: true });
    return () => {
      form.removeEventListener('submit', handleSubmit, { capture: true });
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
    <div className="edit-story-block edit-story-block-body edit-story-block-body-compact">
      <div className="edit-story-body-header">
        <span className="edit-story-body-label">正文</span>
        {!isEditing && (
          <span className="edit-story-body-hint">
            {markedCount > 0 ? `已标记 ${String(markedCount)} 词 · ` : ''}
            点击编辑
          </span>
        )}
      </div>

      {isEditing ? (
        <>
          <textarea
            ref={textareaRef}
            className="input edit-story-body-textarea edit-story-body-surface"
            style={surfaceHeight === undefined ? undefined : { height: surfaceHeight }}
            value={plainText}
            onChange={(event) => {
              setPlainText(event.target.value);
            }}
            onBlur={() => {
              if (commitPlainText(plainText)) {
                exitEditMode(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                exitEditMode(true);
              }
            }}
            onSelect={refreshSelection}
            onMouseUp={refreshSelection}
            onKeyUp={refreshSelection}
          />

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
        </>
      ) : (
        <div
          ref={previewRef}
          className="edit-story-body-preview edit-story-body-surface"
          role="button"
          tabIndex={0}
          onClick={enterEditMode}
          onKeyDown={handlePreviewKeyDown}
        >
          <StoryParagraphPreview runs={runs} />
        </div>
      )}
    </div>
  );
}
