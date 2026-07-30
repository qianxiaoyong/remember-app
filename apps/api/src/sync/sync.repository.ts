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
      packId: row.packId,
      easiness: row.easiness,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
      dueAt: row.dueAt.toISOString(),
      clientVersion: row.clientVersion,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }
}

type ApplyResult = 'APPLIED' | 'STALE';

async function applyLearningStateItem(
  tx: Prisma.TransactionClient,
  userId: string,
  item: SyncBatchItem,
  existing: {
    clientVersion: number;
  } | null,
): Promise<ApplyResult> {
  const data = {
    packId: item.payload.packId,
    easiness: item.payload.easiness,
    intervalDays: item.payload.intervalDays,
    repetitions: item.payload.repetitions,
    dueAt: new Date(item.payload.dueAt),
    clientVersion: item.clientVersion,
    updatedAt: new Date(item.payload.updatedAt),
  };

  if (!existing) {
    try {
      await tx.learningState.create({
        data: {
          userId,
          knowledgeId: item.knowledgeId,
          ...data,
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
      clientVersion: { lt: item.clientVersion },
    },
    data,
  });

  return updated.count === 1 ? 'APPLIED' : 'STALE';
}
