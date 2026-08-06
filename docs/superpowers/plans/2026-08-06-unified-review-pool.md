# 统一复习池与 Leitner 调度 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 [ADR 0013](../decisions/0013-unified-review-pool-and-leitner-scheduler.md) 将 vocabulary 学习包改为「全量浏览 + 加入复习/暂不」，跨 pack 统一复习池 + Leitner 两按钮复习，底栏中间 Tab 承接复习入口，并保留 sync 换机能力。

**Architecture:** `packages/domain` 新增 Leitner 纯函数与 `buildReviewSessionPlan`；`user.sqlite` V4 扩展 `learning_states` 并新增统计/书签/偏好表；mobile 用例层拆分「入池」与「复习评分」两条写库路径；contracts + API 同步 payload 升级；学习包 session 队列对 vocabulary 停用，复习 Tab 独立 session。

**Tech Stack:** `@remember/domain`、vitest、`expo-sqlite`、Expo Router、`@remember/contracts` Zod、Prisma（sync 快照）、TypeScript strict。

## Global Constraints

- 产品展示名「记得」；仓库 `remember-app`。
- 行为以 **ADR 0013（已确认）** 为准；`reviewMode: sm2` enum **保留**，文档标 deprecated，UI 改两按钮。
- 去重键 **`knowledgeId`**；已在池内 UI 统一 **「已加复习」**；点按弹出 **「更新复习」** 确认框，确认后 **删后重加**（档位清零、`firstAddedFromPackId` 换当前包）；**不**计今日入池统计。
- 复习 Tab：**仅到期词**；「记住了」升档、「还不熟」→ **明天**（本地日历日锚点）；**不** session 内重插。
- `dailyReviewLimit` 默认 **20**，范围 **1～999**，入口在 **复习 Tab 页内**；超额 due **不推迟**。
- `packOpenPosition`：`bookmark`（默认）/ `start`，入口在 **设置页**；打开 pack **不弹窗**。
- 底栏角标 = **总到期数**；限额与今日进度在复习 Tab 页内。
- 复习 Session **每条词条** 须展示 **来源学习包**（`firstAddedFromPackId` → `installed_packs.displayName`；与卡面来源一致）。
- 入池 **不设每日上限**；须写入 `review_daily_stats.joinedPoolCount`（仅首次入池 +1）。
- MVP **不提供**移出复习池。
- 页面/用例 **不直连 SQL**；单事务写 `learning_states` + `sync_outbox`（评分/入池路径）。
- 学习统计 **本地 only**；面板 UI 本计划 **不做**。
- 每 Task 结束跑列出的验证；合并前 `pnpm check` 全绿。
- 每 Task 一次 commit；不与其他 feature 混 PR。
- 正式实现遵循 `docs/ai-rules/` 与 `$build-learning-app`。

## 范围外（defer）

| 项 | 说明 |
| --- | --- |
| 学习/复习数据面板 UI | 读 `review_daily_stats`；单独计划 |
| 词条「复习中」标记（P1） | ADR §4.3 可选 |
| `reviewMode` enum rename | ADR Q5：不 rename |
| FSRS / 四按钮 | ADR 非目标 |
| Admin / 服务端统计 | 本地优先 |
| 统计字段上传云端 | 后续 ADR |

## 依赖与实施顺序

```text
Task 1 domain ──┬──► Task 5 join-pool ──► Task 8 browse ──► Task 9 study UI
                ├──► Task 6 review-rating ──► Task 7 review session ──► Task 10 review UI
Task 2 contracts ──► Task 16 API sync
Task 3 schema ──► Task 4 repos ──► (5,6,7,8,12,13,15)
Task 11 capsule（依赖 Task 7 角标查询）
Task 14 rejoin（依赖 Task 5）
Task 15 API sync（依赖 Task 2）
Task 16 docs
Task 17 RC
```

---

## 文件结构（完成后）

