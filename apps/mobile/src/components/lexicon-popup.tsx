import type { ReactElement } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import { SpeakerIcon, StarIcon } from './ui/shell-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface LexiconPopupProps {
  visible: boolean;
  entry: LexiconLookupResult | null;
  isSaved: boolean;
  audioMessage: string | null;
  onClose: () => void;
  onToggleSave: () => void;
  onPlayAudio: () => void;
}

export function LexiconPopup(props: LexiconPopupProps): ReactElement {
  const { visible, entry, isSaved, audioMessage, onClose, onToggleSave, onPlayAudio } = props;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const maxSheetHeight = Math.min(windowHeight * 0.72, 520);

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop}>
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
              <View style={styles.headerRow}>
                <View style={styles.headerMain}>
                  <Text style={styles.word}>{entry.displayForm}</Text>
                  {entry.ipa ? <Text style={styles.ipa}>{entry.ipa}</Text> : null}
                </View>
                <Pressable
                  accessibilityLabel={isSaved ? '取消收藏' : '收藏'}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onToggleSave}
                  style={styles.starButton}
                >
                  <StarIcon filled={isSaved} size="md" />
                </Pressable>
              </View>

              <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={styles.scrollBody}
              >
                <View style={styles.contentPanel}>
                  {entry.definitions.map((definition, index) => (
                    <Text key={`${definition.text}-${String(index)}`} style={styles.definition}>
                      {definition.pos ? `${definition.pos} ` : ''}
                      {definition.text}
                    </Text>
                  ))}
                  {entry.formNote ? <Text style={styles.formNote}>{entry.formNote}</Text> : null}
                  {audioMessage ? <Text style={styles.audioMessage}>{audioMessage}</Text> : null}
                </View>
              </ScrollView>

              <Pressable accessibilityRole="button" onPress={onPlayAudio} style={styles.audioButton}>
                <SpeakerIcon color={colors.textPrimary} size="sm" />
                <Text style={styles.audioLabel}>发音</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.missing}>这个词还没有收录</Text>
          )}
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    minHeight: 220,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerMain: {
    flex: 1,
    gap: spacing.xs,
  },
  word: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  ipa: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  starButton: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'center',
    width: spacing.touchTarget,
  },
  scrollBody: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  contentPanel: {
    backgroundColor: colors.background,
    borderRadius: 6,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  definition: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  formNote: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  audioMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  audioButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 5,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  audioLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  missing: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    paddingBottom: spacing.lg,
  },
});
