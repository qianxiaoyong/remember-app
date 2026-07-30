import { beforeEach, describe, expect, it, vi } from 'vitest';

const getInstalledPack = vi.fn();
const findCatalogItem = vi.fn();
const getInfoAsync = vi.fn();
const playExpoAudioUri = vi.fn();

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack,
}));

vi.mock('../catalog/catalog-seed', () => ({
  findCatalogItem,
}));

vi.mock('expo-file-system/legacy', () => ({
  getInfoAsync,
}));

vi.mock('./play-expo-audio-uri', () => ({
  playExpoAudioUri,
}));

describe('resolvePackAssetUri', () => {
  beforeEach(() => {
    vi.resetModules();
    getInstalledPack.mockReset();
    findCatalogItem.mockReset();
  });

  it('bundled 变体未单独安装时回退到 remember-test-pack 资源目录', async () => {
    getInstalledPack.mockImplementation((packId: string) => {
      if (packId === 'remember-test-pack-2') {
        return null;
      }
      if (packId === 'remember-test-pack') {
        return {
          packId: 'remember-test-pack',
          installStatus: 'installed',
          assetsDir: 'file:///packs/remember-test-pack/assets/',
        };
      }
      return null;
    });
    findCatalogItem.mockReturnValue({ isBundledTestPack: true });

    const { resolvePackAssetUri } = await import('./resolve-pack-asset-uri');
    expect(resolvePackAssetUri('remember-test-pack-2', 'assets/audio/picture.mp3')).toBe(
      'file:///packs/remember-test-pack/assets/audio/picture.mp3',
    );
  });
});

describe('playPackAssetAudio', () => {
  beforeEach(() => {
    vi.resetModules();
    getInstalledPack.mockReset();
    findCatalogItem.mockReset();
    getInfoAsync.mockReset();
    playExpoAudioUri.mockReset();
  });

  it('占位音频过小视为 missing-file', async () => {
    getInstalledPack.mockReturnValue({
      packId: 'remember-test-pack',
      installStatus: 'installed',
      assetsDir: 'file:///packs/remember-test-pack/assets/',
    });
    getInfoAsync.mockResolvedValue({ exists: true, size: 5 });

    const { playPackAssetAudio } = await import('./play-pack-asset-audio');
    await expect(
      playPackAssetAudio({
        packId: 'remember-test-pack',
        relativePath: 'audio/picture.mp3',
      }),
    ).resolves.toBe('missing-file');
    expect(playExpoAudioUri).not.toHaveBeenCalled();
  });

  it('有效文件走 expo 播放并在失败时返回 failed', async () => {
    getInstalledPack.mockReturnValue({
      packId: 'remember-test-pack',
      installStatus: 'installed',
      assetsDir: 'file:///packs/remember-test-pack/assets/',
    });
    getInfoAsync.mockResolvedValue({ exists: true, size: 52079 });
    playExpoAudioUri.mockResolvedValue('failed');

    const { playPackAssetAudio } = await import('./play-pack-asset-audio');
    await expect(
      playPackAssetAudio({
        packId: 'remember-test-pack',
        relativePath: 'audio/picture.mp3',
      }),
    ).resolves.toBe('failed');
    expect(playExpoAudioUri).toHaveBeenCalledWith(
      'file:///packs/remember-test-pack/assets/audio/picture.mp3',
    );
  });
});
