import { Controller, Get, NotFoundException } from '@nestjs/common';
import { appReleaseResponseSchema, type AppReleaseResponse } from '@remember/contracts';
import { readAppReleaseConfig } from '../config/read-app-release-config.js';

@Controller('app/release')
export class AppReleaseController {
  @Get()
  getRelease(): AppReleaseResponse {
    const config = readAppReleaseConfig();
    if (!config) {
      throw new NotFoundException({
        code: 'APP_RELEASE_NOT_CONFIGURED',
        message: 'App 发布信息尚未配置',
      });
    }

    return appReleaseResponseSchema.parse({
      minAndroidVersion: config.minAndroidVersion,
      latestApkUrl: config.latestApkUrl,
      ...(config.forceUpdateBelow ? { forceUpdateBelow: config.forceUpdateBelow } : {}),
    });
  }
}
