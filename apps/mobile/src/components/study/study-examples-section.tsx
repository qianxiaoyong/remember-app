import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { TokenizedSentence } from '../tokenized-sentence';
import { StudySectionHeader } from './study-section-header';
import { CircleIconButton } from '../ui/circle-icon-button';
import { AppIcon } from '../ui/app-icon';
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
                <CircleIconButton
                  accessibilityLabel="播放例句"
                  onPress={() => {
                    props.onPlayExampleAudio(exampleAudio);
                  }}
                >
                  <AppIcon color={colors.accent} name="volume-high-outline" size="sm" />
                </CircleIconButton>
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
});
