import { Controller, Get, Param, Query } from '@nestjs/common';
import type {
  CatalogPackDetail,
  CatalogPackPriceResponse,
  ListCatalogPacksResponse,
} from '@remember/contracts';
import { listCatalogPacksQuerySchema } from '@remember/contracts';
import { CatalogService } from './catalog.service.js';

@Controller('catalog/packs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async listPacks(@Query() query: unknown): Promise<ListCatalogPacksResponse> {
    const parsed = listCatalogPacksQuerySchema.parse(query);
    const items = await this.catalogService.listPacks(parsed);
    return { items };
  }

  @Get(':packId/price')
  getPackPrice(@Param('packId') packId: string): Promise<CatalogPackPriceResponse> {
    return this.catalogService.getPackPrice(packId);
  }

  @Get(':packId')
  getPackDetail(@Param('packId') packId: string): Promise<CatalogPackDetail> {
    return this.catalogService.getPackDetail(packId);
  }
}
