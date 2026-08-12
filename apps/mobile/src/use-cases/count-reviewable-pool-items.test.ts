import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/installed-pack-repository', () => ({
  listInstalledPacks: vi.fn(() => [{ packId: 'pack-a' }, { packId: 'pack-b' }]),
}));

vi.mock('../data/repositories/learning-state-repository', () => ({
  listInReviewPoolItems: vi.fn(() => [
    { knowledgeId: 'a', packId: 'pack-a', firstAddedFromPackId: 'pack-a' },
    { knowledgeId: 'b', packId: 'pack-x', firstAddedFromPackId: 'pack-x' },
    { knowledgeId: 'c', packId: 'pack-b', firstAddedFromPackId: null },
  ]),
  listDueReviewPoolItems: vi.fn(() => [
    { knowledgeId: 'a', packId: 'pack-a', firstAddedFromPackId: 'pack-a' },
    { knowledgeId: 'b', packId: 'pack-x', firstAddedFromPackId: 'pack-x' },
  ]),
}));

vi.mock('./resolve-review-card-context', () => ({
  resolveReviewCardContext: vi.fn((knowledgeId: string) =>
    knowledgeId === 'a' ? { cardDetail: {} } : null,
  ),
}));

import {
  countReviewableDueReviewPoolItems,
  countReviewableInReviewPoolTotal,
} from './count-reviewable-pool-items';
import { listDueReviewPoolItems } from '../data/repositories/learning-state-repository';

describe('countReviewableInReviewPoolTotal', () => {
  it('只统计仍安装学习包内的复习池词条', () => {
    expect(countReviewableInReviewPoolTotal()).toBe(2);
  });
});

describe('countReviewableDueReviewPoolItems', () => {
  it('只统计可加载的到期词条', () => {
    const dueItems = listDueReviewPoolItems(new Date(), 'Asia/Shanghai');
    expect(countReviewableDueReviewPoolItems(dueItems)).toBe(1);
  });
});
