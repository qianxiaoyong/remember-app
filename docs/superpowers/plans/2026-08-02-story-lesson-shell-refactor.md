# story_reading 课节壳重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在已 merge 的 `story_reading` MVP（PR #9）基线上，重构课节阅读体验：对标精听 App 的分层布局、三 Tab（原文 / 精听 / 本课词）、段级音频跟读、UI 抛光；**不破坏** ADR 0012 cardType registry 边界，**不改动** vocabulary 行为。

**Architecture:** 主体工作量收在 `apps/mobile/src/learning/card-types/story-reading/` 插件目录；study 壳层仅扩展 `CardRendererProps` 两个 optional 回调以支持 Tab 级 footer 显隐与精听自动完成；contracts 为 `paragraphs[]` 增加 optional 段级时间轴；共享音频层 additive 暴露 position hook。

**Tech Stack:** TypeScript strict、Zod、Expo Router、React Native、`expo-audio`、`expo-font`（可选）、Vitest。

**关联文档：**

- Spec（需 amend）：`docs/superpowers/specs/2026-08-02-story-reading-design.md`
- ADR：`docs/decisions/0012-card-type-registry.md`
- 前序计划（已完成）：`docs/superpowers/plans/2026-08-02-story-reading-implementation.md`

**分支：** `feat/story-lesson-shell`（从 `main` @ PR #9 merge 开出）

---

## 产品决策（2026-08-02 已确认）

| # | 决策 | 内容 |
| --- | --- | --- |
| D1 | Tab 范围 Phase 1 | **原文 \| 精听 \| 本课词**（不含「评测」） |
| D2 | 跟读粒度 | **段级**（`paragraphs[]` 一段一高亮） |
| D3 | 时间轴来源 | **人工标注** `audioStartMs` / `audioEndMs` |
| D4 | 原文 Tab 完成 | 滚到底 → 显示「我读完了」→ 用户手动点 → `confirmLessonComplete` |
| D5 | 精听 Tab 完成 | **隐藏**「我读完了」；**播完最后一帧** → 自动 `confirmLessonComplete` |
| D6 | 本课词 Tab | 只浏览 `sidebar`，不触发完成 |
| D7 | 高频词样式 | **下划线**，不用背景色（中/低频同理，色线区分 tier） |
| D8 | 中文注释 | **开关**，**默认关闭**；开时 inline `（glossZh）` |
| D9 | 滚动 | **仅正文区** ScrollView；`showsVerticalScrollIndicator={false}` |
| D10 | 封面 | 课头 Hero：**插图作背景** + 底部渐变 + 标题叠字 |
| D11 | 本课 N 词 | 入口移到 **顶栏 Tab 行**（第三 Tab），不单占课头 card |
| D12 | 字体 | story 正文 **Serif**（推荐 `expo-font` + Lora；或系统 `serif` 降级） |
| D13 | protocolVersion | **保持 1**；时间轴字段 optional，旧包可降级 |

---

## 框架边界（不得破坏 registry）

ADR 0012 是**编译期静态 registry**，不是运行时插件。本重构必须遵守：

```text
study-screen 壳
  ├─ 只读 cardTypeRegistry[type].reviewMode
  ├─ 不写 if (cardType === 'story_reading' && tab === …)
  └─ 通过 CardRendererProps optional 回调接收 Renderer 上报

story-reading/ 插件（主要改动）
  ├─ Tab 状态、跟读、播放器、词表 — 全部在内
  └─ registry.ts 仍只注册一行，不新增 cardType

vocabulary / confirmLessonComplete / sync_outbox — 零行为变更
```

### 壳层扩展（最小）

在 `CardRendererProps` 增加 **optional** 字段（vocabulary 不传）：

```typescript
onLessonChromeChange?: (state: {
  footerVisible: boolean;
  completeEnabled: boolean;
}) => void;

onLessonAutoComplete?: () => void;
```

| Tab | footerVisible | completeEnabled | 完成触发 |
| --- | --- | --- | --- |
| 原文 | true | 滚到底后 true | 用户点「我读完了」 |
| 精听 | false | — | 播完 → `onLessonAutoComplete` |
| 本课词 | false | — | 无 |

