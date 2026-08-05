import { useEffect } from 'react';
import { useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

/** 导航就绪后再隐藏 splash，避免根布局挂载与首屏渲染之间的白屏间隙。 */
export function useAppSplashScreen(): void {
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }
    void SplashScreen.hideAsync();
  }, [navigationState?.key]);
}
