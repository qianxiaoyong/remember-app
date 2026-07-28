import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { verifyBundledTestPack } from '../pack/verify-bundled-pack';

type SpikeState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'pass'; detail: string }
  | { status: 'fail'; detail: string };

export function PackSpikeScreen(): ReactElement {
  const [state, setState] = useState<SpikeState>({ status: 'idle' });

  async function runSpike(): Promise<void> {
    setState({ status: 'running' });
    try {
      const summary = await verifyBundledTestPack();
      setState({
        status: 'pass',
        detail: `packId=${summary.packId} cards=${String(summary.cardCount)} lexicon=${String(summary.lexiconCount)} forms=${String(summary.lexiconFormCount)}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState({ status: 'fail', detail: message });
    }
  }

  useEffect(() => {
    void runSpike();
  }, []);

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Pack 协议验收</Text>
      <Text style={styles.status}>状态：{state.status}</Text>
      {'detail' in state && state.detail ? <Text style={styles.detail}>{state.detail}</Text> : null}
      <Pressable onPress={() => void runSpike()} style={styles.button}>
        <Text style={styles.buttonLabel}>重新运行</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#171717',
    fontSize: 24,
    fontWeight: '600',
  },
  status: {
    color: '#404040',
    fontSize: 16,
    marginTop: 16,
  },
  detail: {
    color: '#525252',
    fontSize: 14,
    marginTop: 12,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#171717',
    borderRadius: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
