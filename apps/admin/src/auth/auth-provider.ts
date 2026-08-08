import type { AuthProvider } from 'react-admin';
import {
  adminLoginRequestSchema,
  adminLoginResponseSchema,
  adminSessionUserSchema,
} from '@remember/contracts';
import {
  AdminApiError,
  adminFetchJson,
  clearStoredAdminToken,
  readStoredAdminToken,
  storeAdminToken,
} from '../api/admin-api-client.js';

function readErrorStatus(error: unknown): number | undefined {
  if (error instanceof AdminApiError) {
    return error.status;
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

function isAuthFailure(error: unknown): boolean {
  const status = readErrorStatus(error);
  return status === 401 || status === 403;
}

export const authProvider: AuthProvider = {
  login: async (params: { username?: string; password?: string }) => {
    const input = adminLoginRequestSchema.parse({
      loginName: params.username,
      password: params.password,
    });
    const response = adminLoginResponseSchema.parse(
      await adminFetchJson('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    );
    storeAdminToken(response.token);
    return response;
  },
  logout: async () => {
    const token = readStoredAdminToken();
    if (token) {
      try {
        await adminFetchJson('/admin/auth/logout', { method: 'POST' });
      } catch {
        // 会话已失效时仍清本地 token
      }
    }
    clearStoredAdminToken();
  },
  checkAuth: async () => {
    const token = readStoredAdminToken();
    if (!token) {
      throw new Error('未登录');
    }
    try {
      await adminFetchJson('/admin/auth/me');
    } catch (error) {
      if (isAuthFailure(error)) {
        clearStoredAdminToken();
        throw new Error('未登录', { cause: error });
      }
      // 5xx / 网络错误：保留 token，避免误踢回登录页
      return;
    }
  },
  checkError: (error: unknown) => {
    if (isAuthFailure(error)) {
      clearStoredAdminToken();
    }
    if (error instanceof AdminApiError) {
      return Promise.reject(error);
    }
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error('请求失败'));
  },
  getIdentity: async () => {
    try {
      const admin = adminSessionUserSchema.parse(await adminFetchJson('/admin/auth/me'));
      return {
        id: admin.adminUserId,
        fullName: admin.loginName,
      };
    } catch (error) {
      if (isAuthFailure(error)) {
        clearStoredAdminToken();
        throw new Error('未登录', { cause: error });
      }
      return {
        id: 'admin',
        fullName: '管理员',
      };
    }
  },
  getPermissions: async () => {
    try {
      return adminSessionUserSchema.parse(await adminFetchJson('/admin/auth/me'));
    } catch (error) {
      if (isAuthFailure(error)) {
        clearStoredAdminToken();
        throw new Error('未登录', { cause: error });
      }
      return { adminUserId: 'admin', loginName: 'admin', role: 'super_admin' as const };
    }
  },
};
