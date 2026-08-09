import { beforeEach, describe, expect, it, vi } from 'vitest';

const getInstalledPack = vi.fn();
const getInfoAsync = vi.fn();
const playExpoAudioUri = vi.fn();

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack,
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
  });

  it('未安装时返回 null', async () => {
    getInstalledPack.mockReturnValue(null);

    const { resolvePackAssetUri } = await import('./resolve-pack-asset-uri');
    expect(resolvePackAssetUri('demo-pack', 'assets/audio/word.mp3')).toBeNull();
  });

  it('已安装时解析 assets 相对路径', async () => {
    getInstalledPack.mockReturnValue({
      packId: 'demo-pack',
      installStatus: 'installed',
      assetsDir: 'file:///packs/demo-pack/assets/',
    });

    const { resolvePackAssetUri } = await import('./resolve-pack-asset-uri');
    expect(resolvePackAssetUri('demo-pack', 'assets/audio/word.mp3')).toBe(
      'file:///packs/demo-pack/assets/audio/word.mp3',
    );
  });
});

describe('playPackAssetAudio', () => {
  beforeEach(() => {
    vi.resetModules();
    getInstalledPack.mockReset();
    getInfoAsync.mockReset();
    playExpoAudioUri.mockReset();
  });

  it('占位音频过小视为 missing-file', async () => {
    getInstalledPack.mockReturnValue({
      packId: 'demo-pack',
      installStatus: 'installed',
      assetsDir: 'file:///packs/demo-pack/assets/',
    });
    getInfoAsync.mockResolvedValue({ exists: true, size: 5 });

    const { playPackAssetAudio } = await import('./play-pack-asset-audio');
    await expect(
      playPackAssetAudio({
        packId: 'demo-pack',
        relativePath: 'audio/word.mp3',
      }),
    ).resolves.toBe('missing-file');
    expect(playExpoAudioUri).not.toHaveBeenCalled();
  });

  it('有效文件走 expo 播放并在失败时返回 failed', async () => {
    getInstalledPack.mockReturnValue({
      packId: 'demo-pack',
      installStatus: 'installed',
      assetsDir: 'file:///packs/demo-pack/assets/',
    });
    getInfoAsync.mockResolvedValue({ exists: true, size: 52079 });
    playExpoAudioUri.mockResolvedValue('failed');

    const { playPackAssetAudio } = await import('./play-pack-asset-audio');
    await expect(
      playPackAssetAudio({
        packId: 'demo-pack',
        relativePath: 'audio/word.mp3',
      }),
    ).resolves.toBe('failed');
    expect(playExpoAudioUri).toHaveBeenCalledWith('file:///packs/demo-pack/assets/audio/word.mp3');
  });
});
