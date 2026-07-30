import type { ReactElement } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { IntroMediaItem } from '@remember/contracts';
import { SurfaceCard } from '../ui/surface-card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailIntroMediaProps {
  items: IntroMediaItem[];
}

export function PackDetailIntroMedia(props: PackDetailIntroMediaProps): ReactElement | null {
  if (props.items.length === 0) {
    return null;
  }

  const sorted = [...props.items].sort((left, right) => left.sortOrder - right.sortOrder);

  return (
    <SurfaceCard>
      <Text style={styles.title}>内容介绍</Text>
      <View style={styles.list}>
        {sorted.map((item) => (
          <IntroMediaRow item={item} key={`${item.type}-${item.url}`} />
        ))}
      </View>
    </SurfaceCard>
  );
}

function IntroMediaRow(props: { item: IntroMediaItem }): ReactElement {
  if (props.item.type === 'image') {
    return (
      <Image
        accessibilityLabel="介绍图片"
        resizeMode="cover"
        source={{ uri: props.item.url }}
        style={styles.image}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void Linking.openURL(props.item.url);
      }}
      style={styles.videoButton}
    >
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
    borderRadius: spacing.cardRadius,
    height: 180,
    width: '100%',
  },
  videoButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.cardRadius,
    paddingVertical: spacing.lg,
  },
  videoLabel: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
