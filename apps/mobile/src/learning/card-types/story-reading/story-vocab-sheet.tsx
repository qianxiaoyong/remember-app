import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StorySidebarEntry } from '@remember/contracts';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { tierAccentColor } from './tier-colors';

interface StoryVocabSheetProps {
  visible: boolean;
  entry: StorySidebarEntry | null;
  onClose: () => void;
}

export function StoryVocabSheet(props: StoryVocabSheetProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const maxSheetHeight = Math.min(windowHeight * 0.55, 420);
  const entry = props.entry;

  return (
    <Modal animationType="fade" onRequestClose={props.onClose} transparent visible={props.visible}>
      <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.backdrop}>
        <Pressable
          accessibilityRole="none"
          onPress={() => undefined}
          style={[
            styles.sheet,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          {entry ? (
            <>
              <View style={[styles.tierBar, { backgroundColor: tierAccentColor(entry.tier) }]} />
              <View style={styles.headerRow}>
                <Text style={styles.headword}>{entry.headword}</Text>
                <Text style={styles.pos}>{entry.pos}</Text>
              </View>
              <Text style={styles.ipa}>{entry.ipa}</Text>
              <Text style={styles.definition}>{entry.definitionZh}</Text>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tierBar: {
    borderRadius: 2,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  headerRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headword: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  pos: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  ipa: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  definition: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
  },
});
