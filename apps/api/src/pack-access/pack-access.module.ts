import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PackAccessController } from './pack-access.controller.js';
import { PackAccessRepository } from './pack-access.repository.js';
import { PackAccessService } from './pack-access.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PackAccessController],
  providers: [PackAccessRepository, PackAccessService],
  exports: [PackAccessRepository, PackAccessService],
})
export class PackAccessModule {}
