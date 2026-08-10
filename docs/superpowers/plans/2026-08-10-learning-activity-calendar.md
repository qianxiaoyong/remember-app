# 学习活动日历与家长检查模式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 [ADR 0014](../decisions/0014-learning-activity-calendar.md) 实现本地学习活动事件日志、首页横滑统计、抽屉 7×12 热力格 widget、学习日历页与家长检查模式；主学习/复习算法不变。

**Architecture:** `user.sqlite` V5 新增 append-only `learning_activity_events`；现有 use-case 成功路径末尾旁路 `insertActivityEvent`（try/catch 不 throw）；读路径经 `learning-activity-event-repository` 聚合；日历页与家长检查复用 `study-screen` / `review-screen` 组件，仅增量顶栏与浮窗导航。

**Tech Stack:** `@remember/domain`（`formatLocalReviewDate`、热力档位纯函数）、`@remember/contracts`（事件 enum + payload Zod）、`expo-sqlite`、Expo Router、vitest、TypeScript strict。

## Global Constraints

- 产品展示名「记得」；仓库 `remember-app`；行为以 **ADR 0014（已确认）** 为准。
- **旁路写事件：** 在既有 use-case **成功 commit 之后** 调用 `insertActivityEvent`；**失败只 log，不 throw**，不阻断学习/复习主流程。
- **事件不进 `sync_outbox`、不上传云端**；append-only；P1 **保留 1 年**不 purge。
- **首页概览卡禁止增加纵向高度：** 保留 `introRow` + `totalRow` + `statsRow`；`totalRow` 方案乙（`共 {totalCards} 条学习内容`）；`statsRow` 改横向 `ScrollView`，视口约 3 格宽。
- **热力格三档（按 `localDate` 聚合）：** 灰 = 无事件；浅绿 = 有学习类事件且无 `review_outcome`；深绿 = 有 ≥1 条 `review_outcome`。学习类 = `vocabulary_first_reveal` | `vocabulary_join_review` | `vocabulary_skip_review` | `story_completed`。
- **家长检查模式 UI 增量：** 顶栏同行状态行 + 内容区角落 ◀ ▶ 浮窗；**不改**底栏布局；复用同一 card UI 与 use-case。
- **`vocabulary_first_reveal` 幂等：** 每 `packId + knowledgeId` 一生最多一条。
- 页面/用例 **不直连 SQL**；走 repository。
- 文案对齐 ADR 附录 E：今日到期 / 复习中 / 记忆稳定 / 记住了 / 还不熟。
- 每 Task 结束跑列出的验证；合并前 `pnpm check` 全绿。
- 每 Task 一次 commit；不与其他 feature 混 PR。
- 正式实现遵循 `docs/ai-rules/` 与 `$build-learning-app`。

## 范围外（defer）

| 项                                    | 说明                 |
| ------------------------------------- | -------------------- |
| `learning_activity_daily_rollup` 曲线 | ADR 附录 D；P2       |
| 事件云端同步                          | 新 ADR；P1 不做      |
| 听写/跟读/做题 modality               | enum 预留；P1 不写入 |
| 独立「数据统计」二级页                | ADR §3.1 明确不做    |
| 事件超 1 年 purge                     | P2                   |
| 首页格长按 ⓘ 说明                     | P1.1 可选            |

## 依赖与实施顺序

```text
Task 1 contracts ──► Task 2 schema ──► Task 3 domain heat ──► Task 4 repository
Task 4 ──► Task 5 hooks（写入旁路）
Task 4 ──► Task 6 calendar queries（日明细 / 90 天聚合）
Task 5,6 + 现有 repos ──► Task 7 首页概览
Task 6 ──► Task 8 抽屉 widget
Task 6 ──► Task 9 学习日历页
Task 5,9 ──► Task 10 家长检查模式
Task 11 RC
```

---

## 文件结构（完成后）

