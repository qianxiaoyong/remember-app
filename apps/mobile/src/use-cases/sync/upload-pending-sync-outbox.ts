import type { SyncBatchItem } from '@remember/contracts';
import { uploadLearningStatesBatch } from '../../data/api/sync-api';
import { ApiNetworkError, ApiRequestError } from '../../data/api/api-client';
import { getLearningState } from '../../data/repositories/learning-state-repository';
import {
  deleteSyncOutboxItems,
  listSyncOutboxItems,
  type SyncOutboxRow,
} from '../../data/repositories/sync-outbox-repository';
import { resolveSyncOutboxPayload } from '../../data/sync/resolve-sync-outbox-payload';
import { readSessionToken, writeLastSyncedAt } from '../../data/session/session-store';

const BATCH_SIZE = 100;

export interface UploadPendingSyncOutboxResult {
  uploadedEventCount: number;
  remainingCount: number;
  skippedReason?: 'NO_SESSION' | 'NOT_MAIN_DEVICE' | 'OFFLINE' | 'ERROR';
  errorMessage?: string;
}

export async function uploadPendingSyncOutbox(
  sessionToken?: string | null,
): Promise<UploadPendingSyncOutboxResult> {
  const token = sessionToken ?? (await readSessionToken());
  if (!token) {
    return { uploadedEventCount: 0, remainingCount: 0, skippedReason: 'NO_SESSION' };
  }

  dedupeSyncOutboxByKnowledgeId();

  let uploadedEventCount = 0;

  try {
    while (true) {
      const pending = listSyncOutboxItems(BATCH_SIZE);
      if (pending.length === 0) {
        break;
      }

      const items: SyncBatchItem[] = [];
      const orphanEventIds: string[] = [];
      for (const row of pending) {
        const item = buildUploadItem(row);
        if (!item) {
          orphanEventIds.push(row.eventId);
          continue;
        }
        items.push(item);
      }

      if (orphanEventIds.length > 0) {
        deleteSyncOutboxItems(orphanEventIds);
      }
      if (items.length === 0) {
        if (pending.length < BATCH_SIZE) {
          break;
        }
        continue;
      }

      const response = await uploadLearningStatesBatch(items, token);
      const removableEventIds = [
        ...response.acceptedEventIds,
        ...response.rejected.map((item) => item.eventId),
      ];
      deleteSyncOutboxItems(removableEventIds);
      uploadedEventCount += response.acceptedEventIds.length;

      if (response.acceptedEventIds.length > 0) {
        await writeLastSyncedAt(new Date().toISOString());
      }

      if (pending.length < BATCH_SIZE) {
        break;
      }
    }

    return {
      uploadedEventCount,
      remainingCount: listSyncOutboxItems(BATCH_SIZE).length,
    };
  } catch (error) {
    if (error instanceof ApiNetworkError) {
      return {
        uploadedEventCount,
        remainingCount: listSyncOutboxItems(BATCH_SIZE).length,
        skippedReason: 'OFFLINE',
        errorMessage: error.message,
      };
    }
    if (error instanceof ApiRequestError && error.code === 'NOT_MAIN_DEVICE') {
      return {
        uploadedEventCount,
        remainingCount: listSyncOutboxItems(BATCH_SIZE).length,
        skippedReason: 'NOT_MAIN_DEVICE',
      };
    }
    return {
      uploadedEventCount,
      remainingCount: listSyncOutboxItems(BATCH_SIZE).length,
      skippedReason: 'ERROR',
      errorMessage: error instanceof Error ? error.message : '同步失败',
    };
  }
}

function dedupeSyncOutboxByKnowledgeId(): void {
  const pending = listSyncOutboxItems(1000);
  if (pending.length <= 1) {
    return;
  }

  const latestByKnowledge = new Map<string, SyncOutboxRow>();
  for (const row of pending) {
    const existing = latestByKnowledge.get(row.knowledgeId);
    if (!existing || row.clientVersion > existing.clientVersion) {
      latestByKnowledge.set(row.knowledgeId, row);
      continue;
    }
    if (row.clientVersion === existing.clientVersion && row.createdAt > existing.createdAt) {
      latestByKnowledge.set(row.knowledgeId, row);
    }
  }

  const keepEventIds = new Set([...latestByKnowledge.values()].map((row) => row.eventId));
  const duplicateEventIds = pending
    .filter((row) => !keepEventIds.has(row.eventId))
    .map((row) => row.eventId);
  if (duplicateEventIds.length > 0) {
    deleteSyncOutboxItems(duplicateEventIds);
  }
}

function buildUploadItem(row: SyncOutboxRow): SyncBatchItem | null {
  const payload = resolveSyncOutboxPayload(row);
  if (!payload) {
    return null;
  }

  const state = getLearningState(row.knowledgeId);
  const clientVersion = state?.clientVersion ?? row.clientVersion;
  if (clientVersion < 1) {
    return null;
  }

  return {
    eventId: row.eventId,
    knowledgeId: row.knowledgeId,
    clientVersion,
    payload,
  };
}
