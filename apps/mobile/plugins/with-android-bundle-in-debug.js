const { withAppBuildGradle } = require('@expo/config-plugins');

const BUNDLE_IN_DEBUG_MARKER = 'bundleJsInDebugForStandaloneApk';

/** debug APK 也内嵌 JS bundle，避免真机离线启动时报 Unable to load script。 */
function withAndroidBundleInDebug(config) {
  return withAppBuildGradle(config, (configWithGradle) => {
    let gradle = configWithGradle.modResults.contents;
    if (gradle.includes(BUNDLE_IN_DEBUG_MARKER)) {
      return configWithGradle;
    }

    const injection = `
    // ${BUNDLE_IN_DEBUG_MARKER}: 空列表 = debug 也打包 bundle（__DEV__ 仍为 true）
    debuggableVariants = []`;

    if (gradle.includes('bundleCommand = "export:embed"')) {
      gradle = gradle.replace(
        'bundleCommand = "export:embed"',
        `bundleCommand = "export:embed"${injection}`,
      );
    } else if (gradle.includes('react {')) {
      gradle = gradle.replace('react {', `react {${injection}`);
    }

    configWithGradle.modResults.contents = gradle;
    return configWithGradle;
  });
}

module.exports = withAndroidBundleInDebug;