```text
docs/decisions/0014-learning-activity-calendar.md                    # 已确认

packages/contracts/src/activity/
  learning-activity-event-type.ts                                    # enum + payload Zod
  learning-activity-event-type.test.ts
  index.ts

packages/domain/src/
  learning-activity-heat-level.ts                                    # 三档判定纯函数
  learning-activity-heat-level.test.ts
  classify-vocabulary-first-reveal.ts                                # 待处理/已加入/暂不
  classify-vocabulary-first-reveal.test.ts

apps/mobile/src/data/user-db/
  user-db-schema.ts                                                  # USER_DB_VERSION = 5
  user-db-schema.test.ts

apps/mobile/src/data/repositories/
  learning-activity-event-repository.ts
  learning-activity-event-repository.test.ts

apps/mobile/src/use-cases/
  insert-activity-event.ts                                           # 旁路 insert + 幂等
  insert-activity-event.test.ts
  get-learning-activity-summary.ts                                   # 90 天三数字 + 热力格
  get-learning-activity-summary.test.ts
  get-learning-calendar-day-detail.ts                                # 选中日三分组
  get-learning-calendar-day-detail.test.ts
  get-library-overview.ts                                            # 扩展横滑格字段
  join-review-pool.ts                                                # + 事件钩子
  update-review-pool-from-pack.ts                                    # + 事件钩子
  skip-pack-card.ts                                                  # + 事件钩子
  confirm-review-outcome.ts                                          # + 事件钩子
  record-vocabulary-first-reveal.ts                                  # reveal 钩子

apps/mobile/src/components/
  library/library-overview-card.tsx                                  # 横滑 statsRow
  shell/learning-calendar-widget.tsx                                 # 抽屉卡片
  calendar/learning-calendar-month.tsx
  calendar/learning-calendar-day-detail.tsx
  calendar/inspect-mode-chrome.tsx                                   # 顶栏 + 浮窗

apps/mobile/src/screens/
  learning-calendar-screen.tsx
  study-screen.tsx                                                   # inspect query 分支
  review-screen.tsx                                                  # inspect query 分支

apps/mobile/app/
  learning-calendar.tsx

apps/mobile/src/shell/
  drawer-menu-config.ts                                              # （widget 在 app-drawer 内，非 menu item）
```

---

### Task 1: Contracts — 事件 enum 与 payload

**Files:**

- Create: `packages/contracts/src/activity/learning-activity-event-type.ts`
- Create: `packages/contracts/src/activity/learning-activity-event-type.test.ts`
- Create: `packages/contracts/src/activity/index.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**

- `LearningActivityEventType` 常量（ADR 附录 B.1）
- `activityPayloadBaseSchema`、`vocabularyFirstRevealPayloadSchema`、`reviewOutcomePayloadSchema` 等
- `parseActivityPayload(eventType, json)` 严格校验

- [ ] **Step 1: 写 payload 解析测试**

- [ ] **Step 2: 实现 schema + 导出**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/contracts test -- learning-activity-event
pnpm --filter @remember/contracts typecheck
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(contracts): learning activity event types and payloads"
```

---

### Task 2: user.sqlite V5 — learning_activity_events 表

**Files:**

- Modify: `apps/mobile/src/data/user-db/user-db-schema.ts`
- Modify: `apps/mobile/src/data/user-db/user-db-schema.test.ts`

**Interfaces:**

- `USER_DB_VERSION = 5`
- `MIGRATION_V5_SQL`：ADR §7.1 表 + 4 索引
- `USER_DB_TABLE_NAMES` 追加 `learning_activity_events`

- [ ] **Step 1: 写 schema 测试（版本号、表名、索引）**

