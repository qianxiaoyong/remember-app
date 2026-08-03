# pack-editor story_reading 编辑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在本地 pack-editor 中支持 `story_reading` 卡片的全量编辑（含段级时间轴 UI、新增一课模板），保存/校验/打包与 vocabulary 同级可用。

**Architecture:** 复用 `@remember/contracts` 的 `storyReadingContentSchema` 与 `validateStoryReadingCard` 规则；pack-editor 本地 API 按 `cardType` 分支读写；前端 React Hook Form + 分段组件（lesson / sidebar / paragraphs / timeline）；音频预览经 local-api 只读流式提供 source 内 mp3。Admin 不改。

**Tech Stack:** TypeScript strict、React 19、Vite 5174、react-hook-form、Zod（contracts）、Vitest、Node http 中间件（现有 local-api）。

**分支:** `feat/pack-editor-story`（自 `main` / PR #10 合并后）

**关联文档:**

- `docs/superpowers/specs/2026-08-02-story-reading-design.md` §6（协议）
- `docs/runbooks/pack-editor-local.md`（需同步更新限制表）
- `packages/contracts/src/pack/story-reading-content.ts`
- `packages/contracts/src/pack/validate-story-reading-card.ts`

## Global Constraints

- 产品展示名：`记得`；实现/测试用 `$build-learning-app`。
- **不改动** Admin、API 业务、支付、sync、`protocolVersion`（仍为 1）。
- pack-editor **仅**读写 `tools/pack-builder/source/<packId>/`；zip 不可变，编辑后 bump `packVersion` 再 build。
- story **不**维护 `lexicon.json`；词表仅 `sidebar[]`。
- 校验必须与 pack-builder verify **同标准**（runs↔sidebar、tier、translationZh 全有或全无、时间轴单调无重叠）。
- 每 Task 一次 commit；**禁止**与 mobile / Admin / 无关 fixture 混 commit。
- 混 pack 中 vocabulary 编辑 **零回归**。

---

## 文件结构（实施前锁定）

| 路径 | 职责 |
| --- | --- |
| `tools/pack-editor/src/utils/story-card-template.ts` | 新增一课默认 content 模板 |
| `tools/pack-editor/src/utils/normalize-story-content.ts` | 保存前 trim / 删空 run / Zod parse |
| `tools/pack-editor/src/utils/story-content-issues.ts` | 交叉规则校验（sidebar 孤儿、tier、时间轴、translation）→ ValidationIssue[] |
| `tools/pack-editor/src/components/story-card-form.tsx` | story 编辑主表单（sticky footer 与 vocabulary 对齐） |
| `tools/pack-editor/src/components/story-lesson-fields.tsx` | lesson 字段 + 只读 knowledgeId 预览 |
| `tools/pack-editor/src/components/story-sidebar-editor.tsx` | sidebar CRUD 表 |
| `tools/pack-editor/src/components/story-paragraph-editor.tsx` | 段落列表、runs 编辑、插入 word run |
| `tools/pack-editor/src/components/story-timeline-editor.tsx` | **时间轴 MVP UI**（音频预览 + 段起止编辑） |
| `tools/pack-editor/src/server/read-audio-duration-ms.ts` | Node 侧读 mp3 时长（复用 pack-builder 脚本逻辑或 ffprobe 不可用时的 frame 估算） |
| `tools/pack-editor/src/server/story-source-validation.ts` | 服务端 story 卡校验（schema + 文件存在 + 交叉规则） |
| `tools/pack-editor/src/server/local-api-handlers.ts` | 扩展 save/create/validate/assets |
| `tools/pack-editor/src/server/routes.ts` | 新增 assets / audio-meta 路由 |
| `tools/pack-editor/src/pages/card-edit-page.tsx` | 挂载 StoryCardForm |
| `tools/pack-editor/src/pages/card-list-page.tsx` | 「+ 新增一课」、类型列 |
| `tools/pack-editor/src/api/local-api-client.ts` | `createStoryCard`、`fetchAudioDurationMs`、`assetUrl` |

