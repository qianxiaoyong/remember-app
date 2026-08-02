import type { ReactElement } from 'react';
import { useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StoryReadingContent, StorySidebarEntry } from '@remember/contracts';
import { SurfaceCard } from '../../../components/ui/surface-card';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { BackChevronIcon, MoreVerticalIcon, SpeakerIcon } from '../../../components/ui/shell-icons';
import { resolvePackAssetUri } from '../../../use-cases/resolve-pack-asset-uri';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { countSidebarWords, countTierStats } from './count-tier-stats';
import {
  isScrollAtBottom,
  isScrollContentFullyVisible,
  SCROLL_BOTTOM_THRESHOLD,
} from './scroll-reach-bottom';
import { StoryVocabSheet } from './story-vocab-sheet';
import { TierLegendChips } from './tier-legend-chips';
import { tierAccentColor, tierBackgroundColors } from './tier-colors';

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
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);

  const tryMarkReachedBottomIfFullyVisible = (): void => {
    if (
      isScrollContentFullyVisible(
        contentHeightRef.current,
        layoutHeightRef.current,
        SCROLL_BOTTOM_THRESHOLD,
      )
    ) {
      props.onReachedBottom?.();
    }
  };

  const handleContentSizeChange = (_width: number, height: number): void => {
    contentHeightRef.current = height;
    tryMarkReachedBottomIfFullyVisible();
  };

  const handleScrollViewLayout = (event: LayoutChangeEvent): void => {
    layoutHeightRef.current = event.nativeEvent.layout.height;
    tryMarkReachedBottomIfFullyVisible();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      isScrollAtBottom({
        contentHeight: contentSize.height,
        layoutHeight: layoutMeasurement.height,
        scrollOffsetY: contentOffset.y,
        threshold: SCROLL_BOTTOM_THRESHOLD,
      })
    ) {
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
        <CircleIconButton accessibilityLabel="返回书库" onPress={props.onHomePress}>
          <BackChevronIcon size="sm" />
        </CircleIconButton>
        <Text style={styles.toolbarTitle}>{props.content.lesson.code}</Text>
        <CircleIconButton accessibilityLabel="更多" onPress={props.onMorePress}>
          <MoreVerticalIcon size="sm" />
        </CircleIconButton>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleScrollViewLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <SurfaceCard>
          <View style={styles.lessonHeaderRow}>
            {coverUri ? (
              <Image
                accessibilityLabel="课文插图"
                source={{ uri: coverUri }}
                style={styles.coverThumb}
              />
            ) : (
              <View style={[styles.coverThumb, styles.coverPlaceholder]} />
            )}
            <View style={styles.lessonTitles}>
              <Text numberOfLines={2} style={styles.titleEn}>
                {props.content.lesson.titleEn}
              </Text>
              <Text numberOfLines={1} style={styles.titleZh}>
                {props.content.lesson.titleZh}
              </Text>
            </View>
          </View>

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

          <View style={styles.legendWrap}>
            <TierLegendChips stats={tierStats} />
          </View>
        </SurfaceCard>

        <View style={styles.bodyCardWrap}>
          <SurfaceCard>
            <View style={styles.body}>
              {props.content.story.paragraphs.map((paragraph, paragraphIndex) => (
                <Text key={`p-${String(paragraphIndex)}`} style={styles.paragraph}>
                  {paragraph.runs.map((run, runIndex) => {
                    if (run.kind === 'text') {
                      return (
                        <Text key={`t-${String(paragraphIndex)}-${String(runIndex)}`}>
                          {run.text}
                        </Text>
                      );
                    }
                    return (
                      <Text key={`w-${String(paragraphIndex)}-${String(runIndex)}`}>
                        <Text
                          onPress={() => {
                            openVocabSheet(run.vocabId);
                          }}
                          style={[
                            styles.wordSurface,
                            {
                              backgroundColor: tierBackgroundColors[run.tier],
                              borderBottomColor: tierAccentColor(run.tier),
                            },
                          ]}
                        >
                          {run.surface}
                        </Text>
                        <Text style={styles.wordGloss}>（{run.glossZh}）</Text>
                      </Text>
                    );
                  })}
                </Text>
              ))}
            </View>
          </SurfaceCard>
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

const COVER_THUMB_WIDTH = 88;

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  toolbarTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  coverThumb: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.statTileBackground,
    borderRadius: 12,
    width: COVER_THUMB_WIDTH,
  },
  coverPlaceholder: {
    opacity: 0.6,
  },
  lessonTitles: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: COVER_THUMB_WIDTH * 0.75,
  },
  titleEn: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleZh: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
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
    flex: 1,
    paddingVertical: spacing.sm,
  },
  vocabLinkText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  legendWrap: {
    marginTop: spacing.md,
  },
  bodyCardWrap: {
    marginTop: spacing.xs,
  },
  body: {
    gap: spacing.md,
  },
  paragraph: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 32,
  },
  wordSurface: {
    borderBottomWidth: 2,
    fontSize: 18,
    lineHeight: 32,
  },
  wordGloss: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 32,
  },
});