- [ ] **Step 2: 实现 V5 迁移**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- user-db-schema
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): user.sqlite v5 learning activity events table"
```

---

### Task 3: Domain — 热力三档与待处理子类分类

**Files:**

- Create: `packages/domain/src/learning-activity-heat-level.ts`
- Create: `packages/domain/src/learning-activity-heat-level.test.ts`
- Create: `packages/domain/src/classify-vocabulary-first-reveal.ts`
- Create: `packages/domain/src/classify-vocabulary-first-reveal.test.ts`
- Modify: `packages/domain/src/index.ts`

**Interfaces:**

- `type HeatLevel = 0 | 1 | 2`
- `calculateHeatLevel(eventTypes: string[]): HeatLevel` — ADR §4.3 三档
- `type FirstRevealSubCategory = 'pending' | 'joined_review' | 'skipped'`
- `classifyFirstRevealSubCategory(events: { eventType: string }[]): FirstRevealSubCategory` — ADR §5.3

- [ ] **Step 1: 写 failing tests（三档边界、待处理判定）**

- [ ] **Step 2: 实现纯函数**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/domain test -- learning-activity-heat
pnpm --filter @remember/domain test -- classify-vocabulary-first-reveal
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(domain): heat level and first-reveal subcategory classifiers"
```

---

### Task 4: Repository — learning_activity_events

**Files:**

- Create: `apps/mobile/src/data/repositories/learning-activity-event-repository.ts`
- Create: `apps/mobile/src/data/repositories/learning-activity-event-repository.test.ts`
- Create: `apps/mobile/src/use-cases/insert-activity-event.ts`
- Create: `apps/mobile/src/use-cases/insert-activity-event.test.ts`

**Interfaces:**

- `insertActivityEvent(input)` — 普通 insert；`first_reveal` 前查 `(packId, knowledgeId, eventType)` 存在则 skip
- `hasFirstRevealEvent(packId, knowledgeId): boolean`
- `listEventsByLocalDate(localDate): ActivityEventRow[]`
- `listEventsInDateRange(startDate, endDate): ActivityEventRow[]` — 含 eventType 供聚合
- `countDistinctActiveDays(startDate, endDate): number`
- `countEventsByTypeInRange(eventType, startDate, endDate): number`

- [ ] **Step 1: 写 repository + first_reveal 幂等测试**

- [ ] **Step 2: 实现 repository + insert use-case（失败 catch + console.warn）**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- learning-activity-event
pnpm --filter @remember/mobile test -- insert-activity-event
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): learning activity event repository and insert use-case"
```

---

### Task 5: 写入钩子 — use-case 旁路

**Files:**

- Create: `apps/mobile/src/use-cases/record-vocabulary-first-reveal.ts`
- Modify: `apps/mobile/src/hooks/use-study-flow.ts` 或 `study-screen.tsx` — reveal 时调 record
- Modify: `apps/mobile/src/use-cases/join-review-pool.ts`
- Modify: `apps/mobile/src/use-cases/update-review-pool-from-pack.ts`
- Modify: `apps/mobile/src/use-cases/skip-pack-card.ts`
- Modify: `apps/mobile/src/use-cases/confirm-review-outcome.ts`
- Create/Modify: 对应 `.test.ts`

**规则（ADR §8）：**

| eventType                 | 触发点                                                                   | payload                                               |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| `vocabulary_first_reveal` | 首次 `revealed=true`                                                     | `{ sortOrder? }`                                      |
| `vocabulary_join_review`  | join / update 成功                                                       | `{ sortOrder?, created? }`                            |
| `vocabulary_skip_review`  | skip 成功                                                                | `{ sortOrder? }`                                      |
| `review_outcome`          | confirmReviewOutcome 成功                                                | `{ outcome, modality: 'vocabulary', boxLevelAfter? }` |
| `story_completed`         | **若 reader 已有完课信号则挂钩**；否则本 Task 末留 TODO + 测试 `it.skip` | `{ positionMs?, durationMs? }`                        |

- `displayLabel`：vocabulary 用 headword；story 用课标题
- 可选 `payload.source = 'calendar_inspect'`（Task 10）

- [ ] **Step 1: 写 join/skip/review/first_reveal 钩子测试**

- [ ] **Step 2: 实现钩子（try/catch 包裹 insert）**

- [ ] **Step 3: story_completed：搜索 reader 完课信号；无则 TODO + skip 测试**

- [ ] **Step 4: 验证**

```powershell
pnpm --filter @remember/mobile test -- join-review-pool
pnpm --filter @remember/mobile test -- skip-pack-card
pnpm --filter @remember/mobile test -- confirm-review-outcome
pnpm --filter @remember/mobile test -- record-vocabulary-first-reveal
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(mobile): activity event hooks on study and review use-cases"
```

---

### Task 6: 读用例 — 90 天摘要与日明细

**Files:**

- Create: `apps/mobile/src/use-cases/get-learning-activity-summary.ts`
- Create: `apps/mobile/src/use-cases/get-learning-activity-summary.test.ts`
- Create: `apps/mobile/src/use-cases/get-learning-calendar-day-detail.ts`
- Create: `apps/mobile/src/use-cases/get-learning-calendar-day-detail.test.ts`

**Interfaces:**

- `getLearningActivitySummary(now?)` → `{ activeDays, firstRevealCount, reviewOutcomeCount, heatGrid: HeatCell[][] }`
  - `heatGrid`：7 行（Mon–Sun）× 12 列（周），最右列当前周；每格 `{ localDate, level: 0|1|2 }`
- `getLearningCalendarDayDetail(localDate)` → 新接触（pending/joined/skipped 计数 + 条目列表）、复习（remembered/not_familiar）、短文（story_completed）

- [ ] **Step 1: 写聚合测试（三数字、热力格、日明细分组）**

- [ ] **Step 2: 实现**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- get-learning-activity-summary
pnpm --filter @remember/mobile test -- get-learning-calendar-day-detail
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): learning activity summary and calendar day detail"
```

