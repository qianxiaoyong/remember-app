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
  // Same cover-rendered asset as JS overlay (splash-full.png); per-density PNGs from generateFullScreenSplashImages.
  fs.writeFileSync(
    path.join(drawableDir, 'splashscreen_brand.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap android:gravity="fill" android:src="@drawable/splashscreen_logo" />
  </item>
</layer-list>
`,
  );
  fs.writeFileSync(
    path.join(drawableDir, 'splashscreen_empty_icon.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item
    android:width="1dp"
    android:height="1dp"
    android:gravity="center">
    <shape android:shape="rectangle">
      <solid android:color="@android:color/transparent" />
    </shape>
  </item>
</layer-list>
`,
  );
}

function patchLauncherBackgroundDrawable(drawablePath) {
  if (!fs.existsSync(drawablePath)) {
    return;
  }

  fs.writeFileSync(
    drawablePath,
    `<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background"/>
</layer-list>
`,
  );
}

/** 原生 splash 与 JS overlay 同源：cover 预渲染整帧 + #F5F6FA 底色。 */
function patchSplashStyles(stylesPath) {
  if (!fs.existsSync(stylesPath)) {
    return;
  }

  let content = fs.readFileSync(stylesPath, 'utf8');
  // 必须保留 Theme.SplashScreen 父主题，否则 expo SplashScreenManager 会崩溃。
  content = content.replace(
    /<style name="Theme\.App\.SplashScreen" parent="[^"]+">[\s\S]*?<\/style>/,
    `<style name="Theme.App.SplashScreen" parent="Theme.SplashScreen">
    <item name="android:windowBackground">@drawable/splashscreen_brand</item>
    <item name="windowSplashScreenBackground">@color/splashscreen_background</item>
    <item name="windowSplashScreenAnimatedIcon">@drawable/splashscreen_empty_icon</item>
    <item name="postSplashScreenTheme">@style/AppTheme</item>
    <item name="android:windowSplashScreenBehavior">default</item>
  </style>`,
  );
  const appThemeBlock = content.match(/<style name="AppTheme"[\s\S]*?<\/style>/);
  if (appThemeBlock && !appThemeBlock[0].includes('android:windowBackground')) {
    content = content.replace(
      '<item name="android:navigationBarColor">@android:color/transparent</item>',
      `<item name="android:navigationBarColor">@android:color/transparent</item>
    <item name="android:windowBackground">@color/splashscreen_background</item>`,
      1,
    );
  }
  fs.writeFileSync(stylesPath, content);
}

function patchSplashBackgroundColor(colorsPath, backgroundColor) {
  if (!fs.existsSync(colorsPath) || !backgroundColor) {
    return;
  }

  let content = fs.readFileSync(colorsPath, 'utf8');
  if (content.includes('<root>')) {
    const match = content.match(/<resources>[\s\S]*?<\/resources>/);
    if (match) {
      content = `${match[0]}\n`;
    }
  }

  if (content.includes('name="splashscreen_background"')) {
    content = content.replace(
      /<color name="splashscreen_background">[^<]+<\/color>/,
      `<color name="splashscreen_background">${backgroundColor}</color>`,
    );
  } else {
    content = content.replace(
      '</resources>',
      `  <color name="splashscreen_background">${backgroundColor}</color>\n</resources>`,
    );
  }

  fs.writeFileSync(colorsPath, content);
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
      patchLauncherBackgroundDrawable(path.join(androidResDir, 'drawable', 'ic_launcher_background.xml'));
      patchSplashBackgroundColor(
        path.join(androidResDir, 'values', 'colors.xml'),
        configWithMod.splash?.backgroundColor ?? '#F5F6FA',
      );

      return configWithMod;
    },
  ]);
}

module.exports = withAndroidSplashBrand;
module.exports.patchSplashStyles = patchSplashStyles;
module.exports.patchSplashBackgroundColor = patchSplashBackgroundColor;
module.exports.writeSplashscreenDrawable = writeSplashscreenDrawable;
module.exports.patchLauncherBackgroundDrawable = patchLauncherBackgroundDrawable;
module.exports.generateFullScreenSplashImages = generateFullScreenSplashImages;
module.exports.resolveSplashImagePath = resolveSplashImagePath;
module.exports.resolveSplashPluginConfig = resolveSplashPluginConfig;
