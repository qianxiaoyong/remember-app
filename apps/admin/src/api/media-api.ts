import { adminMediaUploadCoverResponseSchema } from '@remember/contracts';
import { adminFetch } from './admin-api-client.js';

export async function uploadAdminMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await adminFetch('/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    let message = '上传失败';
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // 非 JSON 错误体
    }
    throw new Error(message);
  }
  const body = (await response.json()) as { url: string };
  return body.url;
}

export async function uploadAdminCover(
  file: File,
): Promise<ReturnType<typeof adminMediaUploadCoverResponseSchema.parse>> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await adminFetch('/admin/media/upload-cover', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    let message = '上传失败';
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // 非 JSON 错误体
    }
    throw new Error(message);
  }
  const body = adminMediaUploadCoverResponseSchema.parse(await response.json());
  return body;
}
