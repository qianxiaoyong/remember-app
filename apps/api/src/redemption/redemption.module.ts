import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PackAccessModule } from '../pack-access/pack-access.module.js';
import { RedemptionConfigService } from './redemption-config.service.js';
import { RedemptionController } from './redemption.controller.js';
import { RedemptionRepository } from './redemption.repository.js';
import { RedemptionService } from './redemption.service.js';

@Module({
  imports: [AuthModule, PackAccessModule],
  controllers: [RedemptionController],
  providers: [RedemptionConfigService, RedemptionRepository, RedemptionService],
  exports: [RedemptionConfigService],
})
export class RedemptionModule {}