---

## 产品边界（本 plan 内）

### 做

- 打开 / 保存 / 新增（模板）/ 删除 `story_reading` 卡
- 编辑 `lesson`、`sidebar`、`paragraphs`/`runs`、`translationZh`
- **时间轴 MVP UI**：播放 `primaryAudio`、按段显示色块轨道、每段 `audioStartMs`/`audioEndMs` 数字输入 +「设为起点/终点」+ 段内试听
- 校验纳入 story（local validate + 保存前拦截）
- 列表区分 vocabulary / story；混 pack 校验 + build 不变

### 不做

- Admin 内编辑、LLM 生成、Whisper 自动对齐
- 资源上传 UI（路径字符串 + 存在性检查；文件手工放入 `assets/`）
- `meta.json` 系列信息表单
- 波形 FFT 可视化（MVP 用进度条 + 段色块即可）

---

## Phase 0 — 分支与模板常量

### Task 0: story 新课模板

**Files:**

- Create: `tools/pack-editor/src/utils/story-card-template.ts`
- Create: `tools/pack-editor/src/utils/story-card-template.test.ts`

**Interfaces:**

- Produces: `createStoryCardTemplate(input: { sortOrder: number; lessonCode: string }): PackSourceStoryCard`
- Produces: `suggestNextLessonCode(existingCodes: string[]): string` — 在已有 `C1,C2…` 上递增

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, expect, it } from 'vitest';
import { createStoryCardTemplate, suggestNextLessonCode } from './story-card-template.js';

describe('createStoryCardTemplate', () => {
  it('生成含一段正文、占位时间轴与空 sidebar 的 story 卡', () => {
    const card = createStoryCardTemplate({ sortOrder: 2, lessonCode: 'C2' });
    expect(card.cardType).toBe('story_reading');
    expect(card.content.lesson.code).toBe('C2');
    expect(card.content.story.paragraphs).toHaveLength(1);
    expect(card.content.story.paragraphs[0]?.audioStartMs).toBe(0);
    expect(card.content.story.paragraphs[0]?.audioEndMs).toBe(5000);
    expect(card.content.sidebar).toEqual([]);
  });
});

describe('suggestNextLessonCode', () => {
  it('在 C1 后建议 C2', () => {
    expect(suggestNextLessonCode(['C1'])).toBe('C2');
  });
});
```

- [ ] **Step 2: 运行测试确认 FAIL**

Run: `pnpm --filter @remember/pack-editor exec vitest run src/utils/story-card-template.test.ts`

- [ ] **Step 3: 实现模板**

模板约定：

- `lesson.titleEn` = `'New Lesson'`，`titleZh` = `'新课'`
- `coverImage` = `'assets/images/placeholder.png'`，`primaryAudio` = `'assets/audio/placeholder.mp3'`（运营替换路径）
- 单段：`runs: [{ kind: 'text', text: 'Paragraph one.' }]`
- **无** `translationZh`（避免新建即触发全段翻译约束）
- 时间轴：单段 `0–5000` ms，便于时间轴 UI 立即可调
- `sidebar: []`

- [ ] **Step 4: 测试 PASS**

- [ ] **Step 5: Commit**

```bash
git add tools/pack-editor/src/utils/story-card-template.ts tools/pack-editor/src/utils/story-card-template.test.ts
git commit -m "feat(pack-editor): add story_reading new-lesson template"
```

---

## Phase 1 — 本地 API：story 读写与音频辅助

### Task 1: save/create story 卡

**Files:**

- Modify: `tools/pack-editor/src/server/local-api-handlers.ts`
- Modify: `tools/pack-editor/src/api/local-api-client.ts`
- Create: `tools/pack-editor/src/server/local-api-handlers.story.test.ts`

**Interfaces:**

- Consumes: `createStoryCardTemplate`, `normalizeStoryContent`（Task 2 可先 inline Zod，Task 2 再抽）
- Produces: `handleSaveCard` 接受 story；`handleCreateCard` body `{ cardType?: 'story_reading', lessonCode?: string }`

- [ ] **Step 1: 写 API 测试** — POST create story 返回模板；PUT save 合法 story 200；非法 tier 400

- [ ] **Step 2: 改 `handleSaveCard`**

```typescript
import { storyReadingContentSchema } from '@remember/contracts';
import { isStorySourceCard } from '../utils/is-story-source-card.js';