```text
docs/decisions/0013-unified-review-pool-and-leitner-scheduler.md  # 已确认

packages/domain/src/
  review-box-scheduler.ts              # Leitner 纯函数
  review-box-scheduler.test.ts
  build-review-session-plan.ts         # 到期 + dailyReviewLimit 配额
  build-review-session-plan.test.ts
  local-review-day.ts                  # 本地切日 / 明日锚点

packages/contracts/src/sync/
  learning-state-payload.ts            # v2 字段（breaking）
  learning-state-payload.test.ts

apps/mobile/src/data/user-db/
  user-db-schema.ts                    # USER_DB_VERSION = 4
  migrate-sm2-to-review-pool.ts        # V4 数据迁移

apps/mobile/src/data/repositories/
  learning-state-repository.ts         # 扩展 CRUD + 到期计数
  review-daily-stats-repository.ts
  pack-browse-bookmark-repository.ts
  user-preferences-repository.ts

apps/mobile/src/use-cases/
  join-review-pool.ts
  update-review-pool-from-pack.ts      # 「更新复习」：删后重加语义
  skip-pack-card.ts
  confirm-review-outcome.ts
  resume-or-start-review-session.ts
  resolve-review-card-context.ts       # knowledgeId → 卡面 + 来源包 displayName
  resume-pack-browse.ts
  count-due-review-items.ts
  get-review-tab-summary.ts
  rejoin-card-review.ts                # 改幂等入池

apps/mobile/src/screens/
  review-screen.tsx
  study-screen.tsx                     # 两按钮 + 浏览模式
  settings-screen.tsx                  # packOpenPosition

apps/mobile/src/components/
  shell/capsule-bar.tsx                # 复习 Tab + 角标
  study/join-review-bar.tsx            # 加入复习 / 已加复习 / 暂不
  study/update-review-confirm-dialog.tsx # 「更新复习」确认框
  review/review-outcome-bar.tsx        # 记住了 / 还不熟
  review/review-source-pack-label.tsx  # 「来自《xxx》」

apps/mobile/app/(shell)/
  review.tsx                           # /review

apps/api/prisma/                       # LearningState 字段同步
apps/api/src/sync/                     # 合并策略 boxLevel/dueAt
```

---

### Task 1: Domain — Leitner 调度与复习 Session 规划

**Files:**

- Create: `packages/domain/src/local-review-day.ts`
- Create: `packages/domain/src/review-box-scheduler.ts`
- Create: `packages/domain/src/review-box-scheduler.test.ts`
- Create: `packages/domain/src/build-review-session-plan.ts`
- Create: `packages/domain/src/build-review-session-plan.test.ts`
- Modify: `packages/domain/src/index.ts`

**Interfaces:**

- Consumes: 无
- Produces:
  - `type ReviewOutcome = 'passed' | 'failed'`
  - `type BoxLevel = 0 | 1 | 2 | 3`
  - `interface ReviewPoolState { inReviewPool: boolean; boxLevel: BoxLevel; dueAt: string; consecutiveLevel3Passes?: number }`
  - `applyBoxReview(input: { previous: ReviewPoolState | null; outcome: ReviewOutcome; now: Date; timeZone?: string }): ReviewPoolState`
  - `formatBoxInterval(boxLevel: BoxLevel, consecutiveLevel3Passes: number): string` — 中文间隔文案
  - `startOfLocalReviewDay(now: Date, timeZone: string): Date`
  - `nextLocalReviewDayAnchor(now: Date, timeZone: string): string` — ISO dueAt（**本地 0:00** 切日）
  - `buildReviewSessionPlan(input: { dueItems: { knowledgeId: string; dueAt: string }[]; dailyReviewLimit: number; todayReviewCompletedCount: number; now: Date; timeZone: string }): { sessionKnowledgeIds: string[]; remainingDueCount: number }`

**档位间隔（ADR §6.1，写死在 domain 常量）：**

| boxLevel | passed 后间隔 |
| -------- | ------------- |
| 0 | +1 天 |
| 1 | +3 天 |
| 2 | +7 天 |
| 3 首次 | +21 天 |
| 3 再次 passed | +45 天 → 之后 +90 天循环 |

**failed：** `boxLevel = max(boxLevel - 1, 0)`；`dueAt = nextLocalReviewDayAnchor(now)`。

- [ ] **Step 1: 写 failing tests**

`review-box-scheduler.test.ts` 必覆盖：

```typescript
import { describe, expect, it } from 'vitest';
import { applyBoxReview } from './review-box-scheduler';

describe('applyBoxReview', () => {
  it('passed from level 0 sets due +1 local day', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: { inReviewPool: true, boxLevel: 0, dueAt: now.toISOString() },
      outcome: 'passed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(1);
    expect(next.dueAt).toBe('2026-08-07T00:00:00.000+08:00');
  });

  it('failed keeps level 0 and due tomorrow', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: { inReviewPool: true, boxLevel: 0, dueAt: now.toISOString() },
      outcome: 'failed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(0);
    expect(next.dueAt).toBe('2026-08-07T00:00:00.000+08:00');
  });
});
```

