import type { StoryRun, StorySidebarEntry } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import {
  applyWordMarkAtSelection,
  buildPreviewSegments,
  collectVocabIdsFromRuns,
  markedTextToRuns,
  runsToMarkedText,
  runsToPlainText,
  syncRunsToPlainText,
} from './story-runs-markup.js';

const sidebar: StorySidebarEntry[] = [
  {
    vocabId: 'not',
    headword: 'not',
    ipa: '/nɒt/',
    pos: 'adv.',
    definitionZh: '不',
    tier: 'mid',
  },
  {
    vocabId: 'happy',
    headword: 'happy',
    ipa: '/ˈhæpi/',
    pos: 'adj.',
    definitionZh: '高兴',
    tier: 'high',
  },
  {
    vocabId: 'look',
    headword: 'look',
    ipa: '/lʊk/',
    pos: 'v.',
    definitionZh: '看',
    tier: 'high',
  },
];

const c1ParagraphOneRuns: StoryRun[] = [
  { kind: 'text', text: 'The prince is ' },
  { kind: 'word', surface: 'not', glossZh: '不', tier: 'mid', vocabId: 'not' },
  { kind: 'text', text: ' ' },
  { kind: 'word', surface: 'happy', glossZh: '高兴', tier: 'high', vocabId: 'happy' },
  { kind: 'text', text: '. He wants to marry a princess.' },
];

describe('runsToPlainText', () => {
  it('C1 第一段纯文本', () => {
    expect(runsToPlainText(c1ParagraphOneRuns)).toBe(
      'The prince is not happy. He wants to marry a princess.',
    );
  });

  it('缺失边界空格的 runs 仍能还原可读文本', () => {
    const corrupted: StoryRun[] = [
      { kind: 'text', text: 'The prince' },
      { kind: 'word', surface: 'likes', glossZh: '喜欢', tier: 'high', vocabId: 'like' },
      { kind: 'text', text: 'the' },
      { kind: 'word', surface: 'girl', glossZh: '女孩', tier: 'mid', vocabId: 'girl' },
      { kind: 'text', text: '.' },
    ];
    expect(runsToPlainText(corrupted)).toBe('The prince likes the girl.');
  });
});

describe('runsToMarkedText', () => {
  it('C1 第一段转为标记文本', () => {
    expect(runsToMarkedText(c1ParagraphOneRuns, sidebar)).toBe(
      'The prince is [[not]] [[happy]]. He wants to marry a princess.',
    );
  });
});

describe('markedTextToRuns', () => {
  it('标记文本 round-trip C1 第一段', () => {
    const marked = 'The prince is [[not]] [[happy]]. He wants to marry a princess.';
    expect(markedTextToRuns(marked, sidebar)).toEqual(c1ParagraphOneRuns);
  });
});

describe('syncRunsToPlainText', () => {
  it('修改纯文本时保留 word 标记', () => {
    const edited = 'The prince is not very happy. He wants to marry a princess.';
    const synced = syncRunsToPlainText(c1ParagraphOneRuns, edited, sidebar);
    expect(runsToPlainText(synced)).toBe(edited);
    expect(collectVocabIdsFromRuns(synced)).toEqual(['not', 'happy']);
  });

  it('未改 plain 时仍重建 text run 边界空格', () => {
    const corrupted: StoryRun[] = [
      { kind: 'text', text: 'He' },
      { kind: 'word', surface: 'has', glossZh: '有', tier: 'high', vocabId: 'have' },
      { kind: 'text', text: 'an' },
      { kind: 'word', surface: 'idea', glossZh: '主意', tier: 'low', vocabId: 'idea' },
      { kind: 'text', text: '.' },
    ];
    const plain = runsToPlainText(corrupted);
    const synced = syncRunsToPlainText(corrupted, plain, sidebar);
    expect(runsToPlainText(synced)).toBe('He has an idea.');
    expect(synced).toEqual([
      { kind: 'text', text: 'He ' },
      { kind: 'word', surface: 'has', glossZh: '有', tier: 'high', vocabId: 'have' },
      { kind: 'text', text: ' an ' },
      { kind: 'word', surface: 'idea', glossZh: '主意', tier: 'low', vocabId: 'idea' },
      { kind: 'text', text: '.' },
    ]);
  });
});

describe('applyWordMarkAtSelection', () => {
  it('选中词标记为 word run', () => {
    const plain = 'He looks everywhere.';
    const baseRuns: StoryRun[] = [{ kind: 'text', text: plain }];
    const start = plain.indexOf('looks');
    const end = start + 'looks'.length;
    const next = applyWordMarkAtSelection({
      runs: baseRuns,
      selectionStart: start,
      selectionEnd: end,
      vocabId: 'look',
      sidebar,
    });
    expect(next).toEqual([
      { kind: 'text', text: 'He ' },
      { kind: 'word', surface: 'looks', glossZh: '看', tier: 'high', vocabId: 'look' },
      { kind: 'text', text: ' everywhere.' },
    ]);
  });

  it('缺失词间空格的 runs 也能正确标记末尾词', () => {
    const corrupted: StoryRun[] = [
      { kind: 'text', text: 'He wants to marry a' },
      { kind: 'word', surface: 'not', glossZh: '不', tier: 'mid', vocabId: 'not' },
      { kind: 'word', surface: 'happy', glossZh: '高兴', tier: 'high', vocabId: 'happy' },
      { kind: 'text', text: '. He wants to marry a princess.' },
    ];
    const plain = runsToPlainText(corrupted);
    const start = plain.indexOf('princess');
    const end = start + 'princess'.length;
    const princessSidebar = [
      ...sidebar,
      {
        vocabId: 'princess',
        headword: 'princess',
        ipa: '',
        pos: 'n.',
        definitionZh: '公主',
        tier: 'high' as const,
      },
    ];
    const next = applyWordMarkAtSelection({
      runs: corrupted,
      selectionStart: start,
      selectionEnd: end,
      vocabId: 'princess',
      sidebar: princessSidebar,
    });
    expect(collectVocabIdsFromRuns(next)).toContain('princess');
    expect(runsToPlainText(next)).toBe(plain);
  });
});

describe('buildPreviewSegments', () => {
  it('生成预览分段', () => {
    expect(buildPreviewSegments(c1ParagraphOneRuns)).toEqual([
      { kind: 'text', text: 'The prince is ' },
      { kind: 'word', text: 'not', tier: 'mid', vocabId: 'not' },
      { kind: 'text', text: ' ' },
      { kind: 'word', text: 'happy', tier: 'high', vocabId: 'happy' },
      { kind: 'text', text: '. He wants to marry a princess.' },
    ]);
  });

  it('相邻 word run 缺失空格时分段仍可读', () => {
    const corrupted: StoryRun[] = [
      { kind: 'text', text: 'The prince is' },
      { kind: 'word', surface: 'not', glossZh: '不', tier: 'mid', vocabId: 'not' },
      { kind: 'word', surface: 'happy', glossZh: '高兴', tier: 'high', vocabId: 'happy' },
      { kind: 'text', text: '.' },
    ];
    expect(
      buildPreviewSegments(corrupted)
        .map((segment) => segment.text)
        .join(''),
    ).toBe('The prince is not happy.');
  });
});
