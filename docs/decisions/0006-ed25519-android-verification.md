# 0006 Ed25519 Android 实机验签

日期：2026-07-28
状态：正式签名 release APK、Android API 29 真机验证通过

## 范围

本验证只覆盖移动端 **验签**（不生成密钥、不签名），使用 `@noble/ed25519@3.1.0` 与固定公开向量，在 React Native release 环境中验证 SHA-512 配置与拒绝错误输入。未创建正式 pack 验签模块或业务 UI。

## 环境与依据

| 项                 | 值                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------- |
| @noble/ed25519     | 3.1.0                                                                                        |
| @noble/hashes      | 2.2.0                                                                                        |
| applicationId      | `com.remember.app`                                                                           |
| 构建方式           | 短路径 `D:\r\a` + 本机 release 签名（见 [0004](./0004-android-app-identity-and-signing.md)） |
| 验收设备 API level | 29（Android 10）                                                                             |
| 向量生成           | `tools/technical-spikes/generate-ed25519-vectors.mjs`（私钥不提交仓库）                      |

## 必须采用的配置

React Native **没有** Web `crypto.subtle`。生产移动端验签须：

```typescript
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (message: Uint8Array) => Promise.resolve(sha512(message));
```

- 验签使用同步 **`ed.verify()`**，不依赖 `crypto.subtle`。
- **不要**为验签路径安装 `react-native-get-random-values` 等随机数 polyfill；本 Spike 验签不需要 `randomBytes`。
- **不要**使用默认 `verifyAsync`（其 async SHA-512 回退到 `crypto.subtle`）。

## 验证结果

- 正确公开向量（database、manifest、resource 拼接消息）验签通过。
- 错误公钥、截断签名、非法长度签名被拒绝。
- 对 database、manifest、resource 各篡改一字节后验签失败。

真机输出：

```text
=== ED25519 ===
PASS
```

## 验收命令

与 [0005](./0005-expo-multi-sqlite.md) 相同构建流程；安装 release APK 后，经临时「技术验证」入口人工确认（入口已删除）。

## 未验证与生产边界

- 未验证极大 pack 或流式验签性能。
- 正式 pack 验签须仍走 contracts 层定义的 manifest/hash 顺序；本 Spike 只使用 `spike_marker` 级固定向量。
- 若未来 noble 主版本变更 API，须重新跑定向回归。
