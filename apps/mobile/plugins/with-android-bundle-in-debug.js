const fs = require('node:fs');
const path = require('node:path');
const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');

const BUNDLE_IN_DEBUG_MARKER = 'bundleJsInDebugForStandaloneApk';
const NO_METRO_MARKER = 'standaloneDebugNoMetro';

function patchGradleForEmbeddedDebugBundle(gradle) {
  if (gradle.includes(BUNDLE_IN_DEBUG_MARKER)) {
    return gradle;
  }

  const injection = `
    // ${BUNDLE_IN_DEBUG_MARKER}: 空列表 = debug 也打包 bundle（bundle --dev false，__DEV__ 为 false）
    debuggableVariants = []`;

  if (gradle.includes('bundleCommand = "export:embed"')) {
    return gradle.replace(
      'bundleCommand = "export:embed"',
      `bundleCommand = "export:embed"${injection}`,
    );
  }
  if (gradle.includes('react {')) {
    return gradle.replace('react {', `react {${injection}`);
  }
  return gradle;
}

function patchMainApplicationForStandaloneDebug(contents) {
  if (contents.includes(NO_METRO_MARKER)) {
    return contents;
  }

  const pattern =
    /ExpoReactHostFactory\.getDefaultReactHost\(\s*\n\s*context = applicationContext,/;
  if (!pattern.test(contents)) {
    throw new Error(
      'MainApplication.kt: expected ExpoReactHostFactory.getDefaultReactHost(context = applicationContext, ...)',
    );
  }

  return contents.replace(
    pattern,
    `ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      useDevSupport = false, // ${NO_METRO_MARKER}`,
  );
}

/** debug APK 内嵌 JS bundle 且禁用 Metro/DevSupport，避免离线启动连 8081 与绿色机器人页。 */
function withAndroidBundleInDebug(config) {
  let nextConfig = withAppBuildGradle(config, (configWithGradle) => {
    configWithGradle.modResults.contents = patchGradleForEmbeddedDebugBundle(
      configWithGradle.modResults.contents,
    );
    return configWithGradle;
  });

  return withDangerousMod(nextConfig, [
    'android',
    async (configWithAndroid) => {
      const applicationId = configWithAndroid.android?.package ?? 'com.remember.app';
      const mainApplicationPath = path.join(
        configWithAndroid.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        ...applicationId.split('.'),
        'MainApplication.kt',
      );

      if (!fs.existsSync(mainApplicationPath)) {
        throw new Error(`MainApplication not found: ${mainApplicationPath}`);
      }

      const contents = fs.readFileSync(mainApplicationPath, 'utf8');
      fs.writeFileSync(
        mainApplicationPath,
        patchMainApplicationForStandaloneDebug(contents),
        'utf8',
      );
      return configWithAndroid;
    },
  ]);
}

module.exports = withAndroidBundleInDebug;
module.exports.patchMainApplicationForStandaloneDebug = patchMainApplicationForStandaloneDebug;
