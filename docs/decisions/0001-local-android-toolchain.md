# 0001 本机 Android 工具链前置条件

日期：2026-07-26
状态：工具链已安装；移动身份与release实机验收暂停

## 已验证环境

- JDK：Eclipse Temurin 17.0.19+10，64位HotSpot。
- Android SDK Command-line Tools：22.0（官方Windows包`15859902`）。
- Android SDK Platform：API 36 revision 2，extension level 17。
- Android SDK Build Tools：36.0.0。
- Android SDK Platform Tools：37.0.0。
- ADB：1.0.41 / 37.0.0-14910828。
- 已连接真实设备：0；因此没有实机API level可记录。

工具安装在系统盘之外。机器级`JAVA_HOME`、`ANDROID_HOME`和`ANDROID_SDK_ROOT`已配置，PATH包含Java、Platform Tools和Command-line Tools入口。环境报告只输出版本或状态，不输出这些路径。

Android命令行工具下载自Android Developers官方页面，下载包SHA-256按页面公布值`90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a`核验后才解压。SDK组件通过官方工具安装并接受所需许可；没有安装Android Studio、模拟器、NDK或微信SDK。

官方依据：

- `https://developer.android.com/studio/`
- `https://developer.android.com/tools/sdkmanager`

## 动态报告结果

固定自测命令输出`SELF_TEST_OK`。固定环境报告根据Process、User和Machine环境及实际可执行文件动态得出：

- `JDK_17=17.0.19`
- `JAVA_HOME=CONFIGURED`
- `ANDROID_SDK=CONFIGURED`
- `ADB=1.0.41`
- `ANDROID_DEVICE_COUNT=0`
- `ANDROID_DEVICE_API_LEVELS=NOT_APPLICABLE`
- `ANDROID_APPLICATION_ID=MISSING`
- `RELEASE_BUILD_PROFILE=MISSING`
- `RELEASE_SIGNING_STATUS=MANUAL_CHECK_REQUIRED`
- `WECHAT_APP_ID=MISSING`
- `WECHAT_MERCHANT_ID=MISSING`

当前普通沙箱进程没有Docker Engine命名管道权限，因此同一报告中的`DOCKER_ENGINE=MISSING`表示该进程不可访问Engine，不表示Docker未安装；Task 3已在获批权限下独立验证Docker Engine 29.6.2和Compose 5.3.1。

## 暂停条件

工具链安装不等于Android release验收通过。以下顺序保持不变：

1. 用户确定长期使用的Android `applicationId`。
2. 确定正式release签名方案并在仓库外生成或配置凭证。
3. 使用包名和正式签名到微信开放平台注册。
4. 获得真实微信AppID及所需商户权限。
5. 用户再次确认后，才执行SQLite、Ed25519与受限OpenSDK的release实机Spike。

当前没有修改`apps/mobile/app.json`，没有运行Expo prebuild，没有创建原生工程、`WXPayEntryActivity`、Deep Link或支付请求接口，也没有模拟微信注册、支付或回跳成功。

## 验收命令

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1 -SelfTest
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1
sdkmanager --sdk_root=<configured-sdk-root> --list_installed
adb version
```

在Pause A与Pause B解除并再次取得移动批次确认前，不运行`expo prebuild`、`assembleRelease`或实机Spike。
