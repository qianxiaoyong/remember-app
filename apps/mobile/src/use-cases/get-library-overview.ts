import { packCoverPalette } from '../theme/colors';
import { listPackCards } from '../data/repositories/pack-card-repository';
import { listLearningStatesForPackContent } from '../data/repositories/learning-state-for-pack-content';
import { listInstalledPacks } from '../data/repositories/installed-pack-repository';
import {
  findActiveSessionWithPendingItems,
  listPendingQueueItemsForSession,
} from '../data/repositories/study-session-repository';
import { resolveTodayTaskCount } from '../lib/resolve-today-task-count';
import { sumPackTodayTaskCounts } from '../lib/sum-pack-today-task-counts';
import { resolvePackDisplayName } from '../catalog/resolve-pack-display-name';
import { resolveContentPackId } from './resolve-content-pack-id';
import { findActiveStudySessionForContentPackId } from './find-active-study-session';

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
  actionLabel: '开始学习' | '继续学习';
  statusHint: string;
  coverColor: string;
}

export function getLibraryOverview(now: Date = new Date()): LibraryOverview {
  const installedPacks = listInstalledPacks();
  const nowIso = now.toISOString();
  let totalCards = 0;
  let learningCount = 0;
  let masteredCount = 0;

  const packTodayTaskCounts = installedPacks.map((pack) => {
    const contentPackId = resolveContentPackId(pack.packId);
    const stats = aggregatePackStats(pack.sqlitePath, nowIso);
    return getTodayTaskCountForContentPack(contentPackId, pack.sqlitePath, stats.sm2DueCount);
  });
  const todayTaskCount = sumPackTodayTaskCounts(packTodayTaskCounts);

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

  const activeSession = findActiveSessionWithPendingItems();
  return {
    totalCards,
    todayTaskCount,
    learningCount,
    masteredCount,
    hasActiveTask: activeSession !== null,
    activePackId: activeSession?.packId ?? null,
  };
}

export function listInstalledPackSummaries(now: Date = new Date()): InstalledPackSummary[] {
  const nowIso = now.toISOString();
  const activeSession = findActiveSessionWithPendingItems();

  return listInstalledPacks().map((pack, index) => {
    const contentPackId = resolveContentPackId(pack.packId);
    const stats = aggregatePackStats(pack.sqlitePath, nowIso);
    const hasActiveTask = activeSession?.packId === contentPackId;
    const todayTaskCount = getTodayTaskCountForContentPack(
      contentPackId,
      pack.sqlitePath,
      stats.sm2DueCount,
    );
    const learnedCount = stats.learnedCount;
    const displayName = resolvePackDisplayName(pack.packId) || pack.displayName;

    return {
      packId: pack.packId,
      displayName,
      packVersion: pack.packVersion,
      totalCards: stats.totalCards,
      learnedCount,
      todayTaskCount,
      hasActiveTask,
      actionLabel: hasActiveTask || todayTaskCount > 0 ? '继续学习' : '开始学习',
      statusHint: buildStatusHint(todayTaskCount),
      coverColor: packCoverPalette[index % packCoverPalette.length] ?? packCoverPalette[0],
    };
  });
}

function getPendingSessionCount(contentPackId: string, sqlitePath: string): number {
  const session = findActiveStudySessionForContentPackId(contentPackId, sqlitePath);
  if (!session) {
    return 0;
  }
  return listPendingQueueItemsForSession(session.sessionId).length;
}

function getTodayTaskCountForContentPack(
  contentPackId: string,
  sqlitePath: string,
  sm2DueCount: number,
): number {
  return resolveTodayTaskCount({
    pendingSessionCount: getPendingSessionCount(contentPackId, sqlitePath),
    sm2DueCount,
  });
}

function buildStatusHint(todayTaskCount: number): string {
  if (todayTaskCount > 0) {
    return `今日待复习 ${String(todayTaskCount)} 条`;
  }
  return '暂无未完成任务';
}

interface PackStats {
  totalCards: number;
  learnedCount: number;
  sm2DueCount: number;
  learningCount: number;
  masteredCount: number;
}

function aggregatePackStats(sqlitePath: string, nowIso: string): PackStats {
  const totalCards = listPackCards(sqlitePath).length;
  const states = listLearningStatesForPackContent(sqlitePath);
  let sm2DueCount = 0;
  let learningCount = 0;
  let masteredCount = 0;

  for (const state of states) {
    if (state.dueAt <= nowIso) {
      sm2DueCount += 1;
    } else if (state.repetitions >= 3 || state.intervalDays >= 21) {
      masteredCount += 1;
    } else {
      learningCount += 1;
    }
  }

  return {
    totalCards,
    learnedCount: states.length,
    sm2DueCount,
    learningCount,
    masteredCount,
  };
}

export function formatLearningCount(value: number): string {
  return value.toLocaleString('zh-CN');
}
