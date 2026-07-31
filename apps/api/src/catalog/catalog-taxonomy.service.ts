import { Injectable } from '@nestjs/common';
import { catalogTaxonomyResponseSchema, type CatalogTaxonomyResponse } from '@remember/contracts';
import { CatalogTaxonomyRepository } from './catalog-taxonomy.repository.js';

@Injectable()
export class CatalogTaxonomyService {
  constructor(private readonly repository: CatalogTaxonomyRepository) {}

  async getTaxonomy(): Promise<CatalogTaxonomyResponse> {
    const [primaries, versions] = await Promise.all([
      this.repository.listActiveTaxonomy(),
      this.repository.listActiveVersions(),
    ]);

    return catalogTaxonomyResponseSchema.parse({
      primaries: primaries.map((primary) => ({
        id: primary.id,
        slug: primary.slug,
        label: primary.label,
        sortOrder: primary.sortOrder,
        status: primary.status,
        children: primary.children.map((secondary) => ({
          id: secondary.id,
          slug: secondary.slug,
          label: secondary.label,
          sortOrder: secondary.sortOrder,
          status: secondary.status,
        })),
      })),
      versions: versions.map((version) => ({
        id: version.id,
        slug: version.slug,
        label: version.label,
        sortOrder: version.sortOrder,
        status: version.status,
      })),
    });
  }
}
