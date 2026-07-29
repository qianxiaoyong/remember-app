import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { StudySectionHeader } from './study-section-header';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyMnemonicSectionProps {
  content: VocabularyContent;
}

export function StudyMnemonicSection(props: StudyMnemonicSectionProps): ReactElement {
  const mnemonic = props.content.reveal.mnemonic;
  if (!mnemonic) {
    return <></>;
  }

  return (
    <View style={styles.root}>
      <StudySectionHeader title="助记" />
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>联想</Text>
      </View>
      <Text style={styles.text}>{mnemonic.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(109, 112, 232, 0.12)',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
