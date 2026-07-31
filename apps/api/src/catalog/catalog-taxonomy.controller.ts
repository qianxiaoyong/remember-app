import { Controller, Get } from '@nestjs/common';
import type { CatalogTaxonomyResponse } from '@remember/contracts';
import { CatalogTaxonomyService } from './catalog-taxonomy.service.js';

@Controller('catalog/taxonomy')
export class CatalogTaxonomyController {
  constructor(private readonly taxonomyService: CatalogTaxonomyService) {}

  @Get()
  getTaxonomy(): Promise<CatalogTaxonomyResponse> {
    return this.taxonomyService.getTaxonomy();
  }
}
