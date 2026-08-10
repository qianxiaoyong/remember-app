import type { ReactElement } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { headwordEmphasisSurfaceForms, type VocabularyContent } from '@remember/contracts';
import { StudyHeaderBand } from '../../../components/study/study-header-band';
import { StudyRecallPanel } from '../../../components/study/study-recall-panel';
import { StudyRevealScrollBody } from '../../../components/study/study-reveal-scroll-body';
import {
  InspectModeNavFloating,
  useInspectPanResponder,
  type InspectModeChromeProps,
} from '../../../components/calendar/inspect-mode-chrome';
import { colors } from '../../../theme/colors';

export interface VocabularyStudyPanelProps {
  content: VocabularyContent;
  contextLabel?: string;
  revealed: boolean;
  lexiconSelectedSurfaceForm: string | null;
  onHomePress: () => void;
  onMorePress: () => void;
  onPlayPrimaryAudio: () => void;
  onPlayExampleAudio: (relativePath: string) => void;
  onTokenPress: (token: string) => void;
  onReveal: () => void;
  primaryAudioPlaying?: boolean;
  playingExampleAudioPath?: string | null;
  /** 家长检查：贴边导航 + 横滑切词 */
  inspectNav?: InspectModeChromeProps | null;
}

export function VocabularyStudyPanel(props: VocabularyStudyPanelProps): ReactElement {
  const emphasisSurfaceForms = headwordEmphasisSurfaceForms(props.content.prompt.headword);
  const inspectPanHandlers = useInspectPanResponder(props.inspectNav);
  const [navAnchorY, setNavAnchorY] = useState<number | null>(null);
  const rootRef = useRef<View>(null);
  const bodyRef = useRef<View>(null);
  const lockedNavAnchorYRef = useRef<number | null>(null);
  const revealedRef = useRef(props.revealed);
  revealedRef.current = props.revealed;

  const captureRecallNavAnchor = useCallback(() => {
    if (
      !props.inspectNav ||
      revealedRef.current ||
      lockedNavAnchorYRef.current !== null ||
      !rootRef.current ||
      !bodyRef.current
    ) {
      return;
    }

    requestAnimationFrame(() => {
      if (
        !props.inspectNav ||
        revealedRef.current ||
        lockedNavAnchorYRef.current !== null ||
        !rootRef.current ||
        !bodyRef.current
      ) {
        return;
      }

      bodyRef.current.measureInWindow((...layout: number[]) => {
        if (revealedRef.current || lockedNavAnchorYRef.current !== null || !rootRef.current) {
          return;
        }

        const bodyWindowY = layout[1] ?? 0;
        const bodyHeight = layout[3] ?? 0;

        rootRef.current.measureInWindow((_rootX, rootWindowY) => {
          if (revealedRef.current || lockedNavAnchorYRef.current !== null) {
            return;
          }

          const anchorCenterY = bodyWindowY + bodyHeight / 2 - rootWindowY;
          lockedNavAnchorYRef.current = anchorCenterY;
          setNavAnchorY(anchorCenterY);
        });
      });
    });
  }, [props.inspectNav]);

  useLayoutEffect(() => {
    captureRecallNavAnchor();
  }, [captureRecallNavAnchor, props.revealed, props.content.prompt.headword, props.inspectNav?.index]);

  const handleRootLayout = useCallback(() => {
    captureRecallNavAnchor();
  }, [captureRecallNavAnchor]);

  const handleBodyLayout = useCallback(() => {
    captureRecallNavAnchor();
  }, [captureRecallNavAnchor]);

  const showInspectNav = Boolean(props.inspectNav && props.inspectNav.total > 1);

  return (
    <View ref={rootRef} onLayout={handleRootLayout} style={styles.root}>
      <StudyHeaderBand
        content={props.content}
        {...(props.contextLabel !== undefined ? { contextLabel: props.contextLabel } : {})}
        onHomePress={props.onHomePress}
        onMorePress={props.onMorePress}
        onPlayAudio={props.onPlayPrimaryAudio}
        primaryAudioPlaying={props.primaryAudioPlaying ?? false}
        revealed={props.revealed}
      />
      <View ref={bodyRef} style={styles.body} onLayout={handleBodyLayout} {...inspectPanHandlers}>
        {props.revealed ? (
          <ScrollView
            contentContainerStyle={styles.revealContent}
            showsVerticalScrollIndicator={false}
            style={styles.revealScroll}
          >
            <StudyRevealScrollBody
              content={props.content}
              emphasisSurfaceForms={emphasisSurfaceForms}
              highlightSurfaceForm={props.lexiconSelectedSurfaceForm}
              onPlayExampleAudio={props.onPlayExampleAudio}
              onTokenPress={props.onTokenPress}
              playingExampleAudioPath={props.playingExampleAudioPath ?? null}
            />
          </ScrollView>
        ) : (
          <StudyRecallPanel onReveal={props.onReveal} />
        )}
      </View>
      {showInspectNav && navAnchorY !== null && props.inspectNav ? (
        <InspectModeNavFloating {...props.inspectNav} anchorCenterY={navAnchorY} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  revealScroll: {
    backgroundColor: colors.background,
    flex: 1,
  },
  revealContent: {
    flexGrow: 1,
  },
});