---

## 协议扩展（contracts + pack-builder）

### paragraphs 段级时间轴（optional）

```typescript
// story-reading-content.ts
export const storyParagraphSchema = z.object({
  runs: z.array(storyRunSchema).min(1),
  audioStartMs: z.number().int().min(0).optional(),
  audioEndMs: z.number().int().min(0).optional(),
}).strict().refine(
  (p) => (p.audioStartMs === undefined) === (p.audioEndMs === undefined),
  { message: 'audioStartMs and audioEndMs must both be set or both omitted' },
).refine(
  (p) => p.audioStartMs === undefined || p.audioEndMs > p.audioStartMs,
  { message: 'audioEndMs must be greater than audioStartMs' },
);
```

### validate-story-reading-card 新增规则

- [ ] 若任一段有 time 字段，则**全部段**必须有，且单调递增、无重叠
- [ ] 最后一段 `audioEndMs` ≤ 音频文件时长（verify 时读 mp3 metadata 或 ffprobe）
- [ ] 无 time 字段的旧 content 仍校验通过（精听 Tab 降级提示）

### spec amend 要点

- §8.3 tier 视觉：背景色 → **下划线/字底线**（图例 chip 同步）
- 新增 §8.x：三 Tab、段级跟读、完成条件分 Tab
- §1.2 defer 更新：注释开关 UI 落地；`presentationVariant` 仍 defer

---

## 文件结构（完成后）

```text
docs/superpowers/specs/2026-08-02-story-reading-design.md   # amend
docs/decisions/0012-card-type-registry.md                   # 附录：Renderer 回调约定（可选）

packages/contracts/src/pack/
  story-reading-content.ts                    # paragraph 时间轴
  validate-story-reading-card.ts              # 时间轴校验
  validate-story-reading-card.test.ts

apps/mobile/src/
  learning/card-types/
    types.ts                                  # onLessonChromeChange / onLessonAutoComplete
  learning/card-types/story-reading/
    parse-content.tsx                         # 入口 → StoryLessonShell
    story-lesson-shell.tsx                    # Tab 容器 + chrome 上报
    story-lesson-tabs.tsx                     # 原文 | 精听 | 本课词
    story-read-tab.tsx                        # 原文：Hero + 正文 ScrollView
    story-listen-tab.tsx                      # 精听：跟读高亮 + 底栏播放器
    story-vocab-tab.tsx                       # 本课词（抽离 vocab-list 内容）
    story-lesson-hero.tsx                     # ImageBackground + 渐变 + 标题
    story-audio-bar.tsx                       # 进度条 + 播放/暂停
    story-follow-along.ts                     # positionMs → activeParagraphIndex
    story-follow-along.test.ts
    story-reading-panel.tsx                   # 删除或拆入 read-tab
    story-vocab-list-screen.tsx               # 与 vocab-tab 共用 StoryVocabPanel
    tier-colors.ts                            # 下划线色，去背景 token
    tier-legend-chips.tsx
  hooks/
    use-story-audio-player.ts                 # 包装 expo-audio 状态
  use-cases/
    play-expo-audio-uri.ts                    # additive：subscribe position（保留原 API）
  screens/study-screen.tsx                    # footer 由 chrome 回调驱动

tools/pack-builder/
  scripts/generate-story-c1-cards.mjs           # 输出段级时间轴（人工填表）
  source/story-test-pack/cards.json             # 公主与豌豆 12 段 + timestamps
  fixtures/story-test-pack.zip
```

---

## Phase 0：UI 抛光（无协议变更）

与 Phase 1 可同 PR，但应先可独立验收。

### Task 0.1：布局拆分 — 固定课头 + 正文独滚

**Files:**

- Modify: `story-reading-panel.tsx`（或 interim `story-read-tab.tsx`）

- [ ] 外层 `flex:1`：toolbar + 固定课头 + `ScrollView flex:1` 正文
- [ ] `showsVerticalScrollIndicator={false}`
- [ ] 滚到底 / `onReachedBottom` 仍绑正文 ScrollView

