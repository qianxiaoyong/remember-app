import { describe, expect, it } from 'vitest';
import { createStoryCardTemplate, suggestNextLessonCode } from './story-card-template.js';

describe('createStoryCardTemplate', () => {
  it('生成含一段正文、占位时间轴与空 sidebar 的 story 卡', () => {
    const card = createStoryCardTemplate({ sortOrder: 2, lessonCode: 'C2' });
    expect(card.cardType).toBe('story_reading');
    expect(card.content.lesson.code).toBe('C2');
    expect(card.content.story.paragraphs).toHaveLength(1);
    expect(card.content.story.paragraphs[0]?.audioStartMs).toBe(0);
    expect(card.content.story.paragraphs[0]?.audioEndMs).toBe(5000);
    expect(card.content.sidebar).toEqual([]);
  });
});

describe('suggestNextLessonCode', () => {
  it('在 C1 后建议 C2', () => {
    expect(suggestNextLessonCode(['C1'])).toBe('C2');
  });
});
