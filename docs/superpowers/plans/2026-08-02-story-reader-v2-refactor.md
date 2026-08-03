# story_reading 阅读器 v2 Refactor Plan

> **For agentic workers:** 按 Phase 顺序执行；每 Phase 完成后跑相关测试。前序计划 `2026-08-02-story-lesson-shell-refactor.md` 中与本 plan 冲突的决策 **以本 plan 为准**。

**Goal:** 将 story 阅读体验改为「书库继续阅读 + 原文页播放器 + 书签进度」；去掉精听 Tab、「我读完了」、行内词注与 run 级跟读高亮；段下中文改 `translationZh` 协议字段。

**Architecture:** 插件内自洽（`story-reading/`）；壳层仅扩展 generic 能力（`knowledgeId` 路由、`reviewMode: none`）；书库呈现由 `cardTypeRegistry[].libraryPresentation` 扩展，**pack 不设固定 kind enum**。

**Tech Stack:** TypeScript strict、Zod、Expo Router、React Native、`expo-audio`、Vitest、user.sqlite migration。

**分支:** `feat/story-lesson-shell`（延续）；建议 v2 开始前 commit 上一阶段 WIP 作检查点。

**关联文档（需 amend）:**

- `docs/superpowers/specs/2026-08-02-story-reading-design.md`
- `docs/decisions/0012-card-type-registry.md`

---

## 产品决策（2026-08-02 已确认， supersede 旧 shell plan）

| #   | 决策       | 内容                                                                                  |
| --- | ---------- | ------------------------------------------------------------------------------------- |
| R1  | Tab        | **原文 \| 本课词**；精听并入原文页                                                    |
| R2  | 底栏       | **播放器**：播放/暂停/进度/拖动 + **上一篇/下一篇**                                   |
| R3  | 篇间导航   | 包首/包尾 **循环**（末篇下一篇 → 首篇）                                               |
| R4  | 切课续播   | **上一篇/下一篇始终从 0 开始**；仅书库「继续阅读」用书签 `positionMs`                 |
| R5  | 进度       | **书签**：`knowledgeId + positionMs`；无每日任务；**不写** `learning_states`          |
| R6  | reviewMode | `story_reading` → **`none`**；去掉 `lesson_complete` / 「我读完了」                   |
| R7  | 词注       | **无行内 gloss**；word run 仅 tier 字色 + **点击弹层**（sidebar）                     |
| R8  | 跟读       | **无 run 高亮**；当前段 **整段字体颜色** 区分                                         |
| R9  | 段下中文   | **`paragraphs[].translationZh`** + 「显示翻译」开关；不用 gloss 拼接                  |
| R10 | 书库       | `libraryPresentation: 'reader'`：**隐藏** SM-2 进度条；「上次读到」+ **继续阅读**     |
| R11 | 呈现扩展   | registry 登记 `libraryPresentation`；MVP 两种：`study` / `reader`；未来 cardType 可增 |

---

## 框架边界

```text
cardTypeRegistry
  vocabulary     → reviewMode: sm2,      libraryPresentation: study
  story_reading  → reviewMode: none,    libraryPresentation: reader

study-screen
  ├─ reviewMode none → 无 SM-2 底栏、无 lesson complete 底栏
  └─ 支持 query knowledgeId（reader 模式，不建 session 队列）

story-reading/ 插件
  ├─ 原文 Tab：正文 + 段色跟读 + 底栏 StoryAudioBar（含 prev/next）
  ├─ 本课词 Tab
  ├─ 删 StoryListenTab、删 onLessonAutoComplete / 滚到底完成
  └─ 篇间导航：pack 内 sortOrder 循环 + router.replace knowledgeId

user.sqlite v3
  └─ story_reading_bookmarks(packId PK, knowledgeId, positionMs, updatedAt)
```

**pack 混 cardType：** MVP 仅实现两种书库呈现；混合包 fallback 留到有真实包再定（见 R11）。

---

## Phase 1 — 契约与 registry

