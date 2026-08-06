import { useCallback, useEffect, useState } from 'react';
import type { SessionUser } from '@remember/contracts';
import { ApiRequestError } from '../data/api/api-client';
import { readCachedSessionUser } from '../data/session/session-store';
import { getCurrentSessionUser } from '../use-cases/auth/get-current-session-user';

interface AuthSessionState {
  user: SessionUser | null;
  isLoading: boolean;
  isNotMainDevice: boolean;
  refresh: (options?: { showLoading?: boolean }) => Promise<void>;
}

export function useAuthSession(): AuthSessionState {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotMainDevice, setIsNotMainDevice] = useState(false);

  const refresh = useCallback(async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? true;
    if (showLoading) {
      setIsLoading(true);
    }

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
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    void (async () => {
      const cachedUser = await readCachedSessionUser();
      if (!signal.aborted) {
        if (cachedUser) {
          setUser(cachedUser);
        }
        setIsLoading(false);
      }

      try {
        const sessionUser = await getCurrentSessionUser();
        if (!signal.aborted) {
          setUser(sessionUser);
          setIsNotMainDevice(false);
        }
      } catch (error) {
        if (!signal.aborted) {
          if (error instanceof ApiRequestError && error.code === 'NOT_MAIN_DEVICE') {
            const cachedUserAfterKick = await readCachedSessionUser();
            setUser(cachedUserAfterKick);
            setIsNotMainDevice(true);
            return;
          }
          setUser(null);
          setIsNotMainDevice(false);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return { user, isLoading, isNotMainDevice, refresh };
}
