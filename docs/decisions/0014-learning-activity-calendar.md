# 0014 学习活动日历与家长检查模式

日期：2026-08-10  
状态：**已确认**（2026-08-10 产品定稿：totalRow 方案乙、热力格三档、事件表 1 年保留）  
关联：ADR [0013](./0013-unified-review-pool-and-leitner-scheduler.md)（复习池 / 加入复习·暂不）、[0012](./0012-card-type-registry.md)（cardType / reader）；UI 规范 §9 抽屉、[story-reading 设计](../superpowers/specs/2026-08-02-story-reading-design.md)（短文完课）

---

## 1. 背景

### 1.1 问题

- 首页概览三格（待复习 / 学习中 / 已掌握）与包行进度 **口径混用**，用户难以理解（见产品讨论 2026-08-09）。
- 家长需要 **按日追溯** 孩子学了哪些包、哪些词、复习标记是否准确；现有 `review_daily_stats` 仅有日计数，**无词条级历史**。
- 书签、`learning_states` 只保留 **当前态**，无法回答「8 月 9 日学了什么」。

### 1.2 目标

| 目标 | 说明                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| G1   | **首页**保持现有概览卡 **布局与高度**，仅替换/扩展 **统计数据**；指标过多时 **横向滑动**，不增加首屏纵向空间                  |
| G2   | **抽屉**嵌入「学习日历」widget（近 90 天 **三数字 + 7×12 热力格**），作为主入口                                               |
| G3   | **学习日历页**：真月历 + 选中日 **进度明细**（非汇总统计）；可进入 **家长检查模式**                                           |
| G4   | **家长检查**复用现有学习/复习/阅读 **同一套 UI 与算法**；仅队列改为 **手动上/下条**；顶栏与内容区 **最小增量**（角标 + 浮窗） |
| G5   | **本地事件日志**支撑日历；**不同步云端**（第一期）；保留现有 `learning_states` / 书签 / `review_daily_stats`                  |

### 1.3 非目标（本 ADR）

- 不替代 `learning_states` 的调度职责；不写 SM-2 新算法。
- 不做云端同步、家长端独立 App、学习进度曲线图（可 P2 从事件 rollup）。
- 不改造 pack 协议（0008）。
- 第一期不做听写/跟读/做题 modality（仅预留 enum）。

---

## 2. 决策概览

```text
┌──────────────────┐     append      ┌─────────────────────────────┐
│ 现有学习/复习流   │ ──────────────► │ learning_activity_events     │
│ (算法不变)        │                 │ 本地、append-only、可日历查询  │
└──────────────────┘                 └───────────┬─────────────────┘
                                                   │
         ┌─────────────────────────────────────────┼──────────────────────┐
         ▼                     ▼                   ▼                      ▼
  首页概览（聚合）      抽屉 7×12 热力格      学习日历页（月历+日明细）   家长检查（复用 study/review UI）
  learning_states 等   近90天三数字          仅进度、无首页统计           手动队列 + 顶栏/浮窗
```

**解耦原则：** 主流程在既有 use-case **成功路径末尾** 旁路 `insertActivityEvent`；失败 **不阻断** 学习/复习。读路径：首页统计仍可从 `learning_states` + 包内容聚合；日历 **只读事件表**。

---

## 3. 首页概览统计

### 3.1 布局约束

- 保留：`introRow`（logo + 文案）、`totalRow`（一行主文案）、`statsRow`（统计格区域）。
- **禁止**增加 intro/total 之外的纵向区块高度。
- `statsRow` 改为 **横向 `ScrollView`**：视口内仍约 **3 格宽**，左右滑显示更多格。
- **不设**独立「数据统计二级页」（除非未来指标 >8 且需长说明；届时再 ADR 修订）。

### 3.2 首页格字段清单

见 **附录 A**。实现时 `LibraryOverview` 扩展字段或 `StatTileConfig[]` 驱动渲染。

**`totalRow` 文案（已确认 · 方案乙）：** 维持现 UI — `共 {totalCards} 条学习内容`（大号数字在 totalRow）。**今日到期** 等指标放入横滑格（见附录 A）。

### 3.3 指标说明

- 横滑格 **长按或 ⓘ** 可弹出简短说明（可选 P1.1）；不在首页展开长文。

---

## 4. 抽屉 · 学习日历 widget

### 4.1 位置

- 抽屉 **「学习」分组** 顶部独立卡片：**学习日历**（可点击整卡进学习日历页）。
- 卡片内嵌：**三数字 + 7×12 热力格 + 月份标签 + 「查看全部 ›」**。

