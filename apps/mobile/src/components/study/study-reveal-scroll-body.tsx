import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { StudyExamplesSection } from './study-examples-section';
import { StudyInflectionSection } from './study-inflection-section';
import { StudyMnemonicSection } from './study-mnemonic-section';
import { StudySectionCard } from './study-section-card';
import { spacing } from '../../theme/spacing';

interface StudyRevealScrollBodyProps {
  content: VocabularyContent;
  highlightSurfaceForm?: string | null;
  onPlayExampleAudio: (relativePath: string) => void;
  onTokenPress: (token: string) => void;
}

export function StudyRevealScrollBody(props: StudyRevealScrollBodyProps): ReactElement {
  return (
    <View style={styles.root}>
      <StudySectionCard>
        <StudyExamplesSection
          content={props.content}
          highlightSurfaceForm={props.highlightSurfaceForm ?? null}
          onPlayExampleAudio={props.onPlayExampleAudio}
          onTokenPress={props.onTokenPress}
        />
      </StudySectionCard>
      {props.content.reveal.mnemonic ? (
        <StudySectionCard>
          <StudyMnemonicSection content={props.content} />
        </StudySectionCard>
      ) : null}
      {props.content.reveal.inflectionNote ? (
        <StudySectionCard>
          <StudyInflectionSection content={props.content} />
        </StudySectionCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
