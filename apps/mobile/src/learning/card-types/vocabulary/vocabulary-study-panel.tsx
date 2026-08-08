import type { ReactElement } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { headwordEmphasisSurfaceForms, type VocabularyContent } from '@remember/contracts';
import { StudyHeaderBand } from '../../../components/study/study-header-band';
import { StudyRecallPanel } from '../../../components/study/study-recall-panel';
import { StudyRevealScrollBody } from '../../../components/study/study-reveal-scroll-body';
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
}

export function VocabularyStudyPanel(props: VocabularyStudyPanelProps): ReactElement {
  const emphasisSurfaceForms = headwordEmphasisSurfaceForms(props.content.prompt.headword);

  return (
    <>
      <StudyHeaderBand
        content={props.content}
        {...(props.contextLabel !== undefined ? { contextLabel: props.contextLabel } : {})}
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
            emphasisSurfaceForms={emphasisSurfaceForms}
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
    flexGrow: 1,
  },
});
