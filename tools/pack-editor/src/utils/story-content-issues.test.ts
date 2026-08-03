import type { StoryReadingContent } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import { collectStoryContentIssues } from './story-content-issues.js';

function baseContent(): StoryReadingContent {
  return {
    lesson: {
      code: 'C1',
      titleEn: 'Title',
      titleZh: '标题',
      coverImage: 'assets/images/c1.png',
      primaryAudio: 'assets/audio/c1.mp3',
    },
    story: {
      paragraphs: [
        {
          runs: [
            { kind: 'text', text: 'Hello ' },
            { kind: 'word', surface: 'world', glossZh: '世界', tier: 'high', vocabId: 'world' },
          ],
          audioStartMs: 0,
          audioEndMs: 1000,
          translationZh: '你好世界',
        },
        {
          runs: [{ kind: 'text', text: 'Second.' }],
          audioStartMs: 1000,
          audioEndMs: 2000,
          translationZh: '第二段',
        },
      ],
    },
    sidebar: [
      {
        vocabId: 'world',
        headword: 'world',
        ipa: '/wɜːld/',
        pos: 'n.',
        definitionZh: '世界',
        tier: 'high',
      },
    ],
  };
}

describe('collectStoryContentIssues', () => {
  it('orphan sidebar', () => {
    const content = baseContent();
    content.sidebar.push({
      vocabId: 'orphan',
      headword: 'orphan',
      ipa: '/ˈɔːrfən/',
      pos: 'n.',
      definitionZh: '孤儿',
      tier: 'low',
    });

    const issues = collectStoryContentIssues(content);
    expect(issues.some((issue) => issue.message.includes('orphan sidebar'))).toBe(true);
  });

  it('tier mismatch', () => {
    const content = baseContent();
    content.story.paragraphs[0]!.runs[1] = {
      kind: 'word',
      surface: 'world',
      glossZh: '世界',
      tier: 'low',
      vocabId: 'world',
    };

    const issues = collectStoryContentIssues(content);
    expect(issues.some((issue) => issue.message.includes('tier mismatch'))).toBe(true);
  });

  it('缺 translationZh', () => {
    const content = baseContent();
    delete content.story.paragraphs[1]!.translationZh;

    const issues = collectStoryContentIssues(content);
    expect(issues.some((issue) => issue.message.includes('missing translationZh'))).toBe(true);
  });

  it('时间轴重叠', () => {
    const content = baseContent();
    content.story.paragraphs[1]!.audioStartMs = 500;

    const issues = collectStoryContentIssues(content);
    expect(issues.some((issue) => issue.message.includes('overlaps previous segment'))).toBe(true);
  });

  it('末段超出音频时长', () => {
    const content = baseContent();
    content.story.paragraphs[1]!.audioEndMs = 5000;

    const issues = collectStoryContentIssues(content, { primaryAudioDurationMs: 3000 });
    expect(
      issues.some((issue) => issue.message.includes('exceeds primary audio duration')),
    ).toBe(true);
  });
});
