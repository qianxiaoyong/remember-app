import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { InstalledPackSummary, LibraryOverview } from '../../use-cases/get-library-overview';
import { LibraryActivePackSummary } from './library-active-pack-summary';
import { LibraryTodayOverviewBoard } from './library-today-overview-board';
import { PrimaryButton } from '../ui/primary-button';
import { SurfaceCard } from '../ui/surface-card';
import { spacing } from '../../theme/spacing';

const HOME_CARD_BORDER_RADIUS = 8;
const HOME_BUTTON_BORDER_RADIUS = 8;
const HOME_CARD_PADDING = 20;

interface LibraryHomeWhiteCardProps {
  activePack: InstalledPackSummary;
  overview: LibraryOverview;
  onContinuePress: () => void;
  onDetailPress: () => void;
}

export function LibraryHomeWhiteCard(props: LibraryHomeWhiteCardProps): ReactElement {
  const { activePack } = props;

  return (
    <SurfaceCard borderRadius={HOME_CARD_BORDER_RADIUS} contentPadding={HOME_CARD_PADDING}>
      <LibraryActivePackSummary onDetailPress={props.onDetailPress} pack={activePack} />
      <View style={styles.continueButtonWrap}>
        <PrimaryButton
          borderRadius={HOME_BUTTON_BORDER_RADIUS}
          label={activePack.actionLabel}
          onPress={props.onContinuePress}
        />
      </View>
      <LibraryTodayOverviewBoard overview={props.overview} />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  continueButtonWrap: {
    marginTop: spacing.xl,
  },
});
