import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type {
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminSessionUser,
} from '@remember/contracts';
import { adminLoginRequestSchema } from '@remember/contracts';
import {
  AdminAuthGuard,
  requireAdminAuthContext,
  type RequestWithAdminAuth,
} from './admin-auth.guard.js';
import { AdminAuthService } from './admin-auth.service.js';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: unknown): Promise<AdminLoginResponse> {
    const input = adminLoginRequestSchema.parse(body);
    return this.adminAuthService.login(input);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AdminAuthGuard)
  logout(@Req() request: RequestWithAdminAuth): Promise<AdminLogoutResponse> {
    return this.adminAuthService.logout(requireAdminAuthContext(request));
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  getCurrentAdmin(@Req() request: RequestWithAdminAuth): Promise<AdminSessionUser> {
    return this.adminAuthService.getCurrentAdmin(requireAdminAuthContext(request));
  }
}
