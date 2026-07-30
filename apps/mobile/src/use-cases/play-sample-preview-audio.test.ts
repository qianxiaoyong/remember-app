import { beforeEach, describe, expect, it, vi } from 'vitest';

const playPackAssetAudio = vi.fn();
const playPublicPreviewAudio = vi.fn();

vi.mock('./play-pack-asset-audio', () => ({
  playPackAssetAudio,
}));

vi.mock('./play-public-preview-audio', () => ({
  playPublicPreviewAudio,
}));

describe('playSamplePreviewAudio', () => {
  beforeEach(() => {
    playPackAssetAudio.mockReset();
    playPublicPreviewAudio.mockReset();
  });

  it('已安装时优先播放包内音频', async () => {
    playPackAssetAudio.mockResolvedValue('played');

    const { playSamplePreviewAudio } = await import('./play-sample-preview-audio');
    const result = await playSamplePreviewAudio({
      packId: 'remember-test-pack',
      isInstalled: true,
      sample: {
        headword: 'picture',
        zh: '图片',
        exampleEn: 'I take a picture.',
        previewAudio: 'assets/audio/picture.mp3',
        previewAudioUrl: 'https://cdn.example.com/samples/picture.mp3',
      },
    });

    expect(result).toBe('played');
    expect(playPackAssetAudio).toHaveBeenCalledWith({
      packId: 'remember-test-pack',
      relativePath: 'audio/picture.mp3',
    });
    expect(playPublicPreviewAudio).not.toHaveBeenCalled();
  });

  it('未安装且无公开 URL 时返回 missing-file', async () => {
    const { playSamplePreviewAudio } = await import('./play-sample-preview-audio');
    const result = await playSamplePreviewAudio({
      packId: 'remember-test-pack',
      isInstalled: false,
      sample: {
        headword: 'picture',
        zh: '图片',
        exampleEn: 'I take a picture.',
        previewAudio: 'assets/audio/picture.mp3',
      },
    });

    expect(result).toBe('missing-file');
    expect(playPackAssetAudio).not.toHaveBeenCalled();
  });
});
