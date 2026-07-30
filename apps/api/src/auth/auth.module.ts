import { Module } from '@nestjs/common';
import { SmsModule } from '../sms/sms.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [SmsModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
