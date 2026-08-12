import type { ViewStyle } from 'react-native';

/** 极轻阴影：Android 用 elevation 0 避免硬边，iOS 用低 opacity + 大 blur */
export const cardShadow: ViewStyle = {
  elevation: 0,
  shadowColor: '#202228',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.022,
  shadowRadius: 20,
};

export const headerButtonShadow: ViewStyle = {
  elevation: 0,
  shadowColor: '#202228',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.02,
  shadowRadius: 10,
};
