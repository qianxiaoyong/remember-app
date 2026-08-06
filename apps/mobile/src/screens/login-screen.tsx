import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AuthFormCard,
  AuthHero,
  AuthScreenHeader,
  AuthScreenLayout,
} from '../components/auth/auth-screen-layout';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { PrimaryButton } from '../components/ui/primary-button';
import { ApiRequestError } from '../data/api/api-client';
import { sendSmsCode } from '../use-cases/auth/send-sms-code';
import { verifySmsLogin, schedulePostLoginSync } from '../use-cases/auth/verify-sms-login';
import { isSafeReturnToPath } from '../use-cases/auth-required-error';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function LoginScreen(): ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : undefined;
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    if (phone.trim().length !== 11) {
      Alert.alert('请输入手机号', '请输入 11 位中国大陆手机号');
      return;
    }

    setIsSending(true);
    try {
      const response = await sendSmsCode(phone.trim());
      setCountdown(response.resendAfterSeconds);
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error && error.message.includes('EXPO_PUBLIC_API_BASE_URL')
            ? 'App 未配置服务器地址，请重新安装开发包'
            : error instanceof Error && error.message.toLowerCase().includes('network')
              ? '无法连接服务器。请确认：① 手机与电脑同一 Wi-Fi；② 电脑 API 已启动；③ 已安装最新开发包（HTTP 需允许明文流量）'
              : error instanceof Error && error.message.length > 0
                ? error.message
                : '发送失败，请稍后重试';
      Alert.alert('无法发送验证码', message);
    } finally {
      setIsSending(false);
    }
  }, [phone]);

  const handleLogin = useCallback(async () => {
    if (phone.trim().length !== 11 || code.trim().length !== 6) {
      Alert.alert('请完整填写', '请输入手机号和 6 位验证码');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifySmsLogin(phone.trim(), code.trim());
      schedulePostLoginSync();
      if (returnTo && isSafeReturnToPath(returnTo)) {
        router.replace(returnTo);
      } else {
        router.replace('/library');
      }
    } catch (error) {
      let message = '登录失败，请稍后重试';
      if (error instanceof ApiRequestError) {
        message = error.message;
      } else if (
        error instanceof Error &&
        error.message.length > 0 &&
        !isTechnicalErrorMessage(error.message)
      ) {
        message = error.message;
      }
      Alert.alert('登录失败', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, phone, returnTo, router]);

  return (
    <ScreenScaffold>
      <AuthScreenLayout keyboardAvoiding scroll>
        <AuthScreenHeader
          onBackPress={() => {
            router.back();
          }}
        />
        <AuthHero subtitle="登录后可同步学习进度到云端" title="手机号登录" />
        <AuthFormCard>
          <TextInput
            autoComplete="tel"
            keyboardType="phone-pad"
            maxLength={11}
            onChangeText={setPhone}
            placeholder="手机号"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={phone}
          />
          <View style={styles.codeRow}>
            <TextInput
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={setCode}
              placeholder="验证码"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.codeInput]}
              value={code}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isSending || countdown > 0}
              onPress={() => {
                void handleSendCode();
              }}
              style={[
                styles.codeButton,
                isSending || countdown > 0 ? styles.codeButtonDisabled : null,
              ]}
            >
              {isSending ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text
                  style={[
                    styles.codeButtonText,
                    countdown > 0 ? styles.codeButtonTextDisabled : null,
                  ]}
                >
                  {countdown > 0 ? `${String(countdown)}s` : '获取验证码'}
                </Text>
              )}
            </Pressable>
          </View>
        </AuthFormCard>
        <PrimaryButton
          label="登录"
          loading={isSubmitting}
          onPress={() => {
            void handleLogin();
          }}
        />
      </AuthScreenLayout>
    </ScreenScaffold>
  );
}

function isTechnicalErrorMessage(message: string): boolean {
  return (
    message.startsWith('[') || message.includes('invalid_type') || message.includes('ZodError')
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  codeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  codeInput: {
    flex: 1,
  },
  codeButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 112,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  codeButtonDisabled: {
    backgroundColor: colors.statTileBackground,
  },
  codeButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  codeButtonTextDisabled: {
    color: colors.textMuted,
  },
});
