import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { deferAfterFirstPaint } from '../lib/defer-after-first-paint';
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
      return deferAfterFirstPaint(() => {
        openDrawer();
      });
    }, [openDrawer]),
  );
}
