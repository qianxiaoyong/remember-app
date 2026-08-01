import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  adminCreatePrimaryTaxonomyNodeRequestSchema,
  adminCreateSecondaryTaxonomyNodeRequestSchema,
  adminCreateVersionTaxonomyNodeRequestSchema,
  adminUpdatePrimaryTaxonomyNodeRequestSchema,
  adminUpdateSecondaryTaxonomyNodeRequestSchema,
  adminUpdateVersionTaxonomyNodeRequestSchema,
} from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminCatalogTaxonomyService } from './admin-catalog-taxonomy.service.js';

@Controller('admin/catalog/taxonomy')
@UseGuards(AdminAuthGuard)
export class AdminCatalogTaxonomyController {
  constructor(private readonly service: AdminCatalogTaxonomyService) {}

  @Get()
  listTaxonomy() {
    return this.service.listTaxonomy();
  }

  @Post('primaries')
  createPrimary(@Body() body: unknown) {
    return this.service.createPrimary(adminCreatePrimaryTaxonomyNodeRequestSchema.parse(body));
  }

  @Patch('primaries/:id')
  updatePrimary(@Param('id') id: string, @Body() body: unknown) {
    return this.service.updatePrimary(id, adminUpdatePrimaryTaxonomyNodeRequestSchema.parse(body));
  }

  @Delete('primaries/:id')
  @HttpCode(204)
  async deletePrimary(@Param('id') id: string) {
    await this.service.deletePrimary(id);
  }

  @Post('primaries/:primaryId/secondaries')
  createSecondary(@Param('primaryId') primaryId: string, @Body() body: unknown) {
    return this.service.createSecondary(
      primaryId,
      adminCreateSecondaryTaxonomyNodeRequestSchema.parse(body),
    );
  }

  @Patch('secondaries/:id')
  updateSecondary(@Param('id') id: string, @Body() body: unknown) {
    return this.service.updateSecondary(
      id,
      adminUpdateSecondaryTaxonomyNodeRequestSchema.parse(body),
    );
  }

  @Delete('secondaries/:id')
  @HttpCode(204)
  async deleteSecondary(@Param('id') id: string) {
    await this.service.deleteSecondary(id);
  }

  @Post('versions')
  createVersion(@Body() body: unknown) {
    return this.service.createVersion(adminCreateVersionTaxonomyNodeRequestSchema.parse(body));
  }

  @Patch('versions/:id')
  updateVersion(@Param('id') id: string, @Body() body: unknown) {
    return this.service.updateVersion(id, adminUpdateVersionTaxonomyNodeRequestSchema.parse(body));
  }

  @Delete('versions/:id')
  @HttpCode(204)
  async deleteVersion(@Param('id') id: string) {
    await this.service.deleteVersion(id);
  }
}
