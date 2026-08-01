import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminSessionUser,
} from '@remember/contracts';
import {
  adminLoginResponseSchema,
  adminLogoutResponseSchema,
  adminSessionUserSchema,
} from '@remember/contracts';
import { readAdminAuthConfig } from '../config/read-admin-auth-config.js';
import { createSessionToken, hashSessionToken } from '../auth/crypto.js';
import { verifyAdminPassword } from './admin-password.js';
import { AdminAuthRepository } from './admin-auth.repository.js';

export interface AuthenticatedAdminContext {
  adminUserId: string;
  sessionId: string;
  role: 'super_admin';
}

@Injectable()
export class AdminAuthService {
  private readonly config = readAdminAuthConfig();

  constructor(private readonly adminAuthRepository: AdminAuthRepository) {}

  async login(input: AdminLoginRequest): Promise<AdminLoginResponse> {
    const adminUser = await this.adminAuthRepository.findAdminUserByLoginName(input.loginName);
    if (adminUser?.status !== 'active') {
      throw new UnauthorizedException({
        code: 'ADMIN_CREDENTIALS_INVALID',
        message: '账号或密码错误',
      });
    }

    const passwordMatches = await verifyAdminPassword(input.password, adminUser.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException({
        code: 'ADMIN_CREDENTIALS_INVALID',
        message: '账号或密码错误',
      });
    }

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const now = new Date();
    await this.adminAuthRepository.createSession({
      tokenHash,
      adminUserId: adminUser.id,
      lastActiveAt: now,
    });

    return adminLoginResponseSchema.parse({
      token,
      admin: this.toSessionUser(adminUser),
    });
  }

  async logout(context: AuthenticatedAdminContext): Promise<AdminLogoutResponse> {
    await this.adminAuthRepository.revokeSession(context.sessionId, new Date());
    return adminLogoutResponseSchema.parse({ ok: true });
  }

  async getCurrentAdmin(context: AuthenticatedAdminContext): Promise<AdminSessionUser> {
    const adminUser = await this.adminAuthRepository.findAdminUserById(context.adminUserId);
    if (adminUser?.status !== 'active') {
      throw new UnauthorizedException({ code: 'ADMIN_SESSION_INVALID', message: '会话无效' });
    }
    return this.toSessionUser(adminUser);
  }

  async resolveAuthenticatedContext(token: string): Promise<AuthenticatedAdminContext> {
    const tokenHash = hashSessionToken(token);
    const session = await this.adminAuthRepository.findSessionByTokenHash(tokenHash);
    const now = new Date();

    if (!session || session.revokedAt) {
      throw new UnauthorizedException({ code: 'ADMIN_SESSION_INVALID', message: '会话无效' });
    }

    const ttlMs = this.config.sessionTtlDays * 24 * 60 * 60 * 1000;
    if (now.getTime() - session.lastActiveAt.getTime() > ttlMs) {
      await this.adminAuthRepository.revokeSession(session.id, now);
      throw new UnauthorizedException({ code: 'ADMIN_SESSION_EXPIRED', message: '会话已过期' });
    }

    if (session.adminUser.status !== 'active') {
      throw new ForbiddenException({ code: 'ADMIN_ACCOUNT_DISABLED', message: '账号不可用' });
    }

    if (session.adminUser.role !== 'super_admin') {
      throw new ForbiddenException({ code: 'ADMIN_ROLE_FORBIDDEN', message: '权限不足' });
    }

    await this.adminAuthRepository.touchSession(session.id, now);

    return {
      adminUserId: session.adminUserId,
      sessionId: session.id,
      role: 'super_admin',
    };
  }

  private toSessionUser(adminUser: {
    id: string;
    loginName: string;
    role: string;
  }): AdminSessionUser {
    return adminSessionUserSchema.parse({
      adminUserId: adminUser.id,
      loginName: adminUser.loginName,
      role: adminUser.role,
    });
  }
}
