const fs = require('node:fs');
const path = require('node:path');
const { generateImageAsync } = require('@expo/image-utils');
const { withAndroidColors, withDangerousMod } = require('@expo/config-plugins');

const SPLASH_BACKGROUND = '#F5F6FA';
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
      // 保留生成逻辑供后续需要时启用；原生 splash 现仅展示底色，logo 由 JS overlay 统一呈现。
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
</layer-list>
`,
  );
}

function patchSplashStyles(stylesPath) {
  if (!fs.existsSync(stylesPath)) {
    return;
  }

  const content = fs.readFileSync(stylesPath, 'utf8');
  if (content.includes('@drawable/splashscreen"')) {
    return;
  }

  fs.writeFileSync(
    stylesPath,
    content.replaceAll('@drawable/splashscreen_logo', '@drawable/splashscreen'),
  );
}

/** 全屏 cover splash：按屏幕密度生成铺满图，避免居中小图 + 白边。 */
function withAndroidSplashBrand(config) {
  config = withAndroidColors(config, (configWithColors) => {
    configWithColors.modResults.splashscreen_background = SPLASH_BACKGROUND;
    return configWithColors;
  });

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
