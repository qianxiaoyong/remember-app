import { normalizeZipEntryPath } from '@remember/contracts';
import { unzipSync } from 'fflate';

export function readZipEntries(zipBytes: Uint8Array): Map<string, Uint8Array> {
  const entries = unzipSync(zipBytes);
  const filesByPath = new Map<string, Uint8Array>();
  for (const [entryPath, bytes] of Object.entries(entries)) {
    if (entryPath.endsWith('/')) {
      continue;
    }
    const normalized = normalizeZipEntryPath(entryPath);
    filesByPath.set(normalized, bytes);
  }
  return filesByPath;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
