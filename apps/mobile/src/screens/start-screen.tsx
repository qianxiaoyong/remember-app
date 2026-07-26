import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function StartScreen(): ReactElement {
  return (
    <View style={styles.page}>
      <Text style={styles.name}>记得</Text>
      <Text style={styles.status}>开发环境</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#171717',
    fontSize: 32,
    fontWeight: '600',
  },
  status: {
    color: '#737373',
    fontSize: 14,
    marginTop: 12,
  },
});
