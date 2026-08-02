# story_reading 卡片类型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 PR #7 cardType registry 基线上，落地 `story_reading` 卡片类型——contracts schema、pack-builder 双向一致性校验、mobile 注释阅读 UI 与 `lesson_complete` 完成路径；vocabulary 行为零变更。

**Architecture:** 静态编译期 registry 扩展（ADR 0012）。`packages/contracts` 新增 `storyReadingContentSchema` 与 `validateStoryReadingCard`；`parsePackCardContent` 返回 discriminated union；mobile `cardTypeRegistry` 注册 `StoryReadingRenderer`；study 壳层按 `reviewMode: lesson_complete` 展示「我读完了」底栏，经 `confirmLessonComplete` 写入完成哨兵 `learning_states`。

**Tech Stack:** TypeScript strict、Zod、`@remember/contracts`、`@remember/pack-builder`、Expo Router、React Native、Vitest。

**Spec（已确认）：** `docs/superpowers/specs/2026-08-02-story-reading-design.md`

## Global Constraints

- 产品展示名「记得」；仓库 `remember-app`；分支 `feat/story-reading`（基线 `main` @ PR #7 merge `5208354`）。
- `cardType`：`story_reading`；`protocolVersion` **保持 1**，不 bump。
- `reviewMode` 新增 `lesson_complete`；story 课 **不进 SM-2**。
- 注释：行内 `surface（glossZh）`；tier `high/mid/low` → 红/蓝/绿。
- 点词数据源 **仅 `sidebar[]`**；MVP **不写** story 词到 `lexicon_entries`。
- runs ↔ sidebar：**双向一致**（word run 的 `vocabId` 须在 sidebar；sidebar 不允许孤儿）。
- `knowledgeId`：`{packId}:story:{lessonSlug}`（`lessonSlug` 由 `lesson.code` 规范化）。
- 系列元数据只在 pack source `meta.json`，不进 card content。
- 频次图例：App 固定文案 + 运行时 tier 计数；JSON 只存 tier。
- **不改动：** Admin、API 业务、支付、sync 表结构、pack-editor story 表单。
- 页面/用例不得直连 sqlite（`docs/ai-rules/boundaries.md`）。
- 每 Task 一次 commit；**禁止**与 pack-editor / en-grade3 fixtures WIP 混 commit。
- 合并前 `pnpm check` 全绿 + vocabulary 手工回归一课。

## 范围外（defer）

| 项 | 说明 |
| --- | --- |
| pack-editor story 表单 | 本 PR 不做 |
| story 正文搜索索引 | spec §8.2 defer |
| 宽屏双栏 / QR 音频 / 理解题 | spec 非目标 |
| story 词写入 lexicon_entries / 收藏本 | MVP 不做 |
| `protocolVersion` bump | 明确不做 |

---

## 完成哨兵（Task 3 冻结）

story 课点「我读完了」后写入 `learning_states`，使 `buildStudyQueuePlan` **不再**将其作为 new 或 due：

| 字段 | 值 | 理由 |
| --- | --- | --- |
| `easiness` | `2.5` | SM-2 默认，不参与 story 调度 |
| `intervalDays` | `36500` | 极大间隔，语义为「已完成」 |
| `repetitions` | `1` | 非 0，避免被标为 relearn |
| `dueAt` | `9999-12-31T23:59:59.999Z` | 永不到期 → 不进 due 队列 |

**sync_outbox：** 复用 `buildSyncOutboxPayload`；`rating` 传固定值 `'good'`（或新增 `'complete'` 仅写 payload 元数据，**不**调 `applyReview`）。实施时若 domain 层无 `'complete'`，用 `'good'` + 上述哨兵字段，并在 use-case 注释说明 story 专用。

---

## 文件结构（完成后）

