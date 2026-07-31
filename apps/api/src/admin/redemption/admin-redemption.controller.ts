import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  adminCreateRedemptionBatchRequestSchema,
  adminListRedemptionCodesQuerySchema,
  adminUpdateRedemptionCodeRequestSchema,
} from '@remember/contracts';
import {
  AdminAuthGuard,
  requireAdminAuthContext,
  type RequestWithAdminAuth,
} from '../../admin-auth/admin-auth.guard.js';
import { AdminRedemptionService } from './admin-redemption.service.js';

@Controller('admin/redemption-codes')
@UseGuards(AdminAuthGuard)
export class AdminRedemptionController {
  constructor(private readonly service: AdminRedemptionService) {}

  @Post('batch')
  @HttpCode(200)
  createBatch(@Req() request: RequestWithAdminAuth, @Body() body: unknown) {
    const admin = requireAdminAuthContext(request);
    return this.service.createBatch(
      admin.adminUserId,
      adminCreateRedemptionBatchRequestSchema.parse(body),
    );
  }

  @Get()
  listCodes(@Query() query: unknown) {
    return this.service.listCodes(adminListRedemptionCodesQuerySchema.parse(query));
  }

  @Get(':id')
  getCode(@Param('id') id: string) {
    return this.service.getCode(id);
  }

  @Patch(':id')
  updateCode(@Req() request: RequestWithAdminAuth, @Param('id') id: string, @Body() body: unknown) {
    const admin = requireAdminAuthContext(request);
    return this.service.updateCode(
      admin.adminUserId,
      id,
      adminUpdateRedemptionCodeRequestSchema.parse(body),
    );
  }

  @Post(':id/delete')
  @HttpCode(200)
  deleteCode(@Req() request: RequestWithAdminAuth, @Param('id') id: string) {
    const admin = requireAdminAuthContext(request);
    return this.service.deleteCode(admin.adminUserId, id);
  }

  @Post(':id/restore')
  @HttpCode(200)
  restoreCode(@Req() request: RequestWithAdminAuth, @Param('id') id: string) {
    const admin = requireAdminAuthContext(request);
    return this.service.restoreCode(admin.adminUserId, id);
  }
}
