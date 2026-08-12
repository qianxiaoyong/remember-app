import type { ReactElement } from 'react';
import { AppIcon } from './app-icon';
import { colors } from '../../theme/colors';

interface TabIconProps {
  active: boolean;
  color?: string;
}

export function StudyTabIcon(props: TabIconProps): ReactElement {
  const color = props.color ?? (props.active ? colors.tabActive : colors.tabInactive);
  return <AppIcon color={color} name={props.active ? 'book' : 'book-outline'} size="md" />;
}

/** @deprecated 使用 StudyTabIcon */
export function HomeTabIcon(props: TabIconProps): ReactElement {
  return <StudyTabIcon {...props} />;
}

export function ReviewTabIcon(props: TabIconProps): ReactElement {
  const color = props.color ?? (props.active ? colors.tabActive : colors.tabInactive);
  return <AppIcon color={color} name={props.active ? 'eye' : 'eye-outline'} size="md" />;
}

export function RecordTabIcon(props: TabIconProps): ReactElement {
  const color = props.color ?? (props.active ? colors.tabActive : colors.tabInactive);
  return <AppIcon color={color} name={props.active ? 'calendar' : 'calendar-outline'} size="md" />;
}

export function ProfileTabIcon(props: TabIconProps): ReactElement {
  const color = props.color ?? (props.active ? colors.tabActive : colors.tabInactive);
  return <AppIcon color={color} name={props.active ? 'person' : 'person-outline'} size="md" />;
}
