import { Injectable } from '@nestjs/common';
import type { ListMyPackAccessResponse } from '@remember/contracts';
import { listMyPackAccessResponseSchema } from '@remember/contracts';
import { PackAccessRepository } from './pack-access.repository.js';

@Injectable()
export class PackAccessService {
  constructor(private readonly packAccessRepository: PackAccessRepository) {}

  async listMyPackAccess(userId: string): Promise<ListMyPackAccessResponse> {
    const rows = await this.packAccessRepository.listByUserId(userId);
    return listMyPackAccessResponseSchema.parse({
      items: rows.map((row) => ({
        packId: row.packId,
        grantedAt: row.grantedAt.toISOString(),
        source: row.source === 'purchase' ? 'purchase' : 'redemption',
      })),
    });
  }
}
