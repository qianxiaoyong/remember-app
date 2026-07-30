# Android Release APK 构建指南（Windows）

日期：2026-07-28  
状态：已在 Windows 10 本机验证通过（真机安装成功）  
适用：`记得` / `remember-app` / `com.remember.app`  
技术栈：Expo SDK 57、React Native 0.86、Gradle 9.3、NDK 27

---

## 1. 文档目的

记录 2026-07-28 首次成功产出 **release 签名 APK** 的完整流程，以及此前多次失败的原因与规避方法。后续在本机做 Android release 构建时，**先读本文**，避免重复踩 Windows 路径长度、`subst` 混盘符、错误关闭新架构等坑。

身份与签名细节见 [ADR 0004](../decisions/0004-android-app-identity-and-signing.md)。工具链前置见 [ADR 0001](../decisions/0001-local-android-toolchain.md)。

---

## 2. 前置条件清单

| 项            | 要求                                               | 验证方式                      |
| ------------- | -------------------------------------------------- | ----------------------------- |
| JDK           | Temurin 17（64 位）                                | `java -version`               |
| Android SDK   | API 36、Build Tools 36.0.0、Platform Tools         | `sdkmanager --list_installed` |
| Node / pnpm   | 与仓库 lockfile 一致                               | `pnpm -v`                     |
| 依赖          | 仓库根目录已 `pnpm install`                        | 无报错                        |
| applicationId | `com.remember.app`                                 | `apps/mobile/app.json`        |
| Release 签名  | 仓库外 keystore + `signing.properties`             | 见 ADR 0004                   |
| 环境变量      | `REMEMBER_ANDROID_SIGNING_PROPERTIES` 指向属性文件 | 新开终端需重新设置            |

### 2.1 签名环境变量（每个 PowerShell 会话）

```powershell
$env:REMEMBER_ANDROID_SIGNING_PROPERTIES = 'D:\AIcoder\remember-secrets\signing.properties'
```

属性文件结构见 `apps/mobile/signing.properties.example`。keystore 与密码**不得**进入 Git 或本文档。

### 2.2 Expo config plugin

`apps/mobile/app.json` 已注册 `./plugins/with-android-release-signing.js`。每次 `expo prebuild --clean` 后会自动向 `android/app/build.gradle` 注入 `signingConfigs.rememberRelease`，无需手工改 Gradle。

---

## 3. 关键约束：Windows 路径长度（必读）

### 3.1 问题本质

React Native **0.82+ 默认启用新架构（New Architecture）**，release 构建会编译大量 C++ codegen 产物。  
其中 `react-native-gesture-handler` 等库的对象文件路径极长，形如：

```text
…/apps/mobile/android/app/.cxx/RelWithDebInfo/…/rngesturehandler_codegen_autolinked_build/CMakeFiles/…/D_/…/node_modules/react-native-gesture-handler/shared/shadowNodes/…/RNGestureHandlerDetectorShadowNode.cpp.o
```

在 **Windows 默认 MAX_PATH（260 字符）** 下，ninja/CMake 会直接失败：

```text
ninja: error: Stat(…): Filename longer than 260 characters
```

CMake 还会在配置阶段警告对象目录已接近 250 字符上限。

### 3.2 项目路径过长的典型症状

在 `D:\AIcoder\remember-app` 下构建时：

- `:app:buildCMakeRelWithDebInfo[arm64-v8a]` 失败
- 或 `:react-native-gesture-handler:generateCodegenSchemaFromJavaScript` 相关 C++ 任务失败
- 报错关键词：`Filename longer than 260 characters`、`CMAKE_OBJECT_PATH_MAX`

### 3.3 无效或不足的缓解手段（已实测）

