import sharp from 'sharp';

export const COVER_ORIGINAL_MAX_WIDTH = 900;
export const COVER_ORIGINAL_MAX_HEIGHT = 1200;
export const COVER_THUMB_WIDTH = 240;
export const COVER_THUMB_HEIGHT = 320;

export async function buildCoverOriginalBuffer(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(COVER_ORIGINAL_MAX_WIDTH, COVER_ORIGINAL_MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

export async function buildCoverThumbnailBuffer(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(COVER_THUMB_WIDTH, COVER_THUMB_HEIGHT, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();
}
