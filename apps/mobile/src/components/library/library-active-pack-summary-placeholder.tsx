import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { catalogCoverHeight } from '../../catalog/catalog-cover-layout';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const PLACEHOLDER_COVER_WIDTH = 64;

export function LibraryActivePackSummaryPlaceholder(): ReactElement {
  return (
    <View style={styles.root}>
      <View style={styles.coverPlaceholder} />
      <View style={styles.body}>
        <Text style={styles.title}>尚未选择知识库</Text>
        <View style={styles.progressTrack} />
        <Text style={styles.hint}>安装后可在这里继续学习</Text>
      </View>
    </View>
  );
}

export const libraryActivePackSummaryPlaceholderHeight =
  catalogCoverHeight(PLACEHOLDER_COVER_WIDTH);

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  coverPlaceholder: {
    backgroundColor: colors.statTileBackground,
    borderRadius: 8,
    height: catalogCoverHeight(PLACEHOLDER_COVER_WIDTH),
    width: PLACEHOLDER_COVER_WIDTH,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  progressTrack: {
    backgroundColor: colors.statTileBackground,
    borderRadius: 2,
    height: 4,
    width: '100%',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});