### Task 0.2：tier 下划线 + 注释开关

**Files:**

- Modify: `story-reading-panel.tsx`, `tier-colors.ts`, `tier-legend-chips.tsx`

- [ ] 去掉 word run 背景色；tier → `borderBottomWidth` + tier 色
- [ ] `showGloss` state，默认 `false`；Toggle「显示注释」
- [ ] 开：inline `（glossZh）` 15px muted

### Task 0.3：Hero 封面背景 + Serif 字体

**Files:**

- Create: `story-lesson-hero.tsx`
- Modify: read tab layout
- Optional: `apps/mobile/app/_layout.tsx` 或 story 入口加载 Lora

- [ ] `ImageBackground` + 线性渐变 + 标题
- [ ] 正文 `fontFamily: 'Lora_400Regular'` 或 Platform serif
- [ ] token：`storyBodyFontSize: 20`, `lineHeight: 38`, `paragraphGap: 24`

### Task 0.4：底栏安全区（若 main 未 merge）

**Files:**

- Modify: `study-screen.tsx`

- [ ] `lessonCompleteFooter` 加 `paddingBottom: max(insets.bottom, 12)` + 顶部分割线

**Verify:**

```bash
pnpm --filter @remember/mobile test -- src/learning/card-types/story-reading
pnpm mobile:apk:debug
```

---

## Phase 1：三 Tab + 段级跟读

### Task 1.1：CardRendererProps 壳层扩展

**Files:**

- Modify: `apps/mobile/src/learning/card-types/types.ts`
- Modify: `apps/mobile/src/screens/study-screen.tsx`
- Modify: `apps/mobile/src/learning/card-types/story-reading/parse-content.tsx`

- [ ] 新增 optional `onLessonChromeChange` / `onLessonAutoComplete`
- [ ] `study-screen` 用 state 控制 `showLessonCompleteBar` 与 `completeEnabled`
- [ ] vocabulary Renderer **不传** 新回调，行为不变

**Verify:** `registry.test.ts` + vocabulary 手工回归一课

### Task 1.2：StoryLessonShell + Tabs

**Files:**

- Create: `story-lesson-shell.tsx`, `story-lesson-tabs.tsx`
- Create: `story-read-tab.tsx`, `story-listen-tab.tsx`, `story-vocab-tab.tsx`
- Modify: `parse-content.tsx` → 渲染 Shell

- [ ] Tab：`read` \| `listen` \| `vocab`
- [ ] 切换 Tab 时调用 `onLessonChromeChange`（见上表）
- [ ] `story-vocab-tab` 复用/抽离 `StoryVocabPanel`

### Task 1.3：音频 hook + StoryAudioBar

**Files:**

- Create: `hooks/use-story-audio-player.ts`
- Create: `story-audio-bar.tsx`
- Modify: `play-expo-audio-uri.ts`（additive）

- [ ] 暴露 `{ positionMs, durationMs, playing, play, pause, seek }`
- [ ] **保留** `playExpoAudioUri()` 原签名供 vocabulary 使用
- [ ] 精听 Tab 底栏固定：进度条 + 时间 + 居中播放/暂停

### Task 1.4：段级跟读引擎

**Files:**

- Create: `story-follow-along.ts`, `story-follow-along.test.ts`
- Modify: `story-listen-tab.tsx`

- [ ] `findActiveParagraphIndex(paragraphs, positionMs)`
- [ ] 每段 `onLayout` 记录 y；active 变化 → `scrollTo` + 段级高亮色（如 `colors.studyRatingGood`）
- [ ] tier 下划线在跟读高亮下仍可见（或跟读时整段绿字 + 下划线加粗 — 实施时二选一，默认整段绿）
- [ ] 播完：`positionMs >= lastParagraph.audioEndMs` → `onLessonAutoComplete()`

**Verify:**

```bash
pnpm --filter @remember/mobile test -- story-follow-along
```

### Task 1.5：contracts 段级时间轴

**Files:**

