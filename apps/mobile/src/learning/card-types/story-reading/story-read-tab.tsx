import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StoryReadingContent, StorySidebarEntry } from '@remember/contracts';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { resolvePackAssetUri } from '../../../use-cases/resolve-pack-asset-uri';
import { countTierStats } from './count-tier-stats';
import { findActiveParagraphIndex } from './story-follow-along';
import { StoryLessonHero } from './story-lesson-hero';
import { StoryVocabSheet } from './story-vocab-sheet';
import { TierLegendChips } from './tier-legend-chips';
import { storyFollowAlongTextColor, tierWordColorStyle } from './tier-colors';
import {
  storyBodyFontFamily,
  storyBodyFontSize,
  storyBodyLineHeight,
  storyGlossFontSize,
  storyParagraphGap,
} from './story-typography';

interface StoryReadTabProps {
  packId: string;
  knowledgeId: string;
  content: StoryReadingContent;
  positionMs: number;
  playing: boolean;
}

const AUTO_SCROLL_TOP_INSET = spacing.xl;

export function StoryReadTab(props: StoryReadTabProps): ReactElement {
  const [selectedEntry, setSelectedEntry] = useState<StorySidebarEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const paragraphOffsetsRef = useRef<Map<number, number>>(new Map());
  const lastAutoScrolledIndexRef = useRef<number | null>(null);
  const tierStats = useMemo(() => countTierStats(props.content), [props.content]);
  const activeParagraphIndex = useMemo(
    () => findActiveParagraphIndex(props.content.story.paragraphs, props.positionMs),
    [props.content.story.paragraphs, props.positionMs],
  );
  const sidebarById = useMemo(() => {
    const map = new Map<string, StorySidebarEntry>();
    for (const entry of props.content.sidebar) {
      map.set(entry.vocabId, entry);
    }
    return map;
  }, [props.content.sidebar]);
  const coverUri = resolvePackAssetUri(props.packId, props.content.lesson.coverImage);

  useEffect(() => {
    setShowTranslation(false);
    paragraphOffsetsRef.current.clear();
    lastAutoScrolledIndexRef.current = null;
  }, [props.knowledgeId]);

  useEffect(() => {
    if (!props.playing || activeParagraphIndex === null) {
      return;
    }
    if (lastAutoScrolledIndexRef.current === activeParagraphIndex) {
      return;
    }
    const offsetY = paragraphOffsetsRef.current.get(activeParagraphIndex);
    if (offsetY === undefined) {
      return;
    }
    lastAutoScrolledIndexRef.current = activeParagraphIndex;
    scrollRef.current?.scrollTo({
      y: Math.max(0, offsetY - AUTO_SCROLL_TOP_INSET),
      animated: true,
    });
  }, [activeParagraphIndex, props.playing]);

  const openVocabSheet = (vocabId: string): void => {
    const entry = sidebarById.get(vocabId) ?? null;
    setSelectedEntry(entry);
    setSheetVisible(true);
  };

  return (
    <View style={styles.root}>
      <StoryLessonHero
        coverUri={coverUri}
        titleEn={props.content.lesson.titleEn}
        titleZh={props.content.lesson.titleZh}
      />

      <View style={styles.metaRow}>
        <View style={styles.legendWrap}>
          <TierLegendChips stats={tierStats} />
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: showTranslation }}
          onPress={() => {
            setShowTranslation((value) => !value);
          }}
          style={styles.translationToggle}
        >
          <Text
            style={[
              styles.translationToggleLabel,
              showTranslation ? styles.translationToggleLabelActive : null,
            ]}
          >
            显示翻译
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.body}>
          {props.content.story.paragraphs.map((paragraph, paragraphIndex) => {
            const isFollowAlong = activeParagraphIndex === paragraphIndex;
            return (
              <View
                key={`p-${String(paragraphIndex)}`}
                onLayout={(event) => {
                  paragraphOffsetsRef.current.set(paragraphIndex, event.nativeEvent.layout.y);
                }}
                style={styles.paragraphBlock}
              >
                <Text
                  style={[
                    styles.paragraph,
                    isFollowAlong ? styles.paragraphFollowAlong : null,
                  ]}
                >
                  {paragraph.runs.map((run, runIndex) => {
                    if (run.kind === 'text') {
                      return (
                        <Text key={`t-${String(paragraphIndex)}-${String(runIndex)}`}>
                          {run.text}
                        </Text>
                      );
                    }
                    return (
                      <Text
                        key={`w-${String(paragraphIndex)}-${String(runIndex)}`}
                        onPress={() => {
                          openVocabSheet(run.vocabId);
                        }}
                        style={[
                          styles.wordSurface,
                          isFollowAlong ? styles.paragraphFollowAlong : tierWordColorStyle(run.tier),
                        ]}
                      >
                        {run.surface}
                      </Text>
                    );
                  })}
                </Text>
                {showTranslation && paragraph.translationZh ? (
                  <Text style={styles.paragraphTranslation}>{paragraph.translationZh}</Text>
                ) : null}
              </View>
            );
          })}
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
    flex: 1,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  legendWrap: {
    flex: 1,
    minWidth: 0,
  },
  translationToggle: {
    flexShrink: 0,
    paddingVertical: spacing.xs,
  },
  translationToggleLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  translationToggleLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  body: {
    gap: storyParagraphGap,
  },
  paragraphBlock: {
    gap: spacing.xs,
  },
  paragraph: {
    color: colors.textPrimary,
    fontFamily: storyBodyFontFamily,
    fontSize: storyBodyFontSize,
    lineHeight: storyBodyLineHeight,
  },
  paragraphFollowAlong: {
    color: storyFollowAlongTextColor,
  },
  wordSurface: {
    fontFamily: storyBodyFontFamily,
    fontSize: storyBodyFontSize,
    fontWeight: '600',
    lineHeight: storyBodyLineHeight,
  },
  paragraphTranslation: {
    color: colors.textMuted,
    fontFamily: storyBodyFontFamily,
    fontSize: storyGlossFontSize,
    lineHeight: storyBodyLineHeight,
  },
});
