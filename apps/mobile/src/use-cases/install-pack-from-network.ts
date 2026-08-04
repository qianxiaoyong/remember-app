import { readSessionToken } from '../data/session/session-store';
import {
  downloadPackZipBytes,
  requestPackDownloadAuthorization,
} from '../data/api/pack-download-api';
import { ApiRequestError } from '../data/api/api-client';
import { fetchCatalogPackDetail } from '../data/api/catalog-api';
import { findCatalogItemSync } from '../data/catalog/catalog-cache-store';
import { installPackFromZipBytes } from '../data/pack/install-pack-from-zip';
import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';
import { writeOfflineLicenseExpiry } from '../data/offline-license/offline-license-store';
import { aliasInstalledPack } from './alias-installed-pack';
import { mapPackInstallError } from './map-pack-install-error';

const DOWNLOAD_ERROR_MESSAGES: Record<string, string> = {
  PACK_ACCESS_DENIED: '暂无下载权限，请先购买或兑换',
  PACK_NOT_FOUND: '未找到该知识库',
  PACK_VERSION_NOT_FOUND: '暂无可下载版本',
  PACK_DOWNLOAD_TOKEN_EXPIRED: '下载链接已过期，请重试',
  PACK_DOWNLOAD_TOKEN_INVALID: '下载授权无效，请重试',
  UNAUTHORIZED: '请先登录后再安装',
};

let activeDownloadPackId: string | null = null;

export async function installPackFromNetwork(catalogPackId: string): Promise<InstalledPackRow> {
  if (activeDownloadPackId) {
    throw new Error('已有下载任务进行中，请稍候');
  }

  const token = await readSessionToken();
  if (!token) {
    throw new Error(DOWNLOAD_ERROR_MESSAGES.UNAUTHORIZED);
  }

  activeDownloadPackId = catalogPackId;
  try {
    const authorization = await requestPackDownloadAuthorization(token, catalogPackId);

    const zipBytes = await downloadPackZipBytes(authorization.downloadUrl);
    const displayName = await resolveInstallDisplayName(catalogPackId);
    const installed = await installPackFromZipBytes(zipBytes, displayName);
    await writeOfflineLicenseExpiry(catalogPackId, authorization.offlineLicenseExpiresAt);

    if (authorization.devContentPackId && authorization.devContentPackId !== catalogPackId) {
      return aliasInstalledPack(catalogPackId, installed);
    }

    if (installed.packId !== catalogPackId) {
      throw new Error('安装包与请求的知识库不一致');
    }

    return installed;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw new Error(DOWNLOAD_ERROR_MESSAGES[error.code] ?? error.message, { cause: error });
    }
    throw mapPackInstallError(error);
  } finally {
    activeDownloadPackId = null;
  }
}

async function resolveInstallDisplayName(catalogPackId: string): Promise<string | undefined> {
  const cachedTitle = findCatalogItemSync(catalogPackId)?.title;
  if (cachedTitle) {
    return cachedTitle;
  }

  try {
    const detail = await fetchCatalogPackDetail(catalogPackId);
    return detail.title;
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === 'PACK_NOT_FOUND') {
      return undefined;
    }
    return undefined;
  }
}
