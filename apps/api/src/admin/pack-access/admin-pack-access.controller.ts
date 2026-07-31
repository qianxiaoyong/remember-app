import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { AdminGrantPackAccessResponse } from '@remember/contracts';
import {
  adminGrantPackAccessRequestSchema,
  adminListPackAccessQuerySchema,
} from '@remember/contracts';
import {
  AdminAuthGuard,
  requireAdminAuthContext,
  type RequestWithAdminAuth,
} from '../../admin-auth/admin-auth.guard.js';
import { AdminPackAccessService } from './admin-pack-access.service.js';

@Controller('admin/pack-access')
@UseGuards(AdminAuthGuard)
export class AdminPackAccessController {
  constructor(private readonly service: AdminPackAccessService) {}

  @Get()
  listPackAccess(@Query() query: unknown) {
    return this.service.listPackAccess(adminListPackAccessQuerySchema.parse(query));
  }

  @Post('grant')
  @HttpCode(200)
  grantPackAccess(
    @Req() request: RequestWithAdminAuth,
    @Body() body: unknown,
  ): Promise<AdminGrantPackAccessResponse> {
    const admin = requireAdminAuthContext(request);
    const input = adminGrantPackAccessRequestSchema.parse(body);
    return this.service.grantPackAccess(admin.adminUserId, input);
  }
}
