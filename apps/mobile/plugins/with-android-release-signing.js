const { withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SIGNING_MARKER = 'rememberReleaseSigningFromProperties';

function resolveSigningPropertiesPath(projectRoot) {
  const fromEnv = process.env.REMEMBER_ANDROID_SIGNING_PROPERTIES;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv.replace(/\\/g, '/');
  }

  const localPath = path.join(projectRoot, 'signing.properties');
  if (fs.existsSync(localPath)) {
    return localPath.replace(/\\/g, '/');
  }

  return null;
}

function injectReleaseSigning(gradle, signingPropertiesPath) {
  if (gradle.includes(SIGNING_MARKER)) {
    return gradle;
  }

  const loaderBlock = `
// ${SIGNING_MARKER}
def rememberSigningProps = new Properties()
def rememberSigningFile = new File("${signingPropertiesPath}")
if (rememberSigningFile.exists()) {
    rememberSigningFile.withInputStream { rememberSigningProps.load(it) }
}`;

  const signingConfigBlock = `
        rememberRelease {
            if (rememberSigningProps.containsKey('storeFile')) {
                storeFile file(rememberSigningProps['storeFile'])
                storePassword rememberSigningProps['storePassword']
                keyAlias rememberSigningProps['keyAlias']
                keyPassword rememberSigningProps['keyPassword']
            }
        }`;

  if (!gradle.includes('android {')) {
    throw new Error('[with-android-release-signing] 未找到 android 块');
  }

  let next = `${loaderBlock}\n${gradle}`;

  if (next.includes('signingConfigs {')) {
    next = next.replace('signingConfigs {', `signingConfigs {${signingConfigBlock}`);
  } else {
    next = next.replace(
      /android\s*\{/,
      `android {
    signingConfigs {${signingConfigBlock}
    }`,
    );
  }

  if (next.match(/release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.debug/)) {
    next = next.replace(
      /(release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig signingConfigs.rememberRelease',
    );
  } else if (next.match(/release\s*\{/)) {
    next = next.replace(
      /release\s*\{/,
      'release {\n            signingConfig signingConfigs.rememberRelease',
    );
  } else {
    throw new Error('[with-android-release-signing] 未找到 release 构建类型');
  }

  return next;
}

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    const signingPropertiesPath = resolveSigningPropertiesPath(gradleConfig.modRequest.projectRoot);
    if (!signingPropertiesPath) {
      console.warn(
        '[with-android-release-signing] 未找到 signing.properties，release 仍使用 debug 签名。',
      );
      return gradleConfig;
    }

    gradleConfig.modResults.contents = injectReleaseSigning(
      gradleConfig.modResults.contents,
      signingPropertiesPath,
    );
    return gradleConfig;
  });
}

module.exports = withAndroidReleaseSigning;