| 手段                                                        | 结果     | 说明                                                                        |
| ----------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `android.enableLongPaths=true`（`gradle.properties`）       | 不足     | 仍触发 ninja 260 字符限制                                                   |
| 系统注册表 `LongPathsEnabled=1`                             | 不足     | 同上                                                                        |
| `subst R: D:\AIcoder\remember-app` 后在 `R:` 下构建         | **失败** | Gradle/Metro 混用 `R:` 与 `D:` 真实路径，codegen 报 **「different roots」** |
| `newArchEnabled=false`（`gradle.properties` 或 `app.json`） | **无效** | RN 0.86 构建时打印警告：自 0.82 起**不再支持**关闭新架构，仍按新架构编译    |
| 仅缩短 `reactNativeArchitectures`                           | 不足     | 可加快构建，但**不能单独**解决路径过长                                      |

### 3.4 推荐方案：使用短物理路径

将整个 monorepo 放在 **尽量短的盘符路径** 下构建。本机已验证成功路径：

```text
D:\r\a
```

（`r` = remember，`a` = app；约 6 字符根路径。）

**原则：**

1. 使用**真实物理路径**，不要用 `subst` / junction 把仓库映射到另一盘符后在混合路径下构建。
2. 路径越短越好；建议仓库根目录完整路径 **≤ 20 字符**（含盘符）。
3. 日常开发可仍在 `D:\AIcoder\remember-app`；**release 构建**在短路径副本或永久迁移目录执行。
4. 短路径目录需完整包含：Git 仓库、源码、`pnpm-lock.yaml`；构建前在该目录执行 `pnpm install`。

---

## 4. 标准构建流程（已验证）

以下命令在 **短路径仓库根目录**（如 `D:\r\a`）执行。

### 4.1 首次准备（从主开发目录复制）

若主目录为 `D:\AIcoder\remember-app`，可镜像到短路径（排除可再生成的大目录）：

```powershell
New-Item -ItemType Directory -Force -Path D:\r\a | Out-Null

robocopy "D:\AIcoder\remember-app" "D:\r\a" /MIR `
  /XD node_modules "apps\mobile\android" "apps\mobile\.expo" ".gradle" `
  /NFL /NDL /NJH /NJS /nc /ns /np

cd D:\r\a
pnpm install
```

> `robocopy` 退出码 `0–7` 通常表示复制成功；`8+` 表示错误。

### 4.2 生成原生工程

```powershell
cd D:\r\a   # 或你的短路径根目录
$env:REMEMBER_ANDROID_SIGNING_PROPERTIES = 'D:\AIcoder\remember-secrets\signing.properties'

pnpm --filter @remember/mobile exec expo prebuild --platform android --clean
```

`android/` 在 `.gitignore` 中，**不要**把 prebuild 产物提交 Git。

### 4.3 可选：缩短构建时间与路径（prebuild 后）

在 `apps/mobile/android/gradle.properties` 中可追加（prebuild 会覆盖部分默认值，需在 prebuild **之后**改）：

```properties
# 仅打 arm64 真机包，显著缩短 C++ 编译时间（绝大多数现代手机足够）
reactNativeArchitectures=arm64-v8a

# 无害，但无法单独解决 260 字符问题
android.enableLongPaths=true
```

若需要 x86 模拟器或 32 位设备，再改回多 ABI；路径问题仍依赖短根目录。

### 4.4 构建 release APK

**打包前必查（实机 HTTP 联调）：** main manifest 须含 `android:usesCleartextTraffic="true"`。仅跑 `assembleRelease` 而不 `prebuild` 时，该属性可能被洗掉，表现为 **手机浏览器能打开 API，App 内同步/登录却「无法连接服务器」**。

```powershell
Select-String -Path "apps\mobile\android\app\src\main\AndroidManifest.xml" -Pattern "usesCleartextTraffic"
```

```powershell
cd D:\r\a\apps\mobile\android
$env:REMEMBER_ANDROID_SIGNING_PROPERTIES = 'D:\AIcoder\remember-secrets\signing.properties'

.\gradlew.bat assembleRelease
```

若曾出现 lint 缓存文件被占用，先停 daemon 再构建：

