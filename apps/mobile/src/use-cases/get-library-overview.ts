import { listPackCards } from '../data/repositories/pack-card-repository';
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
  const installedPacks = listInstalledPacks();
  const nowIso = now.toISOString();
  let totalCards = 0;
  let learningCount = 0;
  let masteredCount = 0;

  const todayTaskCount = countDueReviewItems(now);

  const aggregatedSqlitePaths = new Set<string>();
  for (const pack of installedPacks) {
    if (aggregatedSqlitePaths.has(pack.sqlitePath)) {
      continue;
    }
    aggregatedSqlitePaths.add(pack.sqlitePath);
    const stats = aggregatePackStats(pack.sqlitePath, nowIso);
    totalCards += stats.totalCards;
    learningCount += stats.learningCount;
    masteredCount += stats.masteredCount;
  }

  return {
    totalCards,
    todayTaskCount,
    learningCount,
    masteredCount,
    hasActiveTask: todayTaskCount > 0,
    activePackId: null,
  };
}

export function listInstalledPackSummaries(now: Date = new Date()): InstalledPackSummary[] {
  const nowIso = now.toISOString();

  return listInstalledPacks().map((pack) => {
    const stats = aggregatePackStats(pack.sqlitePath, nowIso);
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
  });
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
  const cards = listPackCards(getInstalledPackSqlitePath(packId));
  const index = cards.findIndex((card) => card.knowledgeId === bookmark.knowledgeId);
  if (index < 0) {
    return '尚未开始';
  }
  const card = cards[index];
  return `上次学到：第 ${String(index + 1)} 词 · ${card?.headword ?? bookmark.knowledgeId}`;
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
