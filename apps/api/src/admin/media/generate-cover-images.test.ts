import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  COVER_ORIGINAL_MAX_HEIGHT,
  COVER_ORIGINAL_MAX_WIDTH,
  COVER_THUMB_HEIGHT,
  COVER_THUMB_WIDTH,
  buildCoverOriginalBuffer,
  buildCoverThumbnailBuffer,
} from './generate-cover-images.js';

/** 1200×1600 红色 JPEG，用于验证缩放与格式 */
async function createLargeJpeg(): Promise<Buffer> {
  return sharp({
    create: {
      width: 1200,
      height: 1600,
      channels: 3,
      background: { r: 200, g: 40, b: 40 },
    },
  })
    .jpeg()
    .toBuffer();
}

describe('generate-cover-images', () => {
  it('原图不超过 900×1200 且输出 JPEG', async () => {
    const input = await createLargeJpeg();
    const output = await buildCoverOriginalBuffer(input);
    const meta = await sharp(output).metadata();

    expect(meta.format).toBe('jpeg');
    expect(meta.width).toBeLessThanOrEqual(COVER_ORIGINAL_MAX_WIDTH);
    expect(meta.height).toBeLessThanOrEqual(COVER_ORIGINAL_MAX_HEIGHT);
    expect(output.byteLength).toBeGreaterThan(0);
  });

  it('缩略图为 240×320 WebP', async () => {
    const input = await createLargeJpeg();
    const output = await buildCoverThumbnailBuffer(input);
    const meta = await sharp(output).metadata();

    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(COVER_THUMB_WIDTH);
    expect(meta.height).toBe(COVER_THUMB_HEIGHT);
    expect(output.byteLength).toBeGreaterThan(0);
  });
});
