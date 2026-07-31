import { Injectable } from '@nestjs/common';
import type { AdminSession, AdminUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CreateAdminSessionInput {
  tokenHash: string;
  adminUserId: string;
  lastActiveAt: Date;
}

export interface UpsertAdminUserInput {
  loginName: string;
  passwordHash: string;
}

@Injectable()
export class AdminAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAdminUserByLoginName(loginName: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { loginName } });
  }

  findAdminUserById(adminUserId: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { id: adminUserId } });
  }

  createSession(input: CreateAdminSessionInput): Promise<AdminSession> {
    return this.prisma.adminSession.create({ data: input });
  }

  findSessionByTokenHash(
    tokenHash: string,
  ): Promise<(AdminSession & { adminUser: AdminUser }) | null> {
    return this.prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { adminUser: true },
    });
  }

  revokeSession(sessionId: string, revokedAt: Date): Promise<AdminSession> {
    return this.prisma.adminSession.update({
      where: { id: sessionId },
      data: { revokedAt },
    });
  }

  touchSession(sessionId: string, lastActiveAt: Date): Promise<AdminSession> {
    return this.prisma.adminSession.update({
      where: { id: sessionId },
      data: { lastActiveAt },
    });
  }

  upsertAdminUser(input: UpsertAdminUserInput): Promise<AdminUser> {
    return this.prisma.adminUser.upsert({
      where: { loginName: input.loginName },
      create: {
        loginName: input.loginName,
        passwordHash: input.passwordHash,
      },
      update: {
        passwordHash: input.passwordHash,
        status: 'active',
      },
    });
  }
}
