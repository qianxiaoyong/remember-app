const fs = require('node:fs');
const path = require('node:path');
const { generateImageAsync } = require('@expo/image-utils');
const { withDangerousMod } = require('@expo/config-plugins');

const IMAGE_CACHE_NAME = 'splash-android-brand';
const BASE_WIDTH = 360;
const BASE_HEIGHT = 800;

const DENSITY_FOLDERS = [
  { folder: 'mdpi', multiplier: 1 },
  { folder: 'hdpi', multiplier: 1.5 },
  { folder: 'xhdpi', multiplier: 2 },
  { folder: 'xxhdpi', multiplier: 3 },
  { folder: 'xxxhdpi', multiplier: 4 },
];

function resolveSplashPluginConfig(config) {
  const pluginConfig = config.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
  )?.[1];

  return {
    imagePath: pluginConfig?.image ?? config.splash?.image ?? './assets/images/splash-full.png',
    resizeMode: pluginConfig?.resizeMode ?? config.splash?.resizeMode ?? 'cover',
  };
}

function resolveSplashImagePath(projectRoot, imagePath) {
  return path.resolve(projectRoot, imagePath.replace(/^\.\//, ''));
}

async function generateFullScreenSplashImages(projectRoot, sourceImage) {
  const androidMainPath = path.join(projectRoot, 'android', 'app', 'src', 'main');

  await Promise.all(
    DENSITY_FOLDERS.map(async ({ folder, multiplier }) => {
      const width = Math.round(BASE_WIDTH * multiplier);
      const height = Math.round(BASE_HEIGHT * multiplier);
      const { source } = await generateImageAsync(
        {
          projectRoot,
          cacheType: IMAGE_CACHE_NAME,
        },
        {
          src: sourceImage,
          resizeMode: 'cover',
          width,
          height,
        },
      );

      const outputDir = path.join(androidMainPath, 'res', `drawable-${folder}`);
      await fs.promises.mkdir(outputDir, { recursive: true });
      await fs.promises.writeFile(path.join(outputDir, 'splashscreen_logo.png'), source);
    }),
  );
}

function writeSplashscreenDrawable(androidResDir) {
  const drawableDir = path.join(androidResDir, 'drawable');
  fs.mkdirSync(drawableDir, { recursive: true });
  fs.writeFileSync(
    path.join(drawableDir, 'splashscreen.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background" />
  <item>
    <bitmap android:gravity="fill" android:src="@drawable/splashscreen_logo" />
  </item>
</layer-list>
`,
  );
}

/** 去掉 Android 12 居中 icon，改为全屏背景图。 */
function patchSplashStylesContent(content) {
  if (content.includes('android:windowSplashScreenBehavior">default')) {
    return content;
  }

  let next = content.replace(
    '<item name="windowSplashScreenBackground">@color/splashscreen_background</item>',
    '<item name="windowSplashScreenBackground">@drawable/splashscreen</item>',
  );
  next = next.replace(
    /\s*<item name="windowSplashScreenAnimatedIcon">@drawable\/splashscreen_logo<\/item>\s*/g,
    '\n',
  );
  next = next.replace(
    'android:windowSplashScreenBehavior">icon_preferred',
    'android:windowSplashScreenBehavior">default',
  );
  return next;
}

function patchSplashStyles(stylesPath) {
  if (!fs.existsSync(stylesPath)) {
    return;
  }

  const content = fs.readFileSync(stylesPath, 'utf8');
  const next = patchSplashStylesContent(content);
  if (next !== content) {
    fs.writeFileSync(stylesPath, next);
  }
}

/** 全屏 cover splash：按屏幕密度生成铺满图，避免居中小图 + 白边。 */
function withAndroidSplashBrand(config) {
  return withDangerousMod(config, [
    'android',
    async (configWithMod) => {
      const projectRoot = configWithMod.modRequest.projectRoot;
      const { imagePath, resizeMode } = resolveSplashPluginConfig(configWithMod);
      if (resizeMode !== 'cover') {
        return configWithMod;
      }

      const sourceImage = resolveSplashImagePath(projectRoot, imagePath);
      if (!fs.existsSync(sourceImage)) {
        throw new Error(`Splash image not found: ${sourceImage}`);
      }

      const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      if (!fs.existsSync(androidResDir)) {
        return configWithMod;
      }

      await generateFullScreenSplashImages(projectRoot, sourceImage);
      writeSplashscreenDrawable(androidResDir);
      patchSplashStyles(path.join(androidResDir, 'values', 'styles.xml'));

      return configWithMod;
    },
  ]);
}

module.exports = withAndroidSplashBrand;
module.exports.patchSplashStylesContent = patchSplashStylesContent;