### 4.2 三数字（近 90 天，设备本地时区）

| 标签         | 计算                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **学习天数** | 近 90 天内 `learning_activity_events` 按 `localDate` **去重** 的天数                                 |
| **新接触**   | 近 90 天内 `eventType = vocabulary_first_reveal` 的 **事件条数**（每 packId+knowledgeId 一生最多 1） |
| **复习词数** | 近 90 天内 `eventType = review_outcome` 的 **事件条数**                                              |

### 4.3 热力格（7×12）

- **7 行** = 周一至周日；**12 列** ≈ 12 周 ≈ 84 天（与近 90 天对齐，最右列为当前周）。
- **三档颜色（P1，已确认）：**

| 档位 | 颜色     | 判定（按 `localDate` 聚合当日事件）                         |
| ---- | -------- | ----------------------------------------------------------- |
| 0    | **灰**   | 无任何事件                                                  |
| 1    | **浅绿** | 有 **学习类** 事件，且 **无** `review_outcome`              |
| 2    | **深绿** | 有 **≥1** 条 `review_outcome`（可与学习类同日并存，取深绿） |

**学习类事件：** `vocabulary_first_reveal`、`vocabulary_join_review`、`vocabulary_skip_review`、`story_completed`。

- 可选：**今天** 额外描边（不改变档位色）。
- 点击某一格 → 学习日历页并 **选中对应 `localDate`**。
- 「查看全部 ›」→ 学习日历页（默认选中今天）。

线框见 **附录 C.1**。

---

## 5. 学习日历页

### 5.1 内容边界

- **仅展示进度类明细**（来自 `learning_activity_events` + 按日聚合）。
- **不展示**首页那套汇总统计（内容总量、复习池总数等）。

### 5.2 月历

- 标准 **月视图**；选中日高亮。
- 月历格可沿用热力 **三档** 小点（可选，与抽屉一致）。

### 5.3 选中日明细结构

**新接触**（`vocabulary_first_reveal` 及后续决策事件）子类：

| 子类           | 判定                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| **待处理**     | 已有 `vocabulary_first_reveal`，且同日（或截至日末）无 `vocabulary_join_review` / `vocabulary_skip_review` |
| **已加入复习** | 有 `vocabulary_join_review`（含学习流内加入、家长检查模式内补加）                                          |
| **暂不**       | 有 `vocabulary_skip_review`                                                                                |

**复习**（`review_outcome`）子类：

| 子类       | `payload.outcome` |
| ---------- | ----------------- |
| **记住了** | `remembered`      |
| **还不熟** | `not_familiar`    |

**短文**（P1 若 story 钩子就绪）：

| 子类       | 事件              |
| ---------- | ----------------- |
| **已听完** | `story_completed` |

每组右侧 **「检查 ›」** → 进入家长检查模式（§6），传入 `localDate` + `category` + 子类。

线框见 **附录 C.2**。

---

## 6. 家长检查模式

### 6.1 原则

- **与正常学习/复习/阅读同一页面组件**（`VocabularyStudyPanel`、复习 Tab 同一 card UI、Story reader shell）。
- **不改变** 既有布局：底栏按钮位置、回忆/展开交互 **不变**。
- **算法一致**：「加入复习 / 暂不 / 记住了 / 还不熟」调用 **现有 use-case**，更新 `learning_states`、复习池、Leitner、`review_daily_stats` 等同真学习。
- **唯一差异**：**不绑定** `study_sessions` / 复习 session 自动队列；条目列表来自 **日历筛选结果**，通过 **手动上/下条** 切换。

### 6.2 UI 增量（仅两处）

| 位置                           | 元素                                                |
| ------------------------------ | --------------------------------------------------- |
| **顶栏**（与返回同一行）       | `家长检查 · {localDate} · {子类} · {index}/{total}` |
| **内容区浮窗**（角落，小图标） | `上一条` / `下一条`；不占用底栏                     |

- 可选：顶栏或浮窗旁 **极小号**「检查」角标（icon），不挡 headword。
- **禁止**：底部新增大条导航；禁止缩略版/简化 card。

### 6.3 路由参数（示意）

```text
/study?packId=&knowledgeId=&inspect=1&inspectListId=&index=
/review?…（若复用 review 路由则同等 query）
```

`inspectListId`：服务端无；客户端用 `(localDate, category, subCategory)` 缓存列表 id 或 serialized query。

### 6.4 检查模式下的写事件