```text
docs/decisions/0012-card-type-registry.md          # 附录：story_reading schema + lesson_complete

packages/contracts/src/pack/
  constants.ts                                     # CARD_TYPE_STORY_READING、SUPPORTED_CARD_TYPES
  story-reading-content.ts                         # Zod schema + types
  knowledge-id.ts                                  # story knowledgeId 构建/校验
  card-type-registry.ts                            # parse 分支 + ParsedPackCardContent union
  validate-story-reading-card.ts                   # verify + runs/sidebar 一致性
  validate-story-reading-card.test.ts
  verify-content.ts                                # 注册 story 分支
  verify-content.test.ts                           # story 负例

apps/mobile/src/
  learning/card-types/
    types.ts                                       # ReviewMode + lesson_complete；扩展 Renderer 回调
    registry.ts                                    # story_reading 注册
    story-reading/
      parse-content.tsx                            # StoryReadingCardRenderer 入口
      story-reading-panel.tsx                      # 封面/播放/正文/图例
      story-vocab-sheet.tsx                        # 点词 bottom sheet
      story-vocab-list-screen.tsx                  # 「本课 N 词」列表页
      tier-colors.ts                               # high/mid/low token
      count-tier-stats.ts                          # 运行时 tier 计数
  use-cases/
    confirm-lesson-complete.ts                     # 完成哨兵 + queue + sync
    confirm-lesson-complete.test.ts
  data/pack/pack-card-details.ts                   # headword 分支（story 用 titleEn）
  screens/study-screen.tsx                         # lesson_complete 底栏
  hooks/use-study-flow.ts                          # handleLessonComplete + 滚到底状态

tools/pack-builder/
  source/story-test-pack/                          # 1 课 fixture source
  fixtures/story-test-pack.zip                     # verify 通过样例
```

---

### Task 0: ADR 0012 附录 — story_reading schema 与 lesson_complete

**Files:**

- Modify: `docs/decisions/0012-card-type-registry.md`

**Interfaces:**

- Produces: ADR 附录冻结——`story_reading` content 三键结构、`reviewMode: lesson_complete`、knowledgeId `{packId}:story:{slug}`、runs/sidebar 双向一致规则、完成哨兵语义（引用 spec §4–§7）

- [ ] **Step 1: 在 ADR §2 reviewMode 表追加 `lesson_complete` 行**

- [ ] **Step 2: 新增附录「story_reading（2026-08-02 冻结）」**

  必含：content schema 摘要、knowledgeId 规则、校验 4–6 条、与 vocabulary 差异表、完成哨兵原则（具体值见本计划）。

- [ ] **Step 3: 更新 §1 CardType 表 `story_reading` 状态为「本计划实现」**

- [ ] **Step 4: Commit**

```bash
git add docs/decisions/0012-card-type-registry.md
git commit -m "docs: ADR 0012 附录冻结 story_reading 与 lesson_complete"
```

**Verify:**

```powershell
# 无自动化；人工确认 ADR 与 spec 一致
```

---

### Task 1: contracts — storyReadingContentSchema 与 parse 分发

**Files:**

- Create: `packages/contracts/src/pack/story-reading-content.ts`
- Create: `packages/contracts/src/pack/validate-story-reading-card.ts`
- Create: `packages/contracts/src/pack/validate-story-reading-card.test.ts`
- Modify: `packages/contracts/src/pack/constants.ts`
- Modify: `packages/contracts/src/pack/knowledge-id.ts`
- Modify: `packages/contracts/src/pack/card-type-registry.ts`
- Modify: `packages/contracts/src/pack/card-type-registry.test.ts`
- Modify: `packages/contracts/src/pack/verify-content.ts`
- Modify: `packages/contracts/src/pack/verify-content.test.ts`
- Modify: `packages/contracts/src/pack/index.ts`

**Interfaces:**

- Produces:
  - `CARD_TYPE_STORY_READING = 'story_reading'`
  - `SUPPORTED_CARD_TYPES = ['vocabulary', 'story_reading']`
  - `storyReadingContentSchema`（Zod `.strict()`）
  - `slugFromLessonCode` / `buildStoryKnowledgeId` / `knowledgeIdMatchesLessonCode`
  - `isValidKnowledgeIdFormat` 扩展接受 `:story:` 段
  - `ParsedPackCardContent` discriminated union
  - `parsePackCardContent('story_reading', json)` 分支
  - `validateStoryReadingCard(packId, card, manifestPaths)` 含 runs/sidebar 双向校验

- [ ] **Step 1: 写失败测试 — schema 与 parse**

```typescript
// validate-story-reading-card.test.ts / card-type-registry.test.ts 要点
// - 合法 story content parse 成功
// - word run vocabId 不在 sidebar → PACK_CONTENT_INVALID
// - sidebar 孤儿 vocabId → PACK_CONTENT_INVALID
// - word run tier 与 sidebar tier 不一致 → PACK_CONTENT_INVALID
// - knowledgeId 与 lesson.code 不匹配 → PACK_CONTENT_INVALID
// - coverImage/primaryAudio 未在 manifest → PACK_CONTENT_INVALID
// - parsePackCardContent('story_reading', validJson) 返回 cardType story_reading
```

