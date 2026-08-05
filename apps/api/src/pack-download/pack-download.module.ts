import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { PackAccessModule } from '../pack-access/pack-access.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { PackDownloadConfigService } from './pack-download-config.service.js';
import { PackDownloadController } from './pack-download.controller.js';
import { PackDownloadService } from './pack-download.service.js';

@Module({
  imports: [AuthModule, CatalogModule, PackAccessModule, StorageModule],
  controllers: [PackDownloadController],
  providers: [PackDownloadConfigService, PackDownloadService],
  exports: [PackDownloadService],
})
export class PackDownloadModule {}