`build-review-session-plan.test.ts` 必覆盖：due 10 条、`dailyReviewLimit=20`、已完成 18 → session 仅 2 条；quota 0 → 空 session；超额 due 不修改 dueAt（规划层只选 id）。

- [ ] **Step 2: 跑测试确认 FAIL**

```powershell
pnpm --filter @remember/domain test -- review-box-scheduler
pnpm --filter @remember/domain test -- build-review-session-plan
```

- [ ] **Step 3: 实现 `local-review-day.ts` + scheduler + session plan**

- [ ] **Step 4: 测试 PASS**

```powershell
pnpm --filter @remember/domain test
```

- [ ] **Step 5: Commit**

```bash
git add packages/domain/src/local-review-day.ts packages/domain/src/review-box-scheduler.ts packages/domain/src/review-box-scheduler.test.ts packages/domain/src/build-review-session-plan.ts packages/domain/src/build-review-session-plan.test.ts packages/domain/src/index.ts
git commit -m "feat(domain): add Leitner review-box scheduler and session plan"
```

---

### Task 2: Contracts — Sync Learning State Payload v2

**Files:**

- Modify: `packages/contracts/src/sync/learning-state-payload.ts`
- Modify: `packages/contracts/src/sync/snapshot.ts`
- Create: `packages/contracts/src/sync/learning-state-payload.test.ts`
- Modify: `packages/contracts/src/sync/index.ts`

**Interfaces:**

- Consumes: ADR §7.1 字段表
- Produces:
  - `reviewOutcomeSchema = z.enum(['passed', 'failed'])`
  - `syncLearningStatePayloadSchema` **v2** 字段：

```typescript
export const syncLearningStatePayloadSchema = z
  .object({
    inReviewPool: z.boolean(),
    boxLevel: z.number().int().min(0).max(3),
    dueAt: z.iso.datetime(),
    firstAddedFromPackId: z.string().min(1),
    lastSeenInPackId: z.string().min(1).optional(),
    updatedAt: z.iso.datetime(),
    outcome: reviewOutcomeSchema.optional(), // 最近一次复习 Tab 操作；入池事件可无
    // 迁移期只读，服务端忽略写入：
    legacyEasiness: z.number().optional(),
    legacyIntervalDays: z.number().int().min(0).optional(),
    legacyRepetitions: z.number().int().min(0).optional(),
  })
  .strict();
```

- Snapshot item 同步扩展；导出类型 `SyncLearningStatePayload`。

- [ ] **Step 1: 写 payload 解析/拒绝旧字段的测试**

- [ ] **Step 2: 实现 schema + snapshot 类型**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/contracts typecheck
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(contracts): sync learning state payload v2 for review pool"
```

---

### Task 3: user.sqlite V4 — Schema 与 SM-2 数据迁移

**Files:**

- Modify: `apps/mobile/src/data/user-db/user-db-schema.ts`
- Modify: `apps/mobile/src/data/user-db/user-db-schema.test.ts`
- Create: `apps/mobile/src/data/user-db/migrate-sm2-to-review-pool.ts`
- Create: `apps/mobile/src/data/user-db/migrate-sm2-to-review-pool.test.ts`

**Interfaces:**

- Consumes: 无
- Produces:
  - `USER_DB_VERSION = 4`
  - `MIGRATION_V4_SQL`：

```sql
-- learning_states 扩展
ALTER TABLE learning_states ADD COLUMN inReviewPool INTEGER NOT NULL DEFAULT 0;
ALTER TABLE learning_states ADD COLUMN boxLevel INTEGER NOT NULL DEFAULT 0;
ALTER TABLE learning_states ADD COLUMN firstAddedFromPackId TEXT;
ALTER TABLE learning_states ADD COLUMN lastSeenInPackId TEXT;
ALTER TABLE learning_states ADD COLUMN consecutiveLevel3Passes INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_learning_states_in_pool_due ON learning_states (inReviewPool, dueAt);

