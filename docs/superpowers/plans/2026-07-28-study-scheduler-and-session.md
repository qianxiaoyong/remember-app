# Study Scheduler and Session Implementation Plan

> **Superseded by [2026-08-06-unified-review-pool.md](./2026-08-06-unified-review-pool.md)**（ADR [0013](../../decisions/0013-unified-review-pool-and-leitner-scheduler.md)）。学习包内 SM-2 三按钮与按 pack session 调度 **不再实施**；保留本文仅供历史参考。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** SM-2 三按钮纯函数 + 单元测试；任务生成/继承（先恢复未完成会话）；作答同事务写入 `learning_states`、`study_queue_items`、`sync_outbox`。

**Architecture:** `packages/domain` 放 SM-2 与队列规划纯函数；mobile 用例 + 仓储适配 `user.sqlite`；页面经用例调用。

**Tech Stack:** `@remember/domain`、vitest、expo-sqlite 事务

## Global Constraints

- 三按钮：忘记 / 模糊 / 记得；动态间隔文案
- 打开 App：先恢复未完成任务 → 到期复习 → 补充当次新内容；缺席不累积每日新任务
- 作答确认：单事务更新 learning_states + queue + sync_outbox
- 页面不直连 SQL

---

### Task 1: packages/domain ReviewScheduler

- `applyReview(state, rating, now)` → 新 StudyState
- `previewReviewIntervals(state, now)` → 三档中文间隔文案
- `buildStudyQueuePlan(...)` → 队列规划（继承 pending 不重排）
- vitest 覆盖状态转移、跨天、缺席不堆叠新卡

### Task 2: mobile 仓储与用例

- learning-state / study-session / pack-card repositories
- `resumeOrStartStudySession(packId)`
- `confirmCardReview(packId, knowledgeId, rating)` 单事务

### Task 3: 最小学习页 dev 入口

- `/study` 路由：显示当前卡、三按钮间隔、进度
- 首页增加「开始学习」入口

### 退出门禁

- domain 测试全绿
- 实机/dev：学习 2+ 张 → 杀进程 → 队列恢复；跨天不因缺席堆叠新任务
