# 0005 Expo 多 SQLite Android 实机验证

日期：2026-07-28
状态：正式签名 release APK、Android API 29 真机验证通过

## 范围

本验证只覆盖 `expo-sqlite@57.0.1` 在 Android release 上的多库并发、只读 pack 库、关闭句柄后内容替换，以及损坏候选拒绝且旧库仍可读。未定义正式学习包表结构，未创建业务数据访问层。

## 环境与依据

| 项                 | 值                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Expo SDK           | 57.0.8                                                                                       |
| React Native       | 0.86.0                                                                                       |
| expo-sqlite        | 57.0.1                                                                                       |
| applicationId      | `com.remember.app`                                                                           |
| 构建方式           | 短路径 `D:\r\a` + 本机 release 签名（见 [0004](./0004-android-app-identity-and-signing.md)） |
| 验收设备 API level | 29（Android 10）                                                                             |
| 官方依据           | [Expo SQLite 文档](https://docs.expo.dev/versions/latest/sdk/sqlite/)                        |

Spike 代码位于 `apps/mobile/src/technical-spikes/sqlite/`（验收后随临时入口一并删除；结论以本 ADR 为准）。

## 验证结果

- 同时打开可写 `user-spike.sqlite` 与 pack 库；pack 库执行 `PRAGMA query_only = ON` 后，`INSERT` 因只读失败。
- 用户库可正常写入；pack 库在只读连接上不可写。
- 关闭全部句柄后，使用 **`backupDatabaseAsync`** 将经 `serializeAsync` 得到的正常候选覆盖到 pack 库；重开后读取 marker 为 `pack-replaced`。
- 对候选字节做单字节损坏后，`PRAGMA integrity_check` 拒绝替换；pack 库 marker 保持不变。
- 初版文件系统直接替换（`expo-file-system` 删写 `.sqlite`）在 Android 上因路径与 WAL 侧车文件不同步多次失败；**生产实现应优先使用 SQLite backup API 或等价原生替换路径**，若必须文件级原子切换，须同时清理 `-wal`、`-shm`、`-journal` 并确保与 `databasePath` 一致。

真机输出：

```text
=== SQLITE ===
PASS
```

## 验收命令

```powershell
$env:REMEMBER_ANDROID_SIGNING_PROPERTIES = 'D:\AIcoder\remember-secrets\signing.properties'
cd D:\r\a
pnpm --filter @remember/mobile typecheck
pnpm --filter @remember/mobile exec expo prebuild --platform android --clean
Push-Location apps/mobile/android
.\gradlew.bat assembleRelease
Pop-Location
# 安装 app-release.apk 至 Android 8+ 真机，经临时「技术验证」入口人工确认（入口已删除）
```

## 未验证与生产边界

- 未在 Android 8 以外 API level 逐台复测；升级 Expo/RN/expo-sqlite 主版本后须回归。
- 未验证多 pack 并发只读、FTS 或大规模 pack 文件性能。
- 正式 pack 安装流程（manifest 验签、临时目录、原子切换）在阶段 3 单独实现；本 Spike 只证明 SQLite 多库与 backup 替换路径可行。
