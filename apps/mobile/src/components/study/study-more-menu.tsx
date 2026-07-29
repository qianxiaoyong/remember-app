import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { cardShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface StudyMoreMenuItem {
  id: string;
  label: string;
}

interface StudyMoreMenuProps {
  visible: boolean;
  items: StudyMoreMenuItem[];
  anchorTop: number;
  anchorRight: number;
  onClose: () => void;
  onItemPress: (itemId: string) => void;
}

export function StudyMoreMenu(props: StudyMoreMenuProps): ReactElement {
  return (
    <Modal animationType="fade" onRequestClose={props.onClose} transparent visible={props.visible}>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.backdrop} />
        <View
          style={[
            styles.dropdown,
            {
              right: props.anchorRight,
              top: props.anchorTop,
            },
          ]}
        >
          {props.items.map((item, index) => (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => {
                props.onItemPress(item.id);
              }}
              style={[styles.item, index < props.items.length - 1 ? styles.itemBorder : null]}
            >
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.06)',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 220,
    paddingVertical: spacing.xs,
    position: 'absolute',
    ...cardShadow,
  },
  item: {
    justifyContent: 'center',
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.lg,
  },
  itemBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
});
