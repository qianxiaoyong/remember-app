import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StoryReadingContent, StorySidebarEntry } from '@remember/contracts';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { HomeTabIcon, MoreVerticalIcon, SpeakerIcon } from '../../../components/ui/shell-icons';
import { resolvePackAssetUri } from '../../../use-cases/resolve-pack-asset-uri';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { countSidebarWords, countTierStats, formatTierLegend } from './count-tier-stats';
import { StoryVocabSheet } from './story-vocab-sheet';
import { tierBackgroundColors } from './tier-colors';

const SCROLL_BOTTOM_THRESHOLD = 48;

export interface StoryReadingPanelProps {
  packId: string;
  knowledgeId: string;
  content: StoryReadingContent;
  onHomePress: () => void;
  onMorePress: () => void;
  onPlayPrimaryAudio: () => void;
  onReachedBottom?: () => void;
}

export function StoryReadingPanel(props: StoryReadingPanelProps): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] = useState<StorySidebarEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const tierStats = useMemo(() => countTierStats(props.content), [props.content]);
  const sidebarById = useMemo(() => {
    const map = new Map<string, StorySidebarEntry>();
    for (const entry of props.content.sidebar) {
      map.set(entry.vocabId, entry);
    }
    return map;
  }, [props.content.sidebar]);
  const coverUri = resolvePackAssetUri(props.packId, props.content.lesson.coverImage);
  const wordCount = countSidebarWords(props.content);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
      props.onReachedBottom?.();
    }
  };

  const openVocabSheet = (vocabId: string): void => {
    const entry = sidebarById.get(vocabId) ?? null;
    setSelectedEntry(entry);
    setSheetVisible(true);
  };

  const openVocabList = (): void => {
    router.push(
      `/study/story-vocab-list?packId=${encodeURIComponent(props.packId)}&knowledgeId=${encodeURIComponent(props.knowledgeId)}`,
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.toolbar, { paddingTop: insets.top + spacing.sm }]}>
        <CircleIconButton accessibilityLabel="返回首页" onPress={props.onHomePress}>
          <HomeTabIcon active size="sm" />
        </CircleIconButton>
        <CircleIconButton accessibilityLabel="更多" onPress={props.onMorePress}>
          <MoreVerticalIcon size="sm" />
        </CircleIconButton>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {coverUri ? (
          <Image accessibilityLabel="课文封面" source={{ uri: coverUri }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]} />
        )}

        <Text style={styles.lessonCode}>{props.content.lesson.code}</Text>
        <Text style={styles.titleEn}>{props.content.lesson.titleEn}</Text>
        <Text style={styles.titleZh}>{props.content.lesson.titleZh}</Text>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={props.onPlayPrimaryAudio}
            style={styles.playButton}
          >
            <SpeakerIcon size="sm" />
            <Text style={styles.playLabel}>播放</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={openVocabList} style={styles.vocabLink}>
            <Text style={styles.vocabLinkText}>本课 {wordCount} 词 ›</Text>
          </Pressable>
        </View>

        <View style={styles.legendRow}>
          <Text style={styles.legendItem}>{formatTierLegend(tierStats, 'high')}</Text>
          <Text style={styles.legendItem}>{formatTierLegend(tierStats, 'mid')}</Text>
          <Text style={styles.legendItem}>{formatTierLegend(tierStats, 'low')}</Text>
        </View>

        <View style={styles.body}>
          {props.content.story.paragraphs.map((paragraph, paragraphIndex) => (
            <Text key={`p-${String(paragraphIndex)}`} style={styles.paragraph}>
              {paragraph.runs.map((run, runIndex) => {
                if (run.kind === 'text') {
                  return (
                    <Text key={`t-${String(paragraphIndex)}-${String(runIndex)}`}>{run.text}</Text>
                  );
                }
                return (
                  <Text
                    key={`w-${String(paragraphIndex)}-${String(runIndex)}`}
                    onPress={() => {
                      openVocabSheet(run.vocabId);
                    }}
                    style={[styles.wordRun, { backgroundColor: tierBackgroundColors[run.tier] }]}
                  >
                    {run.surface}（{run.glossZh}）
                  </Text>
                );
              })}
            </Text>
          ))}
        </View>
      </ScrollView>

      <StoryVocabSheet
        entry={selectedEntry}
        onClose={() => {
          setSheetVisible(false);
          setSelectedEntry(null);
        }}
        visible={sheetVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  cover: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.statTileBackground,
    borderRadius: 12,
    marginTop: spacing.sm,
    width: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonCode: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  titleEn: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  titleZh: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  playLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  vocabLink: {
    paddingVertical: spacing.sm,
  },
  vocabLinkText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  legendItem: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  body: {
    marginTop: spacing.lg,
  },
  paragraph: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  wordRun: {
    borderRadius: 4,
  },
});