- [ ] **Step 2: 运行测试确认 FAIL**

```powershell
pnpm --filter @remember/contracts test -- validate-story-reading-card card-type-registry verify-content
```

Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 story-reading-content.ts**

  - `storyTierSchema = z.enum(['high', 'mid', 'low'])`
  - `storyTextRunSchema` / `storyWordRunSchema` discriminated union
  - `storyReadingContentSchema` 顶层三键 strict

- [ ] **Step 4: 扩展 knowledge-id.ts**

  - `STORY_KNOWLEDGE_ID_PATTERN = /^[^:]+:story:[a-z0-9-]+$/`
  - `isValidKnowledgeIdFormat`：`vocabulary` **或** `story` 格式均 true
  - `slugFromLessonCode(code)`：同 headword slug 规则
  - `buildStoryKnowledgeId(packId, lessonCode)`
  - `knowledgeIdMatchesLessonCode({ knowledgeId, packId, lessonCode })`

- [ ] **Step 5: 实现 validate-story-reading-card.ts**

  - Zod parse content
  - knowledgeId 与 `lesson.code` 匹配
  - assert `coverImage`、`primaryAudio` 在 manifest（复用 vocabulary 的 assertAssetReferenced 模式，可内联或抽 package 内共享小函数）
  - 收集所有 `kind:'word'` 的 `vocabId` → 校验 sidebar 存在且 tier 一致
  - 收集 sidebar 全部 `vocabId` → 校验每个至少被 1 个 word run 引用
  - 至少 1 paragraph、至少 1 run

- [ ] **Step 6: 更新 card-type-registry.ts**

  - `ParsedPackCardContent = VocabularyParsed | StoryReadingParsed`
  - `parsePackCardContent` 分发 story 分支
  - `isSupportedCardType` union 扩展

- [ ] **Step 7: verify-content.ts 注册**

```typescript
if (card.cardType === CARD_TYPE_STORY_READING) {
  validated.push(validateStoryReadingCard(packId, card, manifestPaths));
}
```

- [ ] **Step 8: 更新 verify-content.test.ts**

  - 原「拒绝非 vocabulary」改为「拒绝 choice 等未知 type」
  - 新增 story 合法/非法用例

- [ ] **Step 9: 运行测试 PASS**

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/contracts build
```

- [ ] **Step 10: Commit**

```bash
git add packages/contracts/src/pack/
git commit -m "feat(contracts): story_reading schema、parse 与 validate 分发"
```

---

### Task 2: pack-builder verify — runs/sidebar 一致性 + 负例测试

**Files:**

- Create: `tools/pack-builder/source/story-test-pack/`（meta.json、cards.json、assets 占位）
- Modify: `tools/pack-builder/src/verify-pack.test.ts`（或新建 `validate-story-card.test.ts` 经 contracts 单测已覆盖则可只加集成）
- Create: `tools/pack-builder/fixtures/story-test-pack.zip`（build 产出）

**Interfaces:**

- Consumes: Task 1 contracts
- Produces: 至少 1 个 **verify 通过** 的 story zip；负例 tampered story content 被拒

- [ ] **Step 1: 创建 source/story-test-pack**

```text
meta.json          # packId: story-test-pack, displayName 等
cards.json         # 1 行 story_reading, knowledgeId story-test-pack:story:c1
assets/images/c1.png   # 最小 PNG（或复用现有 fixture 图）
assets/audio/c1.mp3    # 最小音频占位
lexicon.json       # 1 条占位 entry（满足 lexicon_entries ≥1 结构自检；与 story 词无关）
```

  cards.json content 参考 spec §9，含 ≥3 个 word run + 对应 sidebar。

- [ ] **Step 2: 写 verify 集成测试**

```typescript
it('构建并校验 story_reading 测试包', async () => {
  const entries = await buildPackArchive(resolve('source/story-test-pack'));
  writeFileSync(fixturePath, writeZip(entries));
  await verifyPackZipFile(fixturePath);
});

