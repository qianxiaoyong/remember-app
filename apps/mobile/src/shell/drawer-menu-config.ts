export type DrawerCommonFeatureId = 'guide' | 'question-bank' | 'redeem' | 'follow';

export type DrawerMenuItemId =
  'downloads' | 'favorites' | 'settings' | 'about' | 'contact' | 'account';

export interface DrawerCommonFeatureItem {
  id: DrawerCommonFeatureId;
  label: string;
  reservedMessage: string;
}

export interface DrawerMenuItem {
  id: DrawerMenuItemId;
  label: string;
  route?: string;
  /** 预留入口：可见但暂不跳转，点击提示 */
  reserved?: boolean;
  reservedMessage?: string;
}

export interface DrawerMenuSection {
  title: string;
  items: DrawerMenuItem[];
}

export const drawerCommonFeatures: DrawerCommonFeatureItem[] = [
  {
    id: 'guide',
    label: '记得攻略',
    reservedMessage: '学习攻略将在后续版本开放。',
  },
  {
    id: 'question-bank',
    label: '真题库',
    reservedMessage: '真题库将在后续版本开放。',
  },
  {
    id: 'redeem',
    label: '兑换码',
    reservedMessage: '兑换码功能将在后续版本开放。',
  },
  {
    id: 'follow',
    label: '关注我',
    reservedMessage: '关注与社群入口将在后续版本开放。',
  },
];

/** 配置分组仅作维护用途；抽屉 UI 不再展示分组标题。 */
export const drawerMenuSections: DrawerMenuSection[] = [
  {
    title: '学习',
    items: [
      { id: 'downloads', label: '下载管理', route: '/downloads' },
      { id: 'favorites', label: '收藏本', route: '/favorites' },
    ],
  },
  {
    title: '账号',
    items: [{ id: 'settings', label: '基础设置', route: '/settings' }],
  },
  {
    title: '支持',
    items: [
      { id: 'about', label: '关于应用', route: '/about' },
      {
        id: 'contact',
        label: '联系我们',
        reserved: true,
        reservedMessage: '客服与反馈渠道将在后续版本开放。',
      },
    ],
  },
];

export const drawerMenuItems: DrawerMenuItem[] = drawerMenuSections.flatMap(
  (section) => section.items,
);