- [ ] **1.1** `storyParagraphSchema` 增加 optional `translationZh`；validate 全有或全无（同 audio 时间轴）
- [ ] **1.2** `ReviewMode` / registry：`story_reading.reviewMode = 'none'`
- [ ] **1.3** `CardTypeDefinition` 增加 `libraryPresentation: 'study' | 'reader'`
- [ ] **1.4** amend `2026-08-02-story-reading-design.md` §2 D1/D9、§6.3 translationZh
- [ ] **1.5** contracts / validate 测试更新

---

## Phase 2 — 书签存储

- [ ] **2.1** `USER_DB_VERSION = 3`；`story_reading_bookmarks` 表 + migration
- [ ] **2.2** repository：`getStoryBookmark` / `upsertStoryBookmark`
- [ ] **2.3** use-case：`resolveStoryReaderEntry(packId)` → knowledgeId + positionMs
- [ ] **2.4** mobile 单元测试

---

## Phase 3 — 阅读器壳重构

- [ ] **3.1** 删 `StoryListenTab`、tabs 仅 read | vocab
- [ ] **3.2** `useStoryAudioPlayer` 提升到 `StoryLessonShell`；原文 Tab 共享
- [ ] **3.3** 底栏 `StoryAudioBar` + prev/next（sortOrder 循环）；切课 positionMs=0
- [ ] **3.4** 跟读：`findActiveParagraphIndex` → **段级文字颜色**；删 run 高亮
- [ ] **3.5** 删行内 gloss / `buildParagraphGloss` 主路径；「显示翻译」→ `translationZh`
- [ ] **3.6** 删 `onLessonChromeChange` complete 语义、`scroll-reach-bottom` 完成解锁
- [ ] **3.7** study-screen：去掉 `lesson_complete` story 底栏路径

---

## Phase 4 — 路由与 reader 模式

- [ ] **4.1** `study.tsx` 解析 `knowledgeId` query
- [ ] **4.2** story reader：不调用 `resumeOrStartStudySession`；直接加载指定卡
- [ ] **4.3** 播放进度 debounce 写书签；退出/回书库写书签
- [ ] **4.4** 删 story `confirmLessonComplete` / learning_states 写入（若有）

---

## Phase 5 — 书库

- [ ] **5.1** `resolvePackLibraryPresentation(packId)` 扫 cards.cardType → registry
- [ ] **5.2** `InstalledPackSummary` 扩展：`libraryPresentation`、reader 态 copy
- [ ] **5.3** `InstalledPackRow`：reader 隐藏 ProgressBar；statusHint = 上次读到
- [ ] **5.4** `onStudyPress`：reader → `/study?packId=&knowledgeId=`（书签或第一课）

---

## Phase 6 — 内容与测试包

- [ ] **6.1** pack-builder verify：`translationZh` 规则
- [ ] **6.2** 公主/C1 源数据补 `translationZh`（可先占位句，verify 通过）
- [ ] **6.3** 重建 `story-test-pack.zip`；`packVersion` bump
- [ ] **6.4** 回归：vocabulary SM-2 不变；reader 书签/循环/翻译开关

---

## 验收清单

1. 纯 story 包书库：**无进度条**，显示「上次读到」，按钮「继续阅读/开始阅读」
2. 原文页：**两 Tab**；底栏播放器 + 上一篇/下一篇 **循环**；切课从 0 播
3. 从书库进入：**续播书签** positionMs
4. 跟读：**当前段字体色**，无词 run 闪烁高亮
5. word run：**点击弹层**；无行内 `（glossZh）`
6. 「显示翻译」：段下 `translationZh`；旧包无字段时不 crash（可选降级隐藏）
7. vocabulary 包书库与学习流：**零回归**

---

## 与前序 shell plan 的显式废弃项

| 旧决策                        | 状态          |
| ----------------------------- | ------------- |
| 三 Tab含精听                  | **废弃**      |
| D4/D5 我读完了 / 精听自动完成 | **废弃**      |
| D8 行内 gloss                 | **废弃**      |
| D7 下划线 tier（已改字色）    | **保持字色**  |
| lesson_complete reviewMode    | **改为 none** |
