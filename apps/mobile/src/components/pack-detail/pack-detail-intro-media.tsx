import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { IntroMediaItem } from '@remember/contracts';
import { SurfaceCard } from '../ui/surface-card';
import { AppIcon } from '../ui/app-icon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailIntroMediaProps {
  items: IntroMediaItem[];
}

const INTRO_IMAGE_PLACEHOLDER_ASPECT_RATIO = 16 / 9;

export function PackDetailIntroMedia(props: PackDetailIntroMediaProps): ReactElement | null {
  if (props.items.length === 0) {
    return null;
  }

  const sorted = [...props.items].sort((left, right) => left.sortOrder - right.sortOrder);

  return (
    <SurfaceCard>
      <Text style={styles.title}>内容介绍</Text>
      <View style={styles.list}>
        {sorted.map((item, index) => (
          <IntroMediaRow item={item} key={`${item.type}-${item.sortOrder}-${index}`} />
        ))}
      </View>
    </SurfaceCard>
  );
}

function IntroMediaImage(props: { url: string }): ReactElement {
  const [aspectRatio, setAspectRatio] = useState(INTRO_IMAGE_PLACEHOLDER_ASPECT_RATIO);

  useEffect(() => {
    let cancelled = false;
    Image.getSize(
      props.url,
      (width, height) => {
        if (cancelled || width <= 0 || height <= 0) {
          return;
        }
        setAspectRatio(width / height);
      },
      () => {
        if (!cancelled) {
          setAspectRatio(INTRO_IMAGE_PLACEHOLDER_ASPECT_RATIO);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [props.url]);

  return (
    <Image
      accessibilityLabel="介绍图片"
      resizeMode="contain"
      source={{ uri: props.url }}
      style={[styles.image, { aspectRatio }]}
    />
  );
}

function IntroMediaRow(props: { item: IntroMediaItem }): ReactElement {
  if (props.item.type === 'image') {
    return <IntroMediaImage url={props.item.url} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void Linking.openURL(props.item.url);
      }}
      style={styles.videoButton}
    >
      <AppIcon color={colors.accent} name="play-circle-outline" size="md" />
      <Text style={styles.videoLabel}>观看介绍视频</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  image: {
    backgroundColor: colors.statTileBackground,
    borderRadius: spacing.cardRadius,
    width: '100%',
  },
  videoButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.cardRadius,
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  videoLabel: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
