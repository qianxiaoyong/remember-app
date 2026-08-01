import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import type { AdminUserDetail, AdminUserListResponse } from '@remember/contracts';
import { adminListUsersQuerySchema } from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminUsersService } from './admin-users.service.js';

@Controller('admin/users')
@UseGuards(AdminAuthGuard)
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  listUsers(@Query() query: unknown): Promise<AdminUserListResponse> {
    return this.service.listUsers(adminListUsersQuerySchema.parse(query));
  }

  @Get(':userId')
  getUserDetail(@Param('userId') userId: string): Promise<AdminUserDetail> {
    return this.service.getUserDetail(userId);
  }
}
