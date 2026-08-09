import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { adminUpsertContentTagVocabularyRequestSchema } from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminContentTagsService } from './admin-content-tags.service.js';

@Controller('admin/content-tags')
@UseGuards(AdminAuthGuard)
export class AdminContentTagsController {
  constructor(private readonly service: AdminContentTagsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  @HttpCode(204)
  async upsert(@Body() body: unknown): Promise<void> {
    const input = adminUpsertContentTagVocabularyRequestSchema.parse(body);
    await this.service.upsertLabels(input.labels);
  }

  @Delete(':label')
  @HttpCode(204)
  async delete(@Param('label') label: string): Promise<void> {
    await this.service.delete(decodeURIComponent(label));
  }
}