---

### Task 7: 首页概览 — 横滑 statsRow

**Files:**

- Modify: `apps/mobile/src/use-cases/get-library-overview.ts`
- Modify: `apps/mobile/src/use-cases/get-library-overview.test.ts`（若有）
- Modify: `apps/mobile/src/components/library/library-overview-card.tsx`

**变更（ADR 附录 A）：**

- 扩展 `LibraryOverview`：`todayDueCount`、`todayReviewCompleted`、`installedPackCount`、`reviewPoolTotal`、`reviewPoolLearning`、`reviewPoolStable`、`todayJoinedPool`
- `totalRow` 不变；`statsRow` → 横向 `ScrollView`，格宽约 1/3 屏宽，顺序见附录 A
- 标签：今日到期 / 今日已复习 / 已安装 / 复习池中 / 复习中 / 记忆稳定 / 今日新入池
- `todayReviewCompleted` 可格式化为 `{n}/{dailyLimit}`

- [ ] **Step 1: 扩展聚合 + 测试**

- [ ] **Step 2: UI 横滑 StatTile，高度与现版一致**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- get-library-overview
pnpm --filter @remember/mobile lint
pnpm --filter @remember/mobile typecheck
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): library overview horizontal stats per ADR 0014"
```

---

### Task 8: 抽屉 — 学习日历 widget

**Files:**

- Create: `apps/mobile/src/components/shell/learning-calendar-widget.tsx`
- Modify: `apps/mobile/src/components/shell/app-drawer.tsx`

**UI（ADR 附录 C.1）：**

- 位置：抽屉 ScrollView 内、常用功能块 **之上**（「学习」区顶部卡片）
- 三数字 + 7×12 热力格 + 月份标签 + 「查看全部 ›」
- 点击格 → `/learning-calendar?localDate=YYYY-MM-DD`
- 「查看全部 ›」→ `/learning-calendar`（默认今天）
- 今天格可选描边

- [ ] **Step 1: 实现 widget 组件**

- [ ] **Step 2: 嵌入 app-drawer**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile lint
pnpm --filter @remember/mobile typecheck
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): drawer learning calendar widget with heat grid"
```

---

### Task 9: 学习日历页

**Files:**

- Create: `apps/mobile/app/learning-calendar.tsx`
- Create: `apps/mobile/src/screens/learning-calendar-screen.tsx`
- Create: `apps/mobile/src/components/calendar/learning-calendar-month.tsx`
- Create: `apps/mobile/src/components/calendar/learning-calendar-day-detail.tsx`

