const { withAndroidManifest } = require('@expo/config-plugins');

/** 确保 release main manifest 允许 HTTP（本地联调 API）。 */
function withAndroidCleartextRelease(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults;
    const application = manifest.manifest.application?.[0];
    if (application?.$) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return configWithManifest;
  });
}

module.exports = withAndroidCleartextRelease;
