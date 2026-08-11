/** Admin 预览走 Vite `/api` 代理，避免 coverUrl 存局域网 IP 时本机浏览器加载失败。 */
export function resolveAdminMediaPreviewSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/api/v1/media/')) {
      return parsed.pathname;
    }
  } catch {
    // 相对路径或非 URL 字符串，原样交给 img
  }
  return trimmed;
}
