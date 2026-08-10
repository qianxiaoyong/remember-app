import { useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { consumeDrawerReturnPending } from '../shell/drawer-return-intent';
import { useShellActions } from '../shell/shell-provider';

/** 从抽屉进入的子页返回 shell 时，恢复抽屉打开状态。 */
export function useRestoreDrawerOnReturn(): void {
  const { openDrawer } = useShellActions();

  useFocusEffect(
    useCallback(() => {
      if (!consumeDrawerReturnPending()) {
        return;
      }
      const task = InteractionManager.runAfterInteractions(() => {
        openDrawer();
      });
      return () => {
        task.cancel();
      };
    }, [openDrawer]),
  );
}