-- vocabulary 包浏览书签（与 story_reading_bookmarks 分离）
CREATE TABLE pack_browse_bookmarks (
  packId TEXT NOT NULL PRIMARY KEY,
  knowledgeId TEXT NOT NULL,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL
);

-- 用户偏好
CREATE TABLE user_preferences (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
-- 种子：dailyReviewLimit=20, packOpenPosition=bookmark

-- 每日统计
CREATE TABLE review_daily_stats (
  localDate TEXT NOT NULL PRIMARY KEY,
  joinedPoolCount INTEGER NOT NULL DEFAULT 0,
  reviewCompletedCount INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL
);
```

- `runSm2ToReviewPoolMigration(db)` — V4 升级时执行一次：

| 原 SM-2 条件 | 迁移结果 |
| --- | --- |
| `repetitions = 0 && intervalDays = 0` | `inReviewPool=0` |
| 否则 | `inReviewPool=1` |
| `intervalDays <= 1` | `boxLevel=0` |
| `intervalDays <= 3` | `boxLevel=1` |
| `intervalDays <= 7` | `boxLevel=2` |
| `intervalDays >= 8` | `boxLevel=3` |
| `packId` | 复制到 `firstAddedFromPackId` |
| `easiness/repetitions/intervalDays` | **保留列**，只读，不删 |

- [ ] **Step 1: 写 migration SQL + schema 测试（版本号、表名）**

- [ ] **Step 2: 写 SM-2 → Leitner 映射单元测试（至少 4 档边界）**

- [ ] **Step 3: 实现 V4 + 迁移函数**

- [ ] **Step 4: 验证**

```powershell
pnpm --filter @remember/mobile test -- user-db-schema
pnpm --filter @remember/mobile test -- migrate-sm2-to-review-pool
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(mobile): user.sqlite v4 review pool schema and sm2 migration"
```

---

### Task 4: Repositories — 复习池 / 统计 / 偏好 / 书签

**Files:**

- Modify: `apps/mobile/src/data/repositories/learning-state-repository.ts`
- Create: `apps/mobile/src/data/repositories/review-daily-stats-repository.ts`
- Create: `apps/mobile/src/data/repositories/pack-browse-bookmark-repository.ts`
- Create: `apps/mobile/src/data/repositories/user-preferences-repository.ts`
- Modify: `apps/mobile/src/data/sync/build-sync-outbox-payload.ts`
- Modify: `apps/mobile/src/data/sync/resolve-sync-outbox-payload.ts`

**Interfaces:**

- Consumes: Task 3 schema
- Produces:
  - `getLearningStateByKnowledgeId(knowledgeId)`
  - `upsertReviewPoolState(state)` — 含 clientVersion 递增
  - `listDueReviewPoolItems(now, timeZone)` — `inReviewPool=1 AND dueAt <= endOfLocalReviewDay`
  - `countDueReviewPoolItems(now, timeZone): number`
  - `getUserPreference(key, defaultValue)` / `setUserPreference(key, value)`
  - `PREFERENCE_DAILY_REVIEW_LIMIT = 'dailyReviewLimit'`
  - `PREFERENCE_PACK_OPEN_POSITION = 'packOpenPosition'` — `'bookmark' | 'start'`
  - `incrementJoinedPoolCount(localDate)` / `incrementReviewCompletedCount(localDate)`
  - `getReviewDailyStats(localDate)`
  - `getPackBrowseBookmark(packId)` / `upsertPackBrowseBookmark(...)`

- [ ] **Step 1: 写 repository 测试（内存 sqlite 或 mock db）**

- [ ] **Step 2: 实现 repositories + sync payload 构建改用 v2**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- learning-state-repository
pnpm --filter @remember/mobile test -- review-daily-stats-repository
pnpm --filter @remember/mobile test -- user-preferences-repository
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): repositories for review pool, stats, and preferences"
```

---

### Task 5: Use Case — 加入复习、已加复习与更新复习

**Files:**

- Create: `apps/mobile/src/use-cases/join-review-pool.ts`
- Create: `apps/mobile/src/use-cases/join-review-pool.test.ts`
- Create: `apps/mobile/src/use-cases/update-review-pool-from-pack.ts`
- Create: `apps/mobile/src/use-cases/update-review-pool-from-pack.test.ts`
- Create: `apps/mobile/src/use-cases/skip-pack-card.ts`
- Modify: `apps/mobile/src/use-cases/rejoin-card-review.ts`
- Modify: `apps/mobile/src/use-cases/rejoin-card-review.test.ts`

**Interfaces:**

- Consumes: Task 1 入池初态、Task 4 repos
- Produces:

```typescript
export type JoinReviewPoolResult =
  | { status: 'created' }
  | { status: 'already_in_pool' };

export async function joinReviewPool(input: {
  knowledgeId: string;
  catalogPackId: string;
  now?: Date;
}): Promise<JoinReviewPoolResult>;

export async function updateReviewPoolFromPack(input: {
  knowledgeId: string;
  catalogPackId: string;
  now?: Date;
}): Promise<void>;
```

**规则（ADR §5.3）：**

- **无记录** → `joinReviewPool`：`inReviewPool=true`, `boxLevel=0`, `consecutiveLevel3Passes=0`, `dueAt=明天锚点`, `firstAddedFromPackId=catalogPackId`；outbox；`incrementJoinedPoolCount`
- **已有记录** → `joinReviewPool` 返回 `already_in_pool`（**不**改数据）；UI 应已显示「已加复习」而非调用 join
- **`updateReviewPoolFromPack`**（用户确认「更新复习」后）：
  - 等价删后重加：`boxLevel=0`, `consecutiveLevel3Passes=0`, `dueAt=新入池锚点`, `firstAddedFromPackId=catalogPackId`, `lastSeenInPackId=catalogPackId`, `inReviewPool=true`
  - outbox；**不** `incrementJoinedPoolCount`
  - 复习 Tab 该词卡面/「来自 xxx」立即指向 **当前包**

- `skipPackCard` — 可选 encounter；MVP 可 no-op + 推进书签

- `rejoinCardReview` — 已在池 → 走 **更新复习** 确认流程（或返回 `already_in_pool` 由 UI 弹框）；不在 search 静默改 due

- [ ] **Step 1: 写 join 首次入池 + update 清零档位/换 sourcePack 测试**

- [ ] **Step 2: 实现 use cases**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- join-review-pool
pnpm --filter @remember/mobile test -- update-review-pool-from-pack
pnpm --filter @remember/mobile test -- rejoin-card-review
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): join and update review pool from learning pack"
```

---

### Task 6: Use Case — 复习 Tab 评分

**Files:**

- Create: `apps/mobile/src/use-cases/confirm-review-outcome.ts`
- Create: `apps/mobile/src/use-cases/confirm-review-outcome.test.ts`

**Interfaces:**

- Consumes: Task 1 `applyBoxReview`, Task 4 repos
- Produces:

```typescript
export async function confirmReviewOutcome(input: {
  sessionId: string;
  knowledgeId: string;
  outcome: 'passed' | 'failed';
  now?: Date;
}): Promise<void>;
```

**流程：** 校验 active review session + 当前 item → `applyBoxReview` → upsert state → mark queue done → outbox（含 `outcome`）→ `incrementReviewCompletedCount` → 若 queue 空则 complete session → 可选 `uploadPendingSyncOutbox()`。

- [ ] **Step 1: 写测试（passed 升档、failed 明天、完成计数 +1）**

- [ ] **Step 2: 实现**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- confirm-review-outcome
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): confirm review outcome for Leitner scheduler"
```

