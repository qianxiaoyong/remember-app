import { Module } from '@nestjs/common';
import { CosPackStorage } from './cos-pack-storage.js';

@Module({
  providers: [CosPackStorage],
  exports: [CosPackStorage],
})
export class StorageModule {}
