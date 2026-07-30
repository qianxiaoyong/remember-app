import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { resolveInitialRoutePath } from '../src/use-cases/resolve-initial-route-path';
import { colors } from '../src/theme/colors';

export default function Index(): ReactElement {
  const [routePath, setRoutePath] = useState<string | null>(null);

  useEffect(() => {
    void resolveInitialRoutePath()
      .then(setRoutePath)
      .catch(() => {
        setRoutePath('/library');
      });
  }, []);

  if (!routePath) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return <Redirect href={routePath} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
