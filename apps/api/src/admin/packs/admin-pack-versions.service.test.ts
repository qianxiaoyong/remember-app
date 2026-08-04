import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ServiceUnavailableException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VerifiedPackArchive } from '@remember/pack-builder/verify';
import { AdminPackVersionsService } from './admin-pack-versions.service.js';

const verifiedFixture: VerifiedPackArchive = {
  manifest: {
    manifestVersion: 1,
    protocolVersion: 1,
    packId: 'remember-test-pack',
    packVersion: '9.9.9',
    keyId: 'test-key',
    files: [{ path: 'pack.sqlite', sha256: 'a'.repeat(64), sizeBytes: 1 }],
    signature: 'sig',
  },
  sha256: 'b'.repeat(64),
  sizeBytes: 128,
  cardCount: 3,
  lexiconEntryCount: 2,
};

describe('AdminPackVersionsService uploadVersion', () => {
  const originalEnv = { ...process.env };
  let storageDir: string;

  const repository = {
    findPackById: vi.fn(),
  };
  const prisma = {
    packVersion: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    pack: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  const packVerifyService = {
    verifyUploadedZip: vi.fn(),
  };
  const auditService = {
    writeAuditLog: vi.fn(),
  };
  const cosPackStorage = {
    isEnabled: vi.fn(),
    putObject: vi.fn(),
    getPresignedDownloadUrl: vi.fn(),
  };

  beforeEach(async () => {
    storageDir = await mkdtemp(join(tmpdir(), 'remember-admin-pack-upload-'));
    process.env = {
      ...originalEnv,
      ADMIN_PACK_STORAGE_DIR: storageDir,
    };
    vi.clearAllMocks();

    repository.findPackById.mockResolvedValue({
      packId: 'remember-test-pack',
      currentVersionId: null,
      samplePreviews: [{ kind: 'audio', title: 'demo', audioUrl: 'https://example.com/a.mp3' }],
    });
    prisma.packVersion.findUnique.mockResolvedValue(null);
    packVerifyService.verifyUploadedZip.mockResolvedValue(verifiedFixture);
    cosPackStorage.isEnabled.mockReturnValue(false);
    cosPackStorage.putObject.mockResolvedValue(undefined);
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        packVersion: {
          create: vi.fn().mockResolvedValue({
            id: '00000000-0000-4000-8000-000000000001',
            packId: 'remember-test-pack',
            packVersion: '9.9.9',
            sha256: verifiedFixture.sha256,
            sizeBytes: BigInt(verifiedFixture.sizeBytes),
            keyId: verifiedFixture.manifest.keyId,
            protocolVersion: verifiedFixture.manifest.protocolVersion,
            status: 'draft',
            note: null,
            publishedAt: new Date('2026-08-04T00:00:00.000Z'),
          }),
        },
      }),
    );
    prisma.pack.update.mockResolvedValue({});
    auditService.writeAuditLog.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    await rm(storageDir, { recursive: true, force: true });
  });

  function createService() {
    return new AdminPackVersionsService(
      repository as never,
      prisma as never,
      packVerifyService as never,
      auditService as never,
      cosPackStorage as never,
    );
  }

  it('COS 启用时上传 zip 后写入 COS', async () => {
    cosPackStorage.isEnabled.mockReturnValue(true);
    const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

    const service = createService();
    await service.uploadVersion('admin-id', 'remember-test-pack', zipBytes);

    expect(cosPackStorage.putObject).toHaveBeenCalledWith(
      'packs/remember-test-pack/9.9.9/pack.zip',
      Buffer.from(zipBytes),
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    const stored = await readFile(
      join(storageDir, 'remember-test-pack', '9.9.9', 'pack.zip'),
    );
    expect(Array.from(stored)).toEqual(Array.from(zipBytes));
  });

  it('COS 未启用时跳过 putObject', async () => {
    cosPackStorage.isEnabled.mockReturnValue(false);
    const service = createService();

    await service.uploadVersion('admin-id', 'remember-test-pack', new Uint8Array([1, 2, 3]));

    expect(cosPackStorage.putObject).not.toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('COS 上传失败时不写 DB', async () => {
    cosPackStorage.isEnabled.mockReturnValue(true);
    cosPackStorage.putObject.mockRejectedValue(
      new ServiceUnavailableException({ code: 'COS_PUT_FAILED', message: 'COS 上传失败' }),
    );

    const service = createService();

    await expect(
      service.uploadVersion('admin-id', 'remember-test-pack', new Uint8Array([1, 2, 3])),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
