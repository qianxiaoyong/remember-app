import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';
import { installBundledTestPack } from '../use-cases/install-bundled-test-pack';
import { listInstalledPacksUseCase } from '../use-cases/list-installed-packs';

export function StartScreen(): ReactElement {
  const [installedPacks, setInstalledPacks] = useState<InstalledPackRow[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshInstalledPacks = useCallback(() => {
    setInstalledPacks(listInstalledPacksUseCase());
  }, []);

  useEffect(() => {
    refreshInstalledPacks();
  }, [refreshInstalledPacks]);

  const handleInstallTestPack = async (): Promise<void> => {
    setIsInstalling(true);
    setMessage(null);
    try {
      const installed = await installBundledTestPack();
      refreshInstalledPacks();
      setMessage(`已安装 ${installed.packId} @ ${installed.packVersion}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : '安装失败';
      setMessage(detail);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.name}>记得</Text>
      <Text style={styles.status}>阶段 4 · 包安装验收</Text>

      <Pressable
        accessibilityRole="button"
        disabled={isInstalling}
        onPress={() => {
          void handleInstallTestPack();
        }}
        style={[styles.button, isInstalling ? styles.buttonDisabled : null]}
      >
        {isInstalling ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonLabel}>安装测试包</Text>
        )}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.sectionTitle}>installed_packs</Text>
      {installedPacks.length === 0 ? (
        <Text style={styles.empty}>暂无已安装知识库</Text>
      ) : (
        installedPacks.map((pack) => (
          <View key={pack.packId} style={styles.packRow}>
            <Text style={styles.packName}>{pack.displayName}</Text>
            <Text style={styles.packMeta}>
              {pack.packVersion} · {pack.installStatus}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  name: {
    color: '#171717',
    fontSize: 32,
    fontWeight: '600',
  },
  status: {
    color: '#737373',
    fontSize: 14,
    marginBottom: 24,
    marginTop: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: '#404040',
    fontSize: 14,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#171717',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 32,
  },
  empty: {
    color: '#737373',
    fontSize: 14,
  },
  packRow: {
    borderColor: '#E5E5E5',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  packName: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '600',
  },
  packMeta: {
    color: '#737373',
    fontSize: 13,
    marginTop: 4,
  },
});
