import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export function StartScreen(): ReactElement {
  return (
    <View style={styles.page}>
      <Text style={styles.name}>记得</Text>
      <Text style={styles.status}>开发环境</Text>
      <Link href="/pack-spike" asChild>
        <Pressable style={styles.spikeButton}>
          <Text style={styles.spikeLabel}>Pack 协议验收（阶段 3）</Text>
        </Pressable>
      </Link>
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
  spikeButton: {
    borderColor: '#D4D4D4',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  spikeLabel: {
    color: '#404040',
    fontSize: 14,
  },
});