it('story sidebar 孤儿条目被拒绝', () => {
  // 直接调 validatePackCards 传入篡改 content，期望 PACK_CONTENT_INVALID
});
```

- [ ] **Step 3: 构建 fixture**

```powershell
pnpm --filter @remember/pack-builder test -- verify-pack
```

Expected: PASS；生成/更新 `fixtures/story-test-pack.zip`

- [ ] **Step 4: Commit**

```bash
git add tools/pack-builder/source/story-test-pack/ tools/pack-builder/fixtures/story-test-pack.zip tools/pack-builder/src/
git commit -m "test(pack-builder): story_reading fixture 与 runs/sidebar 负例"
```

**Verify:**

```powershell
pnpm --filter @remember/pack-builder test
```

---

### Task 3: mobile — lesson_complete 底栏 + confirmLessonComplete

**Files:**

- Create: `apps/mobile/src/use-cases/confirm-lesson-complete.ts`
- Create: `apps/mobile/src/use-cases/confirm-lesson-complete.test.ts`
- Modify: `apps/mobile/src/learning/card-types/types.ts`
- Modify: `apps/mobile/src/screens/study-screen.tsx`
- Modify: `apps/mobile/src/hooks/use-study-flow.ts`
- Modify: `apps/mobile/src/data/pack/pack-card-details.ts`
- Modify: `apps/mobile/src/data/pack/pack-card-details.test.ts`
- Modify: `apps/mobile/src/learning/card-types/registry.ts`
- Modify: `apps/mobile/src/learning/card-types/registry.test.ts`

**Interfaces:**

- Produces:
  - `ReviewMode` 含 `'lesson_complete'`
  - `confirmLessonComplete({ packId, knowledgeId, now? })` → `ActiveStudySession`
  - `CardRendererProps` 可选扩展：`onReachedBottom?: () => void`（或等价 callback）
  - `study-screen` footer：`lesson_complete` 时 `PrimaryButton label="我读完了"` disabled 直到滚到底
  - `pack-card-details`：`headword` 对 story 取 `content.lesson.titleEn`

- [ ] **Step 1: 写失败测试 confirm-lesson-complete**

```typescript
// - 写入 learning_states 完成哨兵（dueAt 9999-...）
// - markQueueItemDone + sync_outbox 同事务
// - 再次 buildStudyQueuePlan 不含该 knowledgeId（new/due 均不出现）
```

- [ ] **Step 2: 实现 confirm-lesson-complete.ts**

  结构 mirror `confirm-card-review.ts`；**不**调用 `applyReview`；直接写哨兵 `LearningStateRow`。

- [ ] **Step 3: types.ts 追加 `lesson_complete`**

- [ ] **Step 4: use-study-flow.ts**

  - `reachedBottom` state
  - `handleLessonComplete` 调 confirmLessonComplete
  - 切卡时 reset `reachedBottom`
  - `handlePlayPrimaryAudio` 分支：story 用 `content.lesson.primaryAudio`（Typed narrowing）

- [ ] **Step 5: study-screen.tsx footer**

```typescript
const showLessonCompleteBar =
  cardTypeDefinition?.reviewMode === 'lesson_complete' && session?.currentItem;
