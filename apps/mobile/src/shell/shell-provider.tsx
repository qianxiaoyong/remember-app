import type { ReactElement, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearDrawerReturnPending } from './drawer-return-intent';

interface ShellActions {
  openDrawer: () => void;
  /** 关闭抽屉并清除「返回后重新打开」意图（用户主动关闭）。 */
  closeDrawer: () => void;
  /** 仅关闭抽屉动画，保留返回意图（从抽屉进入子页时）。 */
  dismissDrawer: () => void;
}

const ShellActionsContext = createContext<ShellActions | null>(null);
const DrawerOpenContext = createContext(false);

export function ShellProvider(props: { children: ReactNode }): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    clearDrawerReturnPending();
    setIsDrawerOpen(false);
  }, []);
  const dismissDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);
  const actions = useMemo(
    () => ({ closeDrawer, dismissDrawer, openDrawer }),
    [closeDrawer, dismissDrawer, openDrawer],
  );

  return (
    <ShellActionsContext.Provider value={actions}>
      <DrawerOpenContext.Provider value={isDrawerOpen}>{props.children}</DrawerOpenContext.Provider>
    </ShellActionsContext.Provider>
  );
}

export function useShellActions(): ShellActions {
  const value = useContext(ShellActionsContext);
  if (!value) {
    throw new Error('useShellActions must be used within ShellProvider');
  }
  return value;
}

export function useDrawerOpen(): boolean {
  return useContext(DrawerOpenContext);
}

/** @deprecated 订阅 isDrawerOpen 会导致页面随抽屉开关重渲染；请改用 useShellActions / useDrawerOpen */
export function useShell(): ShellActions & { isDrawerOpen: boolean } {
  return {
    ...useShellActions(),
    isDrawerOpen: useDrawerOpen(),
  };
}
