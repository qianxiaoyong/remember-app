import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CatalogPackDetail,
  CatalogPackPriceResponse,
  CatalogPackSummary,
  ListCatalogPacksQuery,
} from '@remember/contracts';
import { catalogPackPriceResponseSchema } from '@remember/contracts';
import { mapPackDetail, mapPackSummaries } from './catalog.mapper.js';
import { CatalogRepository } from './catalog.repository.js';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listPacks(query: ListCatalogPacksQuery): Promise<CatalogPackSummary[]> {
    const packs = await this.catalogRepository.listPublishedPacks({
      ...(query.primaryCategory ? { primaryCategory: query.primaryCategory } : {}),
      ...(query.secondaryCategory ? { secondaryCategory: query.secondaryCategory } : {}),
      ...(query.versionLabel ? { versionLabel: query.versionLabel } : {}),
      ...(query.keyword ? { keyword: query.keyword } : {}),
    });
    return mapPackSummaries(packs);
  }

  async getPackDetail(packId: string): Promise<CatalogPackDetail> {
    const pack = await this.catalogRepository.findPublishedPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '未找到该知识库' });
    }
    return mapPackDetail(pack);
  }

  async getPackPrice(packId: string): Promise<CatalogPackPriceResponse> {
    const pack = await this.catalogRepository.findPublishedPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '未找到该知识库' });
    }
    return catalogPackPriceResponseSchema.parse({
      packId: pack.packId,
      priceCents: pack.priceCents,
    });
  }
}