// footer: PrimaryButton disabled={!reachedBottom || isSubmitting} onPress={handleLessonComplete}
```

- [ ] **Step 6: pack-card-details headword 分支**

- [ ] **Step 7: registry 临时注册 stub Renderer**（Task 4 替换为完整实现；或 Task 3/4 合并 commit 若同 PR 内连续）

  Task 3 可先注册返回 `<View/>` 的 stub 使 study 路径可编译；**推荐 Task 3 commit 不含 stub，Task 3 与 4 顺序实施时 Task 3 仅 use-case + 壳层，Task 4 一次性注册 Renderer**。

- [ ] **Step 8: 测试 PASS**

```powershell
pnpm --filter @remember/mobile test -- confirm-lesson-complete pack-card-details registry
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/use-cases/confirm-lesson-complete.ts apps/mobile/src/use-cases/confirm-lesson-complete.test.ts apps/mobile/src/learning/card-types/types.ts apps/mobile/src/screens/study-screen.tsx apps/mobile/src/hooks/use-study-flow.ts apps/mobile/src/data/pack/pack-card-details.ts apps/mobile/src/data/pack/pack-card-details.test.ts
git commit -m "feat(mobile): lesson_complete 底栏与 confirmLessonComplete 完成哨兵"
```

---

### Task 4: mobile — StoryReadingRenderer（封面、播放、正文 runs、滚到底）

**Files:**

- Create: `apps/mobile/src/learning/card-types/story-reading/parse-content.tsx`
- Create: `apps/mobile/src/learning/card-types/story-reading/story-reading-panel.tsx`
- Create: `apps/mobile/src/learning/card-types/story-reading/tier-colors.ts`
- Create: `apps/mobile/src/learning/card-types/story-reading/count-tier-stats.ts`
- Modify: `apps/mobile/src/learning/card-types/registry.ts`

**Interfaces:**

- Consumes: `StoryReadingContent`（parse 后 content）、`onPlayPrimaryAudio`、`onReachedBottom`
- Produces: 单屏阅读 UI——封面、`lesson.code` + 双标题、播放按钮、频次图例（固定文案 + count-tier-stats）、ScrollView 正文 runs 行内渲染

- [ ] **Step 1: count-tier-stats 单元测试**

```typescript
// sidebar 或 runs 统计 high/mid/low 数量
```

- [ ] **Step 2: story-reading-panel.tsx**

  - 封面 `Image` 读 pack 内 `coverImage`（经现有 pack asset URI 解析）
  - 正文：`paragraphs.map` → `runs.map` → text 直接 Text；word 渲染 `surface（glossZh）` + tier 背景色
  - ScrollView `onScroll` 检测距底 < threshold → `onReachedBottom()`
  - 顶栏/壳层：复用 study 屏已有 progress + more（Renderer 内或 study-screen 槽位，与 VocabularyStudyPanel 对齐）

- [ ] **Step 3: parse-content.tsx 导出 StoryReadingCardRenderer**

  - narrow `content` 为 `StoryReadingContent`
  - 注册到 registry：`reviewMode: 'lesson_complete'`

- [ ] **Step 4: registry.test.ts 更新**

```typescript
expect(resolveCardTypeDefinition('story_reading')?.reviewMode).toBe('lesson_complete');
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/learning/card-types/story-reading/ apps/mobile/src/learning/card-types/registry.ts apps/mobile/src/learning/card-types/registry.test.ts
git commit -m "feat(mobile): StoryReadingRenderer 封面正文与 tier 图例"
```

**Verify:**

```powershell
pnpm --filter @remember/mobile test -- story-reading registry count-tier
```

---

### Task 5: mobile — 点词 sheet + 「本课 N 词」词表页

**Files:**

- Create: `apps/mobile/src/learning/card-types/story-reading/story-vocab-sheet.tsx`
- Create: `apps/mobile/src/learning/card-types/story-reading/story-vocab-list-screen.tsx`
- Create: `apps/mobile/app/study/story-vocab-list.tsx`（Expo Router 路由，query: packId + knowledgeId）
- Modify: `apps/mobile/src/learning/card-types/story-reading/story-reading-panel.tsx`

**Interfaces:**

- Produces:
  - 点 `word` run → bottom sheet：headword、ipa、pos、definitionZh、tier 色条（**不**走 lexicon_entries）
  - 课头「本课 N 词 ›」→ navigate 词表页；列表按 sidebar 顺序；项可展开详情

- [ ] **Step 1: story-vocab-sheet.tsx**

  - Modal/BottomSheet 组件；props: `entry: StorySidebarEntry | null`, `visible`, `onClose`
  - **不**展示收藏按钮（spec：MVP 无收藏本联动）

- [ ] **Step 2: story-vocab-list-screen.tsx**

  - 读当前课 content.sidebar；FlatList；点击项展示详情（可复用 sheet 内容 inline）

- [ ] **Step 3: Expo 路由**

  - `/study/story-vocab-list?packId=&knowledgeId=`
  - 页内 `getPackCardDetailUseCase` 加载 sidebar

- [ ] **Step 4: story-reading-panel  wired 点词 + 导航入口**

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/learning/card-types/story-reading/ apps/mobile/app/study/
git commit -m "feat(mobile): story 点词 sheet 与本课词表页"
```

**Verify:**

```powershell
pnpm --filter @remember/mobile test
pnpm --filter @remember/mobile typecheck
```

---

### Task 6: 测试包 fixture + 手工验收清单

**Files:**

- Modify: `apps/mobile/assets/packs/`（可选：内置 story-test-pack.zip 供 dev 安装）
- Create: `docs/superpowers/plans/2026-08-02-story-reading-manual-qa.md`（可选；或写入本计划末尾）

