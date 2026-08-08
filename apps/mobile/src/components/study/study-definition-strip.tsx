import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { VocabularyContent } from '@remember/contracts';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyDefinitionStripProps {
  content: VocabularyContent;
}

export function StudyDefinitionStrip(props: StudyDefinitionStripProps): ReactElement {
  return (
    <View style={styles.root}>
      {props.content.reveal.definitions.map((definition, index) => (
        <Text key={`${definition.text}-${String(index)}`} style={styles.definition}>
          {definition.pos ? `[${definition.pos}] ` : ''}
          {definition.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    gap: 2,
    paddingTop: spacing.xs,
  },
  definition: {
    color: colors.surface,
    fontSize: 15,
    lineHeight: 20,
  },
});