// 在 vocabulary safeParse 分支前：
if (isStorySourceCard(card)) {
  const parsed = storyReadingContentSchema.safeParse(card.content);
  // fail → 400 issues
  // pass → writePackSource
}
```

- [ ] **Step 3: 改 `handleCreateCard`**

```typescript
if (body.cardType === 'story_reading') {
  const lessonCode = body.lessonCode?.trim() || suggestNextLessonCode(/* scan existing story cards */);
  const newCard = createStoryCardTemplate({ sortOrder: maxSortOrder + 1, lessonCode });
  source.cards.push(newCard);
  // 201 { card: newCard }
}
```

- [ ] **Step 4: client `createStoryCard(packId, lessonCode?)`**

- [ ] **Step 5: vitest PASS + commit**

`feat(pack-editor): local API save and create story_reading cards`

---

### Task 2: 音频预览与时长 API

**Files:**

- Create: `tools/pack-editor/src/server/read-audio-duration-ms.ts`
- Create: `tools/pack-editor/src/server/read-audio-duration-ms.test.ts`
- Modify: `tools/pack-editor/src/server/routes.ts`
- Modify: `tools/pack-editor/src/server/local-api-handlers.ts` — `handleGetAsset`, `handleGetAudioMeta`

**Interfaces:**

- Produces: `readAudioDurationMs(absolutePath: string): number`
- Produces: `GET /local-api/packs/:packId/assets/*` — 只读流式（路径校验，防 `..`）
- Produces: `GET /local-api/packs/:packId/audio-meta?path=assets/audio/c1.mp3` → `{ durationMs }`

- [ ] **Step 1: 从 `tools/pack-builder/scripts/generate-story-c1-cards.mjs` 提取 `readMp3DurationMs` 到 TS 模块 + 单测（用 `story-test-pack` 的 c1.mp3 fixture 路径）**

- [ ] **Step 2: assets 路由** — `resolveSourceDir` + `assertAllowedPackPath` + `createReadStream`

- [ ] **Step 3: client**

```typescript
export function packAssetUrl(packId: string, relativePath: string): string {
  return `/local-api/packs/${encodeURIComponent(packId)}/assets/${relativePath.split('/').map(encodeURIComponent).join('/')}`;
}

export async function fetchAudioDurationMs(packId: string, relativePath: string): Promise<number> {
  const data = await readJson<{ durationMs: number }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/audio-meta?path=${encodeURIComponent(relativePath)}`),
  );
  return data.durationMs;
}
```

- [ ] **Step 4: commit** — `feat(pack-editor): asset streaming and audio duration API`

---

### Task 3: story 源校验（validate 端点）

**Files:**

- Create: `tools/pack-editor/src/utils/story-content-issues.ts`
- Create: `tools/pack-editor/src/utils/story-content-issues.test.ts`
- Create: `tools/pack-editor/src/server/story-source-validation.ts`
- Modify: `tools/pack-editor/src/server/validate-pack-source.ts`

**Interfaces:**

- Produces: `collectStoryContentIssues(sourceDir, card): ValidationIssue[]`
- 复用 contracts 逻辑：可 `parseStoryReadingContentJson` + 复制 validate 交叉规则，或调用 `validateStoryReadingCard`（需构造 manifestPaths = source 下 assets 相对路径集合）

- [ ] **Step 1: 测试** — orphan sidebar、tier mismatch、缺 translationZh、时间轴重叠、资源文件不存在

- [ ] **Step 2: `validatePackSource` 对 story 卡不再 `continue` skip**

- [ ] **Step 3: commit** — `feat(pack-editor): validate story_reading source cards`

---

## Phase 2 — 前端表单

### Task 4: StoryCardForm 骨架 + lesson / sidebar

**Files:**

- Create: `tools/pack-editor/src/utils/normalize-story-content.ts`
- Create: `tools/pack-editor/src/components/story-lesson-fields.tsx`
- Create: `tools/pack-editor/src/components/story-sidebar-editor.tsx`
- Create: `tools/pack-editor/src/components/story-card-form.tsx`
- Modify: `tools/pack-editor/src/pages/card-edit-page.tsx`

**Interfaces:**

- Consumes: `saveCard`, `PackSourceStoryCard`, `buildStoryKnowledgeId` from contracts（只读展示）
- Produces: `STORY_CARD_FORM_ID`, `StoryCardForm({ packId, defaultValues, onSubmit })`

- [ ] **Step 1: `normalizeStoryContent`** — `storyReadingContentSchema.parse`；trim lesson 字符串；删空 text run

- [ ] **Step 2: lesson 区** — code / titleEn / titleZh / coverImage / primaryAudio；下方只读 `knowledgeId`（`buildStoryKnowledgeId(packId, code)`）

- [ ] **Step 3: sidebar 表** — 可增删行；字段 vocabId, headword, ipa, pos, definitionZh, tier(select)

- [ ] **Step 4: card-edit-page** — `isStorySourceCard` 时渲染 `StoryCardForm` + sticky footer（保存/返回）

- [ ] **Step 5: 手动冒烟** — `pnpm dev:pack-editor` 打开 story-test-pack C1，改 titleZh 保存，刷新仍在

- [ ] **Step 6: commit** — `feat(pack-editor): story lesson and sidebar form`

---

### Task 5: 段落与 runs 编辑

**Files:**

- Create: `tools/pack-editor/src/components/story-paragraph-editor.tsx`

- [ ] **Step 1: 段落列表** — 增删段、上下移动 sortOrder

- [ ] **Step 2: 每段 runs** — text run 多行输入；word run 从 sidebar 下拉选 vocabId（自动填 surface/tier/glossZh）或手动

- [ ] **Step 3: translationZh** — 段级 textarea；顶部开关「启用段下翻译」：开启时给 **所有段** 补空字符串或删全部（enforce 全有或全无）

- [ ] **Step 4: 保存前跑 `collectStoryContentIssues` 展示 inline errors**

- [ ] **Step 5: commit** — `feat(pack-editor): story paragraph and runs editor`

---

### Task 6: 时间轴 MVP UI

**Files:**

- Create: `tools/pack-editor/src/components/story-timeline-editor.tsx`
- Create: `tools/pack-editor/src/components/story-timeline-editor.test.ts`（纯函数：段 UI 数据转换）

**UI 规格（MVP 必须实现）:**

```text
┌─ 音频 ─────────────────────────────────────────┐
│ [▶] ━━━━━●━━━━━━━━━━━━  01:23 / 03:45         │
├─ 段轨道 ───────────────────────────────────────┤
│ |██ seg1 ██|████ seg2 ████|████ seg3 ████|     │  ← 按 ms 比例色块
├─ 当前段 #2 ────────────────────────────────────┤
│ 起点 ms [9826] [设为播放位置]  终点 [15200] [设为播放位置] │
│ [▶ 播放本段]                                    │
└─ 全段启用时间轴 ☑ （关则清除所有 audio* 字段）──┘
```

行为：

1. 加载 `lesson.primaryAudio` → `packAssetUrl` + `<audio ref>`
2. mount 时 `fetchAudioDurationMs`；若段落无时间轴且用户勾选「启用」→ 均分 `durationMs / n`
3. 「设为播放位置」读 `audio.currentTime * 1000` 写入 start/end
4. 「播放本段」`audio.currentTime = start/1000; play();` 并在 `timeupdate` 到 end 时 pause
5. 改 ms 输入 → 重绘段轨道；保存时校验单调、无重叠、末段 ≤ duration
6. 勾选关 → 删除所有段 `audioStartMs`/`audioEndMs`

- [ ] **Step 1: 纯函数测试** — `buildSegmentTrack(paragraphs, durationMs)` 返回 `{ leftPct, widthPct, label }[]`

- [ ] **Step 2: 实现组件** — 嵌入 `StoryCardForm` 在 paragraph 编辑器下方或 Tab「时间轴」

- [ ] **Step 3: 与 `collectStoryContentIssues` 联动** — 重叠/越界显示红框

- [ ] **Step 4: 手动验收** — 打开 C1，拖播放头设 12 段时间轴，校验通过，build zip 成功

- [ ] **Step 5: commit** — `feat(pack-editor): story paragraph timeline editor UI`

---

## Phase 3 — 列表与文档

### Task 7: 卡片列表 UX

**Files:**

- Modify: `tools/pack-editor/src/pages/card-list-page.tsx`
- Modify: `docs/runbooks/pack-editor-local.md`

- [ ] **Step 1: 列增加 type** — `vocabulary` / `story` badge

- [ ] **Step 2: 工具栏** — 「+ 新增单词」（现有）、「+ 新增一课」→ 弹窗输入 `lessonCode`（默认 `suggestNextLessonCode`）→ `createStoryCard` → 进编辑页

- [ ] **Step 3: 删除确认 copy** — story 用「删除一课 #n CODE title」

- [ ] **Step 4: 更新 runbook** — 限制表改为支持 story_reading；补充时间轴编辑说明

- [ ] **Step 5: commit** — `feat(pack-editor): list UX for story cards and update runbook`

---

## Phase 4 — 验收

### Task 8: 全量检查

- [ ] **Step 1:** `pnpm --filter @remember/pack-editor test`
- [ ] **Step 2:** `pnpm --filter @remember/pack-editor typecheck`
- [ ] **Step 3:** `pnpm check`（根目录全绿）
- [ ] **Step 4: 手工流程**
  1. `pnpm dev:pack-editor`
  2. story-test-pack → 校验通过
  3. 新增 C99 课（模板）→ 改标题 → 设 1 段时间轴 → 保存 → 校验 → 打包
  4. remember-test-pack vocabulary 卡仍可编辑保存
- [ ] **Step 5: commit**（若有遗漏 fix）— `chore(pack-editor): story editing acceptance fixes`

---

## 验收清单

- [ ] story 卡可编辑保存，不再显示「暂不支持」
- [ ] 新增一课使用模板（单段 + 占位时间轴 + 空 sidebar）
- [ ] 时间轴 UI：播放、设为起/终点、段色块轨道、全段启用/禁用
- [ ] validate 捕获 sidebar 孤儿 / tier / translation / 时间轴 / 缺文件
- [ ] build 产出 zip 通过 pack-builder verify
- [ ] vocabulary 零回归
- [ ] Admin 无改动

---

## 风险

1. **改 `lesson.code`** 会改变 `knowledgeId`，App 端旧书签失效 — UI 改 code 时应用 ConfirmDialog 警告。
2. **placeholder 资源** 新建课校验失败 — 列表/表单顶部提示「请替换 placeholder 资源路径」；validate 明确报缺文件。
3. **mp3 时长估算误差** — 末段 `audioEndMs` 略小于真实时长即可；verify 可选传 `primaryAudioDurationMs`（build 时 pack-builder 会算）。

---

## Git

```bash
git checkout main
git pull origin main
git checkout -b feat/pack-editor-story
# 实施本 plan
# PR 目标：main
```

**禁止：** 与 mobile reader、Admin、无关 zip fixture 批量变更混 PR。
