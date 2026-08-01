import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller.js';
import { CatalogTaxonomyController } from './catalog-taxonomy.controller.js';
import { CatalogTaxonomyRepository } from './catalog-taxonomy.repository.js';
import { CatalogTaxonomyService } from './catalog-taxonomy.service.js';
import { CatalogRepository } from './catalog.repository.js';
import { CatalogService } from './catalog.service.js';

@Module({
  controllers: [CatalogController, CatalogTaxonomyController],
  providers: [CatalogRepository, CatalogService, CatalogTaxonomyRepository, CatalogTaxonomyService],
  exports: [CatalogService, CatalogRepository, CatalogTaxonomyService],
})
export class CatalogModule {}
