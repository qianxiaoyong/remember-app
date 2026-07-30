# 阶段 5 完成摘要（账号、同步与换机恢复）

日期：2026-07-30  
基线：`main` @ `1ef86be`（PR #3 merge）  
收口分支：`feat/account-sync`

## 交付物

| 子计划 | 核心交付 | 状态 |
| --- | --- | --- |
| kickoff `2026-07-29-phase5-account-sync-kickoff.md` | Q1:B / Q2:A / Q3:A 已确认 | ✅ |
| 1 `2026-07-29-phone-session-and-main-device.md` | Prisma auth 三表；短信登录（dev mock）；session + 主设备；登录/账号 UI | ✅ |
| 2 `2026-07-30-study-state-sync-and-restore.md` | `learning_states` + `sync_processed_events`；outbox 上传；快照恢复；sync worker | ✅ |
| ADR `0009-session-kick-and-snapshot-restore.md` | 跨设备顶号 1a、快照合并 2a、登录 await 恢复 | ✅ |
| runbook `account-sync-maintenance.md` | 实机联调、双机验收、已知缺陷与维护要点 | ✅ |
| infra `pnpm dev:db` + `local-api-docker-dev.md` | 本地 Docker PostgreSQL 一键启动 | ✅ |

主要代码路径：

- API 鉴权：`apps/api/src/auth/`、`apps/api/src/sms/`
- API 同步：`apps/api/src/sync/`
- 契约：`packages/contracts/src/auth/`、`packages/contracts/src/sync/`
- 移动端：`apps/mobile/src/use-cases/auth/`、`apps/mobile/src/use-cases/sync/`、登录/账号屏
- 集成测试：`apps/api/test/auth-main-device.e2e.test.ts`、`sync-learning-states.e2e.test.ts`

## 退出门禁（§5.8）

**自动化（merge 时本地验证）：**

- `pnpm --filter @remember/api test:integration` — **14/14** 通过
- `pnpm --filter @remember/contracts test` — **24/24** 通过
- `pnpm --filter @remember/mobile test` — **28/28** 通过

**实机（维护手册 §6，开发期已跑通核心路径）：**

- A 机学习 → 待上传归零 → B 机同号登录 → 进度与云端 snapshot 一致
- B 顶 A：A **403** + Banner，本地仍可学；A 不清登录态缓存（ADR 0009 §1a）
- 同 deviceId 再登录：旧 token **401**

**§5.8 正式双机 release 脚本验收：** checklist 保留「merge 后按维护手册 §6 补跑并勾选」说明；不阻塞 merge。

## 产品选项落地

| 选项 | 落地 |
| --- | --- |
| Q1:B | 首次安装登录引导 +「稍后」；跳过后不反复强制 |
| Q2:A | 快照/合并按 `clientVersion` 取更高；登录 await 恢复后 upload |
| Q3:A | 被顶设备云端读写 **403**；保留本地进度与 cached 用户展示 |

## 阶段 5 范围外（defer）

| 项 | 说明 |
| --- | --- |
| 腾讯云 SMS SDK 3.0 真发码 | dev/test mock `000000`；`tencent-sms-sender` 为 stub |
| 阶段 6 目录 / 订单 / 微信支付 / `pack_access` | 市场仍为 catalog seed |
| 备案域名 + 正式 HTTPS API | 本地 IP + cleartext release 插件用于联调 |
| 弱网/杀进程专项自动化 | 行为靠 outbox 保留 + worker 重试；无独立 E2E |
| `pnpm check` 全绿 | `format:check` 在 main 上仍有历史 Prettier 告警（非本阶段引入） |

## 审查后修复（PR #3 追加 commit）

1. **P1** 同 deviceId 再登录 revoke 旧 session；跨设备 **不 revoke**（ADR 0009）
2. **P1** sync `updateMany … clientVersion: { lt }` + upload mutex
3. **P2** 换机恢复 UI 文案、INVALID_PAYLOAD outbox 清理、`__DEV__` 才显示 API URL
4. **docs** maintenance §2.3 与 checklist §5.4 对齐 ADR 0009

## Mock 与 dev 联调要点

| 项 | 处理 |
| --- | --- |
| 验证码 | dev/test 固定 `000000` |
| API 地址 | `EXPO_PUBLIC_API_BASE_URL` bake 进 release；内网 HTTP 需 cleartext 插件 |
| 登录失败提示 | 区分未配置 URL / 网络 / 服务器错误（维护手册 §5） |
| legacy outbox payload | `resolve-sync-outbox-payload` 从本地 `learning_states` 补全 SM-2 字段 |

## 下一阶段

阶段 6：目录、订单、微信支付与 `pack_access`（见 `development-order` §9）。  
并行：备案通过后官网/API 正式域名；腾讯云短信模板；Pause C/D 微信 AppID。
