import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { redeemPackCode } from '../use-cases/redeem-pack-code';
import { isAuthRequiredError } from '../use-cases/auth-required-error';
import { useAuthSession } from '../hooks/use-auth-session';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function RedeemCodeScreen(): ReactElement {
  const router = useRouter();
  const { user } = useAuthSession();
  const [code, setCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const promptLogin = (): void => {
    Alert.alert('需要登录', '兑换知识库需要先登录账号，登录后可继续兑换。', [
      { text: '取消', style: 'cancel' },
      {
        text: '去登录',
        onPress: () => {
          router.push('/login?returnTo=%2Fredeem');
        },
      },
    ]);
  };

  const handleSubmit = (): void => {
    if (!user) {
      promptLogin();
      return;
    }

    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert('请输入兑换码');
      return;
    }

    void (async () => {
      setIsBusy(true);
      try {
        const result = await redeemPackCode(trimmed);
        if (result.alreadyOwned) {
          Alert.alert('已拥有', '您已开通该知识库，可在详情页安装。');
          return;
        }
        Alert.alert('兑换成功', '知识库已开通，可在市场详情页安装。');
        setCode('');
      } catch (error) {
        if (isAuthRequiredError(error)) {
          promptLogin();
          return;
        }
        const message = error instanceof Error ? error.message : '兑换失败';
        Alert.alert('兑换失败', message);
      } finally {
        setIsBusy(false);
      }
    })();
  };

  return (
    <ScreenScaffold>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.backLabel}>关闭</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>兑换码</Text>
          <Text style={styles.subtitle}>输入兑换码开通知识库使用权</Text>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isBusy}
            onChangeText={setCode}
            placeholder="请输入兑换码"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={code}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={handleSubmit}
            style={[styles.submitButton, isBusy ? styles.submitButtonDisabled : null]}
          >
            {isBusy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.submitLabel}>确认兑换</Text>
            )}
          </Pressable>
          {!user ? <Text style={styles.loginHint}>兑换前需先登录账号</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backLabel: {
    color: colors.accent,
    fontSize: 15,
  },
  body: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  loginHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
