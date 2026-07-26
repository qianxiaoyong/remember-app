# 0001 本机 Android 工具链前置条件

日期：2026-07-26

## 当前事实

- 本机尚未安装或配置可调用的 Java。
- 本机尚未设置 `ANDROID_HOME`。
- Expo SDK 57 的 Android JavaScript bundle 已能导出。
- Android 原生开发构建和 release 实机构建尚未验证。

## 决定

阶段2开始前安装 JDK 17 和 Android SDK，并配置项目可读取的 Android SDK 路径。完成后必须运行原生开发构建和 release 实机验证，再开始微信 OpenSDK 与学习包签名验证。

在上述验证完成前，不得声称 Android release 构建已经通过。
