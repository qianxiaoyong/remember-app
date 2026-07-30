export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class ApiNetworkError extends Error {
  constructor(message = '无法连接服务器') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

/** 目录/详情在 API 不可达或无数据时，可回退本地缓存或 seed。 */
export function shouldUseOfflineCatalogFallback(error: unknown): boolean {
  if (error instanceof ApiNetworkError) {
    return true;
  }
  if (error instanceof ApiRequestError) {
    return error.status === 404 || error.status >= 500;
  }
  return false;
}
