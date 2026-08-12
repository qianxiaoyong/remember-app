import type { ReactElement, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearDrawerReturnPending } from './drawer-return-intent';

interface ShellActions {
  openDrawer: () => void;
  /** 关闭抽屉并清除「返回后重新打开」意图（用户主动关闭）。 */
  closeDrawer: () => void;
  /** 仅关闭抽屉动画，保留返回意图（从抽屉进入子页时）。 */
  dismissDrawer: () => void;
  openContactPanel: () => void;
  closeContactPanel: () => void;
}

const ShellActionsContext = createContext<ShellActions | null>(null);
const DrawerOpenContext = createContext(false);
const ContactPanelOpenContext = createContext(false);
const TabBarVisibleContext = createContext(true);
const SetTabBarVisibleContext = createContext<((visible: boolean) => void) | null>(null);

export function ShellProvider(props: { children: ReactNode }): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isContactPanelOpen, setIsContactPanelOpen] = useState(false);
  const [tabBarVisible, setTabBarVisible] = useState(true);
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
  const openContactPanel = useCallback(() => {
    setIsContactPanelOpen(true);
  }, []);
  const closeContactPanel = useCallback(() => {
    setIsContactPanelOpen(false);
  }, []);
  const actions = useMemo(
    () => ({ closeContactPanel, closeDrawer, dismissDrawer, openContactPanel, openDrawer }),
    [closeContactPanel, closeDrawer, dismissDrawer, openContactPanel, openDrawer],
  );

  return (
    <ShellActionsContext.Provider value={actions}>
      <SetTabBarVisibleContext.Provider value={setTabBarVisible}>
        <TabBarVisibleContext.Provider value={tabBarVisible}>
          <DrawerOpenContext.Provider value={isDrawerOpen}>
            <ContactPanelOpenContext.Provider value={isContactPanelOpen}>
              {props.children}
            </ContactPanelOpenContext.Provider>
          </DrawerOpenContext.Provider>
        </TabBarVisibleContext.Provider>
      </SetTabBarVisibleContext.Provider>
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

export function useContactPanelOpen(): boolean {
  return useContext(ContactPanelOpenContext);
}

export function useTabBarVisible(): boolean {
  return useContext(TabBarVisibleContext);
}

export function useSetTabBarVisible(): (visible: boolean) => void {
  const setVisible = useContext(SetTabBarVisibleContext);
  if (!setVisible) {
    throw new Error('useSetTabBarVisible must be used within ShellProvider');
  }
  return setVisible;
}

/** Shell 外（如 Stack 级 review-inspect）无 Tab 栏时可安全调用，返回 null。 */
export function useOptionalSetTabBarVisible(): ((visible: boolean) => void) | null {
  return useContext(SetTabBarVisibleContext);
}

/** @deprecated 使用 useTabBarVisible */
export function useCapsuleVisible(): boolean {
  return useTabBarVisible();
}

/** @deprecated 使用 useSetTabBarVisible */
export function useSetCapsuleVisible(): (visible: boolean) => void {
  return useSetTabBarVisible();
}

/** @deprecated 使用 useOptionalSetTabBarVisible */
export function useOptionalSetCapsuleVisible(): ((visible: boolean) => void) | null {
  return useOptionalSetTabBarVisible();
}

/** @deprecated 订阅 isDrawerOpen 会导致页面随抽屉开关重渲染；请改用 useShellActions / useDrawerOpen */
export function useShell(): ShellActions & { isDrawerOpen: boolean } {
  return {
    ...useShellActions(),
    isDrawerOpen: useDrawerOpen(),
  };
}