---

### Task 7: Use Case — 复习 Session 启动与摘要

**Files:**

- Create: `apps/mobile/src/use-cases/resume-or-start-review-session.ts`
- Create: `apps/mobile/src/use-cases/resume-or-start-review-session.test.ts`
- Create: `apps/mobile/src/use-cases/count-due-review-items.ts`
- Create: `apps/mobile/src/use-cases/get-review-tab-summary.ts`

**Interfaces:**

- Consumes: Task 1 `buildReviewSessionPlan`, Task 4 repos
- Produces:
  - `resumeOrStartReviewSession()` — 复用 `study_sessions` 表但 `packId='__review__'`（或新 `review_sessions` 表 — **优先复用现有 session/queue 表**，减少迁移面）
  - `countDueReviewItems(now?)` — 底栏角标
  - `getReviewTabSummary()` → `{ dueTotal, dailyReviewLimit, todayReviewCompleted, remainingQuota, joinedPoolCountToday }`
  - `resolveReviewCardContext(knowledgeId)` → `{ cardDetail, sourcePackId, sourcePackDisplayName }` — `sourcePack*` 来自 `learning_states.firstAddedFromPackId` + `installed_packs`；未安装时 `sourcePackDisplayName` 降级为 packId 或固定文案「已卸载的学习包」

