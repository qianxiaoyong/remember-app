import type { ReactElement } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

interface StoryLessonHeroProps {
  coverUri: string | null;
  titleEn: string;
  titleZh: string;
}

const HERO_HEIGHT = 200;

export function StoryLessonHero(props: StoryLessonHeroProps): ReactElement {
  const titles = (
    <View style={styles.titles}>
      <Text numberOfLines={2} style={styles.titleEn}>
        {props.titleEn}
      </Text>
      <Text numberOfLines={1} style={styles.titleZh}>
        {props.titleZh}
      </Text>
    </View>
  );

  if (!props.coverUri) {
    return (
      <View style={[styles.hero, styles.placeholder]}>
        <View style={styles.overlay} />
        {titles}
      </View>
    );
  }

  return (
    <ImageBackground
      accessibilityLabel="课文封面"
      resizeMode="cover"
      source={{ uri: props.coverUri }}
      style={styles.hero}
    >
      <View style={styles.overlay} />
      {titles}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  placeholder: {
    backgroundColor: colors.statTileBackground,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  titles: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  titleEn: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  titleZh: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 15,
    lineHeight: 22,
  },
});
