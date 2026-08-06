# Phone Session and Main Device Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** 监护人手机号登录（dev 可 mock 验证码）、opaque session + Android Keystore、单主设备切换；**不含**学习进度上传与换机快照（子计划 2）。

**Architecture:** `packages/contracts` 定义 auth Zod 契约 → NestJS Controller → Use case → Prisma repository → PostgreSQL；移动端经用例 + HTTP 适配器，session 只进 Keystore。

**Tech Stack:** NestJS 11、Prisma、PostgreSQL 18（Docker）、Zod、`expo-secure-store` / Keystore 封装、Vitest + supertest 集成测试

**Kickoff：** `docs/superpowers/plans/2026-07-29-phase5-account-sync-kickoff.md`（§11：`Q1:B Q2:A Q3:A`）  
**Docker runbook：** `docs/runbooks/local-api-docker-dev.md`  
**验收：** `docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §5.1–5.4

## Global Constraints

- 本阶段 **只迁** `users`、`sms_challenges`、`sessions`；**不建** `learning_states`（子计划 2）
- Prisma 模型 **不得** 直接作为 API 响应
- `userId` 只从 session 解析；请求体里的 userId 一律忽略
- 新设备登录：同一事务更新 `users.mainDeviceId` + 撤销旧 `sessions`（Q3:A：旧设备读写云端均拒绝）
- dev/test 允许 mock 验证码 `000000`；**禁止** 进 production
- 子计划 1 完成前：移动端 **不接** sync 上传、不改 outbox payload
- 页面不直连 HTTP / Keystore / SQL

## 业务交付（本计划结束时用户能做什么）

1. 冷启动直接进入书库/学习，不弹登录引导（Q1:B 2026-08 修订）；需账号时再引导
2. 输入手机号 + 验证码（dev 用 `000000`）完成登录
3. 抽屉显示脱敏手机号；账号页可登出
4. 两台手机同一账号登录：后登录者成为主设备，先登录者再调写接口得 403
5. 未登录时本地学习仍与阶段 4 相同

---

### Task 1: 本地 Docker PostgreSQL 与根脚本

**Files:**

- Create: `infra/dev/compose.yaml`（已完成）
- Create: `infra/dev/.env.example`（已完成）
- Create: `infra/dev/start-dev-db.ps1`（已完成）
- Create: `docs/runbooks/local-api-docker-dev.md`（已完成）
- Modify: 根 `package.json` — 增加 `dev:db`、`dev:db:down`

**Steps:**

- [ ] 确认 `pnpm dev:db` 可启动 healthy 的 `remember_dev` 库
- [ ] runbook 中记录 `DATABASE_URL` 格式

**Verify:**

```powershell
pnpm dev:db
docker compose --project-name remember-dev --file infra/dev/compose.yaml ps
```

---

### Task 2: Prisma 初始化与首迁（auth 三表）

**Files:**

- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/.../migration.sql`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Modify: `apps/api/package.json` — 增加 `@prisma/client`、`prisma` 脚本
- Create: `apps/api/.env.example` — `DATABASE_URL`、`AUTH_PHONE_PEPPER`、`SMS_MOCK_ENABLED` 等

**Schema（业务含义）:**

| 表               | 用途                                                            |
| ---------------- | --------------------------------------------------------------- |
| `users`          | 账号：手机号哈希索引、脱敏展示号、可选昵称、当前主设备 ID、状态 |
| `sms_challenges` | 验证码挑战：哈希、过期、尝试次数、是否已使用                    |
| `sessions`       | 登录凭证哈希、用户、设备 ID、最后活动、撤销时间                 |

**Verify:**

```powershell
pnpm dev:db
pnpm --filter @remember/api prisma migrate dev
pnpm --filter @remember/api typecheck
```

---

### Task 3: `packages/contracts` auth 契约

**Files:**

- Create: `packages/contracts/src/auth/send-sms-code.ts`
- Create: `packages/contracts/src/auth/verify-sms-code.ts`
- Create: `packages/contracts/src/auth/session-user.ts`
- Create: `packages/contracts/src/auth/index.ts`
- Test: 契约 round-trip / 非法输入拒绝

**Endpoints（冻结路径）:**

| 方法 | 路径                      | 说明                             |
| ---- | ------------------------- | -------------------------------- |
| POST | `/api/v1/auth/sms/send`   | 发码（dev mock 不真发短信）      |
| POST | `/api/v1/auth/sms/verify` | 验码 + 签发 session + 主设备切换 |
| POST | `/api/v1/auth/logout`     | 撤销当前 session                 |
| GET  | `/api/v1/auth/me`         | 当前用户展示信息                 |

**Verify:**

```powershell
pnpm --filter @remember/contracts test
```

---

### Task 4: 短信适配器（Mock + 腾讯云接口预留）

**Files:**

- Create: `apps/api/src/sms/sms-sender.port.ts`
- Create: `apps/api/src/sms/mock-sms-sender.ts`
- Create: `apps/api/src/sms/tencent-sms-sender.ts`（可先 stub throw「未配置」）
- Create: `apps/api/src/sms/sms.module.ts`

