import type { ReactElement, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ShellActions {
  openDrawer: () => void;
  closeDrawer: () => void;
}

const ShellActionsContext = createContext<ShellActions | null>(null);
const DrawerOpenContext = createContext(false);

export function ShellProvider(props: { children: ReactNode }): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);
  const actions = useMemo(() => ({ closeDrawer, openDrawer }), [closeDrawer, openDrawer]);

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
