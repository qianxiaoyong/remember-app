import appJson from './app.json';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');

/** @type {import('expo/config').ExpoConfig} */
export default {
  ...appJson.expo,
  extra: {
    apiBaseUrl: apiBaseUrl || undefined,
  },
};