- 家长点击「加入复习 / 暂不 / 记住了 / 还不熟」→ **正常 use-case** + **追加** `learning_activity_events`（同 eventType，`payload.source = calendar_inspect` 可选，便于分析）。
- `vocabulary_first_reveal` **不因检查模式重复写入**（仍一生一条）。

线框见 **附录 C.3**。

---

## 7. 数据：learning_activity_events

### 7.1 表结构（user.sqlite v5，待实现）

```sql
CREATE TABLE learning_activity_events (
  eventId TEXT NOT NULL PRIMARY KEY,
  localDate TEXT NOT NULL,
  occurredAt TEXT NOT NULL,
  eventType TEXT NOT NULL,
  packId TEXT NOT NULL,
  knowledgeId TEXT,
  displayLabel TEXT,
  payload TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_activity_local_date ON learning_activity_events (localDate);
CREATE INDEX idx_activity_pack_date ON learning_activity_events (packId, localDate);
CREATE INDEX idx_activity_type_date ON learning_activity_events (eventType, localDate);
CREATE INDEX idx_activity_knowledge ON learning_activity_events (packId, knowledgeId);
```

- `localDate`：`YYYY-MM-DD`，设备本地时区（与 `review_daily_stats` 一致）。
- `displayLabel`：冗余 headword / 课名，列表展示免开 pack。
- `payload`：JSON，见 **附录 B**。

### 7.2 保留策略（已确认）

- P1：**至少保留 1 年**，不自动删除；超出 1 年的归档策略留 P2（**附录 D** rollup 或按 `localDate` purge）。
- 事件 **不进** `sync_outbox`、不上传云端。

### 7.3 与 review_daily_stats

- **双写（P1）：** 复习完成、入池仍维护 `review_daily_stats` 供首页快查；事件表供日历。
- 不在 P1 从事件表反推取代 `review_daily_stats`。

---

## 8. 写入时机（钩子）

| eventType                 | 触发点（现有 use-case / UI）                       | 幂等                           |
| ------------------------- | -------------------------------------------------- | ------------------------------ |
| `vocabulary_first_reveal` | 首次 `revealed=true`（该 packId+knowledgeId）      | **一生一条**                   |
| `vocabulary_join_review`  | `joinReviewPool` / `updateReviewPoolFromPack` 成功 | 每次操作一条                   |
| `vocabulary_skip_review`  | `skipPackCard` 成功                                | 每次操作一条                   |
| `review_outcome`          | `confirmReviewOutcome` 成功                        | 每次一条                       |
| `story_completed`         | 短文完课（story 设计 § 完课条件）                  | 每课一条（packId+knowledgeId） |

写入失败：**记录日志，不 throw**。

---

## 9. 未来扩展

| 扩展               | 方式                                                   |
| ------------------ | ------------------------------------------------------ |
| 听写/跟读/做题复习 | `review_outcome.payload.modality` 新枚举值；日历多子组 |
| 跟读/做题学习      | 新 `eventType` 或 `learning_completed` + modality      |
| 进度曲线           | `learning_activity_daily_rollup` 由事件聚合（附录 D）  |
| 云端同步           | 新 ADR；**不在 P1**                                    |

---

## 10. 验收标准（P1）

- [ ] 首页概览卡高度与现版一致；统计格可横滑；数字口径与附录 A 一致。
- [ ] 抽屉学习日历 widget：三数字 + 7×12 **三档**热力格（灰 / 浅绿 / 深绿）；点击进日历页。
- [ ] 学习日历页：月历 + 日明细三分组；无首页汇总统计。
- [ ] 家长检查：顶栏状态 + 浮窗上/下条；UI 与学与复习页一致；按钮走原 use-case。
- [ ] `vocabulary_first_reveal` 每 packId+knowledgeId 仅一条。
- [ ] 事件表本地可查近 90 天；**不上传** sync_outbox。

---

## 附录 A：首页横滑格字段清单

### A.1 数据字段（`LibraryOverview` 扩展建议）

| 字段 key               | 展示标签   | 单位 | 数据来源                                                          | 默认露出顺序    |
| ---------------------- | ---------- | ---- | ----------------------------------------------------------------- | --------------- |
| `todayDueCount`        | 今日到期   | 条   | `countDueReviewItems`                                             | 1               |
| `todayReviewCompleted` | 今日已复习 | 条   | `review_daily_stats.reviewCompletedCount` / limit 可选展示 `8/20` | 2               |
| `installedPackCount`   | 已安装     | 本   | `listInstalledPacks().length`                                     | 3               |
| `reviewPoolTotal`      | 复习池中   | 条   | `inReviewPool` count                                              | 4               |
| `reviewPoolLearning`   | 复习中     | 条   | 0013 `learningCount` 聚合                                         | 5               |
| `reviewPoolStable`     | 记忆稳定   | 条   | 0013 `masteredCount` 聚合                                         | 6               |
| `todayJoinedPool`      | 今日新入池 | 词   | `review_daily_stats.joinedPoolCount`                              | 7（可选，靠后） |

