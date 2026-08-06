#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- Node CJS 构建脚本 */
/** 本地 release 构建前 patch Android 全屏 splash（prebuild 不可用时手动执行）。 */
const path = require('node:path');
const fs = require('node:fs');
const { generateImageAsync } = require('@expo/image-utils');

const projectRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../apps/mobile');
const SPLASH_BACKGROUND = '#F5F6FA';
const sourceImage = path.join(projectRoot, 'assets/images/splash-full.png');
const BASE_WIDTH = 360;
const BASE_HEIGHT = 800;

const DENSITY_FOLDERS = [
  { folder: 'mdpi', multiplier: 1 },
  { folder: 'hdpi', multiplier: 1.5 },
  { folder: 'xhdpi', multiplier: 2 },
  { folder: 'xxhdpi', multiplier: 3 },
  { folder: 'xxxhdpi', multiplier: 4 },
];

async function main() {
  const androidMainPath = path.join(projectRoot, 'android/app/src/main');
  if (!fs.existsSync(androidMainPath)) {
    throw new Error(`Android project not found: ${androidMainPath}`);
  }
  if (!fs.existsSync(sourceImage)) {
    throw new Error(`Splash image not found: ${sourceImage}`);
  }

  await Promise.all(
    DENSITY_FOLDERS.map(async ({ folder, multiplier }) => {
      const width = Math.round(BASE_WIDTH * multiplier);
      const height = Math.round(BASE_HEIGHT * multiplier);
      const { source } = await generateImageAsync(
        { projectRoot, cacheType: 'splash-android-brand-cli' },
        { src: sourceImage, resizeMode: 'cover', width, height },
      );
      const outputDir = path.join(androidMainPath, 'res', `drawable-${folder}`);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'splashscreen_logo.png'), source);
    }),
  );

  const resDir = path.join(androidMainPath, 'res');
  fs.mkdirSync(path.join(resDir, 'drawable'), { recursive: true });
  fs.writeFileSync(
    path.join(resDir, 'drawable/splashscreen.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background" />
</layer-list>
`,
  );

  const colorsPath = path.join(resDir, 'values/colors.xml');
  fs.writeFileSync(
    colorsPath,
    fs
      .readFileSync(colorsPath, 'utf8')
      .replace(/splashscreen_background">[^<]+/, `splashscreen_background">${SPLASH_BACKGROUND}`),
  );

  const stylesPath = path.join(resDir, 'values/styles.xml');
  let styles = fs.readFileSync(stylesPath, 'utf8');
  if (!styles.includes('@drawable/splashscreen"')) {
    styles = styles.replaceAll('@drawable/splashscreen_logo', '@drawable/splashscreen');
  }
  if (!styles.includes('android:windowBackground">@color/splashscreen_background')) {
    styles = styles.replace(
      '<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">',
      `<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:windowBackground">@color/splashscreen_background</item>`,
    );
  }
  fs.writeFileSync(stylesPath, styles);

  console.log(`Android full-screen splash patched at ${projectRoot}`);
}

void main();
