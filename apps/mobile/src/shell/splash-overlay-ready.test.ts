import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  markSplashOverlayReady,
  resetSplashOverlayReadyForTests,
  waitForSplashOverlayReady,
} from './splash-overlay-ready';

describe('waitForSplashOverlayReady', () => {
  afterEach(() => {
    resetSplashOverlayReadyForTests();
    vi.useRealTimers();
  });

  it('超时后仍会 resolve', async () => {
    vi.useFakeTimers();
    const promise = waitForSplashOverlayReady(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });

  it('markSplashOverlayReady 后立刻 resolve', async () => {
    markSplashOverlayReady();
    await expect(waitForSplashOverlayReady()).resolves.toBeUndefined();
  });
});
