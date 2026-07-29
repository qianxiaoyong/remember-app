import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { TokenizedSentence } from '../tokenized-sentence';
import { StudySectionHeader } from './study-section-header';
import { SpeakerIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyExamplesSectionProps {
  content: VocabularyContent;
  highlightSurfaceForm?: string | null;
  onPlayExampleAudio: (relativePath: string) => void;
  onTokenPress: (token: string) => void;
}

export function StudyExamplesSection(props: StudyExamplesSectionProps): ReactElement {
  return (
    <View style={styles.root}>
      <StudySectionHeader title="例句" />
      <View style={styles.list}>
        {props.content.reveal.examples.map((example, index) => {
          const exampleAudio = example.audio;
          return (
            <View key={`${example.en}-${String(index)}`} style={styles.row}>
              <View style={styles.textBlock}>
                <TokenizedSentence
                  highlightSurfaceForm={props.highlightSurfaceForm ?? null}
                  onTokenPress={props.onTokenPress}
                  sentence={example.en}
                />
                <Text style={styles.zh}>{example.zh}</Text>
              </View>
              {exampleAudio ? (
                <Pressable
                  accessibilityLabel="播放例句"
                  hitSlop={8}
                  onPress={() => {
                    props.onPlayExampleAudio(exampleAudio);
                  }}
                  style={styles.audioButton}
                >
                  <SpeakerIcon color={colors.accent} size="sm" />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  zh: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  audioButton: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'center',
    width: spacing.touchTarget,
  },
});