**Session 表复用约定：**

- `study_sessions.packId = '__review_pool__'`
- `study_queue_items.itemType = 'review'` only
- 与 per-pack vocabulary session **互斥**：启动复习 session 不依赖 packId

- [ ] **Step 1: 写 session 配额与恢复测试**

- [ ] **Step 2: 实现 use cases**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- resume-or-start-review-session
pnpm --filter @remember/mobile test -- get-review-tab-summary
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): review session resume and tab summary"
```

---

### Task 8: Use Case — Vocabulary 包全量浏览 + 书签

**Files:**

- Create: `apps/mobile/src/use-cases/resume-pack-browse.ts`
- Create: `apps/mobile/src/use-cases/resume-pack-browse.test.ts`
- Modify: `apps/mobile/src/hooks/use-study-flow.ts`
- Modify: `apps/mobile/src/use-cases/resume-or-start-study-session.ts` — vocabulary 路径 deprecated，story 保留

**Interfaces:**

- Consumes: Task 4 bookmark + preferences repos
- Produces:

```typescript
export async function resumePackBrowse(input: {
  packId: string;
  now?: Date;
}): Promise<{
  cards: PackCardRef[];       // 全量，不过滤
  initialKnowledgeId: string; // 由 packOpenPosition + bookmark 决定
}>;
```

**规则（ADR §3.1）：**

- `packOpenPosition='bookmark'` 且有书签 → 落书签
- `packOpenPosition='start'` 或无书签 → 第一课/列表顶
- 浏览推进时 `upsertPackBrowseBookmark`
- **不** 创建 SM-2 study session

- [ ] **Step 1: 写浏览落点测试（bookmark/start）**

- [ ] **Step 2: 实现 browse use case；story_reading 仍走原 session 逻辑**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- resume-pack-browse
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): pack browse mode with bookmark and open position preference"
```

---

### Task 9: Study Screen — 加入复习 / 已加复习 / 暂不

**Files:**

- Create: `apps/mobile/src/components/study/join-review-bar.tsx`
- Create: `apps/mobile/src/components/study/update-review-confirm-dialog.tsx`
- Modify: `apps/mobile/src/screens/study-screen.tsx`
- Modify: `apps/mobile/src/hooks/use-study-flow.ts`
- Remove/deprecate usage: `study-rating-bar.tsx`（vocabulary 路径）
- Modify: `apps/mobile/src/learning/card-types/registry.ts` — comment deprecated

**UI 行为（ADR §3.2）：**

- vocabulary + `reviewMode=sm2`：揭示后底部操作区
- **未在池**：**加入复习** → `joinReviewPool`；成功后可切为「已加复习」或进入下一张（待 UI 稿）
- **已在池**：按钮文案 **已加复习**（统一样式，可点击）
- 点 **已加复习** → `UpdateReviewConfirmDialog`（主旨 **更新复习**，说明：将用 **当前学习包** 的内容替换复习池中的该词，**复习进度清零**）
- 确认 → `updateReviewPoolFromPack`；取消 → 关闭
- **暂不** → `skipPackCard` + 下一张
- 去掉 SM-2 间隔 preview
- Story 阅读 UI **不变**

- [ ] **Step 1: join-review-bar 双态 + 确认框组件**

- [ ] **Step 2: hook 加载 `inReviewPool` 状态决定按钮文案**

