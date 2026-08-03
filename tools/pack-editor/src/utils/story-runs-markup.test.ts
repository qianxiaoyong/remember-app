import type { StoryRun, StorySidebarEntry } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import {
  buildPreviewSegments,
  markedTextToRuns,
  runsToMarkedText,
  wrapSelectionAsWordToken,
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

describe('runsToMarkedText', () => {
  it('C1 第一段转为标记文本', () => {
    expect(runsToMarkedText(c1ParagraphOneRuns, sidebar)).toBe(
      'The prince is [[not]] [[happy]]. He wants to marry a princess.',
    );
  });

  it('surface 与 headword 不同时保留 surface|vocabId', () => {
    const runs: StoryRun[] = [
      { kind: 'text', text: 'He ' },
      { kind: 'word', surface: 'looks', glossZh: '看', tier: 'high', vocabId: 'look' },
      { kind: 'text', text: ' everywhere.' },
    ];
    expect(runsToMarkedText(runs, sidebar)).toBe('He [[looks|look]] everywhere.');
  });
});

describe('markedTextToRuns', () => {
  it('标记文本 round-trip C1 第一段', () => {
    const marked = 'The prince is [[not]] [[happy]]. He wants to marry a princess.';
    expect(markedTextToRuns(marked, sidebar)).toEqual(c1ParagraphOneRuns);
  });

  it('解析 surface|vocabId 标记', () => {
    const runs = markedTextToRuns('He [[looks|look]] everywhere.', sidebar);
    expect(runs).toEqual([
      { kind: 'text', text: 'He ' },
      { kind: 'word', surface: 'looks', glossZh: '看', tier: 'high', vocabId: 'look' },
      { kind: 'text', text: ' everywhere.' },
    ]);
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
});

describe('wrapSelectionAsWordToken', () => {
  it('选中词与 headword 一致时用 vocabId 标记', () => {
    expect(wrapSelectionAsWordToken({ selectedText: 'happy', vocabId: 'happy', sidebar })).toBe(
      '[[happy]]',
    );
  });
});
