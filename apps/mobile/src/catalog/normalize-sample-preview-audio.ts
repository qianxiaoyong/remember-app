import type { PackSamplePreview } from './pack-sample-preview';

/** dev/集成测试用的占位 CDN，不可作为真实公开试听。 */
export function isDevPlaceholderPreviewUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'cdn.example.com' || host.endsWith('.example.com');
  } catch {
    return true;
  }
}

export function normalizeSamplePreviewAudioFields(sample: PackSamplePreview): PackSamplePreview {
  if (!sample.previewAudioUrl || !isDevPlaceholderPreviewUrl(sample.previewAudioUrl)) {
    return sample;
  }
  const { previewAudioUrl: _previewAudioUrl, ...rest } = sample;
  void _previewAudioUrl;
  return rest;
}
