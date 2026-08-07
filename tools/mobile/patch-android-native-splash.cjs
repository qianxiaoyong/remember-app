/**
 * Post-prebuild patch: native splash matches JS overlay (splash-full.png cover + #F5F6FA).
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Node CJS post-prebuild script */
const path = require('path');
const {
  writeSplashscreenDrawable,
  patchSplashStyles,
  patchSplashBackgroundColor,
  patchLauncherBackgroundDrawable,
  generateFullScreenSplashImages,
  resolveSplashImagePath,
  resolveSplashPluginConfig,
} = require('../../apps/mobile/plugins/with-android-splash-brand');

async function main() {
  const androidDir = process.argv[2];
  if (!androidDir) {
    console.error('Usage: node patch-android-native-splash.cjs <androidDir>');
    process.exit(1);
  }

  const mobileDir = path.dirname(androidDir);
  const appJson = require(path.join(mobileDir, 'app.json'));
  const splashConfig = resolveSplashPluginConfig(appJson.expo);
  const sourceImage = resolveSplashImagePath(mobileDir, splashConfig.imagePath);

  await generateFullScreenSplashImages(mobileDir, sourceImage);

  const resDir = path.join(androidDir, 'app', 'src', 'main', 'res');
  writeSplashscreenDrawable(resDir);
  patchSplashStyles(path.join(resDir, 'values', 'styles.xml'));
  patchLauncherBackgroundDrawable(path.join(resDir, 'drawable', 'ic_launcher_background.xml'));
  patchSplashBackgroundColor(path.join(resDir, 'values', 'colors.xml'), '#F5F6FA');
  console.log('Patched native Android splash resources');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