- [ ] **Step 3: 手测：A 包加入 → B 包同词显示「已加复习」→ 更新后复习 Tab 来源变为 B 包**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): join and update review buttons in study screen"
```

---

### Task 10: Review Tab 屏 — Session + 限额设置

**Files:**

- Create: `apps/mobile/src/use-cases/resolve-review-card-context.ts`
- Create: `apps/mobile/src/use-cases/resolve-review-card-context.test.ts`
- Create: `apps/mobile/app/(shell)/review.tsx`
- Create: `apps/mobile/src/screens/review-screen.tsx`
- Create: `apps/mobile/src/components/review/review-outcome-bar.tsx`
- Create: `apps/mobile/src/components/review/review-source-pack-label.tsx`
- Create: `apps/mobile/src/hooks/use-review-flow.ts`

**UI（ADR §4）：**

- 顶区：`今日已练 X / 限额 Y`；`到期共 Z 词`；`今日新入池 N 词`（读 stats）
- 限额编辑：Stepper 或输入，1～999，写 `dailyReviewLimit`
- 空态：无到期词 → 引导去学习中加入复习
- 有 session：卡片上方/副标题展示 **来源学习包**（`ReviewSourcePackLabel`：如「来自《公主与豌豆》」）；卡面经 `resolveReviewCardContext` 从 `firstAddedFromPackId` 加载
- 卡片 + **记住了 / 还不熟** → `confirmReviewOutcome`
- Session 结束：完成面板，可返回

- [ ] **Step 1: 实现 `resolveReviewCardContext` + 来源包 label 组件**

- [ ] **Step 2: 实现 review screen + hook（每条带 sourcePackDisplayName）**

- [ ] **Step 3: 验证限额变更后 session 条数；跨 pack 词条来源名正确**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(mobile): review tab screen with daily limit setting"
```

---

### Task 11: 底栏 Capsule — 复习 Tab 与角标

**Files:**

- Modify: `apps/mobile/src/components/shell/capsule-bar.tsx`
- Modify: `apps/mobile/app/(shell)/_layout.tsx`
- Modify: `apps/mobile/src/shell/shell-tab-transition.ts`

**变更：**

- `CapsuleTab = 'library' | 'review' | 'market'`
- 中间按钮：复习图标（非 + 上传）；路由 `/review`
- 角标：`countDueReviewItems()`；0 时隐藏
- 移除「功能开发中」上传占位

- [ ] **Step 1: 扩展 Tab 类型与导航**

- [ ] **Step 2: 角标订阅（focus 时 refresh 或 lightweight poll）**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(mobile): capsule review tab with due count badge"
```

---

### Task 12: 设置页 — packOpenPosition

**Files:**

- Modify: `apps/mobile/src/screens/settings-screen.tsx`

**UI：**

- 学习偏好区块：「打开学习包时」→ 单选 **从书签继续** / **从开头开始**
- 读写 `user_preferences.packOpenPosition`

- [ ] **Step 1: 实现设置项**

- [ ] **Step 2: 与 Task 8 联调**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(mobile): pack open position preference in settings"
```

---

### Task 13: 书库概览 — 统计与文案

**Files:**

- Modify: `apps/mobile/src/use-cases/get-library-overview.ts`
- Modify: `apps/mobile/src/use-cases/get-library-overview.test.ts`（若有）
- Modify: `apps/mobile/src/lib/resolve-today-task-count.ts`

**变更（ADR §3.4）：**

- `study` 包：`statusHint` → 书签文案（「上次学到：…」），**不再**「今日待复习 N 条」
- `masteredCount` / `learningCount` → 基于 `boxLevel`（建议：boxLevel=3 且 due 远 → mastered；inReviewPool → learning）
- 全局 `todayTaskCount` / `hasActiveTask` → 对齐 **统一复习池到期数**（非 per-pack SM-2）
- `actionLabel`：已安装 study 包 →「打开学习」/「继续学习」（基于书签，非 session）

- [ ] **Step 1: 更新聚合逻辑 + 测试**

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(mobile): library overview for review pool and browse bookmarks"
```

---

### Task 14: 搜索页与 Story 词表 — 已加复习 / 更新

**Files:**

- Modify: `apps/mobile/src/screens/search-screen.tsx`
- 检查: `apps/mobile/src/learning/card-types/story_reading/` 词表组件

- [ ] **Step 1: 搜索「加入复习」：未在池 → join；已在池 → **已加复习** + 同 Task 9 更新确认框**

- [ ] **Step 2: Story 词表（若有入口）同 vocabulary 双态与更新流程**

- [ ] **Step 3: Commit**

```bash
git commit -m "fix(mobile): search and story use join/update review pool UX"
```

### Task 15: API / Prisma — Sync v2 与冲突合并

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_review_pool_fields/migration.sql`
- Modify: `apps/api/src/sync/sync.repository.ts`
- Modify: `apps/api/src/sync/sync.repository.test.ts`（若有）

**Prisma `LearningState` 增字段：** `inReviewPool`, `boxLevel`, `firstAddedFromPackId`, `lastSeenInPackId`, `consecutiveLevel3Passes`；legacy SM-2 字段保留只读。

