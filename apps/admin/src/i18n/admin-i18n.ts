import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';

const zhMessages = {
  ...englishMessages,
  ra: {
    ...englishMessages.ra,
    auth: {
      ...englishMessages.ra.auth,
      username: '用户名',
      password: '密码',
      sign_in: '登录',
      auth_check_error: '登录状态已失效，请重新登录',
    },
    action: {
      ...englishMessages.ra.action,
      logout: '退出',
    },
    page: {
      ...englishMessages.ra.page,
      dashboard: '驾驶舱',
    },
    notification: {
      ...englishMessages.ra.notification,
      logged_out: '已退出登录',
    },
  },
};

export const adminI18nProvider = polyglotI18nProvider(() => zhMessages, 'zh');
