import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const audioDir = resolve(scriptDir, '../source/remember-test-pack/assets/audio');

/** 公开 3 秒示例 MP3；构建时需联网，失败则回退内嵌最小 MP3。 */
const SAMPLE_MP3_URL = 'https://download.samplelib.com/mp3/sample-3s.mp3';

const minimalMp3 = Buffer.from(
  'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjEwLjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'base64',
);

const MIN_PLAYABLE_BYTES = 4096;
const audioFiles = ['picture.mp3', 'take-a-picture.mp3'];

async function loadSampleMp3() {
  try {
    const response = await fetch(SAMPLE_MP3_URL);
    if (!response.ok) {
      throw new Error(`sample mp3 fetch failed: ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < MIN_PLAYABLE_BYTES) {
      throw new Error(`sample mp3 too small: ${bytes.byteLength}`);
    }
    return bytes;
  } catch (error) {
    console.warn('ensure-test-pack-audio: using embedded fallback mp3', error);
    return minimalMp3;
  }
}

function needsReplace(filePath) {
  try {
    const existing = readFileSync(filePath);
    return existing.byteLength < MIN_PLAYABLE_BYTES;
  } catch {
    return true;
  }
}

const sampleMp3 = await loadSampleMp3();

for (const fileName of audioFiles) {
  const filePath = resolve(audioDir, fileName);
  if (!needsReplace(filePath)) {
    continue;
  }
  writeFileSync(filePath, sampleMp3);
  console.log(`wrote ${fileName} (${sampleMp3.byteLength} bytes)`);
}
