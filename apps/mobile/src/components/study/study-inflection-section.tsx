import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { StudySectionHeader } from './study-section-header';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyInflectionSectionProps {
  content: VocabularyContent;
}

export function StudyInflectionSection(props: StudyInflectionSectionProps): ReactElement {
  const note = props.content.reveal.inflectionNote;
  if (!note) {
    return <></>;
  }

  return (
    <View style={styles.root}>
      <StudySectionHeader title="词形变化" />
      <Text style={styles.text}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
