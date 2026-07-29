import type { ReactElement } from 'react';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATALOG_VERSION_OPTIONS } from '../../catalog/catalog-seed';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { cardShadow } from '../../theme/shadows';

interface MarketVersionDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export function MarketVersionDropdown(props: MarketVersionDropdownProps): ReactElement {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ left: 0, top: 0, width: 0 });

  const setDropdownOpen = (nextOpen: boolean): void => {
    setOpen(nextOpen);
    props.onOpenChange?.(nextOpen);
  };

  const openDropdown = (): void => {
    triggerRef.current?.measureInWindow((left, top, width, height) => {
      setAnchor({
        left,
        top: top + height + spacing.xs,
        width,
      });
      setDropdownOpen(true);
    });
  };

  return (
    <>
      <View collapsable={false} ref={triggerRef} style={styles.container}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (open) {
              setDropdownOpen(false);
              return;
            }
            openDropdown();
          }}
          style={styles.trigger}
        >
          <Text style={styles.triggerLabel}>{props.value}</Text>
          <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
        </Pressable>
      </View>

      <Modal
        animationType="none"
        onRequestClose={() => {
          setDropdownOpen(false);
        }}
        transparent
        visible={open}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setDropdownOpen(false);
          }}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.menu,
            {
              left: anchor.left,
              minWidth: anchor.width,
              top: anchor.top,
            },
          ]}
        >
          {CATALOG_VERSION_OPTIONS.map((option) => {
            const isActive = props.value === option;
            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => {
                  props.onChange(option);
                  setDropdownOpen(false);
                }}
                style={[styles.option, isActive ? styles.optionActive : null]}
              >
                <Text style={[styles.optionLabel, isActive ? styles.optionLabelActive : null]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  triggerLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    position: 'absolute',
    ...cardShadow,
  },
  option: {
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  optionActive: {
    backgroundColor: colors.background,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  optionLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
