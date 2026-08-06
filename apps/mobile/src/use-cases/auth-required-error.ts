export class AuthRequiredError extends Error {
  override readonly name = 'AuthRequiredError';
}

export function isAuthRequiredError(error: unknown): error is AuthRequiredError {
  return error instanceof AuthRequiredError;
}

export function isSafeReturnToPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false;
  }

  const allowedPrefixes = ['/pack/', '/library', '/redeem', '/account'];
  return allowedPrefixes.some((prefix) => path === prefix || path.startsWith(prefix));
}
