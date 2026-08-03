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
