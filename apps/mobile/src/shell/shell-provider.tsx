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
const CapsuleVisibleContext = createContext(true);
const SetCapsuleVisibleContext = createContext<((visible: boolean) => void) | null>(null);

export function ShellProvider(props: { children: ReactNode }): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [capsuleVisible, setCapsuleVisible] = useState(true);
  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    clearDrawerReturnPending();
    setIsDrawerOpen((open) => (open ? false : open));
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
      <SetCapsuleVisibleContext.Provider value={setCapsuleVisible}>
        <CapsuleVisibleContext.Provider value={capsuleVisible}>
          <DrawerOpenContext.Provider value={isDrawerOpen}>
            {props.children}
          </DrawerOpenContext.Provider>
        </CapsuleVisibleContext.Provider>
      </SetCapsuleVisibleContext.Provider>
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

export function useCapsuleVisible(): boolean {
  return useContext(CapsuleVisibleContext);
}

export function useSetCapsuleVisible(): (visible: boolean) => void {
  const setVisible = useContext(SetCapsuleVisibleContext);
  if (!setVisible) {
    throw new Error('useSetCapsuleVisible must be used within ShellProvider');
  }
  return setVisible;
}

/** Shell 外（如 Stack 级 review-inspect）无胶囊栏时可安全调用，返回 null。 */
export function useOptionalSetCapsuleVisible(): ((visible: boolean) => void) | null {
  return useContext(SetCapsuleVisibleContext);
}

/** @deprecated 订阅 isDrawerOpen 会导致页面随抽屉开关重渲染；请改用 useShellActions / useDrawerOpen */
export function useShell(): ShellActions & { isDrawerOpen: boolean } {
  return {
    ...useShellActions(),
    isDrawerOpen: useDrawerOpen(),
  };
}
