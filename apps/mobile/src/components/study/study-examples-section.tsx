import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { TokenizedSentence } from '../tokenized-sentence';
import { StudySectionHeader } from './study-section-header';
import { AppIcon } from '../ui/app-icon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyExamplesSectionProps {
  content: VocabularyContent;
  emphasisSurfaceForms?: readonly string[] | null;
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
          const hasAudio = Boolean(exampleAudio);
          return (
            <View key={`${example.en}-${String(index)}`} style={styles.row}>
              <View style={styles.textBlock}>
                <TokenizedSentence
                  emphasisSurfaceForms={props.emphasisSurfaceForms ?? null}
                  highlightSurfaceForm={props.highlightSurfaceForm ?? null}
                  onTokenPress={props.onTokenPress}
                  sentence={example.en}
                />
                <Text style={styles.zh}>{example.zh}</Text>
              </View>
              <Pressable
                accessibilityLabel="播放例句"
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasAudio }}
                disabled={!hasAudio}
                hitSlop={8}
                onPress={() => {
                  if (exampleAudio) {
                    props.onPlayExampleAudio(exampleAudio);
                  }
                }}
                style={styles.speakerButton}
              >
                <AppIcon
                  color={hasAudio ? colors.accent : colors.textMuted}
                  name="volume-high-outline"
                  size="sm"
                />
              </Pressable>
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
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  zh: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  speakerButton: {
    alignItems: 'center',
    height: spacing.touchTarget,
    justifyContent: 'flex-start',
    paddingTop: 2,
    width: spacing.touchTarget,
  },
});
