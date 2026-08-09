/** 历史 APK 内置测试包 ID；启动时从 installed_packs 清理，不再内置安装。 */
export const LEGACY_BUNDLED_TEST_PACK_IDS = [
  'remember-test-pack',
  'remember-test-pack-2',
  'remember-test-pack-3',
  'remember-test-pack-4',
  'remember-test-pack-5',
  'story-test-pack',
] as const;

export function isLegacyBundledTestPackId(packId: string): boolean {
  return (
    packId === 'story-test-pack' ||
    packId === 'remember-test-pack' ||
    packId.startsWith('remember-test-pack-')
  );
}
