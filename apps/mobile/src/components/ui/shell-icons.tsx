import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type IconSize = 'sm' | 'md' | 'lg';

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
      <View style={[styles.menuLine, { backgroundColor: color, height: scale.line, width: scale.menuWidth }]} />
      <View style={[styles.menuLine, { backgroundColor: color, height: scale.line, width: scale.menuWidth }]} />
      <View style={[styles.menuLine, { backgroundColor: color, height: scale.line, width: scale.menuWidth }]} />
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

interface HomeTabIconProps {
  active: boolean;
  size?: IconSize;
  color?: string;
}

export function HomeTabIcon(props: HomeTabIconProps): ReactElement {
  const scale = sizeScale(props.size ?? 'lg');
  const color = props.color ?? (props.active ? colors.textPrimary : colors.tabInactive);
  return (
    <View style={[styles.home, { height: scale.tabHeight, width: scale.tabWidth }]}>
      <View
        style={[
          styles.homeRoof,
          {
            borderBottomColor: color,
            borderLeftWidth: scale.homeRoof / 2,
            borderRightWidth: scale.homeRoof / 2,
            borderBottomWidth: scale.homeRoof * 0.45,
          },
        ]}
      />
      <View
        style={[
          styles.homeBody,
          {
            height: scale.homeBodyH,
            width: scale.homeBodyW,
            marginTop: 1,
          },
          props.active
            ? { backgroundColor: color }
            : { borderColor: color, borderWidth: scale.homeStroke, backgroundColor: 'transparent' },
        ]}
      />
    </View>
  );
}

interface FolderTabIconProps {
  active: boolean;
}

export function FolderTabIcon(props: FolderTabIconProps): ReactElement {
  const color = props.active ? colors.textPrimary : colors.tabInactive;
  const scale = sizeScale('lg');
  return (
    <View style={[styles.folder, { height: scale.tabHeight, width: scale.tabWidth }]}>
      <View
        style={[
          styles.folderTab,
          {
            backgroundColor: color,
            height: scale.folderTabH,
            marginLeft: 2,
            width: scale.folderTabW,
            opacity: props.active ? 1 : 0.85,
          },
        ]}
      />
      <View
        style={[
          styles.folderBody,
          {
            height: scale.folderBodyH,
            width: scale.tabWidth,
          },
          props.active
            ? { backgroundColor: color }
            : { borderColor: color, borderWidth: 1.5, backgroundColor: 'transparent' },
        ]}
      />
    </View>
  );
}

function sizeScale(size: IconSize) {
  if (size === 'sm') {
    return {
      headerIconBox: 14,
      uploadWidth: 14,
      uploadHeight: 14,
      uploadArrow: 8,
      uploadStem: 5,
      uploadBase: 11,
      uploadStroke: 1.6,
      plusBox: 14,
      plusArm: 10,
      plusStroke: 1.8,
      menuWidth: 13,
      menuGap: 2.5,
      line: 1.5,
      searchBox: 14,
      searchRing: 9,
      searchStroke: 1.4,
      searchHandle: 4.5,
      backChevron: 8,
      moreDot: 3,
      moreDotGap: 2.5,
      moreHeight: 14,
      speakerWidth: 18,
      speakerHeight: 12,
      speakerCone: 6,
      speakerWave: 6,
      speakerWaveLarge: 9,
      musicWidth: 10,
      musicHeight: 12,
      musicHead: 5,
      musicStem: 9,
      musicStroke: 1.4,
      tabWidth: 14,
      tabHeight: 14,
      homeRoof: 11,
      homeBodyW: 8,
      homeBodyH: 5,
      homeStroke: 1.2,
      folderTabW: 9,
      folderTabH: 4,
      folderBodyH: 12,
      star: 22,
    };
  }
  if (size === 'lg') {
    return {
      headerIconBox: 18,
      uploadWidth: 18,
      uploadHeight: 18,
      uploadArrow: 10,
      uploadStem: 6,
      uploadBase: 14,
      uploadStroke: 2,
      plusBox: 18,
      plusArm: 13,
      plusStroke: 2.2,
      menuWidth: 18,
      menuGap: 4,
      line: 2,
      searchBox: 20,
      searchRing: 13,
      searchStroke: 1.8,
      searchHandle: 6,
      backChevron: 10,
      moreDot: 3.5,
      moreDotGap: 3,
      moreHeight: 16,
      speakerWidth: 20,
      speakerHeight: 14,
      speakerCone: 7,
      speakerWave: 7,
      speakerWaveLarge: 10,
      musicWidth: 12,
      musicHeight: 14,
      musicHead: 6,
      musicStem: 10,
      musicStroke: 1.6,
      tabWidth: 28,
      tabHeight: 28,
      homeRoof: 24,
      homeBodyW: 18,
      homeBodyH: 11,
      folderTabW: 12,
      folderTabH: 5,
      folderBodyH: 16,
      star: 28,
      homeStroke: 1.5,
    };
  }
  return {
    headerIconBox: 16,
    uploadWidth: 16,
    uploadHeight: 16,
    uploadArrow: 9,
    uploadStem: 5,
    uploadBase: 12,
    uploadStroke: 1.8,
    plusBox: 16,
    plusArm: 11,
    plusStroke: 2,
    menuWidth: 15,
    menuGap: 3,
    line: 1.6,
    searchBox: 16,
    searchRing: 10,
    searchStroke: 1.5,
    searchHandle: 5,
    backChevron: 9,
    moreDot: 3,
    moreDotGap: 2.8,
    moreHeight: 15,
    speakerWidth: 19,
    speakerHeight: 13,
    speakerCone: 6.5,
    speakerWave: 6.5,
    speakerWaveLarge: 9.5,
    musicWidth: 11,
    musicHeight: 13,
    musicHead: 5.5,
    musicStem: 9.5,
    musicStroke: 1.5,
    tabWidth: 22,
    tabHeight: 22,
    homeRoof: 20,
    homeBodyW: 15,
    homeBodyH: 9,
    folderTabW: 10,
    folderTabH: 4,
    folderBodyH: 13,
    star: 24,
    homeStroke: 1.4,
  };
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
  home: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    height: 0,
    width: 0,
  },
  homeBody: {
    borderRadius: 2,
  },
  folder: {
    justifyContent: 'flex-end',
  },
  folderTab: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  folderBody: {
    borderRadius: 3,
  },
});