**Interfaces:**

- Produces: mobile 可安装的 story zip；手工 QA 步骤

- [ ] **Step 1: 确认 `tools/pack-builder/fixtures/story-test-pack.zip` verify 通过**

- [ ] **Step 2: （可选）复制 zip 到 `apps/mobile/assets/packs/story-test-pack.zip` 供本地 dev**

- [ ] **Step 3: 手工验收清单（实施者执行并勾选）**

  1. 安装 story-test-pack（及 remember-test-pack vocabulary 对照）
  2. 打开 story C1：封面、标题、播放、图例数字与 sidebar tier 一致
  3. 正文 word 行内注释颜色正确；点词 sheet 与 sidebar 一致
  4. 「本课 N 词」列表完整、顺序正确
  5. 未滚到底时「我读完了」disabled；滚到底 enabled
  6. 点「我读完了」→ 下一项；杀进程重进 → 已完成课不再出现
  7. remember-test-pack vocabulary 一课：prompt/reveal/SM-2/点词 lexicon **零回归**

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/assets/packs/story-test-pack.zip  # 若添加
git commit -m "chore(mobile): 添加 story_reading 测试包 fixture"
```

---

### Task 7: pnpm check 全绿 + vocabulary 零回归

**Files:**

- （仅修复 CI 阻断项，不扩 scope）

- [ ] **Step 1: 全量检查**

```powershell
pnpm check
```

- [ ] **Step 2: 针对性测试**

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/pack-builder test
pnpm --filter @remember/mobile test
pnpm --filter @remember/domain test
```

- [ ] **Step 3: grep 确认 vocabulary 路径未误改**

```powershell
rg "VocabularyStudyPanel|validateVocabularyCard|CARD_TYPE_VOCABULARY" apps/mobile packages/contracts
```

- [ ] **Step 4: 手工 vocabulary 回归（remember-test-pack 一课）**

- [ ] **Step 5: Commit（若有 lint/format 修复）**

```bash
git commit -m "chore: story_reading 实施收尾 format/lint 修复"
```

---

## 建议 Git 分支与 PR

```text
git checkout -b feat/story-reading main   # 已创建
```

| PR | Tasks | 说明 |
| --- | --- | --- |
| 单 PR | Task 0–7 | 推荐单人 review 合并 |

**禁止：** 与 pack-editor、en-grade3 WIP、card-type-registry 分支未提交内容混 PR。

---

## 验收标准（Done — 对齐 spec §11）

- [ ] ADR 0012 附录含 story_reading + lesson_complete
- [ ] `SUPPORTED_CARD_TYPES` 含 `vocabulary` + `story_reading`
- [ ] story zip `pack-builder verify` 通过；sidebar 不一致负例被拒
- [ ] App：音频/封面/行内注释/tier 图例/点词/词表/我读完了/进度继承
- [ ] 已完成 story 课不进 SM-2 due/new 队列
- [ ] vocabulary 学习行为零回归
- [ ] `protocolVersion: 1` story pack 可构建
- [ ] `pnpm check` 全绿

---

## Self-Review

| 要求 | Task |
| --- | --- |
| ADR 附录 | Task 0 |
| contracts schema + parse + validate | Task 1 |
| pack-builder fixture + 负例 | Task 2 |
| lesson_complete + 完成哨兵 | Task 3 |
| StoryReadingRenderer 主 UI | Task 4 |
| 点词 + 词表页 | Task 5 |
| fixture + 手工 QA | Task 6 |
| pnpm check + vocabulary 回归 | Task 7 |
| 不含 pack-editor / Admin / API | Global Constraints |
| protocolVersion 不 bump | Global Constraints |

---

## 执行起手 Prompt（阶段 B）

```text
请阅读并执行：
- docs/superpowers/specs/2026-08-02-story-reading-design.md
- docs/superpowers/plans/2026-08-02-story-reading-implementation.md
- docs/decisions/0012-card-type-registry.md（附录）

使用 $build-learning-app、superpowers:subagent-driven-development（或 executing-plans），在分支 feat/story-reading 上按 Task 0→7 实施。

硬性要求：vocabulary 零回归；每 Task 一次 commit；每 Task 跑计划内测试；全部完成后 pnpm check 全绿 + 手工验收清单。
```