**不在横滑格：** `totalCards` — 固定在 **totalRow**（方案乙）。

### A.2 totalRow（已确认 · 方案乙）

| totalRow                                             | 横滑格                             |
| ---------------------------------------------------- | ---------------------------------- |
| `共 {totalCards} 条学习内容`（维持现 UI 结构与字号） | 含 **今日到期** 为首格，其余见上表 |

### A.3 展示规则

- 每格：`label` + `value` + 单位（与现 `StatTile` 相同）。
- `todayReviewCompleted` 可格式化为 `{n}/{dailyLimit}`，单位仍用「条」或改为「词」— 产品统一用 **「条」**。
- 滑动指示：可选底部小圆点（P1.1）；P1 可仅依赖横滑边缘裁切。

---

## 附录 B：事件 enum 与 payload

### B.1 eventType 枚举（第一期）

```typescript
/** user.sqlite learning_activity_events.eventType — 第一期冻结 */
export const LearningActivityEventType = {
  /** 单词：该 pack 内首次展开答案（packId+knowledgeId 一生一条） */
  VOCABULARY_FIRST_REVEAL: 'vocabulary_first_reveal',
  /** 单词：用户点击「加入复习」或「更新复习」成功 */
  VOCABULARY_JOIN_REVIEW: 'vocabulary_join_review',
  /** 单词：用户点击「暂不」成功 */
  VOCABULARY_SKIP_REVIEW: 'vocabulary_skip_review',
  /** 复习：用户点击「记住了」或「还不熟」成功 */
  REVIEW_OUTCOME: 'review_outcome',
  /** 短文：完全听完（见 story-reading 完课定义） */
  STORY_COMPLETED: 'story_completed',
} as const;

export type LearningActivityEventType =
  (typeof LearningActivityEventType)[keyof typeof LearningActivityEventType];
```

### B.2 预留（不在 P1 写入）

```typescript
/** 未来 modality / 事件 — 仅文档预留，实现时另开 ADR 修订 */
export const LearningActivityEventTypeFuture = {
  REVIEW_DICTATION_OUTCOME: 'review_dictation_outcome',
  REVIEW_SHADOW_READ_OUTCOME: 'review_shadow_read_outcome',
  CHOICE_ANSWERED: 'choice_answered',
} as const;
```

### B.3 payload schema（JSON）

**公共可选键：**

```typescript
interface ActivityPayloadBase {
  /** 可选：calendar_inspect | browse | review_tab */
  source?: 'browse' | 'review_tab' | 'calendar_inspect';
}
```

**按 eventType：**

| eventType                 | payload 字段                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `vocabulary_first_reveal` | `{ sortOrder?: number }`                                                                      |
| `vocabulary_join_review`  | `{ sortOrder?: number; created?: boolean }` — `created` 区分新建 vs 更新复习                  |
| `vocabulary_skip_review`  | `{ sortOrder?: number }`                                                                      |
| `review_outcome`          | `{ outcome: 'remembered' \| 'not_familiar'; modality: 'vocabulary'; boxLevelAfter?: number }` |
| `story_completed`         | `{ positionMs?: number; durationMs?: number }`                                                |

**review_outcome.outcome 与 UI：**

| UI     | payload.outcome | 底层 use-case                    |
| ------ | --------------- | -------------------------------- |
| 记住了 | `remembered`    | `confirmReviewOutcome('passed')` |
| 还不熟 | `not_familiar`  | `confirmReviewOutcome('failed')` |

**未来 modality：** `vocabulary` \| `dictation` \| `shadow_read` \| `choice` …

### B.4 displayLabel

- vocabulary：`prompt.headword`
- story：课标题或 `Lesson {n}`（来自 card content）

---

## 附录 C：线框定稿

### C.1 抽屉 · 学习日历 widget

