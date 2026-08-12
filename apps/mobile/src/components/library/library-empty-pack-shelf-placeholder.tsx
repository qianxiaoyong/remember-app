import type { ReactElement } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { catalogCoverHeight, catalogCoverShelfWidth } from '../../catalog/catalog-cover-layout';
import { PrimaryButton } from '../ui/primary-button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LibraryEmptyPackShelfPlaceholderProps {
  onBrowsePress: () => void;
}

export function LibraryEmptyPackShelfPlaceholder(
  props: LibraryEmptyPackShelfPlaceholderProps,
): ReactElement {
  const { width: windowWidth } = useWindowDimensions();
  const coverWidth = catalogCoverShelfWidth(windowWidth);
  const coverHeight = catalogCoverHeight(coverWidth);

  return (
    <View style={[styles.root, { minHeight: coverHeight + spacing.xl }]}>
      <View style={[styles.messageBlock, { maxWidth: coverWidth }]}>
        <Text style={styles.title}>还没有安装知识库</Text>
        <Text style={styles.subtitle}>去资料页选一本</Text>
        <PrimaryButton label="去资料看看" onPress={props.onBrowsePress} variant="surface" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  messageBlock: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
