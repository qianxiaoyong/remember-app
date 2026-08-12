import type { ReactElement, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ShellActions {
  openContactPanel: () => void;
  closeContactPanel: () => void;
}

const ShellActionsContext = createContext<ShellActions | null>(null);
const ContactPanelOpenContext = createContext(false);
const TabBarVisibleContext = createContext(true);
const SetTabBarVisibleContext = createContext<((visible: boolean) => void) | null>(null);

export function ShellProvider(props: { children: ReactNode }): ReactElement {
  const [isContactPanelOpen, setIsContactPanelOpen] = useState(false);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const openContactPanel = useCallback(() => {
    setIsContactPanelOpen(true);
  }, []);
  const closeContactPanel = useCallback(() => {
    setIsContactPanelOpen(false);
  }, []);
  const actions = useMemo(
    () => ({ closeContactPanel, openContactPanel }),
    [closeContactPanel, openContactPanel],
  );

  return (
    <ShellActionsContext.Provider value={actions}>
      <SetTabBarVisibleContext.Provider value={setTabBarVisible}>
        <TabBarVisibleContext.Provider value={tabBarVisible}>
          <ContactPanelOpenContext.Provider value={isContactPanelOpen}>
            {props.children}
          </ContactPanelOpenContext.Provider>
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