```powershell
.\gradlew.bat --stop
Start-Sleep -Seconds 2
.\gradlew.bat assembleRelease
```

**预期：** 终端末尾 `BUILD SUCCESSFUL`；耗时约 7–10 分钟（视机器与 ABI 数量而定）。

### 4.5 产物位置

| 说明            | 路径                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| Gradle 默认输出 | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`           |
| 可选本地副本    | 仓库根 `dist/remember-0.0.0-release.apk`（`dist/` 已在 `.gitignore`，勿提交） |

2026-07-28 成功产物大小约 **93 MB**（含多 ABI 时更大；仅 arm64 会更小）。

---

## 5. 2026-07-28 构建时间线（摘要）

| 次序 | 环境                                  | 操作                                                 | 结果                                     |
| ---- | ------------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| 1    | `D:\AIcoder\remember-app`             | `expo prebuild` + `assembleRelease`                  | 失败：路径 > 260 字符                    |
| 2    | 同上 + `enableLongPaths` + 系统长路径 | 重试                                                 | 失败：同上                               |
| 3    | `subst R:` 映射短盘符                 | 在 `R:` 下构建                                       | 失败：`different roots`（R: 与 D: 混用） |
| 4    | 同上                                  | 尝试 `newArchEnabled=false`                          | 失败：RN 0.86 忽略该设置，仍编 C++       |
| 5    | **`D:\r\a`**                          | 镜像 → `pnpm install` → prebuild → `assembleRelease` | **成功**                                 |
| 6    | 真机                                  | 安装 `app-release.apk`                               | **安装成功**                             |

---

## 6. 验收步骤

### 6.1 构建产物存在

```powershell
Get-Item "D:\r\a\apps\mobile\android\app\build\outputs\apk\release\app-release.apk" |
  Select-Object FullName, Length, LastWriteTime
