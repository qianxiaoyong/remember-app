# 0004 Android 应用身份与 Release 签名

日期：2026-07-27（构建验收更新：2026-07-28）
状态：applicationId、release 签名与 release APK 构建均已在本机验收；Windows 下须在短路径构建，见 [Android Release 构建指南（Windows）](../runbooks/android-release-build-windows.md)

## 已确认身份

| 项            | 值                                         |
| ------------- | ------------------------------------------ |
| applicationId | `com.remember.app`                         |
| 产品展示名    | 记得                                       |
| Expo slug     | `remember`                                 |
| 证书主体      | `CN=Remember, OU=Mobile, O=Remember, C=CN` |

`applicationId` 已写入 `apps/mobile/app.json`，并通过 `expo prebuild` 生成到原生工程 `namespace` 与 `defaultConfig.applicationId`。注册微信开放平台后不得随意修改。

## Release 签名方案

采用 **本机 PKCS12 keystore + Gradle release 签名**，不使用 EAS 托管凭证。

| 项            | 值                                                           |
| ------------- | ------------------------------------------------------------ |
| 密钥算法      | RSA 2048                                                     |
| 签名算法      | SHA256withRSA                                                |
| 密钥别名      | `remember-release`                                           |
| 有效期        | 10,000 天                                                    |
| keystore 位置 | `D:\AIcoder\remember-secrets\remember-release.jks`（仓库外） |
| 属性文件      | `D:\AIcoder\remember-secrets\signing.properties`（仓库外）   |
| 环境变量      | `REMEMBER_ANDROID_SIGNING_PROPERTIES` 指向上述属性文件       |

属性文件与 keystore **不得提交 Git**。仓库内仅保留 `apps/mobile/signing.properties.example` 作为结构模板。

### 公开证书指纹（微信开放平台注册用）

| 指纹类型 | 值                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------- |
| SHA-1    | `D9:5E:C7:24:1D:62:75:CB:DA:EB:8A:1D:BC:3D:D0:6C:AC:11:66:17`                                     |
| SHA-256  | `85:66:46:AA:1F:77:C8:79:24:CF:93:4D:02:68:F9:FF:79:BF:13:2E:C1:0A:6B:E0:FC:7C:AD:72:85:D2:9F:26` |

## 工程接入方式

1. `apps/mobile/app.json` 注册 `./plugins/with-android-release-signing.js`。
2. 该 Expo config plugin 在 `expo prebuild` 时读取 `REMEMBER_ANDROID_SIGNING_PROPERTIES` 或 `apps/mobile/signing.properties`，向 `android/app/build.gradle` 注入 `signingConfigs.rememberRelease`，并将 `release` 构建类型绑定到该配置。
3. `android/` 目录仍在 `.gitignore` 中；每次 `prebuild --clean` 后签名注入由 plugin 自动重建。

## 验收命令

完整步骤、Windows 路径约束与故障排查见 **[Android Release 构建指南（Windows）](../runbooks/android-release-build-windows.md)**。摘要：

```powershell
# 1. 在短路径仓库根目录执行（Windows 必读 runbook 第 3 节）
#    推荐：D:\r\a，勿用 subst 映射盘符
cd D:\r\a

# 2. 签名环境变量（新开终端需重新设置）
$env:REMEMBER_ANDROID_SIGNING_PROPERTIES = 'D:\AIcoder\remember-secrets\signing.properties'

# 3. 生成原生工程
pnpm --filter @remember/mobile exec expo prebuild --platform android --clean

# 4. 构建 release APK
Push-Location apps/mobile/android
.\gradlew.bat assembleRelease
Pop-Location

# 5. 产物：apps/mobile/android/app/build/outputs/apk/release/app-release.apk

# 6. 脱敏环境报告
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1
```

预期：`ANDROID_APPLICATION_ID=CONFIGURED`；release APK 可安装到 Android 8+ 真机；`RELEASE_SIGNING_STATUS` 在 `apksigner verify` 通过前仍为 `MANUAL_CHECK_REQUIRED`。

## 构建验收记录

| 日期       | 结果     | 说明                                                    |
| ---------- | -------- | ------------------------------------------------------- |
| 2026-07-27 | 阻塞     | `D:\AIcoder\remember-app` 下 TLS 握手失败（见历史备注） |
| 2026-07-28 | **通过** | 短路径 `D:\r\a` 下 `assembleRelease` 成功；真机安装成功 |

### Windows 路径长度（2026-07-28 确认）

在 `D:\AIcoder\remember-app` 下构建会因 RN 0.86 新架构 C++ codegen 路径超过 260 字符而失败。`enableLongPaths`、`subst R:`、`newArchEnabled=false` 均不能作为可靠替代。**必须在短物理路径构建**；细节见 runbook。

### 历史阻塞：Java TLS（2026-07-27）

曾出现 Gradle/JVM 访问 Maven 仓库 TLS 握手失败。2026-07-28 短路径构建中未复现。若再次遇到，可检查代理/防火墙/JDK 证书，或尝试：

```powershell
.\gradlew.bat assembleRelease --init-script ..\..\..\tools\mobile\gradle-mirror-init.gradle
```

## 保管要求

- keystore 与 `signing.properties` 需离线备份；丢失后无法以相同指纹更新已发布 APK。
- 密码只保存在仓库外属性文件中，不得写入 ADR、聊天或 CI 日志。
- 微信开放平台注册时使用本文 SHA-1 指纹；AppID 获得前不得调用 `registerApp` 或创建 `WXPayEntryActivity`。

## 下一步

1. ~~解除本机 Java TLS 阻塞并完成 `assembleRelease` 验收。~~（2026-07-28 已完成，见 runbook）
2. 使用 `com.remember.app` 与 SHA-1 指纹在微信开放平台注册移动应用（Pause C）。
3. 获得 AppID 后，用户确认再执行阶段 2 移动端 Spike（SQLite、Ed25519、OpenSDK）。
4. 后续 Android release 构建统一遵循 [runbook](../runbooks/android-release-build-windows.md)；若永久迁移仓库到短路径，更新团队 onboarding 说明。
