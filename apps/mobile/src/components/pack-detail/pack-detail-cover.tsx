import type { ReactElement } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { CatalogCoverPresentation } from '../../catalog/resolve-catalog-cover';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailCoverProps {
  cover: CatalogCoverPresentation;
}

export function PackDetailCover(props: PackDetailCoverProps): ReactElement {
  const { cover } = props;

  return (
    <ImageBackground
      imageStyle={styles.coverImage}
      resizeMode="cover"
      source={cover.imageSource}
      style={styles.cover}
    >
      <View style={styles.scrimTop} />
      <View style={styles.scrimBottom} />
      <View style={styles.content}>
        <Text style={styles.badge}>{cover.badge}</Text>
        <View style={styles.titleBlock}>
          {cover.lines.map((line) => (
            <Text key={line} numberOfLines={2} style={styles.titleLine}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const COVER_WIDTH = 96;
const COVER_HEIGHT = 128;

const styles = StyleSheet.create({
  cover: {
    borderRadius: 14,
    height: COVER_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: COVER_WIDTH,
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  scrimTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  scrimBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    bottom: 0,
    height: '58%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  badge: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    zIndex: 1,
  },
  titleBlock: {
    gap: 2,
    zIndex: 1,
  },
  titleLine: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
});
