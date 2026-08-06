/**
 * Post-prebuild patch: native splash = solid #F5F6FA only (no Expo default robot).
 * Logo is shown only via JS overlay after bundle loads.
 */
const path = require('path');
const {
  writeSplashscreenDrawable,
  patchSplashStyles,
  patchSplashBackgroundColor,
  patchLauncherBackgroundDrawable,
} = require('../../apps/mobile/plugins/with-android-splash-brand');

const androidDir = process.argv[2];
if (!androidDir) {
  console.error('Usage: node patch-android-native-splash.cjs <androidDir>');
  process.exit(1);
}

const resDir = path.join(androidDir, 'app', 'src', 'main', 'res');
writeSplashscreenDrawable(resDir);
patchSplashStyles(path.join(resDir, 'values', 'styles.xml'));
patchLauncherBackgroundDrawable(path.join(resDir, 'drawable', 'ic_launcher_background.xml'));
patchSplashBackgroundColor(path.join(resDir, 'values', 'colors.xml'), '#F5F6FA');
console.log('Patched native Android splash resources');
