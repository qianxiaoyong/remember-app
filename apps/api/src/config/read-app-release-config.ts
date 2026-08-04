export interface AppReleaseConfig {
  minAndroidVersion: string;
  latestApkUrl: string;
  forceUpdateBelow?: string;
}

export function readAppReleaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppReleaseConfig | null {
  const minAndroidVersion = env.APP_RELEASE_MIN_ANDROID_VERSION?.trim();
  const latestApkUrl = env.APP_RELEASE_LATEST_APK_URL?.trim();
  const forceUpdateBelow = env.APP_RELEASE_FORCE_UPDATE_BELOW?.trim();

  if (!minAndroidVersion || !latestApkUrl) {
    return null;
  }

  return {
    minAndroidVersion,
    latestApkUrl,
    ...(forceUpdateBelow ? { forceUpdateBelow } : {}),
  };
}
