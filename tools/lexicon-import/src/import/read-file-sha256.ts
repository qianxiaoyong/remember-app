import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';

export async function readFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => {
      hash.update(chunk);
    });
    stream.on('error', reject);
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
}

export async function readFileHeadBytes(filePath: string, byteCount = 4096): Promise<Buffer> {
  const buffer = await readFile(filePath);
  return buffer.subarray(0, Math.min(buffer.length, byteCount));
}
