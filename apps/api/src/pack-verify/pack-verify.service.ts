import { HttpException, Injectable } from '@nestjs/common';
import { PackVerificationError } from '@remember/contracts';
import { verifyPackZipBuffer, type VerifiedPackArchive } from '@remember/pack-builder/verify';

@Injectable()
export class PackVerifyService {
  async verifyUploadedZip(zipBytes: Uint8Array): Promise<VerifiedPackArchive> {
    try {
      return await verifyPackZipBuffer(zipBytes);
    } catch (error) {
      if (error instanceof PackVerificationError) {
        throw new HttpException(
          { code: error.code, message: '学习包校验失败' },
          error.code === 'PACK_PROTOCOL_UNSUPPORTED' ? 422 : 400,
        );
      }
      throw error;
    }
  }
}
