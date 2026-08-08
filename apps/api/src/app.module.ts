import { Module } from '@nestjs/common';
import { AdminAuthModule } from './admin-auth/admin-auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { HealthController } from './health/health.controller.js';
import { AppReleaseController } from './app-release/app-release.controller.js';
import { MediaController } from './media/media.controller.js';
import { OrderModule } from './order/order.module.js';
import { PackAccessModule } from './pack-access/pack-access.module.js';
import { PackDownloadModule } from './pack-download/pack-download.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedemptionModule } from './redemption/redemption.module.js';
import { SyncModule } from './sync/sync.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminAuthModule,
    AdminModule,
    AuditModule,
    SyncModule,
    StorageModule,
    CatalogModule,
    PackAccessModule,
    RedemptionModule,
    OrderModule,
    PaymentModule,
    PackDownloadModule,
  ],
  controllers: [HealthController, AppReleaseController, MediaController],
})
export class AppModule {}
