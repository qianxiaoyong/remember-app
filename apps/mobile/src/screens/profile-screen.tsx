import type { ReactElement } from 'react';
import { TabPageTopSpacer } from '../components/shell/tab-page-top-spacer';
import { ProfileScreenBody } from '../components/profile/profile-screen-body';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { useShellTabHardwareBackHandler } from '../hooks/use-shell-tab-hardware-back-handler';

export function ProfileScreen(): ReactElement {
  useShellTabHardwareBackHandler();

  return (
    <ScreenScaffold safeAreaEdges={['left', 'right']} withTabBarPadding>
      <TabPageTopSpacer />
      <ProfileScreenBody />
    </ScreenScaffold>
  );
}
