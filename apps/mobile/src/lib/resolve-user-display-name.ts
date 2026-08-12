const LEGACY_GUARDIAN_NAMES = new Set(['监护人', '监护人账号']);

/** 统一账号展示名：历史默认「监护人」→「用户」。 */
export function resolveUserDisplayName(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  if (!trimmed || LEGACY_GUARDIAN_NAMES.has(trimmed)) {
    return '用户';
  }
  return trimmed;
}
