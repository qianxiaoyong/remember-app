import { Injectable } from '@nestjs/common';
import type {
  AdminListUsersQuery,
  AdminUserDetail,
  AdminUserListResponse,
} from '@remember/contracts';
import { adminUserDetailSchema, adminUserListResponseSchema } from '@remember/contracts';
import type { AdminUserListRow } from './admin-users.repository.js';
import { AdminUsersRepository } from './admin-users.repository.js';

@Injectable()
export class AdminUsersService {
  constructor(private readonly repository: AdminUsersRepository) {}

  async listUsers(query: AdminListUsersQuery): Promise<AdminUserListResponse> {
    const result = await this.repository.listUsers(query);
    return adminUserListResponseSchema.parse({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      items: result.rows.map((row) => this.toListItem(row)),
    });
  }

  async getUserDetail(userId: string): Promise<AdminUserDetail> {
    const user = await this.repository.findUserDetail(userId);
    return adminUserDetailSchema.parse({
      ...this.toListItem(user),
      ...(user.mainDeviceId ? { mainDeviceId: user.mainDeviceId } : {}),
    });
  }

  private toListItem(row: AdminUserListRow) {
    const lastActiveAt = row.sessions[0]?.lastActiveAt;
    return {
      userId: row.id,
      maskedPhone: row.maskedPhone,
      ...(row.displayName ? { displayName: row.displayName } : {}),
      status: row.status as 'active',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      ...(lastActiveAt ? { lastActiveAt: lastActiveAt.toISOString() } : {}),
      packAccessCount: row._count.packAccesses,
      paidOrderCount: row._count.orders,
    };
  }
}
