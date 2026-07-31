import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller.js';
import { AdminAuthGuard } from './admin-auth.guard.js';
import { AdminAuthRepository } from './admin-auth.repository.js';
import { AdminAuthService } from './admin-auth.service.js';

@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthRepository, AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthService, AdminAuthGuard],
})
export class AdminAuthModule {}
