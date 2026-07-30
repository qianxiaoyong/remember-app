# Study State Sync and Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** 学习进度 outbox 上传、服务端 `learning_states` 持久化、换机快照恢复；Q2:A 按 `clientVersion` 合并；同步不阻塞本地学习。

**Architecture:** `packages/contracts` sync Zod → NestJS Sync 模块 → Prisma repository → PostgreSQL；移动端用例 + sync worker 后台上传/恢复，页面不直连 HTTP/SQL。

**Tech Stack:** NestJS 11、Prisma、PostgreSQL 18（Docker）、Zod、expo-sqlite outbox、Vitest + supertest

**Kickoff：** `docs/superpowers/plans/2026-07-29-phase5-account-sync-kickoff.md`（§11：`Q1:B Q2:A Q3:A`）  
**前置：** 子计划 1 已合并（`feat/account-sync` @ 手机号登录 + 主设备）  
**验收：** `docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §5.5–5.8

## Global Constraints

- 只同步 `learning_states`；不同步 `study_sessions` / 收藏 / 已安装包列表
- 作答事务仍只写本地；上传异步，失败保留 outbox
- 服务端 `userId` 只从 session 解析；非主设备写接口 **403**
- 按 `eventId` 幂等；按 `clientVersion` 条件更新（Q2:A）
- outbox `payload` 必须含 SM-2 全字段（修阶段 4 技术债）
- 子计划 2 完成前：账号页「最后同步时间」从真实 sync 写入

## 业务交付（本计划结束时用户能做什么）

1. A 机学习并联网 → 进度上传服务端
2. B 机同号登录 → 下载快照恢复进度（合并规则：版本更高者胜）
3. 弱网/重复/乱序上传不覆盖更新状态
4. 被顶设备不能写云端；主设备可上传
5. 账号页展示最后成功同步时间

---

### Task 1: 本计划文档

**Verify:** 文件存在且与 kickoff §5–§6 一致

---

### Task 2: Prisma 迁移 — `learning_states` + `sync_processed_events`

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260730100000_add_learning_states/migration.sql`
- Modify: `apps/api/test/helpers/db-test-helper.ts` — `resetSyncTables`

**Schema:**

| 表 | 用途 |
| --- | --- |
| `learning_states` | `userId` + `knowledgeId` 唯一；SM-2 字段 + `clientVersion` + `updatedAt` |
| `sync_processed_events` | `eventId` PK；幂等去重 |

**Verify:**

```powershell
pnpm dev:db
pnpm --filter @remember/api prisma migrate deploy
pnpm --filter @remember/api typecheck
```

---

### Task 3: `packages/contracts` sync 契约

**Files:**

- Create: `packages/contracts/src/sync/learning-state-payload.ts`
- Create: `packages/contracts/src/sync/batch-upload.ts`
- Create: `packages/contracts/src/sync/snapshot.ts`
- Create: `packages/contracts/src/sync/index.ts`
- Create: `packages/contracts/src/sync/sync.test.ts`
- Modify: `packages/contracts/src/index.ts`

**Endpoints:**

| 方法 | 路径 |
| --- | --- |
| POST | `/api/v1/sync/learning-states/batch` |
| GET | `/api/v1/sync/learning-states/snapshot` |

**Verify:**

```powershell
pnpm --filter @remember/contracts test
```

---

### Task 4: API Sync 模块

**Files:**

- Create: `apps/api/src/sync/sync.module.ts`
- Create: `apps/api/src/sync/sync.controller.ts`
- Create: `apps/api/src/sync/sync.service.ts`
- Create: `apps/api/src/sync/sync.repository.ts`
- Modify: `apps/api/src/app.module.ts`

**Verify:**

```powershell
pnpm --filter @remember/api typecheck
```

---

### Task 5: 同步集成测试

**Files:**

- Create: `apps/api/test/sync-learning-states.e2e.test.ts`

**Cases:**

- 批量上传成功；`GET snapshot` 一致
- 重复 `eventId` 幂等
- 乱序旧 `clientVersion` → `STALE_VERSION`，不覆盖
- 非主设备 batch → 403

**Verify:**

```powershell
pnpm --filter @remember/api test:integration
```

---

### Task 6: 修复 outbox payload（阶段 4 技术债）

**Files:**

- Create: `apps/mobile/src/data/sync/build-sync-outbox-payload.ts`
- Modify: `apps/mobile/src/use-cases/confirm-card-review.ts`
- Test: payload 符合 `syncLearningStatePayloadSchema`

---

### Task 7: 移动端 sync API 与 outbox 读取

**Files:**

- Create: `apps/mobile/src/data/api/sync-api.ts`
- Extend: `apps/mobile/src/data/repositories/sync-outbox-repository.ts` — list/delete batch

---

### Task 8: sync worker（上传）

**Files:**

- Create: `apps/mobile/src/use-cases/sync/upload-pending-sync-outbox.ts`
- Create: `apps/mobile/src/hooks/use-sync-worker.ts`
- 触发：登录成功、App 回前台、作答后 fire-and-forget

---

### Task 9: 换机快照恢复（Q2:A 合并）

**Files:**

- Create: `apps/mobile/src/use-cases/sync/restore-learning-states-from-snapshot.ts`
- Modify: `apps/mobile/src/use-cases/auth/verify-sms-login.ts` — 登录后 upload + restore
- Modify: `apps/mobile/src/data/session/session-store.ts` — `lastSyncedAt`

---

### Task 10: 账号页最后同步时间 + 退出门禁

**Files:**

- Modify: `apps/mobile/src/screens/account-screen.tsx`

**退出门禁：**

- [ ] `pnpm check` 全绿（Windows CRLF 历史除外需说明）
- [ ] `pnpm --filter @remember/api test:integration` 含 sync 用例
- [ ] 双机 release：A 学习上传 → B 登录恢复快照

---

## 新窗口起手 Prompt

```text
请阅读：
- docs/superpowers/plans/2026-07-29-phase5-account-sync-kickoff.md
- docs/superpowers/plans/2026-07-30-study-state-sync-and-restore.md

在 feat/account-sync 分支用 $build-learning-app 与 executing-plans 实施子计划 2。
子计划 1 已完成；不要改 pack 协议、不要接微信支付。
```