**UI（ADR 附录 C.2）：**

- 月历 + 选中日高亮；格内可选三档小点
- 选中日明细：新接触 / 复习 / 短文 三组 + 子类计数
- **不放**首页汇总统计
- 各组「检查 ›」→ 家长检查路由（Task 10）

- [ ] **Step 1: 路由 + screen 骨架**

- [ ] **Step 2: 月历与日明细组件**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile lint
pnpm --filter @remember/mobile typecheck
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): learning calendar page with day detail"
```

---

### Task 10: 家长检查模式

**Files:**

- Create: `apps/mobile/src/components/calendar/inspect-mode-chrome.tsx`
- Create: `apps/mobile/src/use-cases/build-inspect-queue.ts`
- Create: `apps/mobile/src/use-cases/build-inspect-queue.test.ts`
- Modify: `apps/mobile/src/screens/study-screen.tsx`
- Modify: `apps/mobile/src/screens/review-screen.tsx`
- Modify: `apps/mobile/app/study.tsx` / `review.tsx`（query 透传）

**路由 query：**

```text
/study?packId=&knowledgeId=&inspect=1&localDate=&category=&subCategory=&index=
/review?…（复习类 subCategory）
```

- 复用现有 panel + 底栏；顶栏：`家长检查 · {date} · {子类} · {index}/{total}`
- 浮窗 ◀ ▶ 切换队列；按钮仍调 join/skip/confirm use-case
- 检查模式写事件时 `payload.source = 'calendar_inspect'`
- `confirmReviewOutcome` 在 inspect 模式：**不依赖 active review session**（扩展 input 或 inspect 专用 confirm 包装）

- [ ] **Step 1: buildInspectQueue + 测试**

- [ ] **Step 2: inspect chrome + study/review 分支**

- [ ] **Step 3: 验证**

```powershell
pnpm --filter @remember/mobile test -- build-inspect-queue
pnpm --filter @remember/mobile lint
pnpm --filter @remember/mobile typecheck
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(mobile): parent inspect mode reusing study and review screens"
```

---

### Task 11: 全量验证与 RC 门禁

**验收清单（ADR §10）：**

- [ ] 首页概览卡高度与现版一致；统计格可横滑；口径与附录 A 一致
- [ ] 抽屉 widget：三数字 + 7×12 三档热力格；点击进日历页
- [ ] 学习日历页：月历 + 日明细三分组；无首页汇总统计
- [ ] 家长检查：顶栏 + 浮窗；UI 与学/复习页一致；按钮走原 use-case
- [ ] `vocabulary_first_reveal` 每 packId+knowledgeId 仅一条
- [ ] 事件不进 sync_outbox

**自动化：**

```powershell
pnpm check
pnpm --filter @remember/mobile test
pnpm --filter @remember/mobile lint
pnpm --filter @remember/mobile typecheck
```

- [ ] **Step 1: 自动化全绿**

- [ ] **Step 2: 实机走查（可选）**

---

## 退出门禁

- `pnpm check` 全绿
- ADR §10 验收项通过
- 事件表 append-only、本地 only
- 首页纵向高度未增加

---

## 风险与缓解

| 风险                                         | 缓解                                               |
| -------------------------------------------- | -------------------------------------------------- |
| 旁路 insert 失败静默                         | 单元测试 + 开发环境 console.warn                   |
| inspect 模式 confirmReviewOutcome 需 session | 扩展 use-case 支持 `inspectMode` 跳过 session 校验 |
| story 完课信号未就绪                         | Task 5 TODO + skip 测试；Plan 已注明               |
| 90 天 scan 性能                              | P1 数据量小；索引 `localDate`；P2 rollup           |

---

## 相关文档

- ADR：[0014](../decisions/0014-learning-activity-calendar.md)
- 依赖：[0013](../decisions/0013-unified-review-pool-and-leitner-scheduler.md)
- UI：`docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md` §9
