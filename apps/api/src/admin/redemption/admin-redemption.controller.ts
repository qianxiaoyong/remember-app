import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import {
  adminCreateRedemptionBatchRequestSchema,
  adminListRedemptionCodesQuerySchema,
} from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminRedemptionService } from './admin-redemption.service.js';

@Controller('admin/redemption-codes')
@UseGuards(AdminAuthGuard)
export class AdminRedemptionController {
  constructor(private readonly service: AdminRedemptionService) {}

  @Post('batch')
  @HttpCode(200)
  createBatch(@Body() body: unknown) {
    return this.service.createBatch(adminCreateRedemptionBatchRequestSchema.parse(body));
  }

  @Get()
  listCodes(@Query() query: unknown) {
    return this.service.listCodes(adminListRedemptionCodesQuerySchema.parse(query));
  }
}
