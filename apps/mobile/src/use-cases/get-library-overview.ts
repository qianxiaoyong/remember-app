import { formatLocalReviewDate } from '@remember/domain';
import { getPackCard, listPackCards } from '../data/repositories/pack-card-repository';
import { listLearningStatesForPackContent } from '../data/repositories/learning-state-for-pack-content';
import { listInstalledPacks } from '../data/repositories/installed-pack-repository';
import { getPackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { countInReviewPoolTotal } from '../data/repositories/learning-state-repository';
import { getReviewDailyStats } from '../data/repositories/review-daily-stats-repository';
import { getDailyReviewLimit } from '../data/repositories/user-preferences-repository';
import { resolvePackDisplayName } from '../catalog/resolve-pack-display-name';
import { getStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { getPackCardDetailUseCase } from './get-pack-card-detail';
import { resolvePackLibraryPresentation } from './resolve-pack-library-presentation';
import { countDueReviewItems } from './count-due-review-items';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import type { LibraryPresentation } from '../learning/card-types/types';

export interface LibraryOverviewStatTile {
  key: string;
  label: string;
  value: string;
  unit: string;
}

export interface LibraryOverview {
  totalCards: number;
  todayDueCount: number;
  todayReviewCompleted: number;
  todayReviewLimit: number;
  installedPackCount: number;
  reviewPoolTotal: number;
  reviewPoolLearning: number;
  reviewPoolStable: number;
  todayJoinedPool: number;
  statTiles: LibraryOverviewStatTile[];
  /** @deprecated 保留兼容；等同 todayDueCount */
  todayTaskCount: number;
  /** @deprecated 保留兼容；等同 reviewPoolLearning */
  learningCount: number;
  /** @deprecated 保留兼容；等同 reviewPoolStable */
  masteredCount: number;
  hasActiveTask: boolean;
  activePackId: string | null;
}
export interface InstalledPackSummary {
  packId: string;
  displayName: string;
  packVersion: string;
  totalCards: number;
  learnedCount: number;
  todayTaskCount: number;
  hasActiveTask: boolean;
  libraryPresentation: LibraryPresentation;
  actionLabel: '打开学习' | '继续学习' | '开始阅读' | '继续阅读';
  statusHint: string;
}

export function getLibraryOverview(now: Date = new Date()): LibraryOverview {
  return loadLibraryScreenData(now).overview;
}

export function listInstalledPackSummaries(now: Date = new Date()): InstalledPackSummary[] {
  return loadLibraryScreenData(now).installedPacks;
}

export function loadLibraryScreenData(now: Date = new Date()): {
  overview: LibraryOverview;
  installedPacks: InstalledPackSummary[];
} {
  const installed = listInstalledPacks();
  const nowIso = now.toISOString();
  const timeZone = getDeviceTimeZone();
  const localDate = formatLocalReviewDate(now, timeZone);
  const dailyStats = getReviewDailyStats(localDate);
  const dailyReviewLimit = getDailyReviewLimit();
  const todayDueCount = countDueReviewItems(now);
  const statsCache = new Map<string, PackStats>();

  const getStats = (sqlitePath: string): PackStats => {
    const cached = statsCache.get(sqlitePath);
    if (cached) {
      return cached;
    }
    const stats = aggregatePackStats(sqlitePath, nowIso);
    statsCache.set(sqlitePath, stats);
    return stats;
  };

  let totalCards = 0;
  let learningCount = 0;
  let masteredCount = 0;
  const reviewPoolTotal = countInReviewPoolTotal();
  const aggregatedSqlitePaths = new Set<string>();
  for (const pack of installed) {
    if (aggregatedSqlitePaths.has(pack.sqlitePath)) {
      continue;
    }
    aggregatedSqlitePaths.add(pack.sqlitePath);
    const stats = getStats(pack.sqlitePath);
    totalCards += stats.totalCards;
    learningCount += stats.learningCount;
    masteredCount += stats.masteredCount;
  }

  const overview: LibraryOverview = {
    totalCards,
    todayDueCount,
    todayReviewCompleted: dailyStats.reviewCompletedCount,
    todayReviewLimit: dailyReviewLimit,
    installedPackCount: installed.length,
    reviewPoolTotal,
    reviewPoolLearning: learningCount,
    reviewPoolStable: masteredCount,
    todayJoinedPool: dailyStats.joinedPoolCount,
    statTiles: buildLibraryStatTiles({
      todayDueCount,
      todayReviewCompleted: dailyStats.reviewCompletedCount,
      todayReviewLimit: dailyReviewLimit,
      installedPackCount: installed.length,
      reviewPoolTotal,
      reviewPoolLearning: learningCount,
      reviewPoolStable: masteredCount,
      todayJoinedPool: dailyStats.joinedPoolCount,
    }),
    todayTaskCount: todayDueCount,
    learningCount,
    masteredCount,
    hasActiveTask: todayDueCount > 0,
    activePackId: null,
  };

  const installedPacks = installed.map((pack) => buildInstalledPackSummary(pack, getStats));

  return { overview, installedPacks };
}

function buildInstalledPackSummary(
  pack: ReturnType<typeof listInstalledPacks>[number],
  getStats: (sqlitePath: string) => PackStats,
): InstalledPackSummary {
  const stats = getStats(pack.sqlitePath);
  const catalogTitle = resolvePackDisplayName(pack.packId);
  const displayName =
    catalogTitle !== pack.packId
      ? catalogTitle
      : pack.displayName !== pack.packId
        ? pack.displayName
        : pack.packId;
  const libraryPresentation = resolvePackLibraryPresentation(pack.packId);
  const browseBookmark = getPackBrowseBookmark(pack.packId);
  const readerProgress =
    libraryPresentation === 'reader' ? getReaderPackProgress(pack.packId, pack.sqlitePath) : null;
  const vocabularyProgress =
    libraryPresentation !== 'reader'
      ? getVocabularyBrowseProgress(pack.packId, pack.sqlitePath)
      : null;

  return {
    packId: pack.packId,
    displayName,
    packVersion: pack.packVersion,
    totalCards: readerProgress?.totalCards ?? vocabularyProgress?.totalCards ?? stats.totalCards,
    learnedCount:
      readerProgress?.learnedCount ?? vocabularyProgress?.learnedCount ?? stats.learnedCount,
    todayTaskCount: 0,
    hasActiveTask: false,
    libraryPresentation,
    actionLabel: buildActionLabel({
      libraryPresentation,
      hasBookmark:
        libraryPresentation === 'reader'
          ? getStoryReadingBookmark(pack.packId) !== null
          : browseBookmark !== null,
    }),
    statusHint: buildStatusHint({
      libraryPresentation,
      packId: pack.packId,
    }),
  };
}

function buildActionLabel(input: {
  libraryPresentation: LibraryPresentation;
  hasBookmark: boolean;
}): InstalledPackSummary['actionLabel'] {
  if (input.libraryPresentation === 'reader') {
    return input.hasBookmark ? '继续阅读' : '开始阅读';
  }
  return input.hasBookmark ? '继续学习' : '打开学习';
}

function buildStatusHint(input: {
  libraryPresentation: LibraryPresentation;
  packId: string;
}): string {
  if (input.libraryPresentation === 'reader') {
    return buildReaderStatusHint(input.packId);
  }
  return buildStudyBrowseStatusHint(input.packId);
}

function buildStudyBrowseStatusHint(packId: string): string {
  const bookmark = getPackBrowseBookmark(packId);
  if (!bookmark) {
    return '尚未开始';
  }
  const card = getPackCard(getInstalledPackSqlitePath(packId), bookmark.knowledgeId);
  if (!card) {
    return `第 ${String(bookmark.sortOrder)} 词`;
  }
  return `第 ${String(bookmark.sortOrder)} 词 · ${card.headword}`;
}

function getInstalledPackSqlitePath(packId: string): string {
  const pack = listInstalledPacks().find((item) => item.packId === packId);
  if (!pack) {
    throw new Error(`pack not installed: ${packId}`);
  }
  return pack.sqlitePath;
}

function buildReaderStatusHint(packId: string): string {
  const bookmark = getStoryReadingBookmark(packId);
  if (!bookmark) {
    return '尚未开始';
  }
  const detail = getPackCardDetailUseCase(packId, bookmark.knowledgeId);
  if (detail?.cardType !== 'story_reading') {
    return '尚未开始';
  }
  return `${detail.content.lesson.code} ${detail.content.lesson.titleZh}`;
}

function getReaderPackProgress(
  packId: string,
  sqlitePath: string,
): { totalCards: number; learnedCount: number } {
  const cards = listPackCards(sqlitePath);
  const totalCards = cards.length;
  if (totalCards === 0) {
    return { totalCards: 0, learnedCount: 0 };
  }

  const bookmark = getStoryReadingBookmark(packId);
  if (!bookmark) {
    return { totalCards, learnedCount: 0 };
  }

  const bookmarkCard = cards.find((card) => card.knowledgeId === bookmark.knowledgeId);
  if (!bookmarkCard) {
    return { totalCards, learnedCount: 0 };
  }

  const learnedCount = cards.filter((card) => card.sortOrder <= bookmarkCard.sortOrder).length;
  return { totalCards, learnedCount };
}

function getVocabularyBrowseProgress(
  packId: string,
  sqlitePath: string,
): { totalCards: number; learnedCount: number } {
  const cards = listPackCards(sqlitePath);
  const totalCards = cards.length;
  if (totalCards === 0) {
    return { totalCards: 0, learnedCount: 0 };
  }

  const bookmark = getPackBrowseBookmark(packId);
  if (!bookmark) {
    return { totalCards, learnedCount: 0 };
  }

  const bookmarkCard = cards.find((card) => card.knowledgeId === bookmark.knowledgeId);
  if (!bookmarkCard) {
    return { totalCards, learnedCount: bookmark.sortOrder };
  }

  return { totalCards, learnedCount: bookmarkCard.sortOrder };
}

interface PackStats {
  totalCards: number;
  learnedCount: number;
  learningCount: number;
  masteredCount: number;
}

function aggregatePackStats(sqlitePath: string, nowIso: string): PackStats {
  const totalCards = listPackCards(sqlitePath).length;
  const states = listLearningStatesForPackContent(sqlitePath);
  let learningCount = 0;
  let masteredCount = 0;

  for (const state of states) {
    if (!state.inReviewPool) {
      continue;
    }
    if (state.boxLevel >= 3 && state.dueAt > nowIso) {
      masteredCount += 1;
    } else {
      learningCount += 1;
    }
  }

  return {
    totalCards,
    learnedCount: states.filter((state) => state.inReviewPool).length,
    learningCount,
    masteredCount,
  };
}

function buildLibraryStatTiles(input: {
  todayDueCount: number;
  todayReviewCompleted: number;
  todayReviewLimit: number;
  installedPackCount: number;
  reviewPoolTotal: number;
  reviewPoolLearning: number;
  reviewPoolStable: number;
  todayJoinedPool: number;
}): LibraryOverviewStatTile[] {
  const reviewCompletedDisplay =
    input.todayReviewLimit > 0
      ? `${formatLearningCount(input.todayReviewCompleted)}/${formatLearningCount(input.todayReviewLimit)}`
      : formatLearningCount(input.todayReviewCompleted);

  return [
    { key: 'todayDueCount', label: '今日到期', value: formatLearningCount(input.todayDueCount), unit: '条' },
    { key: 'todayReviewCompleted', label: '今日已复习', value: reviewCompletedDisplay, unit: '条' },
    { key: 'installedPackCount', label: '已安装', value: formatLearningCount(input.installedPackCount), unit: '本' },
    { key: 'reviewPoolTotal', label: '复习池中', value: formatLearningCount(input.reviewPoolTotal), unit: '条' },
    { key: 'reviewPoolLearning', label: '复习中', value: formatLearningCount(input.reviewPoolLearning), unit: '条' },
    { key: 'reviewPoolStable', label: '记忆稳定', value: formatLearningCount(input.reviewPoolStable), unit: '条' },
    { key: 'todayJoinedPool', label: '今日新入池', value: formatLearningCount(input.todayJoinedPool), unit: '词' },
  ];
}

export function formatLearningCount(value: number): string {
  return value.toLocaleString('zh-CN');
}

export function createEmptyLibraryOverview(): LibraryOverview {
  return {
    totalCards: 0,
    todayDueCount: 0,
    todayReviewCompleted: 0,
    todayReviewLimit: 20,
    installedPackCount: 0,
    reviewPoolTotal: 0,
    reviewPoolLearning: 0,
    reviewPoolStable: 0,
    todayJoinedPool: 0,
    statTiles: buildLibraryStatTiles({
      todayDueCount: 0,
      todayReviewCompleted: 0,
      todayReviewLimit: 20,
      installedPackCount: 0,
      reviewPoolTotal: 0,
      reviewPoolLearning: 0,
      reviewPoolStable: 0,
      todayJoinedPool: 0,
    }),
    todayTaskCount: 0,
    learningCount: 0,
    masteredCount: 0,
    hasActiveTask: false,
    activePackId: null,
  };
}
