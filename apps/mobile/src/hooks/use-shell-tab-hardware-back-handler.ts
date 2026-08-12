import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useDrawerOpen } from '../shell/shell-provider';

/** Shell 根 tab 页：抽屉未开且无更深栈时，系统返回退出 App。 */
export function useShellTabHardwareBackHandler(): void {
  const router = useRouter();
  const isDrawerOpen = useDrawerOpen();

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = (): boolean => {
        if (isDrawerOpen) {
          return false;
        }
        if (router.canGoBack()) {
          return false;
        }
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
      return () => {
        subscription.remove();
      };
    }, [isDrawerOpen, router]),
  );
}
