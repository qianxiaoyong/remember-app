import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { PackVerifyModule } from '../pack-verify/pack-verify.module.js';
import { PaymentModule } from '../payment/payment.module.js';
import { RedemptionModule } from '../redemption/redemption.module.js';
import { AdminAuditLogsController } from './audit-logs/admin-audit-logs.controller.js';
import { AdminAuditLogsService } from './audit-logs/admin-audit-logs.service.js';
import { AdminCatalogTaxonomyController } from './catalog-taxonomy/admin-catalog-taxonomy.controller.js';
import { AdminCatalogTaxonomyRepository } from './catalog-taxonomy/admin-catalog-taxonomy.repository.js';
import { AdminCatalogTaxonomyService } from './catalog-taxonomy/admin-catalog-taxonomy.service.js';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller.js';
import { AdminDashboardRepository } from './dashboard/admin-dashboard.repository.js';
import { AdminDashboardService } from './dashboard/admin-dashboard.service.js';
import { AdminLexiconController } from './lexicon/admin-lexicon.controller.js';
import { AdminLexiconEnrichService } from './lexicon/admin-lexicon-enrich.service.js';
import { AdminLexiconRepository } from './lexicon/admin-lexicon.repository.js';
import { AdminLexiconService } from './lexicon/admin-lexicon.service.js';
import { AdminOrdersController } from './orders/admin-orders.controller.js';
import { AdminOrdersRepository } from './orders/admin-orders.repository.js';
import { AdminOrdersService } from './orders/admin-orders.service.js';
import { AdminPackAccessController } from './pack-access/admin-pack-access.controller.js';
import { AdminPackAccessRepository } from './pack-access/admin-pack-access.repository.js';
import { AdminPackAccessService } from './pack-access/admin-pack-access.service.js';
import { AdminPacksController } from './packs/admin-packs.controller.js';
import { AdminPackVersionsService } from './packs/admin-pack-versions.service.js';
import { AdminPacksRepository } from './packs/admin-packs.repository.js';
import { AdminPacksService } from './packs/admin-packs.service.js';
import { AdminRedemptionController } from './redemption/admin-redemption.controller.js';
import { AdminRedemptionService } from './redemption/admin-redemption.service.js';
import { AdminRefundsController } from './refunds/admin-refunds.controller.js';
import { AdminRefundsService } from './refunds/admin-refunds.service.js';
import { AdminUsersController } from './users/admin-users.controller.js';
import { AdminUsersRepository } from './users/admin-users.repository.js';
import { AdminUsersService } from './users/admin-users.service.js';

@Module({
  imports: [AdminAuthModule, AuditModule, PackVerifyModule, PaymentModule, RedemptionModule],
  controllers: [
    AdminDashboardController,
    AdminOrdersController,
    AdminPackAccessController,
    AdminPacksController,
    AdminCatalogTaxonomyController,
    AdminLexiconController,
    AdminRefundsController,
    AdminRedemptionController,
    AdminAuditLogsController,
    AdminUsersController,
  ],
  providers: [
    AdminDashboardRepository,
    AdminDashboardService,
    AdminOrdersRepository,
    AdminOrdersService,
    AdminPackAccessRepository,
    AdminPackAccessService,
    AdminPacksRepository,
    AdminPacksService,
    AdminPackVersionsService,
    AdminCatalogTaxonomyRepository,
    AdminCatalogTaxonomyService,
    AdminLexiconRepository,
    AdminLexiconEnrichService,
    AdminLexiconService,
    AdminRefundsService,
    AdminRedemptionService,
    AdminAuditLogsService,
    AdminUsersRepository,
    AdminUsersService,
  ],
})
export class AdminModule {}
