import type { ReactElement } from 'react';
import { View } from 'react-native';
import type { DrawerCommonFeatureId } from '../../shell/drawer-menu-config';
import { AppIcon, type AppIconName } from '../ui/app-icon';
import { colors } from '../../theme/colors';

interface DrawerCommonFeatureIconProps {
  featureId: DrawerCommonFeatureId;
}

const DRAWER_FEATURE_ICON: Record<DrawerCommonFeatureId, AppIconName> = {
  guide: 'compass-outline',
  'question-bank': 'library-outline',
  redeem: 'ticket-outline',
  follow: 'eye-outline',
};

export function DrawerCommonFeatureIcon(props: DrawerCommonFeatureIconProps): ReactElement {
  return (
    <View style={{ alignItems: 'center', height: 28, justifyContent: 'center', width: 28 }}>
      <AppIcon color={colors.textPrimary} name={DRAWER_FEATURE_ICON[props.featureId]} size="md" />
    </View>
  );
}
