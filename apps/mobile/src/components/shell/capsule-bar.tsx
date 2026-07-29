import type { ReactElement } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniNotice } from '../ui/mini-notice';
import { FolderTabIcon, HomeTabIcon, PlusIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { capsuleShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

export type CapsuleTab = 'library' | 'market';

interface CapsuleBarProps {
  activeTab: CapsuleTab;
  onTabPress: (tab: CapsuleTab) => void;
}

export function CapsuleBar(props: CapsuleBarProps): ReactElement {
  const insets = useSafeAreaInsets();
  const [uploadNoticeVisible, setUploadNoticeVisible] = useState(false);

  return (
    <>
      <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + spacing.md }]}>
        <View style={styles.capsule}>
          <TabItem
            isActive={props.activeTab === 'library'}
            label="首页"
            onPress={() => {
              props.onTabPress('library');
            }}
            renderIcon={(active) => <HomeTabIcon active={active} />}
          />
          <UploadTabButton
            onPress={() => {
              setUploadNoticeVisible(true);
            }}
          />
          <TabItem
            isActive={props.activeTab === 'market'}
            label="资料"
            onPress={() => {
              props.onTabPress('market');
            }}
            renderIcon={(active) => <FolderTabIcon active={active} />}
          />
        </View>
      </View>
      <MiniNotice
        message="功能开发中……"
        onClose={() => {
          setUploadNoticeVisible(false);
        }}
        visible={uploadNoticeVisible}
      />
    </>
  );
}

function TabItem(props: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  renderIcon: (active: boolean) => ReactElement;
}): ReactElement {
  const tone = props.isActive ? colors.textPrimary : colors.tabInactive;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: props.isActive }}
      onPress={props.onPress}
      style={styles.item}
    >
      {props.renderIcon(props.isActive)}
      <Text style={[styles.itemLabel, { color: tone }]}>{props.label}</Text>
    </Pressable>
  );
}

function UploadTabButton(props: { onPress: () => void }): ReactElement {
  return (
    <Pressable
      accessibilityLabel="上传"
      accessibilityRole="button"
      onPress={props.onPress}
      style={styles.uploadItem}
    >
      <View style={styles.uploadCircle}>
        <PlusIcon color={colors.surface} size="lg" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  capsule: {
    alignItems: 'flex-end',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.05)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...capsuleShadow,
  },
  item: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'flex-end',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    width: 64,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  uploadItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -18,
    width: 56,
  },
  uploadCircle: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
    ...capsuleShadow,
  },
});
