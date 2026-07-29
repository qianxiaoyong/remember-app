import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { type IconSize, sizeScale } from './shell-icon-scales';

export { FolderTabIcon, HomeTabIcon } from './shell-tab-icons';

interface MenuIconProps {
  color?: string;
  size?: IconSize;
}

export function MenuIcon(props: MenuIconProps): ReactElement {
  const color = props.color ?? colors.textPrimary;
  const scale = sizeScale(props.size ?? 'md');
  return (
    <View
      style={[
        styles.menu,
        {
          gap: scale.menuGap,
          height: scale.headerIconBox,
          justifyContent: 'center',
          width: scale.headerIconBox,
        },
      ]}
    >
      <View
        style={[
          styles.menuLine,
          { backgroundColor: color, height: scale.line, width: scale.menuWidth },
        ]}
      />
      <View
        style={[
          styles.menuLine,
          { backgroundColor: color, height: scale.line, width: scale.menuWidth },
        ]}
      />
      <View
        style={[
          styles.menuLine,
          { backgroundColor: color, height: scale.line, width: scale.menuWidth },
        ]}
      />
    </View>
  );
}

interface SearchIconProps {
  color?: string;
  size?: IconSize;
}

export function BackChevronIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.textPrimary;
  const scale = sizeScale(props.size ?? 'sm');
  return (
    <View
      style={[
        styles.backChevron,
        {
          borderColor: color,
          borderLeftWidth: scale.searchStroke,
          borderBottomWidth: scale.searchStroke,
          height: scale.backChevron,
          width: scale.backChevron,
        },
      ]}
    />
  );
}

export function SpeakerIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.textSecondary;
  const scale = sizeScale(props.size ?? 'sm');
  return (
    <View style={[styles.speakerRoot, { height: scale.speakerHeight, width: scale.speakerWidth }]}>
      <View
        style={{
          borderBottomColor: 'transparent',
          borderBottomWidth: scale.speakerCone / 2,
          borderLeftColor: color,
          borderLeftWidth: scale.speakerCone,
          borderTopColor: 'transparent',
          borderTopWidth: scale.speakerCone / 2,
          height: 0,
          width: 0,
        }}
      />
      <View
        style={{
          borderColor: color,
          borderLeftWidth: 0,
          borderRadius: scale.speakerWave / 2,
          borderWidth: scale.searchStroke,
          height: scale.speakerWave,
          marginLeft: 2,
          width: scale.speakerWave / 2,
        }}
      />
      <View
        style={{
          borderColor: color,
          borderLeftWidth: 0,
          borderRadius: scale.speakerWaveLarge / 2,
          borderWidth: scale.searchStroke,
          height: scale.speakerWaveLarge,
          marginLeft: 1,
          width: scale.speakerWaveLarge / 2,
        }}
      />
    </View>
  );
}

export function PlusIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.textPrimary;
  const scale = sizeScale(props.size ?? 'md');
  return (
    <View
      style={{
        alignItems: 'center',
        height: scale.plusBox,
        justifyContent: 'center',
        width: scale.plusBox,
      }}
    >
      <View
        style={{
          backgroundColor: color,
          borderRadius: 1,
          height: scale.plusStroke,
          position: 'absolute',
          width: scale.plusArm,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: 1,
          height: scale.plusArm,
          position: 'absolute',
          width: scale.plusStroke,
        }}
      />
    </View>
  );
}

export function UploadIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.textPrimary;
  const scale = sizeScale(props.size ?? 'md');
  return (
    <View
      style={{
        alignItems: 'center',
        height: scale.uploadHeight,
        justifyContent: 'flex-end',
        width: scale.uploadWidth,
      }}
    >
      <View
        style={{
          borderBottomColor: color,
          borderLeftColor: 'transparent',
          borderLeftWidth: scale.uploadArrow / 2,
          borderRightColor: 'transparent',
          borderRightWidth: scale.uploadArrow / 2,
          borderBottomWidth: scale.uploadArrow * 0.55,
          height: 0,
          marginBottom: 1,
          width: 0,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: 1,
          height: scale.uploadStem,
          width: scale.uploadStroke,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: 1,
          height: scale.uploadStroke,
          marginTop: 2,
          width: scale.uploadBase,
        }}
      />
    </View>
  );
}

export function MoreVerticalIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.textPrimary;
  const scale = sizeScale(props.size ?? 'sm');
  return (
    <View
      style={{
        alignItems: 'center',
        gap: scale.moreDotGap,
        height: scale.headerIconBox,
        justifyContent: 'center',
        width: scale.headerIconBox,
      }}
    >
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            alignSelf: 'center',
            backgroundColor: color,
            borderRadius: scale.moreDot / 2,
            height: scale.moreDot,
            width: scale.moreDot,
          }}
        />
      ))}
    </View>
  );
}

interface StarIconProps {
  filled: boolean;
  color?: string;
  size?: IconSize;
}

/** 五角星；项目未引入 icon font，星形暂用 Unicode 字符绘制。 */
export function StarIcon(props: StarIconProps): ReactElement {
  const scale = sizeScale(props.size ?? 'md');
  const color = props.color ?? (props.filled ? colors.favoriteStar : colors.textMuted);
  return (
    <Text
      style={{
        color,
        fontSize: scale.star,
        lineHeight: scale.star + 2,
        textAlign: 'center',
        width: scale.star + 4,
      }}
    >
      {props.filled ? '★' : '☆'}
    </Text>
  );
}

export function MusicNoteIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.accent;
  const scale = sizeScale(props.size ?? 'sm');
  return (
    <View style={{ height: scale.musicHeight, width: scale.musicWidth }}>
      <View
        style={[
          styles.musicHead,
          {
            backgroundColor: color,
            borderRadius: scale.musicHead / 2,
            height: scale.musicHead,
            width: scale.musicHead,
          },
        ]}
      />
      <View
        style={[
          styles.musicStem,
          {
            backgroundColor: color,
            height: scale.musicStem,
            left: scale.musicHead - scale.musicStroke,
            top: scale.musicHead / 4,
            width: scale.musicStroke,
          },
        ]}
      />
    </View>
  );
}

export function SearchIcon(props: SearchIconProps): ReactElement {
  const color = props.color ?? colors.textPrimary;
  const scale = sizeScale(props.size ?? 'md');
  return (
    <View style={{ height: scale.searchBox, width: scale.searchBox }}>
      <View
        style={[
          styles.searchRing,
          {
            borderColor: color,
            borderWidth: scale.searchStroke,
            height: scale.searchRing,
            width: scale.searchRing,
            borderRadius: scale.searchRing / 2,
          },
        ]}
      />
      <View
        style={[
          styles.searchHandle,
          {
            backgroundColor: color,
            height: scale.searchStroke,
            top: scale.searchRing - 1,
            width: scale.searchHandle,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {},
  menuLine: {
    borderRadius: 1,
  },
  searchRing: {},
  searchHandle: {
    borderRadius: 1,
    position: 'absolute',
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  backChevron: {
    transform: [{ rotate: '45deg' }],
  },
  speakerRoot: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  musicHead: {},
  musicStem: {
    borderRadius: 1,
    position: 'absolute',
  },
});