```

### 6.2 签名验证（可选）

使用 Android SDK 的 `apksigner`（路径随 SDK 安装位置而异）：

```powershell
apksigner verify --verbose "D:\r\a\apps\mobile\android\app\build\outputs\apk\release\app-release.apk"
```

### 6.3 真机安装

```powershell
adb install -r "D:\r\a\apps\mobile\android\app\build\outputs\apk\release\app-release.apk"
```

确认：

- 包名：`com.remember.app`
- 图标：黑底白色 ∞（adaptive icon）
- 应用名：记得

Release SHA-1（微信开放平台用）见 ADR 0004，与 debug 签名不同。

### 6.4 应用内数据验收（release 必读）

**release APK 默认 `android:debuggable=false`，以下命令会失败，属于正常现象：**

```powershell
adb shell run-as com.remember.app ls files/packs/remember-test-pack/
adb shell run-as com.remember.app sqlite3 databases/user.sqlite "SELECT packId FROM installed_packs;"
# 典型输出：run-as: package not debuggable: com.remember.app
```

| 构建类型    | `run-as` 查私有目录   | 阶段 4 退出门禁                |
| ----------- | --------------------- | ------------------------------ |
| **release** | ❌ 不可用             | ✅ 以 App 内真实 UI / 功能为准 |
| **debug**   | ✅ 可用（仅开发调试） | 不能替代 release 验收          |

**release 实机验收替代方式：**

1. 使用 App 内开发/验收入口展示的数据（如首页 `installed_packs` 列表，来自真实 SQLite 查询）。
2. 仅需命令行抽查时，构建并安装 **debug APK**（`assembleDebug`），在同一分支上用 `run-as` 查库；debug 通过 **不能** 代替 release 门禁。

```powershell
# 可选：仅开发期查库（debug 包）
cd D:\r\a\apps\mobile\android
.\gradlew.bat assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell run-as com.remember.app sqlite3 databases/user.sqlite "SELECT packId, packVersion, installStatus FROM installed_packs;"
```

---

## 7. 故障排查

### 7.1 `Filename longer than 260 characters`

**原因：** 仓库根路径太长。  
**处理：** 换到 `D:\r\a` 等短路径；不要用 `subst`。

### 7.2 `this and base files have different roots`

**原因：** `subst`/映射盘符与真实路径混用。  
**处理：** 仅在单一物理短路径下构建；取消 `subst`。

### 7.3 `newArchEnabled=false` 不生效

**原因：** RN ≥ 0.82 强制新架构。  
**处理：** 不要依赖关闭新架构；缩短路径。

### 7.4 `lintVitalAnalyzeRelease` / 无法删除 `expo-modules-core\android\build`

**原因：** 上一次 Gradle daemon 仍占用 lint 缓存 jar。  
**处理：** `.\gradlew.bat --stop`，删除 `node_modules\expo-modules-core\android\build\intermediates\lint-cache`（若仍失败），再 `assembleRelease`。

### 7.5 `[with-android-release-signing] 未找到 signing.properties`

**原因：** 未设置 `REMEMBER_ANDROID_SIGNING_PROPERTIES` 且仓库内无 `apps/mobile/signing.properties`。  
**处理：** 设置环境变量指向仓库外属性文件；release 会退回 debug 签名（**不可用于微信注册验收**）。

### 7.6 TLS / Maven 握手失败

见 ADR 0004「当前阻塞」历史记录。若复现，排查代理、防火墙、JDK 证书；可尝试 `tools/mobile/gradle-mirror-init.gradle` init-script（按 ADR 0004 命令）。

---

## 8. 主开发目录与构建目录如何同步

推荐工作流：

1. **日常开发**：继续在 `D:\AIcoder\remember-app`（Cursor 主工作区）。
2. **需要 APK 时**：将变更同步到 `D:\r\a` 后按第 4 节构建。
3. **同步方式**（二选一）：
   - **镜像复制**（见 4.1 `robocopy`）：适合未提交改动较多时；
   - **Git**：在短路径目录 `git pull` / `git fetch` + checkout 同一分支，再 `pnpm install`。

构建完成后，可将 APK 复制回主目录便于分发：

```powershell
New-Item -ItemType Directory -Force -Path "D:\AIcoder\remember-app\dist" | Out-Null
Copy-Item "D:\r\a\apps\mobile\android\app\build\outputs\apk\release\app-release.apk" `
  "D:\AIcoder\remember-app\dist\remember-0.0.0-release.apk"
```

**长期建议：** 若 Android 构建频繁，可将 Git 仓库永久迁移到 `D:\r\a`（或类似短路径），避免双目录维护。

---

## 9. 禁止事项

- 不要用 `subst` / 虚拟盘符「伪缩短」路径后在原 `D:` 路径混用工具链。
- 不要提交 `android/`、`dist/*.apk`、`signing.properties`、`.jks`。
- 不要在未获微信 AppID 前为 release 包接入 OpenSDK 支付/登录生产配置。
- 不要假设 `enableLongPaths` 或关闭新架构能替代短路径。

---

## 10. 相关文件索引

| 文件                                                      | 作用                          |
| --------------------------------------------------------- | ----------------------------- |
| `apps/mobile/app.json`                                    | 包名、图标、Expo plugins      |
| `apps/mobile/plugins/with-android-release-signing.js`     | Release 签名注入              |
| `apps/mobile/signing.properties.example`                  | 签名属性模板                  |
| `apps/mobile/android/gradle.properties`                   | prebuild 生成；构建前可改 ABI |
| `tools/mobile/gradle-mirror-init.gradle`                  | 可选 Maven 镜像 init-script   |
| `docs/decisions/0004-android-app-identity-and-signing.md` | 身份、指纹、签名 ADR          |

---

## 11. 变更记录

| 日期       | 说明                                                                |
| ---------- | ------------------------------------------------------------------- |
| 2026-07-28 | 首版：记录 Windows 路径踩坑、短路径 `D:\r\a` 成功流程、真机安装验证 |
