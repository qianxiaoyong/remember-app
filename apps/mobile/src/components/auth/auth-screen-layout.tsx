import type { ReactElement, ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import logoImage from '../../../assets/images/icon_108x108.png';
import { CircleIconButton } from '../ui/circle-icon-button';
import { BackChevronIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface AuthScreenHeaderProps {
  onBackPress: () => void;
}

export function AuthScreenHeader(props: AuthScreenHeaderProps): ReactElement {
  return (
    <View style={styles.headerRow}>
      <CircleIconButton accessibilityLabel="返回" onPress={props.onBackPress}>
        <BackChevronIcon size="sm" />
      </CircleIconButton>
    </View>
  );
}

interface AuthHeroProps {
  title: string;
  subtitle?: string;
}

export function AuthHero(props: AuthHeroProps): ReactElement {
  return (
    <View style={styles.hero}>
      <Image accessibilityLabel="记得" source={logoImage} style={styles.logo} />
      <Text style={styles.heroTitle}>{props.title}</Text>
      {props.subtitle ? <Text style={styles.heroSubtitle}>{props.subtitle}</Text> : null}
    </View>
  );
}

interface AuthFormCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AuthFormCard(props: AuthFormCardProps): ReactElement {
  return <View style={[styles.formCard, props.style]}>{props.children}</View>;
}

interface AuthScreenLayoutProps {
  children: ReactNode;
  keyboardAvoiding?: boolean;
  scroll?: boolean;
}

export function AuthScreenLayout(props: AuthScreenLayoutProps): ReactElement {
  const body = props.scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {props.children}
    </ScrollView>
  ) : (
    <View style={styles.body}>{props.children}</View>
  );

  if (props.keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  body: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  logo: {
    borderRadius: 16,
    height: 64,
    marginBottom: spacing.sm,
    width: 64,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    padding: spacing.lg,
  },
});
