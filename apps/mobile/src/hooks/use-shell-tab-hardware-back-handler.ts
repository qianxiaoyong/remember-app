import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

/** Shell 根 tab 页：无更深栈时，系统返回退出 App。 */
export function useShellTabHardwareBackHandler(): void {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const onHardwareBackPress = (): boolean => {
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
    }, [router]),
  );
}
