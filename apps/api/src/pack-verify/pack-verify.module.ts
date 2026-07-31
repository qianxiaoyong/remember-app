import { Module } from '@nestjs/common';
import { PackVerifyService } from './pack-verify.service.js';

@Module({
  providers: [PackVerifyService],
  exports: [PackVerifyService],
})
export class PackVerifyModule {}
