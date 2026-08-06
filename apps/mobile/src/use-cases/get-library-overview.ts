import { getPackCard, listPackCards } from '../data/repositories/pack-card-repository';
import { listLearningStatesForPackContent } from '../data/repositories/learning-state-for-pack-content';
import { listInstalledPacks } from '../data/repositories/installed-pack-repository';
import { getPackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { resolvePackDisplayName } from '../catalog/resolve-pack-display-name';
import { getStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { getPackCardDetailUseCase } from './get-pack-card-detail';
import { resolvePackLibraryPresentation } from './resolve-pack-library-presentation';
import { countDueReviewItems } from './count-due-review-items';
import type { LibraryPresentation } from '../learning/card-types/types';

export interface LibraryOverview {
  totalCards: number;
  todayTaskCount: number;
  learningCount: number;
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
  const todayTaskCount = countDueReviewItems(now);
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
    todayTaskCount,
    learningCount,
    masteredCount,
    hasActiveTask: todayTaskCount > 0,
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
  const learnedCount = stats.learnedCount;
  const catalogTitle = resolvePackDisplayName(pack.packId);
  const displayName =
    catalogTitle !== pack.packId
      ? catalogTitle
      : pack.displayName !== pack.packId
        ? pack.displayName
        : pack.packId;
  const libraryPresentation = resolvePackLibraryPresentation(pack.packId);
  const browseBookmark = getPackBrowseBookmark(pack.packId);

  return {
    packId: pack.packId,
    displayName,
    packVersion: pack.packVersion,
    totalCards: stats.totalCards,
    learnedCount,
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
    return `上次学到：第 ${String(bookmark.sortOrder)} 词`;
  }
  return `上次学到：第 ${String(bookmark.sortOrder)} 词 · ${card.headword}`;
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
  return `上次读到：${detail.content.lesson.code} ${detail.content.lesson.titleZh}`;
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

export function formatLearningCount(value: number): string {
  return value.toLocaleString('zh-CN');
}
