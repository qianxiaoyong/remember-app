import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { SyncBatchUploadResponse, SyncSnapshotResponse } from '@remember/contracts';
import { AuthGuard, requireAuthContext, type RequestWithAuth } from '../auth/auth.guard.js';
import { SyncService } from './sync.service.js';

@Controller('sync/learning-states')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('batch')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  uploadBatch(
    @Req() request: RequestWithAuth,
    @Body() body: unknown,
  ): Promise<SyncBatchUploadResponse> {
    return this.syncService.uploadBatch(requireAuthContext(request), body);
  }

  @Get('snapshot')
  @UseGuards(AuthGuard)
  getSnapshot(@Req() request: RequestWithAuth): Promise<SyncSnapshotResponse> {
    return this.syncService.getSnapshot(requireAuthContext(request));
  }
}
