import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StoryReadingContent } from '@remember/contracts';
import { useStoryAudioPlayer } from '../../../hooks/use-story-audio-player';
import { HeaderIconButton } from '../../../components/ui/header-icon-button';
import { AppIcon } from '../../../components/ui/app-icon';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { listStoryLessonSummaries } from '../../../use-cases/resolve-story-reader-entry';
import { recordStoryCompleted } from '../../../use-cases/record-story-completed';
import { resolvePackAssetUri } from '../../../use-cases/resolve-pack-asset-uri';
import { countSidebarWords } from './count-tier-stats';
import { canJumpParagraph, resolveParagraphJumpMs } from './story-follow-along';
import { StoryAudioBar } from './story-audio-bar';
import { StoryLessonTabs, type StoryLessonTabId } from './story-lesson-tabs';
import { cycleStoryLoopMode, resolveLoopSeekMs, type StoryLoopMode } from './story-loop-mode';
import { cycleStoryPlaybackRate, type StoryPlaybackRate } from './story-playback-rate';
import { StoryReadTab } from './story-read-tab';
import { StoryVocabTab } from './story-vocab-tab';

export interface StoryLessonShellProps {
  packId: string;
  knowledgeId: string;
  content: StoryReadingContent;
  initialAudioPositionMs?: number;
  onHomePress: () => void;
  onMorePress: () => void;
  onReaderBookmark?: (positionMs: number) => void;
  onNavigateLesson?: (knowledgeId: string) => void;
  /** 限定上一篇/下一篇范围（如日历检查队列） */
  lessonNavigationIds?: string[];
}

const BOOKMARK_DEBOUNCE_MS = 5000;