**Rules:**

- 验证码只存 **哈希**；日志无手机号/验证码明文
- 频控：同号 60s 重发、日上限 10、单 challenge 最多 5 次尝试（PostgreSQL 计数）
- `SMS_MOCK_ENABLED=true` 时：任意手机号可发；验证码固定 `000000`

---

### Task 5: Auth 模块（NestJS）

**Files:**

- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.service.ts`（或分 use case 文件）
- Create: `apps/api/src/auth/auth.repository.ts`
- Create: `apps/api/src/auth/session.middleware.ts` 或 Guard
- Create: `apps/api/src/auth/crypto.ts` — token 生成、SHA-256 哈希
- Modify: `apps/api/src/app.module.ts`

**Core behaviors:**

1. **send：** 创建 `sms_challenges` 行；mock 模式下跳过腾讯云调用
2. **verify：** 校验 challenge → upsert user → **事务**内：设 `mainDeviceId`、撤销旧 sessions、创建新 session → 返回 **明文 token 一次**（响应体），DB 只存哈希
3. **logout：** 撤销当前 session
4. **me：** 返回脱敏手机号、displayName（默认「监护人」）

**Verify:**

```powershell
pnpm --filter @remember/api test:integration
```

集成测试必须连 **真实 PostgreSQL**（Docker）。

---

### Task 6: 主设备与 session 集成测试

**Files:**

- Create: `apps/api/test/auth-main-device.e2e.test.ts`

**Cases:**

- [ ] 发码 + 验码登录成功，返回 token
- [ ] 错误/过期验证码拒绝
- [ ] 成功登录后 challenge 标记 consumed
- [ ] 设备 B 登录后，设备 A 的 token 调写保护路由 → 403
- [ ] 并发双机登录：最终仅一台 `mainDeviceId` 有效
- [ ] session 90 天 TTL（测试配置可缩短）

---

### Task 7: 移动端 — deviceId 与 session 存储

**Files:**

- Create: `apps/mobile/src/data/device/get-or-create-device-id.ts`（SecureStore）
- Create: `apps/mobile/src/data/session/session-store.ts`（Keystore / SecureStore 封装）
- Create: `apps/mobile/src/data/api/api-client.ts` — 带 session header 的 fetch
- Create: `apps/mobile/src/data/api/auth-api.ts`

**Rules:**

- session token **不出** 日志、UI、错误消息
- 401/403：清 session，账号页展示「已在其他设备登录」

---

### Task 8: 移动端 — 登录 UI 与 Q1:B 引导

**Files:**

- Create: `apps/mobile/src/screens/login-screen.tsx`
- Create: `apps/mobile/src/screens/login-guide-screen.tsx`（保留；2026-08 起不再冷启动自动跳转）
- Create: `apps/mobile/src/screens/account-screen.tsx`
- Modify: `apps/mobile/src/components/shell/drawer-account-header.tsx`
- Modify: 路由 / drawer 点击账号进登录或账号页
- Create: `apps/mobile/src/use-cases/auth/send-sms-code.ts`、`verify-sms-login.ts`、`logout.ts`

**UI:**

- 轻量全屏：手机号 + 验证码 + 获取验证码倒计时
- 首次引导 ~~仅展示一次~~ → **2026-08 修订**：冷启动不弹；需账号操作时再 Alert 引导登录
- 未登录：抽屉头部进登录；**不阻断**首页与学习

---

### Task 9: 子计划 1 退出门禁

**必须全部满足：**

- [ ] `pnpm check` 全绿
- [ ] Docker PG + auth 集成测试绿
- [ ] release/dev 实机：mock 码登录 → 抽屉显示脱敏号 → 登出
- [ ] 双机（或两 session 模拟）：B 登录后 A 调需 auth 的写接口失败
- [ ] **未做：** sync 上传、换机快照、outbox payload 修复

**建议 commit 粒度：** Task 1–2 → 3–5 → 6 → 7–8

---

## 新窗口起手 Prompt（复制即用）

```text
请阅读：
- docs/superpowers/plans/2026-07-29-phase5-account-sync-kickoff.md
- docs/superpowers/plans/2026-07-29-phone-session-and-main-device.md
- docs/runbooks/local-api-docker-dev.md

使用 $build-learning-app 与 executing-plans，在分支 feat/account-sync 上从 Task 2 开始实施（Task 1 脚手架已存在则验证即可）。

实施前读 docs/ai-rules/（含 data-and-security、testing-and-review）。
先 pnpm dev:db，再 Prisma 迁移与 API。
dev 验证码固定 000000；不要接 sync 上传、不要改 pack 协议、不要订单/微信支付。
```

## 完成后需回报

- 变更文件列表与 migrations 名
- `pnpm check` 与 `test:integration` 输出
- 实机登录与双机主设备测试结果
- `apps/api/.env.example` 新增变量说明
