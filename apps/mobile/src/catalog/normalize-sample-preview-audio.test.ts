import { describe, expect, it } from 'vitest';
import {
  isDevPlaceholderPreviewUrl,
  normalizeSamplePreviewAudioFields,
} from './normalize-sample-preview-audio';

describe('normalize-sample-preview-audio', () => {
  it('识别 dev 占位 CDN', () => {
    expect(isDevPlaceholderPreviewUrl('https://cdn.example.com/samples/picture.mp3')).toBe(true);
    expect(isDevPlaceholderPreviewUrl('https://cdn.remember.dev/sample.mp3')).toBe(false);
  });

  it('剥离占位 previewAudioUrl', () => {
    const normalized = normalizeSamplePreviewAudioFields({
      headword: 'picture',
      zh: '图片',
      exampleEn: 'I take a picture.',
      previewAudioUrl: 'https://cdn.example.com/samples/picture.mp3',
    });
    expect(normalized.previewAudioUrl).toBeUndefined();
  });
});
