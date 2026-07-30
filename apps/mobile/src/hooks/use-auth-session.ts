import { useCallback, useEffect, useState } from 'react';
import type { SessionUser } from '@remember/contracts';
import { ApiRequestError } from '../data/api/api-client';
import { readCachedSessionUser } from '../data/session/session-store';
import { getCurrentSessionUser } from '../use-cases/auth/get-current-session-user';

interface AuthSessionState {
  user: SessionUser | null;
  isLoading: boolean;
  isNotMainDevice: boolean;
  refresh: () => Promise<void>;
}

export function useAuthSession(): AuthSessionState {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotMainDevice, setIsNotMainDevice] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionUser = await getCurrentSessionUser();
      setUser(sessionUser);
      setIsNotMainDevice(false);
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'NOT_MAIN_DEVICE') {
        const cachedUser = await readCachedSessionUser();
        setUser(cachedUser);
        setIsNotMainDevice(true);
        return;
      }
      setUser(null);
      setIsNotMainDevice(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, isLoading, isNotMainDevice, refresh };
}
