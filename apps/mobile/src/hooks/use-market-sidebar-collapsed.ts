import { useCallback, useEffect, useState } from 'react';
import {
  getMarketSidebarCollapsedSync,
  readMarketUiPreferences,
  writeMarketSidebarCollapsed,
} from '../shell/market-ui-preferences';

export function useMarketSidebarCollapsed(): {
  collapsed: boolean;
  toggleCollapsed: () => void;
} {
  const [collapsed, setCollapsed] = useState(getMarketSidebarCollapsedSync);

  useEffect(() => {
    void readMarketUiPreferences().then((preferences) => {
      setCollapsed(preferences.sidebarCollapsed);
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      void writeMarketSidebarCollapsed(next);
      return next;
    });
  }, []);

  return { collapsed, toggleCollapsed };
}