```text
┌─ 抽屉 ─────────────────────────────────────────────┐
│ [头像] 监护人账号                                    │
├────────────────────────────────────────────────────┤
│ ┌─ 学习日历 ──────────────────── 查看全部 › ─┐    │
│ │  18        42         36                    │    │
│ │  学习天数   新接触     复习词数   （近90天）  │    │
│ │                                             │    │
│ │  ░ ░ ▒ ░ ░ ▓ ▒   ░ ▒ ░ ░ ▓ ░   … (7×12)   │    │
│ │  ░ ▒ ░ ░ ▓ ░ ░   ▓ ░ ▒ ░ ░ ░ ▓             │    │
│ │  …（7 行 × 12 列，Mon–Sun）                  │    │
│ │       6月        7月        8月              │    │
│ └─────────────────────────────────────────────┘    │
│  常用功能 …                                         │
│  下载管理 / 收藏本 / …                              │
└────────────────────────────────────────────────────┘

图例：░ 灰=无记录   ▒ 浅绿=有学习无复习   ▓ 深绿=有复习
```

### C.2 学习日历页

```text
┌─ ←  学习日历 ──────────────────────────────────────┐
│              ‹    2026 年 8 月    ›                 │
│  日   一   二   三   四   五   六                    │
│                          1    2    3    4    5     │
│   6    7    8   [9]  10   11   12                  │
│  …                                                  │
├─────────────────────────────────────────────────────┤
│  8月9日  周六                                       │
│                                                     │
│  ▼ 新接触  12                                       │
│     待处理 3 · 已加入复习 5 · 暂不 4      [ 检查 › ] │
│                                                     │
│  ▼ 复习  8                                          │
│     记住了 6 · 还不熟 2                   [ 检查 › ] │
│                                                     │
│  ▼ 短文  1                                          │
│     《童话故事》第 3 课 已听完            [ 检查 › ] │
└─────────────────────────────────────────────────────┘
```

### C.3 家长检查 · vocabulary（与学包页同构）

```text
┌─ ← 返回    家长检查 · 8/9 · 暂不 · 2/4 ─────────────┐  ← 仅此顶栏增量
├─────────────────────────────────────────────────────┤
│  （与 study-screen vocabulary 完全相同：）             │
│  toolbar / headword / 音标 / 喇叭                   │
│  回忆态 or 展开答案                                   │
│                                                     │
│                              ┌─────┐                │
│                              │ ◀ ▶ │  浮窗         │
│                              └─────┘                │
├─────────────────────────────────────────────────────┤
│  [ 加入复习 ]              [ 暂不 ]                    │  ← 原底栏，不动
└─────────────────────────────────────────────────────┘
```

### C.4 家长检查 · 复习（与复习 Tab 同构）

```text
┌─ ← 返回    家长检查 · 8/9 · 还不熟 · 1/2 ──────────┐
├─────────────────────────────────────────────────────┤
│  （与 review-screen vocabulary 完全相同）             │
│                              ┌─────┐                │
│                              │ ◀ ▶ │                │
│                              └─────┘                │
├─────────────────────────────────────────────────────┤
│  [ 记住了 ]              [ 还不熟 ]                  │
└─────────────────────────────────────────────────────┘
```

---

## 附录 D：日汇总表（P2 可选）

```sql
-- 非 P1 交付；有事件数据后可 materialize
CREATE TABLE learning_activity_daily_rollup (
  localDate TEXT NOT NULL PRIMARY KEY,
  activeDay INTEGER NOT NULL DEFAULT 0,
  firstRevealCount INTEGER NOT NULL DEFAULT 0,
  joinReviewCount INTEGER NOT NULL DEFAULT 0,
  skipReviewCount INTEGER NOT NULL DEFAULT 0,
  reviewRememberedCount INTEGER NOT NULL DEFAULT 0,
  reviewNotFamiliarCount INTEGER NOT NULL DEFAULT 0,
  storyCompletedCount INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL
);
```

用于：曲线图、抽屉三数字快查（可选替代 90 天 scan）。

---

## 附录 E：与 0013 文案对齐

| 0013 / 现 UI   | 本 ADR 展示                                             |
| -------------- | ------------------------------------------------------- |
| 通过 / failed  | **记住了 / 还不熟**（仅 UI；use-case 仍 passed/failed） |
| 学习中（首页） | 建议改为 **复习中**（复习池内未稳定）                   |
| 已掌握（首页） | 建议改为 **记忆稳定**                                   |
| 待复习         | **今日到期**                                            |

---

## 变更记录

| 日期       | 说明                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 2026-08-10 | 初稿：日历、检查模式、首页横滑、事件表、线框定稿                                  |
| 2026-08-10 | 定稿：totalRow 方案乙；热力格三档（灰/浅绿/深绿）；事件表 1 年保留；状态 → 已确认 |
