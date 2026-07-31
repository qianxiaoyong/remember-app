import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { AdminCreateRefundResponse } from '@remember/contracts';
import { adminCreateRefundRequestSchema } from '@remember/contracts';
import {
  AdminAuthGuard,
  requireAdminAuthContext,
  type RequestWithAdminAuth,
} from '../../admin-auth/admin-auth.guard.js';
import { AdminRefundsService } from './admin-refunds.service.js';

@Controller('admin/refunds')
@UseGuards(AdminAuthGuard)
export class AdminRefundsController {
  constructor(private readonly service: AdminRefundsService) {}

  @Post()
  @HttpCode(200)
  createRefund(
    @Req() request: RequestWithAdminAuth,
    @Body() body: unknown,
  ): Promise<AdminCreateRefundResponse> {
    const admin = requireAdminAuthContext(request);
    const input = adminCreateRefundRequestSchema.parse(body);
    return this.service.createRefund(admin.adminUserId, input);
  }
}
