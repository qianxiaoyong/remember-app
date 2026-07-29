import type { ReactElement } from 'react';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyRecallPanelProps {
  primaryImageUri?: string | null;
  onReveal: () => void;
}

export function StudyRecallPanel(props: StudyRecallPanelProps): ReactElement {
  const [imageVisible, setImageVisible] = useState(Boolean(props.primaryImageUri));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onReveal}
      style={styles.root}
    >
      <View style={styles.content}>
        {props.primaryImageUri && imageVisible ? (
          <Image
            onError={() => {
              setImageVisible(false);
            }}
            resizeMode="contain"
            source={{ uri: props.primaryImageUri }}
            style={styles.image}
          />
        ) : null}
        <Text style={styles.primaryHint}>请回忆单词发音和释义</Text>
        <Text style={styles.secondaryHint}>点击屏幕显示答案</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  image: {
    height: 120,
    marginBottom: spacing.xl,
    width: 120,
  },
  primaryHint: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  secondaryHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
