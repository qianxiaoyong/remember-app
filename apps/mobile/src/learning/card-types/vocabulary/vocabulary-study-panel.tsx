import type { ReactElement } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { StudyHeaderBand } from '../../../components/study/study-header-band';
import { StudyRecallPanel } from '../../../components/study/study-recall-panel';
import { StudyRevealScrollBody } from '../../../components/study/study-reveal-scroll-body';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export interface VocabularyStudyPanelProps {
  content: VocabularyContent;
  revealed: boolean;
  lexiconSelectedSurfaceForm: string | null;
  onHomePress: () => void;
  onMorePress: () => void;
  onPlayPrimaryAudio: () => void;
  onPlayExampleAudio: (relativePath: string) => void;
  onTokenPress: (token: string) => void;
  onReveal: () => void;
}

export function VocabularyStudyPanel(props: VocabularyStudyPanelProps): ReactElement {
  return (
    <>
      <StudyHeaderBand
        content={props.content}
        onHomePress={props.onHomePress}
        onMorePress={props.onMorePress}
        onPlayAudio={props.onPlayPrimaryAudio}
        revealed={props.revealed}
      />
      {props.revealed ? (
        <ScrollView
          contentContainerStyle={styles.revealContent}
          showsVerticalScrollIndicator={false}
          style={styles.revealScroll}
        >
          <StudyRevealScrollBody
            content={props.content}
            highlightSurfaceForm={props.lexiconSelectedSurfaceForm}
            onPlayExampleAudio={props.onPlayExampleAudio}
            onTokenPress={props.onTokenPress}
          />
        </ScrollView>
      ) : (
        <StudyRecallPanel onReveal={props.onReveal} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  revealScroll: {
    backgroundColor: colors.background,
    flex: 1,
  },
  revealContent: {
    paddingBottom: spacing.lg,
  },
});
