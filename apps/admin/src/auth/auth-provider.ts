import type { AuthProvider } from 'react-admin';
import {
  adminLoginRequestSchema,
  adminLoginResponseSchema,
  adminSessionUserSchema,
} from '@remember/contracts';
import {
  adminFetchJson,
  clearStoredAdminToken,
  readStoredAdminToken,
  storeAdminToken,
} from '../api/admin-api-client.js';

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
    await adminFetchJson('/admin/auth/me');
  },
  checkError: (error: { status?: number }) => {
    if (error.status === 401 || error.status === 403) {
      clearStoredAdminToken();
    }
    return Promise.reject(error instanceof Error ? error : new Error('请求失败'));
  },
  getIdentity: async () => {
    const admin = adminSessionUserSchema.parse(await adminFetchJson('/admin/auth/me'));
    return {
      id: admin.adminUserId,
      fullName: admin.loginName,
    };
  },
  getPermissions: async () => adminSessionUserSchema.parse(await adminFetchJson('/admin/auth/me')),
};
