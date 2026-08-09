import type { PackDownloadAuthorizationResponse } from '@remember/contracts';
import { packDownloadAuthorizationResponseSchema } from '@remember/contracts';
import { apiFetchJson } from './api-client';

/** 大包经 staging API 代理下载可能较慢；与 install 验包分离，仅约束 HTTP 下载。 */
const PACK_DOWNLOAD_TIMEOUT_MS = 600_000;

export async function requestPackDownloadAuthorization(
  sessionToken: string,
  packId: string,
): Promise<PackDownloadAuthorizationResponse> {
  const body = await apiFetchJson<unknown>(
    `/api/v1/packs/${encodeURIComponent(packId)}/download-authorization`,
    {
      method: 'POST',
      sessionToken,
    },
  );
  return packDownloadAuthorizationResponseSchema.parse(body);
}

export async function downloadPackZipBytes(downloadUrl: string): Promise<Uint8Array> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, PACK_DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(downloadUrl, { method: 'GET', signal: controller.signal });
    if (!response.ok) {
      throw new Error('下载失败，请稍后重试');
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } finally {
    clearTimeout(timeoutId);
  }
}
