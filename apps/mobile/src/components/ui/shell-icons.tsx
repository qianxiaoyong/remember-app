import type { ReactElement } from 'react';
import { View } from 'react-native';
import { AppIcon } from './app-icon';
import { colors } from '../../theme/colors';
import { type IconSize, sizeScale } from './shell-icon-scales';

export {
  StudyTabIcon,
  ProfileTabIcon,
  RecordTabIcon,
  ReviewTabIcon,
} from './shell-tab-icons';

interface ShellIconProps {
  color?: string;
  size?: IconSize;
}

export function MenuIcon(props: ShellIconProps): ReactElement {
  return (
    <View
      style={{
        alignItems: 'center',
        height: sizeScale(props.size ?? 'md').headerIconBox,
        justifyContent: 'center',
        width: sizeScale(props.size ?? 'md').headerIconBox,
      }}
    >
      <AppIcon color={props.color ?? colors.textPrimary} name="menu" size={props.size ?? 'md'} />
    </View>
  );
}

export function SearchIcon(props: ShellIconProps): ReactElement {
  return (
    <View
      style={{
        alignItems: 'center',
        height: sizeScale(props.size ?? 'md').headerIconBox,
        justifyContent: 'center',
        width: sizeScale(props.size ?? 'md').headerIconBox,
      }}
    >
      <AppIcon color={props.color ?? colors.textPrimary} name="search" size={props.size ?? 'md'} />
    </View>
  );
}

export function BackChevronIcon(props: ShellIconProps): ReactElement {
  return (
    <AppIcon
      color={props.color ?? colors.textPrimary}
      name="chevron-back"
      size={props.size ?? 'sm'}
    />
  );
}

export function PlusIcon(props: ShellIconProps): ReactElement {
  return <AppIcon color={props.color ?? colors.textPrimary} name="add" size={props.size ?? 'md'} />;
}

export function MoreVerticalIcon(props: ShellIconProps): ReactElement {
  return (
    <View
      style={{
        alignItems: 'center',
        height: sizeScale(props.size ?? 'sm').headerIconBox,
        justifyContent: 'center',
        width: sizeScale(props.size ?? 'sm').headerIconBox,
      }}
    >
      <AppIcon
        color={props.color ?? colors.textPrimary}
        name="ellipsis-vertical"
        size={props.size ?? 'sm'}
      />
    </View>
  );
}

export function UploadIcon(props: ShellIconProps): ReactElement {
  return (
    <AppIcon
      color={props.color ?? colors.textPrimary}
      name="download-outline"
      size={props.size ?? 'md'}
    />
  );
}

interface StarIconProps {
  filled: boolean;
  color?: string;
  size?: IconSize;
}

/** 收藏星形。 */
export function StarIcon(props: StarIconProps): ReactElement {
  const color = props.color ?? (props.filled ? colors.favoriteStar : colors.textMuted);
  return (
    <AppIcon
      color={color}
      name={props.filled ? 'star' : 'star-outline'}
      size={props.size ?? 'md'}
    />
  );
}

export function SpeakerIcon(props: ShellIconProps): ReactElement {
  return (
    <AppIcon
      color={props.color ?? colors.textSecondary}
      name="volume-high-outline"
      size={props.size ?? 'sm'}
    />
  );
}

export function MusicNoteIcon(props: ShellIconProps): ReactElement {
  return (
    <AppIcon
      color={props.color ?? colors.accent}
      name="musical-notes-outline"
      size={props.size ?? 'sm'}
    />
  );
}
