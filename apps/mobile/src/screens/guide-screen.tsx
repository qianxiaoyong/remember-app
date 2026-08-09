import type { ReactElement } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { guideSections, type GuideSection } from '../content/guide-sections';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function GuideScreen(): ReactElement {
  const router = useRouter();

  return (
    <ScreenScaffold>
      <AppHeader
        onBackPress={() => {
          router.back();
        }}
        variant="back"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>记得攻略</Text>
        <Text style={styles.lead}>快速了解如何安装学习包、学习与复习。</Text>
        {guideSections.map((section) => (
          <GuideSectionBlock key={section.id} section={section} />
        ))}
      </ScrollView>
    </ScreenScaffold>
  );
}

function GuideSectionBlock(props: { section: GuideSection }): ReactElement {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.section.title}</Text>
      {props.section.image ? (
        <Image
          accessibilityLabel={props.section.imageAccessibilityLabel ?? props.section.title}
          resizeMode="contain"
          source={props.section.image}
          style={styles.sectionImage}
        />
      ) : null}
      {props.section.paragraphs.map((paragraph, index) => (
        <Text key={`${props.section.id}-${String(index)}`} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  lead: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionImage: {
    alignSelf: 'center',
    borderRadius: 8,
    height: 180,
    width: '100%',
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
