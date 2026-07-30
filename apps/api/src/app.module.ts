import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { HealthController } from './health/health.controller.js';
import { PackAccessModule } from './pack-access/pack-access.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedemptionModule } from './redemption/redemption.module.js';
import { SyncModule } from './sync/sync.module.js';

@Module({
  imports: [PrismaModule, AuthModule, SyncModule, CatalogModule, PackAccessModule, RedemptionModule],
  controllers: [HealthController],
})
export class AppModule {}
