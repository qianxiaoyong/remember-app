import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LexiconPopup } from '../components/lexicon-popup';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { StudyMoreMenu } from '../components/study/study-more-menu';
import { StudyRatingBar } from '../components/study/study-rating-bar';
import { StudySessionOutcomePanel } from '../components/study/study-session-outcome-panel';
import { PrimaryButton } from '../components/ui/primary-button';
import { useStudyFlow } from '../hooks/use-study-flow';
import { resolveCardTypeDefinition } from '../learning/card-types/registry';
import { UnsupportedCardPanel } from '../learning/card-types/unsupported-card-panel';
import { listInstalledPacksUseCase } from '../use-cases/list-installed-packs';
import {
  resolveStudyPackDisplayName,
  resolveStudySessionOutcome,
} from '../use-cases/resolve-study-session-outcome';
import { navigateShellTab } from '../shell/shell-tab-transition';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface StudyScreenProps {
  packId: string;
  autoStart?: boolean;
}

export function StudyScreen(props: StudyScreenProps): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    session,
    startSession,
    revealed,
    isSubmitting,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm,
    audioMessage,
    cardDetail,
    intervalLabels,
    setRevealed,
    handleReview,
    openLexicon,
    handleToggleSave,
    handlePlayAudio,
    handlePlayPrimaryAudio,
    handlePlayExampleAudio,
    closeLexicon,
  } = useStudyFlow(props.packId);
  const [moreVisible, setMoreVisible] = useState(false);
  const [switchVisible, setSwitchVisible] = useState(false);

  const installedPacks = useMemo(() => listInstalledPacksUseCase(), []);
  const sessionOutcome = useMemo(() => resolveStudySessionOutcome(session), [session]);
  const packDisplayName = useMemo(() => resolveStudyPackDisplayName(props.packId), [props.packId]);
  const cardTypeDefinition = cardDetail ? resolveCardTypeDefinition(cardDetail.cardType) : null;

  useEffect(() => {
    if (props.autoStart !== false && session === null) {
      startSession();
    }
  }, [props.autoStart, props.packId, session, startSession]);

  const moreItems = [
    { id: 'search', label: '搜索当前知识库' },
    { id: 'switch', label: '切换已安装知识库' },
    { id: 'settings', label: '基础学习设置' },
  ];

  const moreMenuAnchorTop = insets.top + spacing.sm + spacing.touchTarget + spacing.xs;
  const moreMenuAnchorRight = spacing.lg;

  const handleMoreItem = (itemId: string): void => {
    setMoreVisible(false);
    if (itemId === 'search') {
      router.push(`/search?packId=${props.packId}`);
      return;
    }
    if (itemId === 'switch') {
      setSwitchVisible(true);
      return;
    }
    if (itemId === 'settings') {
      router.push('/settings');
    }
  };

  const showRatingBar =
    cardTypeDefinition?.reviewMode === 'sm2' && revealed && session?.currentItem && intervalLabels;

  const goHome = (): void => {
    router.replace('/library');
  };

  return (
    <ScreenScaffold
      footer={
        showRatingBar ? (
          <StudyRatingBar disabled={isSubmitting} labels={intervalLabels} onRate={handleReview} />
        ) : null
      }
      safeAreaEdges={['left', 'right']}
    >
      <View style={styles.root}>
        {!session ? (
          <View style={styles.emptyState}>
            <PrimaryButton label="恢复或开始任务" onPress={startSession} />
          </View>
        ) : sessionOutcome ? (
          <StudySessionOutcomePanel
            completedCount={session.completedCount}
            onBrowseMarket={() => {
              navigateShellTab(router, 'market');
            }}
            onGoHome={goHome}
            packDisplayName={packDisplayName}
            variant={sessionOutcome}
          />
        ) : cardDetail ? (
          cardTypeDefinition ? (
            <cardTypeDefinition.Renderer
              content={cardDetail.content}
              knowledgeId={cardDetail.knowledgeId}
              lexiconSelectedSurfaceForm={lexiconSelectedSurfaceForm}
              onHomePress={goHome}
              onMorePress={() => {
                setMoreVisible(true);
              }}
              onPlayExampleAudio={handlePlayExampleAudio}
              onPlayPrimaryAudio={handlePlayPrimaryAudio}
              onTokenPress={openLexicon}
              packId={props.packId}
              revealed={revealed}
              setRevealed={setRevealed}
              sortOrder={cardDetail.sortOrder}
            />
          ) : (
            <UnsupportedCardPanel onGoHome={goHome} />
          )
        ) : null}
      </View>

      <LexiconPopup
        audioMessage={audioMessage}
        entry={lexiconEntry}
        isSaved={lexiconSaved}
        onClose={closeLexicon}
        onPlayAudio={handlePlayAudio}
        onToggleSave={handleToggleSave}
        visible={lexiconVisible}
      />

      <StudyMoreMenu
        anchorRight={moreMenuAnchorRight}
        anchorTop={moreMenuAnchorTop}
        items={moreItems}
        onClose={() => {
          setMoreVisible(false);
        }}
        onItemPress={handleMoreItem}
        visible={moreVisible}
      />

      <StudyMoreMenu
        anchorRight={moreMenuAnchorRight}
        anchorTop={moreMenuAnchorTop}
        items={installedPacks.map((pack) => ({
          id: pack.packId,
          label: pack.displayName,
        }))}
        onClose={() => {
          setSwitchVisible(false);
        }}
        onItemPress={(itemId) => {
          setSwitchVisible(false);
          router.replace(`/study?packId=${itemId}`);
        }}
        visible={switchVisible}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyState: {
    padding: spacing.lg,
  },
});
