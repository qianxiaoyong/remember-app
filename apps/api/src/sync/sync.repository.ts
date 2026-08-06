import { Injectable } from '@nestjs/common';
import type { SyncBatchItem, SyncBatchUploadResponse, SyncSnapshotItem } from '@remember/contracts';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  applyBatchUpload(userId: string, items: SyncBatchItem[]): Promise<SyncBatchUploadResponse> {
    return this.prisma.$transaction(async (tx) => {
      const acceptedEventIds: string[] = [];
      const rejected: SyncBatchUploadResponse['rejected'] = [];

      for (const item of items) {
        const processed = await tx.syncProcessedEvent.findUnique({
          where: { eventId: item.eventId },
        });
        if (processed) {
          if (processed.userId === userId) {
            acceptedEventIds.push(item.eventId);
          } else {
            rejected.push({ eventId: item.eventId, reason: 'INVALID_PAYLOAD' });
          }
          continue;
        }

        const existing = await tx.learningState.findUnique({
          where: {
            userId_knowledgeId: {
              userId,
              knowledgeId: item.knowledgeId,
            },
          },
        });

        if (existing && existing.clientVersion >= item.clientVersion) {
          await tx.syncProcessedEvent.create({
            data: {
              eventId: item.eventId,
              userId,
              knowledgeId: item.knowledgeId,
            },
          });
          rejected.push({ eventId: item.eventId, reason: 'STALE_VERSION' });
          acceptedEventIds.push(item.eventId);
          continue;
        }

        const applied = await applyLearningStateItem(tx, userId, item, existing);
        if (applied === 'APPLIED') {
          await tx.syncProcessedEvent.create({
            data: {
              eventId: item.eventId,
              userId,
              knowledgeId: item.knowledgeId,
            },
          });
          acceptedEventIds.push(item.eventId);
          continue;
        }

        await tx.syncProcessedEvent.create({
          data: {
            eventId: item.eventId,
            userId,
            knowledgeId: item.knowledgeId,
          },
        });
        rejected.push({ eventId: item.eventId, reason: 'STALE_VERSION' });
        acceptedEventIds.push(item.eventId);
      }

      return { acceptedEventIds, rejected };
    });
  }

  async listSnapshot(userId: string): Promise<SyncSnapshotItem[]> {
    const rows = await this.prisma.learningState.findMany({
      where: { userId },
      orderBy: { knowledgeId: 'asc' },
    });

    return rows.map((row) => ({
      knowledgeId: row.knowledgeId,
      inReviewPool: row.inReviewPool,
      boxLevel: row.boxLevel,
      dueAt: row.dueAt.toISOString(),
      firstAddedFromPackId: row.firstAddedFromPackId,
      ...(row.lastSeenInPackId ? { lastSeenInPackId: row.lastSeenInPackId } : {}),
      ...(row.consecutiveLevel3Passes > 0
        ? { consecutiveLevel3Passes: row.consecutiveLevel3Passes }
        : {}),
      clientVersion: row.clientVersion,
      updatedAt: row.updatedAt.toISOString(),
      legacyEasiness: row.easiness,
      legacyIntervalDays: row.intervalDays,
      legacyRepetitions: row.repetitions,
    }));
  }
}

type ApplyResult = 'APPLIED' | 'STALE';

interface ExistingLearningState {
  clientVersion: number;
  boxLevel: number;
  dueAt: Date;
  firstAddedFromPackId: string;
  lastSeenInPackId: string | null;
  consecutiveLevel3Passes: number;
  inReviewPool: boolean;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  packId: string;
}

async function applyLearningStateItem(
  tx: Prisma.TransactionClient,
  userId: string,
  item: SyncBatchItem,
  existing: ExistingLearningState | null,
): Promise<ApplyResult> {
  const incomingDueAt = new Date(item.payload.dueAt);
  const merged = existing
    ? {
        inReviewPool: item.payload.inReviewPool || existing.inReviewPool,
        boxLevel: Math.min(existing.boxLevel, item.payload.boxLevel),
        dueAt: incomingDueAt.getTime() < existing.dueAt.getTime() ? incomingDueAt : existing.dueAt,
        firstAddedFromPackId:
          item.clientVersion >= existing.clientVersion
            ? item.payload.firstAddedFromPackId
            : existing.firstAddedFromPackId,
        lastSeenInPackId: item.payload.lastSeenInPackId ?? existing.lastSeenInPackId ?? null,
        consecutiveLevel3Passes:
          item.clientVersion >= existing.clientVersion
            ? (item.payload.consecutiveLevel3Passes ?? 0)
            : existing.consecutiveLevel3Passes,
        easiness: item.payload.legacyEasiness ?? existing.easiness,
        intervalDays: item.payload.legacyIntervalDays ?? existing.intervalDays,
        repetitions: item.payload.legacyRepetitions ?? existing.repetitions,
        packId: item.payload.firstAddedFromPackId,
        clientVersion: Math.max(existing.clientVersion, item.clientVersion),
        updatedAt: new Date(item.payload.updatedAt),
      }
    : {
        inReviewPool: item.payload.inReviewPool,
        boxLevel: item.payload.boxLevel,
        dueAt: incomingDueAt,
        firstAddedFromPackId: item.payload.firstAddedFromPackId,
        lastSeenInPackId: item.payload.lastSeenInPackId ?? null,
        consecutiveLevel3Passes: item.payload.consecutiveLevel3Passes ?? 0,
        easiness: item.payload.legacyEasiness ?? 2.5,
        intervalDays: item.payload.legacyIntervalDays ?? 0,
        repetitions: item.payload.legacyRepetitions ?? 0,
        packId: item.payload.firstAddedFromPackId,
        clientVersion: item.clientVersion,
        updatedAt: new Date(item.payload.updatedAt),
      };

  if (!existing) {
    try {
      await tx.learningState.create({
        data: {
          userId,
          knowledgeId: item.knowledgeId,
          ...merged,
        },
      });
      return 'APPLIED';
    } catch {
      const raced = await tx.learningState.findUnique({
        where: {
          userId_knowledgeId: {
            userId,
            knowledgeId: item.knowledgeId,
          },
        },
      });
      if (!raced || raced.clientVersion >= item.clientVersion) {
        return 'STALE';
      }
    }
  }

  const updated = await tx.learningState.updateMany({
    where: {
      userId,
      knowledgeId: item.knowledgeId,
      clientVersion: { lt: merged.clientVersion },
    },
    data: merged,
  });

  return updated.count === 1 ? 'APPLIED' : 'STALE';
}
