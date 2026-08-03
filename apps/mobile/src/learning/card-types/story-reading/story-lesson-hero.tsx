import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

interface StoryLessonHeroProps {
  coverUri: string | null;
  titleEn: string;
  titleZh: string;
}

const PLACEHOLDER_ASPECT_RATIO = 16 / 9;

export function StoryLessonHero(props: StoryLessonHeroProps): ReactElement {
  const [coverAspectRatio, setCoverAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!props.coverUri) {
      setCoverAspectRatio(null);
      return;
    }

    let cancelled = false;
    Image.getSize(
      props.coverUri,
      (width, height) => {
        if (cancelled || width <= 0 || height <= 0) {
          return;
        }
        setCoverAspectRatio(width / height);
      },
      () => {
        if (!cancelled) {
          setCoverAspectRatio(PLACEHOLDER_ASPECT_RATIO);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [props.coverUri]);

  const titles = (
    <View style={styles.titleScrim}>
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
      <View style={[styles.hero, styles.placeholder, { aspectRatio: PLACEHOLDER_ASPECT_RATIO }]}>
        <View style={styles.placeholderTitles}>{titles}</View>
      </View>
    );
  }

  return (
    <View style={styles.hero}>
      <Image
        accessibilityLabel="课文封面"
        resizeMode="cover"
        source={{ uri: props.coverUri }}
        style={[styles.coverImage, { aspectRatio: coverAspectRatio ?? PLACEHOLDER_ASPECT_RATIO }]}
      />
      <View pointerEvents="none" style={styles.titleBar}>
        {titles}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  coverImage: {
    width: '100%',
  },
  placeholder: {
    backgroundColor: colors.statTileBackground,
    justifyContent: 'flex-end',
  },
  placeholderTitles: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  titleBar: {
    bottom: 0,
    left: 0,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  titleScrim: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    borderRadius: 12,
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  titleEn: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleZh: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
});
