import { useEffect } from 'react';
import { getCurrentSessionUser } from '../use-cases/auth/get-current-session-user';

export function useSessionRefresh(): void {
  useEffect(() => {
    void getCurrentSessionUser().catch(() => {
      // 启动 session 校验失败不阻断 UI；抽屉打开时会再刷新
    });
  }, []);
}
