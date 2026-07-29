import type { ReactElement } from 'react';
import { Text, View } from 'react-native';
import { studySectionStyles } from './study-section-styles';

interface StudySectionHeaderProps {
  title: string;
}

export function StudySectionHeader(props: StudySectionHeaderProps): ReactElement {
  return (
    <View>
      <Text style={studySectionStyles.title}>{props.title}</Text>
      <View style={studySectionStyles.titleDivider} />
    </View>
  );
}
