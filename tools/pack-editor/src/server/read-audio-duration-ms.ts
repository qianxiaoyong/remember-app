import { readFileSync } from 'node:fs';

const bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const samplerates = [44100, 48000, 32000, 0];

export function readAudioDurationMs(absolutePath: string): number {
  const buffer = readFileSync(absolutePath);
  let offset = 0;
  if (buffer.slice(0, 3).toString() === 'ID3') {
    const tagSize =
      ((buffer[6]! & 0x7f) << 21) |
      ((buffer[7]! & 0x7f) << 14) |
      ((buffer[8]! & 0x7f) << 7) |
      (buffer[9]! & 0x7f);
    offset = 10 + tagSize;
  }

  let frames = 0;
  let sampleRate = 44100;

  while (offset + 4 < buffer.length) {
    if (buffer[offset] === 0xff && (buffer[offset + 1]! & 0xe0) === 0xe0) {
      const layer = (buffer[offset + 1]! >> 1) & 0x3;
      if (layer !== 0x1) {
        offset += 1;
        continue;
      }
      const bitrateIndex = (buffer[offset + 2]! >> 4) & 0xf;
      const sampleRateIndex = (buffer[offset + 2]! >> 2) & 0x3;
      const padding = (buffer[offset + 2]! >> 1) & 0x1;
      const bitrate = bitrates[bitrateIndex]! * 1000;
      const nextSampleRate = samplerates[sampleRateIndex];
      if (!bitrate || !nextSampleRate) {
        offset += 1;
        continue;
      }
      sampleRate = nextSampleRate;
      const frameLength = Math.floor((144 * bitrate) / sampleRate) + padding;
      frames += 1;
      offset += frameLength;
      continue;
    }
    offset += 1;
  }

  return Math.round((frames * 1152 * 1000) / sampleRate);
}
