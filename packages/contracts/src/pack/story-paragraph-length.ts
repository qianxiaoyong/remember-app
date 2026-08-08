/** Story segment limits for primary reader pacing and audio sync. */
export const STORY_PARAGRAPH_MAX_SENTENCES = 3;
export const STORY_PARAGRAPH_MAX_CHARS = 120;

const SENTENCE_END_PATTERN = /[.!?](?=\s|$|")/g;

export function countEnglishSentences(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  const matches = trimmed.match(SENTENCE_END_PATTERN);
  return matches?.length ?? 1;
}

export interface StoryParagraphLengthIssue {
  sentenceCount: number;
  charCount: number;
  maxSentences: number;
  maxChars: number;
}

export function getStoryParagraphLengthIssue(
  plainText: string,
  limits?: { maxSentences?: number; maxChars?: number },
): StoryParagraphLengthIssue | undefined {
  const maxSentences = limits?.maxSentences ?? STORY_PARAGRAPH_MAX_SENTENCES;
  const maxChars = limits?.maxChars ?? STORY_PARAGRAPH_MAX_CHARS;
  const sentenceCount = countEnglishSentences(plainText);
  const charCount = plainText.length;

  if (sentenceCount <= maxSentences && charCount <= maxChars) {
    return undefined;
  }

  return {
    sentenceCount,
    charCount,
    maxSentences,
    maxChars,
  };
}

export function formatStoryParagraphLengthMessage(issue: StoryParagraphLengthIssue): string {
  const parts: string[] = [];
  if (issue.sentenceCount > issue.maxSentences) {
    parts.push(`${String(issue.sentenceCount)} sentences (max ${String(issue.maxSentences)})`);
  }
  if (issue.charCount > issue.maxChars) {
    parts.push(`${String(issue.charCount)} chars (max ${String(issue.maxChars)})`);
  }
  return `paragraph too long: ${parts.join(', ')}`;
}
