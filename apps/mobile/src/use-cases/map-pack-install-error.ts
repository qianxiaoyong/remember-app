import { PackVerificationError, type PackErrorCode } from '@remember/contracts';

const PACK_INSTALL_ERROR_MESSAGES: Partial<Record<PackErrorCode, string>> = {
  PACK_ARCHIVE_INVALID: '安装包不完整，请重新下载',
  PACK_MANIFEST_INVALID: '安装包格式错误，请重新下载',
  PACK_PROTOCOL_UNSUPPORTED: '该学习包需要新版 App，请先升级应用',
  PACK_INTEGRITY_FAILED: '安装包文件损坏，请重新下载',
  PACK_SIGNATURE_INVALID: '不是有效的官方安装包',
  PACK_KEY_UNKNOWN: '请先更新 App 后再安装此学习包',
  PACK_SIZE_EXCEEDED: '安装包过大，请联系客服',
  PACK_SCHEMA_INVALID: '安装包内容损坏，请重新下载',
  PACK_CONTENT_INVALID: '安装包内容损坏，请重新下载',
  PACK_UNSUPPORTED_CARD_TYPE: '请先更新 App 后再安装此学习包',
};

export function mapPackInstallError(error: unknown): Error {
  if (error instanceof PackVerificationError) {
    const message = PACK_INSTALL_ERROR_MESSAGES[error.code] ?? '安装失败，请重新下载或联系客服';
    return new Error(message, { cause: error });
  }

  return error instanceof Error ? error : new Error('安装失败');
}
