import type { ImageURISource } from 'react-native';

const remoteCoverSourceByUri = new Map<string, ImageURISource>();

/** 同一 coverUrl 复用同一 `{ uri }` 对象，避免 Image 误判 source 变化而重复解码。 */
export function resolveRemoteCoverImageSource(uri: string): ImageURISource {
  const normalized = uri.trim();
  const cached = remoteCoverSourceByUri.get(normalized);
  if (cached) {
    return cached;
  }

  const source: ImageURISource = { uri: normalized };
  remoteCoverSourceByUri.set(normalized, source);
  return source;
}

/** 测试专用：清空模块级缓存。 */
export function clearRemoteCoverImageSourceCacheForTests(): void {
  remoteCoverSourceByUri.clear();
}