**合并策略（ADR §7.2，替换纯 clientVersion LWW 用于这些字段）：**

- `boxLevel` → `min(a, b)`
- `dueAt` → 较早者
- `clientVersion` → 较高写入序
- 其余字段随 winning row

- [ ] **Step 1: migration + repository 测试（双机 merge 用例）**

- [ ] **Step 2: 移动端 `restore-learning-states-from-snapshot.ts` 适配 v2**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/api test -- sync
pnpm --filter @remember/mobile test -- restore-learning-states
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(api): sync review pool state with conservative merge"
```

---

### Task 16: 文档与废止旧计划

**Files:**

- Modify: `docs/decisions/0013-unified-review-pool-and-leitner-scheduler.md` — §13 链接本计划；去掉「ADR 大纲」脚注
- Modify: `docs/decisions/0012-card-type-registry.md` — `reviewMode: sm2` deprecated 说明
- Modify: `docs/superpowers/plans/2026-07-28-study-scheduler-and-session.md` — 顶部加 **Superseded by 2026-08-06-unified-review-pool.md**
- Modify: `docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md` — §8.2 / 胶囊 Tab 复习语义（最小 diff）
- Modify: `docs/runbooks/release-candidate-checklist.md` — 复习流程 RC 项

- [ ] **Step 1: 文档更新**

- [ ] **Step 2: Commit**

```bash
git commit -m "docs: unified review pool plan links and supersede sm2 scheduler"
```

---

### Task 17: 全量验证与 RC 门禁

**验收清单（ADR §10）：**

- [ ] 学习包：全量词可见；杀进程书签恢复；「暂不」不进池；设置切换 `packOpenPosition` 落点正确
- [ ] 同词两 pack：首次加入仅一条；B 包显示 **已加复习**；确认 **更新复习** 后档位清零、复习 Tab 来源改为 B 包
- [ ] 复习 Tab：仅到期词；「还不熟」→ 明日；「记住了」→ 档位表间隔；**每条可见来源学习包名**
- [ ] 修改 `dailyReviewLimit` 后 session 条数符合配额；超额 due 仍到期
- [ ] 今日首次入池计数正确；点「已加复习」/ **更新复习** 均不增加 joinedPoolCount
- [ ] 底栏角标 = 总到期数；Tab 内限额/进度正确
- [ ] 跨天、Asia/Shanghai「明天」正确
- [ ] 同步：双机入池 + 复习升档不丢、不重复（`boxLevel` 取低、`dueAt` 取早）
- [ ] Story 词表（若有）与 vocabulary 同一池
- [ ] V3→V4 迁移：有 SM-2 数据的测试库升级后 `inReviewPool`/`boxLevel` 合理

**自动化：**

```powershell
pnpm check
```

**实机（debug APK）：**

```powershell
# 项目脚本，按仓库现有 RC 流程
pnpm --filter @remember/mobile android
```

- [ ] **Step 1: 自动化全绿**

- [ ] **Step 2: 实机走查上述清单**

- [ ] **Step 3: 在 `docs/runbooks/release-candidate-checklist.md` 勾选完成项**

---

## 退出门禁

- `pnpm check` 全绿
- ADR §10 验收项实机通过
- 旧 SM-2 三按钮在 vocabulary 路径 **不可达**
- `/review` Tab 可完成至少 1 次完整复习 session
- 已登录用户 sync 上传/恢复快照含 v2 字段

---

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| Sync payload breaking 旧 APK | DB migration version gate；旧 APK 提示升级 |
| `study_sessions` 复用与 pack session 冲突 | `packId='__review_pool__'` 常量；启动复习前 complete 冲突 session（或互斥规则写测试） |
| SM-2 映射丢进度 | 映射表保守（偏高 boxLevel）；RC 前用真实测试库验证 |
| 本地 0:00 切日与旧 UTC SM-2 混用 | 迁移后统一 `local-review-day`；文档注明 |

---

## 相关文档

- ADR：[0013](../decisions/0013-unified-review-pool-and-leitner-scheduler.md)
- 废止：[2026-07-28-study-scheduler-and-session.md](./2026-07-28-study-scheduler-and-session.md)
- UI：`docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md`
- CardType：[0012](../decisions/0012-card-type-registry.md)
