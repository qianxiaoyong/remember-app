import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminPacksService } from './admin-packs.service.js';

const packId = 'demo-delete-pack';

const packRecord = {
  packId,
  title: '待删除测试包',
  status: 'draft',
  versions: [],
  currentVersionId: null,
};

describe('AdminPacksService.deletePack', () => {
  const repository = {
    findPackById: vi.fn(),
    listPacks: vi.fn(),
  };
  const prisma = {
    order: { count: vi.fn() },
    packAccess: { count: vi.fn() },
    redemptionEvent: { count: vi.fn() },
    $transaction: vi.fn(),
  };
  const auditService = {
    writeAuditLog: vi.fn(),
  };
  const contentTagsService = {
    upsertLabels: vi.fn(),
  };

  const service = new AdminPacksService(
    repository as never,
    prisma as never,
    auditService as never,
    contentTagsService as never,
  );

  beforeEach(() => {
    repository.findPackById.mockReset();
    prisma.order.count.mockReset();
    prisma.packAccess.count.mockReset();
    prisma.redemptionEvent.count.mockReset();
    prisma.$transaction.mockReset();
    auditService.writeAuditLog.mockReset();
  });

  it('throws when pack is missing', async () => {
    repository.findPackById.mockResolvedValue(null);

    await expect(service.deletePack('admin-1', packId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('blocks delete when pack access exists', async () => {
    repository.findPackById.mockResolvedValue(packRecord);
    prisma.order.count.mockResolvedValue(0);
    prisma.packAccess.count.mockResolvedValue(1);
    prisma.redemptionEvent.count.mockResolvedValue(0);

    await expect(service.deletePack('admin-1', packId)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes pack and writes audit log when no blockers', async () => {
    repository.findPackById.mockResolvedValue(packRecord);
    prisma.order.count.mockResolvedValue(0);
    prisma.packAccess.count.mockResolvedValue(0);
    prisma.redemptionEvent.count.mockResolvedValue(0);
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        redemptionCode: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        packVersion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        pack: { delete: vi.fn().mockResolvedValue(packRecord) },
      }),
    );

    await service.deletePack('admin-1', packId);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(auditService.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'pack.delete',
        targetType: 'pack',
        targetId: packId,
      }),
      expect.anything(),
    );
  });
});
