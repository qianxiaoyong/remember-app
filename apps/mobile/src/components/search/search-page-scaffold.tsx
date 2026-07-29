import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface SearchPageScaffoldProps {
  children: ReactNode;
  topBar: ReactNode;
}

export function SearchPageScaffold(props: SearchPageScaffoldProps): ReactElement {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
        {props.topBar}
        <View style={styles.content}>{props.children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
