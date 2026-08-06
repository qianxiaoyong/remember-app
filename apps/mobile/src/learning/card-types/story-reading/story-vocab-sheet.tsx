import type { ReactElement } from 'react';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildKnowledgeId, type StorySidebarEntry } from '@remember/contracts';
import { UpdateReviewConfirmDialog } from '../../../components/study/update-review-confirm-dialog';
import { getLearningStateByKnowledgeId } from '../../../data/repositories/learning-state-repository';
import { joinReviewPool } from '../../../use-cases/join-review-pool';
import { updateReviewPoolFromPack } from '../../../use-cases/update-review-pool-from-pack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { tierAccentColor } from './tier-colors';

interface StoryVocabSheetProps {
  visible: boolean;
  entry: StorySidebarEntry | null;
  packId?: string | undefined;
  onClose: () => void;
}

function vocabularyKnowledgeId(packId: string, headword: string): string {
  const kind = headword.trim().includes(' ') ? 'phrase' : 'word';
  return buildKnowledgeId(packId, headword, kind);
}

export function StoryVocabSheet(props: StoryVocabSheetProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const maxSheetHeight = Math.min(windowHeight * 0.55, 420);
  const entry = props.entry;
  const [updateConfirmVisible, setUpdateConfirmVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const knowledgeId =
    entry && props.packId ? vocabularyKnowledgeId(props.packId, entry.headword) : null;
  const inReviewPool =
    refreshKey >= 0 &&
    knowledgeId !== null &&
    (getLearningStateByKnowledgeId(knowledgeId)?.inReviewPool ?? false);

  const handleReviewPress = (): void => {
    if (!entry || !props.packId || !knowledgeId) {
      return;
    }
    setFeedback(null);
    const state = getLearningStateByKnowledgeId(knowledgeId);
    if (state?.inReviewPool) {
      setUpdateConfirmVisible(true);
      return;
    }
    const result = joinReviewPool({ knowledgeId, catalogPackId: props.packId });
    if (result.status === 'created') {
      setFeedback('已加入复习');
      setRefreshKey((value) => value + 1);
      return;
    }
    setUpdateConfirmVisible(true);
  };

  const handleConfirmUpdate = (): void => {
    if (!props.packId || !knowledgeId || !entry) {
      return;
    }
    updateReviewPoolFromPack({ knowledgeId, catalogPackId: props.packId });
    setFeedback('已更新复习');
    setUpdateConfirmVisible(false);
    setRefreshKey((value) => value + 1);
  };

  return (
    <>
      <Modal
        animationType="fade"
        onRequestClose={props.onClose}
        transparent
        visible={props.visible}
      >
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
                {props.packId ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleReviewPress}
                    style={styles.reviewButton}
                  >
                    <Text style={styles.reviewLabel}>
                      {inReviewPool ? '已加复习 ›' : '加入复习 ›'}
                    </Text>
                  </Pressable>
                ) : null}
                {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <UpdateReviewConfirmDialog
        onCancel={() => {
          setUpdateConfirmVisible(false);
        }}
        onConfirm={handleConfirmUpdate}
        visible={updateConfirmVisible}
      />
    </>
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
  reviewButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  reviewLabel: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  feedback: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
  },
});
