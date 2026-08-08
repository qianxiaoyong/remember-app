import { describe, expect, it } from 'vitest';
import {
  countEnglishSentences,
  formatStoryParagraphLengthMessage,
  getStoryParagraphLengthIssue,
  STORY_PARAGRAPH_MAX_CHARS,
  STORY_PARAGRAPH_MAX_SENTENCES,
} from './story-paragraph-length.js';

describe('story-paragraph-length', () => {
  it('counts sentences with quoted endings', () => {
    expect(countEnglishSentences('Fox laughs.')).toBe(1);
    expect(countEnglishSentences('"Ha ha ha! They will kill you." Cat does not listen.')).toBe(3);
    expect(
      countEnglishSentences(
        '"What\'s yours?" Fox is thinking. Fox has many ideas. "Do I do this?" he thinks.',
      ),
    ).toBe(5);
  });

  it('flags paragraph exceeding sentence or char limits', () => {
    const issue = getStoryParagraphLengthIssue(
      '"What\'s yours?" Fox is thinking. Fox has many ideas. "Do I do this?" he thinks. "Or do I do that? Oh no!" The dogs are coming.',
    );
    expect(issue).toEqual({
      sentenceCount: 8,
      charCount: 126,
      maxSentences: STORY_PARAGRAPH_MAX_SENTENCES,
      maxChars: STORY_PARAGRAPH_MAX_CHARS,
    });
    if (issue === undefined) {
      throw new Error('expected paragraph length issue');
    }
    expect(formatStoryParagraphLengthMessage(issue)).toContain('paragraph too long');
  });

  it('accepts short paragraphs', () => {
    expect(getStoryParagraphLengthIssue('Fox is afraid. He cannot think.')).toBeUndefined();
  });
});