- Modify: `packages/contracts/src/pack/story-reading-content.ts`
- Modify: `validate-story-reading-card.ts`
- Modify: `validate-story-reading-card.test.ts`
- Modify: `docs/superpowers/specs/2026-08-02-story-reading-design.md`

- [ ] schema + 校验（见上文）
- [ ] 负例：重叠区间、缺一半字段、end > 音频时长

**Verify:**

```bash
pnpm --filter @remember/contracts test
pnpm --filter @remember/pack-builder test
```

### Task 1.6：公主与豌豆人工时间轴 + 重建 zip

**Files:**

- Modify: `tools/pack-builder/scripts/generate-story-c1-cards.mjs`
- Modify: `tools/pack-builder/source/story-test-pack/cards.json`
- Rebuild: `fixtures/story-test-pack.zip`, `apps/mobile/assets/packs/story-test-pack.zip`

- [ ] 12 段各填 `audioStartMs` / `audioEndMs`（人工听 mp3 标注）
- [ ] bump `meta.json` `packVersion`
- [ ] verify 通过

**Verify:**

```bash
node tools/pack-builder/dist/cli.js build --source tools/pack-builder/source/story-test-pack --output tools/pack-builder/fixtures/story-test-pack.zip
node tools/pack-builder/dist/cli.js verify -- tools/pack-builder/fixtures/story-test-pack.zip
```

---

## 验收清单（Phase 0 + 1）

### 原文 Tab

- [ ] Hero 封面背景；标题可读
- [ ] Serif 20px；段间距舒适；无滚动条；仅正文滚
- [ ] tier 下划线无底色；注释默认关
- [ ] 滚到底 → 「我读完了」可点 → 下一课

### 精听 Tab

- [ ] 无「我读完了」底栏
- [ ] 播放时当前段高亮 + 自动滚入视区
- [ ] 拖进度条 → 跳段
- [ ] 播完 → 自动完成并下一课

### 本课词 Tab

- [ ] 32 词列表；可点详情 sheet
- [ ] 无完成底栏

### 回归

- [ ] vocabulary SM-2 三按钮正常
- [ ] `pnpm check` 全绿
- [ ] 无 time 轴的旧 story 包：原文 OK，精听降级（提示或隐藏 Tab）

---

## 范围外（defer Phase 2+）

| 项 | 说明 |
| --- | --- |
| Tab「评测」 | 需 assessment schema + `reviewMode: interactive` |
| 句级跟读 | 需 sentences[] 或更细时间轴 |
| 自动对齐工具 | Whisper 等；本期人工标 |
| pack-editor 时间轴 UI | CLI/脚本足够 |
| story 词写入 lexicon_entries | spec MVP 不做 |
| protocolVersion bump | 不做 |

---

## 实施顺序建议

```text
1. Task 1.1  壳层回调（可先 stub Shell 验证 footer 显隐）
2. Task 1.2  Tab 壳 + vocab tab
3. Task 0.*   UI 抛光（可与 2 并行）
4. Task 1.5  协议时间轴
5. Task 1.3  音频 hook + 播放条
6. Task 1.4  跟读引擎
7. Task 1.6  人工标时间轴 + fixture
8. 全量验收 + APK
```

---

## 风险与注意

1. **study-screen 禁止 story 硬编码分支** — 只用 `onLessonChromeChange`。
2. **精听自动完成** 与 **原文手动完成** 共用 `confirmLessonComplete`；注意 `isSubmitting` 防双触发。
3. **Tab 切换时音频**：切离精听应 pause；切回保留 position。
4. **本课词 Tab** 若内嵌 ScrollView，注意与外层 scroll 嵌套（词表自滚、无外层滚）。
5. **本地 main 可能有未提交 UI WIP** — 新窗口切分支后先 `git status`，建议基于 `feat/story-lesson-shell` 上的 plan commit 开干。

---

## Git

```bash
git checkout main
git pull origin main
git checkout -b feat/story-lesson-shell
# 本 plan 文件首 commit 后按 Task 逐步提交
```

**合并目标：** `main`（独立 PR，不与 pack-editor WIP 混 commit）
