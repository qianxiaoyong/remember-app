import { describe, expect, it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { signManifestPayload } from '@remember/contracts';
import { buildPackArchive } from './build-pack.js';
import { verifyPackZipFile } from './verify-pack-file.js';
import { readZipEntries, writeZip } from './zip-archive.js';
import { sha256Hex } from './sha256.js';
import { ed } from './configure-ed25519.js';

const TEST_PRIVATE_KEY_HEX = '9d61b19deffd5a60ba844af492ec2cc44401c569d40c893265af344b4352f907';

const fixturePath = resolve('fixtures/remember-test-pack.zip');
const storyFixturePath = resolve('fixtures/story-test-pack.zip');
const sourceDir = resolve('source/remember-test-pack');
const storySourceDir = resolve('source/story-test-pack');

describe('pack-builder verify', () => {
  it('构建并校验固定测试包', async () => {
    const entries = await buildPackArchive(sourceDir);
    writeFileSync(fixturePath, writeZip(entries));
    await verifyPackZipFile(fixturePath);
  });

  it('构建并校验 story_reading 测试包', async () => {
    const entries = await buildPackArchive(storySourceDir);
    writeFileSync(storyFixturePath, writeZip(entries));
    await verifyPackZipFile(storyFixturePath);
  });

  it('story sidebar 孤儿条目在 verify 时被拒绝', async () => {
    const entries = await buildPackArchive(storySourceDir);
    const files = readZipEntries(writeZip(entries));
    const sqlite = files.get('pack.sqlite');
    if (!sqlite) {
      throw new Error('missing sqlite');
    }
    const { DatabaseSync } = await import('node:sqlite');
    const tempPath = resolve('fixtures/story-orphan-temp.sqlite');
    writeFileSync(tempPath, sqlite);
    const db = new DatabaseSync(tempPath);
    const orphanContent = JSON.stringify({
      lesson: {
        code: 'C1',
        titleEn: 'Test',
        titleZh: '测试',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: {
        paragraphs: [{ runs: [{ kind: 'text', text: 'Hello.' }] }],
      },
      sidebar: [
        {
          vocabId: 'orphan',
          headword: 'orphan',
          ipa: '/ɔː/',
          pos: 'n.',
          definitionZh: '孤儿',
          tier: 'low',
        },
      ],
    });
    db.prepare('UPDATE cards SET content = ? WHERE sortOrder = 1').run(orphanContent);
    db.close();
    const updatedSqlite = new Uint8Array(readFileSync(tempPath));
    files.set('pack.sqlite', updatedSqlite);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('packManifest.json'))) as {
      signature: string;
      files: { path: string; sha256: string; sizeBytes: number }[];
      [key: string]: unknown;
    };
    const sqliteEntry = manifest.files.find((file) => file.path === 'pack.sqlite');
    if (!sqliteEntry) {
      throw new Error('missing sqlite manifest entry');
    }
    sqliteEntry.sha256 = sha256Hex(updatedSqlite);
    sqliteEntry.sizeBytes = updatedSqlite.byteLength;
    const { signature: removedSignature, ...manifestWithoutSignature } = manifest;
    void removedSignature;
    manifest.signature = await signManifestPayload(
      manifestWithoutSignature,
      TEST_PRIVATE_KEY_HEX,
      (message, privateKey) => ed.sign(message, privateKey),
    );
    files.set(
      'packManifest.json',
      new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`),
    );
    const tamperedPath = resolve('fixtures/story-orphan-sidebar.zip');
    writeFileSync(tamperedPath, writeZip(Object.fromEntries(files)));

    await expect(verifyPackZipFile(tamperedPath)).rejects.toMatchObject({
      code: 'PACK_CONTENT_INVALID',
    });
  });

  it('篡改 manifest 哈希后拒绝', async () => {
    const zipBytes = new Uint8Array(readFileSync(fixturePath));
    const files = readZipEntries(zipBytes);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('packManifest.json'))) as {
      files: { path: string; sha256: string; sizeBytes: number }[];
    };
    const sqliteEntry = manifest.files.find((file) => file.path === 'pack.sqlite');
    if (!sqliteEntry) {
      throw new Error('missing sqlite entry');
    }
    sqliteEntry.sha256 = `${sqliteEntry.sha256.slice(0, -1)}0`;
    files.set(
      'packManifest.json',
      new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`),
    );
    const tamperedPath = resolve('fixtures/tampered-hash.zip');
    writeFileSync(tamperedPath, writeZip(Object.fromEntries(files)));

    await expect(verifyPackZipFile(tamperedPath)).rejects.toMatchObject({
      code: 'PACK_INTEGRITY_FAILED',
    });
  });

  it('错误 keyId 后拒绝', async () => {
    const zipBytes = new Uint8Array(readFileSync(fixturePath));
    const files = readZipEntries(zipBytes);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('packManifest.json'))) as {
      keyId: string;
    };
    manifest.keyId = 'unknown-key';
    files.set(
      'packManifest.json',
      new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`),
    );
    const tamperedPath = resolve('fixtures/tampered-key.zip');
    writeFileSync(tamperedPath, writeZip(Object.fromEntries(files)));

    await expect(verifyPackZipFile(tamperedPath)).rejects.toMatchObject({
      code: 'PACK_KEY_UNKNOWN',
    });
  });

  it('未知协议版本后拒绝', async () => {
    const zipBytes = new Uint8Array(readFileSync(fixturePath));
    const files = readZipEntries(zipBytes);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('packManifest.json'))) as {
      protocolVersion: number;
    };
    manifest.protocolVersion = 99;
    files.set(
      'packManifest.json',
      new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`),
    );
    const tamperedPath = resolve('fixtures/tampered-protocol.zip');
    writeFileSync(tamperedPath, writeZip(Object.fromEntries(files)));

    await expect(verifyPackZipFile(tamperedPath)).rejects.toMatchObject({
      code: 'PACK_MANIFEST_INVALID',
    });
  });

  it('路径穿越后拒绝', async () => {
    const zipBytes = new Uint8Array(readFileSync(fixturePath));
    const files = readZipEntries(zipBytes);
    files.set('../evil.txt', new TextEncoder().encode('x'));
    const tamperedPath = resolve('fixtures/tampered-path.zip');
    writeFileSync(tamperedPath, writeZip(Object.fromEntries(files)));

    await expect(verifyPackZipFile(tamperedPath)).rejects.toMatchObject({
      code: 'PACK_ARCHIVE_INVALID',
    });
  });

  it('损坏 sqlite 后拒绝', async () => {
    const zipBytes = new Uint8Array(readFileSync(fixturePath));
    const files = readZipEntries(zipBytes);
    const sqlite = files.get('pack.sqlite');
    if (!sqlite) {
      throw new Error('missing sqlite');
    }
    const corrupted = new Uint8Array(sqlite);
    corrupted.fill(0);
    files.set('pack.sqlite', corrupted);

    const manifest = JSON.parse(new TextDecoder().decode(files.get('packManifest.json'))) as {
      signature: string;
      files: { path: string; sha256: string; sizeBytes: number }[];
      [key: string]: unknown;
    };
    const sqliteEntry = manifest.files.find((file) => file.path === 'pack.sqlite');
    if (!sqliteEntry) {
      throw new Error('missing sqlite manifest entry');
    }
    sqliteEntry.sha256 = sha256Hex(corrupted);
    const { signature: removedSignature, ...manifestWithoutSignature } = manifest;
    void removedSignature;
    manifest.signature = await signManifestPayload(
      manifestWithoutSignature,
      TEST_PRIVATE_KEY_HEX,
      (message, privateKey) => ed.sign(message, privateKey),
    );
    files.set(
      'packManifest.json',
      new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`),
    );

    const tamperedPath = resolve('fixtures/tampered-sqlite.zip');
    writeFileSync(tamperedPath, writeZip(Object.fromEntries(files)));

    await expect(verifyPackZipFile(tamperedPath)).rejects.toMatchObject({
      code: 'PACK_SCHEMA_INVALID',
    });
  });
});
