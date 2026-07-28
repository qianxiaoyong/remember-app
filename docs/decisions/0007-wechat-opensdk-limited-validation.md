# 0007 微信 OpenSDK 受限加载验证

日期：2026-07-28
状态：`LIMITED_PASS`（核心类经 JS/Kotlin 边界加载成功；未注册 App、未验证回跳或支付）

## 范围

本验证只证明腾讯微信 OpenSDK Android 核心类能进入正式签名 release APK，并经 Expo 本地模块 `wechat-open-sdk` 从 JS 调用 Kotlin 时成功加载。不调用 `registerApp`、不创建 `WXPayEntryActivity`、不发送支付请求、不模拟回跳。

## 环境与依据

| 项                 | 值                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OpenSDK 依赖       | `com.tencent.mm.opensdk:wechat-sdk-android:6.8.34`                                                                                                                                               |
| 本地模块           | `apps/mobile/modules/wechat-open-sdk`                                                                                                                                                            |
| applicationId      | `com.remember.app`                                                                                                                                                                               |
| 构建方式           | 短路径 `D:\r\a` + 本机 release 签名（见 [0004](./0004-android-app-identity-and-signing.md)）                                                                                                     |
| 验收设备 API level | 29（Android 10）                                                                                                                                                                                 |
| 官方依据           | [微信支付商户文档](https://pay.wechatpay.cn/doc/v3/merchant/4013289321)、[Sonatype wechat-sdk-android](https://central.sonatype.com/artifact/com.tencent.mm.opensdk/wechat-sdk-android/versions) |

Kotlin 侧直接引用 `WXAPIFactory` 与 `IWXAPI` 类型并 `Class.forName` 强制加载；类缺失或链接失败时向 JS 抛错，禁止返回硬编码版本或假成功。

## 验证结果

- `assertCoreClassesLoaded()` 在 release 真机上完成，无硬编码成功值。
- 真机输出为 **`LIMITED_PASS`**，不是「OpenSDK 接入完成」。

```text
=== WECHAT_OPENSDK ===
LIMITED_PASS
```

## 明确未创建

- `registerApp` / AppID 注册
- `<applicationId>/wxapi/WXPayEntryActivity`
- `sendWechatPayRequest` 或支付结果事件
- 模拟微信回跳

## 后续门禁（Pause C / D）

1. 用户在微信开放平台完成移动应用注册（包名 + release 签名指纹，见 [0004](./0004-android-app-identity-and-signing.md)）。
2. 获得 AppID 后，另写 OpenSDK 后续计划（注册、Activity、真实回跳）；商户权限仍缺失时不得声称支付链路通过。

本地 Expo 模块 **`apps/mobile/modules/wechat-open-sdk` 保留**，供阶段 3 扩展；Spike 专用断言文件已随临时入口删除。

## 验收命令

与 [0005](./0005-expo-multi-sqlite.md) 相同构建流程；安装 release APK 后，经临时「技术验证」入口人工确认（入口已删除）。
