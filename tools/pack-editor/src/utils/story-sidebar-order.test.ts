import { describe, expect, it } from 'vitest';
import type { StorySidebarEntry } from '@remember/contracts';
import {
  insertSidebarEntryAtTierHead,
  moveSidebarEntryToTierHead,
  sortSidebarIndicesByTier,
} from './story-sidebar-order.js';

function entry(vocabId: string, tier: StorySidebarEntry['tier']): StorySidebarEntry {
  return {
    vocabId,
    headword: vocabId,
    ipa: '',
    pos: '',
    definitionZh: '',
    tier,
  };
}

describe('story-sidebar-order', () => {
  it('insertSidebarEntryAtTierHead 将新 mid 词插到 mid 组最上面', () => {
    const sidebar = [
      entry('happy', 'high'),
      entry('not', 'mid'),
      entry('marry', 'low'),
    ];
    const next = insertSidebarEntryAtTierHead(sidebar, entry('wants', 'mid'));
    expect(next.map((item) => item.vocabId)).toEqual(['happy', 'wants', 'not', 'marry']);
  });

  it('insertSidebarEntryAtTierHead 将新 high 词插到 high 组最上面', () => {
    const sidebar = [entry('look', 'high'), entry('not', 'mid')];
    const next = insertSidebarEntryAtTierHead(sidebar, entry('find', 'high'));
    expect(next.map((item) => item.vocabId)).toEqual(['find', 'look', 'not']);
  });

  it('moveSidebarEntryToTierHead 改 tier 后移到新组最上面', () => {
    const sidebar = [entry('happy', 'high'), entry('not', 'mid'), entry('wants', 'high')];
    const next = moveSidebarEntryToTierHead(sidebar, 2, 'mid');
    expect(next.map((item) => item.vocabId)).toEqual(['happy', 'wants', 'not']);
    expect(next.find((item) => item.vocabId === 'wants')?.tier).toBe('mid');
  });

  it('sortSidebarIndicesByTier 按 high → mid → low → normal 排序', () => {
    const sidebar = [
      entry('not', 'mid'),
      entry('princess', 'normal'),
      entry('happy', 'high'),
      entry('marry', 'low'),
    ];
    const indices = sortSidebarIndicesByTier(sidebar);
    expect(indices.map((index) => sidebar[index]?.vocabId)).toEqual([
      'happy',
      'not',
      'marry',
      'princess',
    ]);
  });
});
