import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { adminListAuditLogsQuerySchema } from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminAuditLogsService } from './admin-audit-logs.service.js';

@Controller('admin/audit-logs')
@UseGuards(AdminAuthGuard)
export class AdminAuditLogsController {
  constructor(private readonly service: AdminAuditLogsService) {}

  @Get()
  listAuditLogs(@Query() query: unknown) {
    return this.service.listAuditLogs(adminListAuditLogsQuerySchema.parse(query));
  }
}
