import { Injectable } from '@nestjs/common';
import type {
  SyncBatchUploadRequest,
  SyncBatchUploadResponse,
  SyncSnapshotResponse,
} from '@remember/contracts';
import {
  syncBatchUploadRequestSchema,
  syncBatchUploadResponseSchema,
  syncSnapshotResponseSchema,
} from '@remember/contracts';
import type { AuthenticatedRequestContext } from '../auth/auth.service.js';
import { SyncRepository } from './sync.repository.js';

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}

  async uploadBatch(
    context: AuthenticatedRequestContext,
    body: unknown,
  ): Promise<SyncBatchUploadResponse> {
    const parsed: SyncBatchUploadRequest = syncBatchUploadRequestSchema.parse(body);
    const result = await this.syncRepository.applyBatchUpload(context.userId, parsed.items);
    return syncBatchUploadResponseSchema.parse(result);
  }

  async getSnapshot(context: AuthenticatedRequestContext): Promise<SyncSnapshotResponse> {
    const items = await this.syncRepository.listSnapshot(context.userId);
    return syncSnapshotResponseSchema.parse({ items });
  }
}