export function StoryLessonShell(props: StoryLessonShellProps): ReactElement {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StoryLessonTabId>('read');
  const [loopMode, setLoopMode] = useState<StoryLoopMode>('none');
  const [playbackRate, setPlaybackRate] = useState<StoryPlaybackRate>(1);
  const wordCount = countSidebarWords(props.content);
  const toolbarTop = insets.top + spacing.xs;
  const audioUri = resolvePackAssetUri(props.packId, props.content.lesson.primaryAudio);
  const loopModeRef = useRef(loopMode);
  loopModeRef.current = loopMode;
  const playbackPositionRef = useRef(0);
  const playbackDurationRef = useRef(0);

  const handleNaturalPlaybackFinished = useCallback((): void => {
    if (loopModeRef.current !== 'none') {
      return;
    }
    recordStoryCompleted({
      catalogPackId: props.packId,
      knowledgeId: props.knowledgeId,
      titleZh: props.content.lesson.titleZh,
      positionMs: playbackPositionRef.current,
      durationMs: playbackDurationRef.current,
    });
  }, [props.content.lesson.titleZh, props.knowledgeId, props.packId]);

  const audioPlayer = useStoryAudioPlayer({
    uri: audioUri,
    isActive: activeTab === 'read',
    playbackRate,
    onNaturalPlaybackFinished: handleNaturalPlaybackFinished,
    ...(props.initialAudioPositionMs !== undefined
      ? { initialPositionMs: props.initialAudioPositionMs }
      : {}),
  });
  playbackPositionRef.current = audioPlayer.positionMs;
  playbackDurationRef.current = audioPlayer.durationMs;
  const bookmarkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopHandledRef = useRef(false);
  const lessons = useMemo(() => {
    if (props.lessonNavigationIds && props.lessonNavigationIds.length > 0) {
      return props.lessonNavigationIds.map((knowledgeId) => ({ knowledgeId }));
    }
    return listStoryLessonSummaries(props.packId);
  }, [props.lessonNavigationIds, props.packId]);

  const adjacentLessonIds = useMemo(() => {
    if (lessons.length === 0) {
      return { previous: null, next: null };
    }
    const currentIndex = lessons.findIndex((lesson) => lesson.knowledgeId === props.knowledgeId);
    if (currentIndex < 0) {
      return { previous: null, next: null };
    }
    const restrictToList = Boolean(props.lessonNavigationIds && props.lessonNavigationIds.length > 0);
    if (restrictToList) {
      return {
        previous: currentIndex > 0 ? (lessons[currentIndex - 1]?.knowledgeId ?? null) : null,
        next:
          currentIndex < lessons.length - 1
            ? (lessons[currentIndex + 1]?.knowledgeId ?? null)
            : null,
      };
    }
    const previous =
      lessons[(currentIndex - 1 + lessons.length) % lessons.length]?.knowledgeId ?? null;
    const next = lessons[(currentIndex + 1) % lessons.length]?.knowledgeId ?? null;
    return { previous, next };
  }, [lessons, props.knowledgeId, props.lessonNavigationIds]);

  useEffect(() => {
    setActiveTab('read');
    setLoopMode('none');
    loopHandledRef.current = false;
  }, [props.knowledgeId]);

  const paragraphs = props.content.story.paragraphs;

  useEffect(() => {
    if (loopMode === 'none') {
      loopHandledRef.current = false;
      return;
    }

    const seekTo = resolveLoopSeekMs({
      mode: loopMode,
      positionMs: audioPlayer.positionMs,
      durationMs: audioPlayer.durationMs,
      paragraphs,
    });

    if (seekTo === null) {
      loopHandledRef.current = false;
      return;
    }

    if (loopHandledRef.current) {
      return;
    }

    loopHandledRef.current = true;
    audioPlayer.seek(seekTo);
    audioPlayer.play();
  }, [
    audioPlayer.durationMs,
    audioPlayer.play,
    audioPlayer.playing,
    audioPlayer.positionMs,
    audioPlayer.seek,
    loopMode,
    paragraphs,
  ]);

  useEffect(() => {
    if (!props.onReaderBookmark) {
      return;
    }
    if (bookmarkTimerRef.current) {
      clearTimeout(bookmarkTimerRef.current);
    }
    bookmarkTimerRef.current = setTimeout(() => {
      props.onReaderBookmark?.(audioPlayer.positionMs);
    }, BOOKMARK_DEBOUNCE_MS);
    return () => {
      if (bookmarkTimerRef.current) {
        clearTimeout(bookmarkTimerRef.current);
      }
    };
  }, [audioPlayer.positionMs, props.onReaderBookmark]);

  const navigateLesson = (knowledgeId: string | null): void => {
    if (!knowledgeId || knowledgeId === props.knowledgeId) {
      return;
    }
    props.onNavigateLesson?.(knowledgeId);
  };

  const canPreviousParagraph = canJumpParagraph(paragraphs, audioPlayer.positionMs, 'prev');
  const canNextParagraph = canJumpParagraph(paragraphs, audioPlayer.positionMs, 'next');

  const jumpParagraph = (direction: 'prev' | 'next'): void => {
    const targetMs = resolveParagraphJumpMs(paragraphs, audioPlayer.positionMs, direction);
    if (targetMs === null) {
      return;
    }
    audioPlayer.seek(targetMs);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.toolbar, { paddingTop: toolbarTop }]}>
        <HeaderIconButton
          accessibilityLabel="返回书库"
          onPress={() => {
            props.onReaderBookmark?.(audioPlayer.positionMs);
            props.onHomePress();
          }}
        >
          <AppIcon color={colors.textPrimary} name="chevron-back" size="sm" />
        </HeaderIconButton>

        <View pointerEvents="box-none" style={[styles.tabsOverlay, { top: toolbarTop }]}>
          <StoryLessonTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="toolbar"
            vocabCount={wordCount}
          />
        </View>

        <HeaderIconButton accessibilityLabel="更多" onPress={props.onMorePress}>
          <AppIcon color={colors.textPrimary} name="ellipsis-vertical" size="sm" />
        </HeaderIconButton>
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'read' ? (
          <StoryReadTab
            content={props.content}
            knowledgeId={props.knowledgeId}
            packId={props.packId}
            playing={audioPlayer.playing}
            positionMs={audioPlayer.positionMs}
          />
        ) : null}
        {activeTab === 'vocab' ? (
          <StoryVocabTab content={props.content} packId={props.packId} />
        ) : null}
      </View>

      {activeTab === 'read' ? (
        <View style={{ paddingBottom: Math.max(insets.bottom, spacing.sm) }}>
          <StoryAudioBar
            canNextParagraph={canNextParagraph}
            canPreviousParagraph={canPreviousParagraph}
            disabled={!audioPlayer.isReady}
            durationMs={audioPlayer.durationMs}
            loopMode={loopMode}
            playbackRate={playbackRate}
            onCycleLoopMode={() => {
              setLoopMode((current) => cycleStoryLoopMode(current));
            }}
            onCyclePlaybackRate={() => {
              setPlaybackRate((current) => cycleStoryPlaybackRate(current));
            }}
            onNextLesson={() => {
              navigateLesson(adjacentLessonIds.next);
            }}
            onNextParagraph={() => {
              jumpParagraph('next');
            }}
            onPause={audioPlayer.pause}
            onPlay={audioPlayer.play}
            onPreviousLesson={() => {
              navigateLesson(adjacentLessonIds.previous);
            }}
            onPreviousParagraph={() => {
              jumpParagraph('prev');
            }}
            onSeek={audioPlayer.seek}
            playing={audioPlayer.playing}
            positionMs={audioPlayer.positionMs}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: spacing.touchTarget,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    position: 'relative',
  },
  tabsOverlay: {
    alignItems: 'center',
    bottom: spacing.sm,
    justifyContent: 'center',
    left: spacing.xs + spacing.touchTarget,
    position: 'absolute',
    right: spacing.sm + spacing.touchTarget,
    zIndex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
