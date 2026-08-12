import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';

/** 与原 Tab 页大标题（22/bold）占位等高，仅保留顶部留白。 */
export const TAB_PAGE_TITLE_BLOCK_HEIGHT = 30;

export function TabPageTopSpacer(): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleBlock} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  titleBlock: {
    height: TAB_PAGE_TITLE_BLOCK_HEIGHT,
  },
});
