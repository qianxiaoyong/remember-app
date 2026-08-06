/* eslint-disable @typescript-eslint/no-require-imports, no-undef -- 入口须先于 expo-router 执行 preventAutoHide */
const SplashScreen = require('expo-splash-screen');
const { Asset } = require('expo-asset');

void SplashScreen.preventAutoHideAsync().catch(() => {
  // 尽早持有原生 splash，避免 RN 首帧前闪白
});

void Asset.fromModule(require('./assets/images/splash-full.png'))
  .downloadAsync()
  .catch(() => {
    // 预解码失败不阻断启动
  });

require('expo-router/entry');
