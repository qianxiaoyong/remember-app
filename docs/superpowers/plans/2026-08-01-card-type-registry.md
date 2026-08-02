# Card Type Registry（轻量呈现分发）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变 vocabulary 学习行为的前提下，引入 `cardType` 轻量 registry，使 study 屏、parse、verify 按类型分发；为后续 `story_reading`、`dialogue_scenario` 等新呈现铺路。

**Architecture:** 静态编译期 registry（非运行时插件）。`packages/contracts` 定义 `CardType` 与 parse 分发；`pack-builder` verify 按 type 注册 validator；`apps/mobile` 用 `cardTypeRegistry[type].Renderer` 渲染，会话/SM-2/同步逻辑保留在 study 壳层。

**Tech Stack:** TypeScript strict、Zod、`@remember/contracts`、`@remember/pack-builder`、Expo Router、`apps/mobile` React Native、Vitest。

## Global Constraints

- 产品展示名「记得」；仓库 `remember-app`。
- **本计划仅 refactor + vocabulary 零行为变更**；**不**实现 `story_reading` / 对话 / OCR / AI。
- `cardType` 全链路统一命名（sqlite、`constants.ts`、registry 键一致）。
- `parseCardContentJson` **保留**为 vocabulary 别名，避免一次性改断 pack-builder 外部引用；新增 `parsePackCardContent` 作为分发入口。
- `SUPPORTED_CARD_TYPES` 在本计划结束时仍 **只有** `vocabulary`；新 type 在后续 ADR/计划中扩展。
- 页面/用例不得直接访问 sqlite；继续经 repository / use-case（`docs/ai-rules/boundaries.md`）。
- 每 Task 结束跑列出的验证命令；合并前 `pnpm check` 全绿。
- 每 Task 一次 commit；不与其他 feature 混 PR。

## 范围外（defer）

| 项                              | 说明                        |
| ------------------------------- | --------------------------- |
| `story_reading` schema + UI     | 单独计划，registry merge 后 |
| `dialogue_scenario` + OCR/AI    | 单独 ADR + 计划             |
| pack-editor 新 type 表单        | 随具体 type 再做            |
| 运行时插件 / 远程加载 Renderer  | 明确不做                    |
| Admin / API / 支付 / 同步表结构 | 不改动                      |

---

## 文件结构（完成后）

```text
docs/decisions/0012-card-type-registry.md

packages/contracts/src/pack/
  constants.ts                    # CardType、SUPPORTED_CARD_TYPES
  card.ts                         # parsePackCardContent、PackCardDetail 类型（契约侧）
  card-type-registry.ts           # parse 分发（contracts 层，无 React）
  vocabulary-content.ts           # 不变
  verify-content.ts               # 薄分发层
  validate-vocabulary-card.ts     # 从 verify-content 抽出

apps/mobile/src/
  data/pack/pack-card-details.ts  # 读 sqlite + cardType + parsePackCardContent
  learning/card-types/
    types.ts                      # CardRendererProps、ReviewMode、CardTypeDefinition
    registry.ts                   # cardTypeRegistry
    unsupported-card-panel.tsx
    vocabulary/
      parse-content.ts
      vocabulary-study-panel.tsx  # 从 study-screen 抽出
  screens/study-screen.tsx        # 壳 + registry 分发 + SM-2 底栏
  hooks/use-study-flow.ts         # cardDetail 类型扩展（行为不变）

tools/pack-builder/               # verify 仍经 @remember/contracts，无新文件必需
```

---

### Task 0: ADR 0012（cardType registry 约定）

**Files:**

- Create: `docs/decisions/0012-card-type-registry.md`

**Interfaces:**

- Produces: 文档约定——registry 位置、`reviewMode` 枚举、新增 type 的 5 步 checklist、与 ADR 0008 关系（0008 仍管 zip 外壳；0012 管 cardType 扩展）

- [ ] **Step 1: 写 ADR**

内容必含：

- `CardType` 命名：`vocabulary` | 未来 `story_reading` | …
- `reviewMode`: `'sm2' | 'none' | 'interactive'`（本计划仅实现 `sm2`）
- 三层：contracts parse → pack-builder validate → mobile Renderer
- 禁止：HTML 富文本进 pack、App 直连 LLM、运行时插件

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/0012-card-type-registry.md
git commit -m "docs: ADR 0012 cardType 轻量 registry 约定"
```

---

### Task 1: contracts — CardType 与 parsePackCardContent

**Files:**

- Modify: `packages/contracts/src/pack/constants.ts`
- Create: `packages/contracts/src/pack/card-type-registry.ts`
- Modify: `packages/contracts/src/pack/card.ts`
- Modify: `packages/contracts/src/pack/index.ts`
- Create: `packages/contracts/src/pack/card-type-registry.test.ts`

**Interfaces:**

- Produces:
  - `export type CardType = typeof CARD_TYPE_VOCABULARY`（可扩展为 union）
  - `export function parsePackCardContent(cardType: string, contentJson: string): ParsedPackCardContent`
  - `export type ParsedPackCardContent = { cardType: 'vocabulary'; content: VocabularyContent }`
  - `parseCardContentJson` 保留，内部仍调 vocabulary schema

- [ ] **Step 1: 写失败测试**

```typescript
// packages/contracts/src/pack/card-type-registry.test.ts
import { describe, expect, it } from 'vitest';
import { PackVerificationError } from './errors.js';
import { parsePackCardContent } from './card-type-registry.js';

describe('parsePackCardContent', () => {
  it('vocabulary 合法 content 解析成功', () => {
    const json = JSON.stringify({
      prompt: { headword: 'hi', primaryAudio: 'assets/a.mp3' },
      reveal: { definitions: [{ text: '嗨' }], examples: [{ en: 'Hi.', zh: '嗨。' }] },
    });
    const result = parsePackCardContent('vocabulary', json);
    expect(result.cardType).toBe('vocabulary');
    expect(result.content.prompt.headword).toBe('hi');
  });

  it('未知 cardType 抛 PACK_UNSUPPORTED_CARD_TYPE', () => {
    expect(() => parsePackCardContent('story_reading', '{}')).toThrow(PackVerificationError);
  });
});
```

- [ ] **Step 2: 运行测试确认 FAIL**

Run: `pnpm --filter @remember/contracts test -- card-type-registry.test.ts`  
Expected: FAIL（模块或函数不存在）

- [ ] **Step 3: 实现 card-type-registry.ts**

```typescript
// packages/contracts/src/pack/card-type-registry.ts
import { PackVerificationError } from './errors.js';
import { CARD_TYPE_VOCABULARY, SUPPORTED_CARD_TYPES } from './constants.js';
import { parseCardContentJson } from './card.js';
import type { VocabularyContent } from './vocabulary-content.js';

export type ParsedPackCardContent = {
  cardType: typeof CARD_TYPE_VOCABULARY;
  content: VocabularyContent;
};

export function parsePackCardContent(cardType: string, contentJson: string): ParsedPackCardContent {
  if (cardType !== CARD_TYPE_VOCABULARY) {
    throw new PackVerificationError(
      'PACK_UNSUPPORTED_CARD_TYPE',
      `unsupported cardType: ${cardType}`,
    );
  }
  return { cardType: CARD_TYPE_VOCABULARY, content: parseCardContentJson(contentJson) };
}

export function isSupportedCardType(cardType: string): cardType is typeof CARD_TYPE_VOCABULARY {
  return (SUPPORTED_CARD_TYPES as readonly string[]).includes(cardType);
}
```

- [ ] **Step 4: 在 errors 中确认有 `PACK_UNSUPPORTED_CARD_TYPE` 码；若无则添加**

- [ ] **Step 5: 运行测试 PASS**

Run: `pnpm --filter @remember/contracts test`

- [ ] **Step 6: Commit**

```bash
git add packages/contracts/src/pack/
git commit -m "feat(contracts): 添加 parsePackCardContent 与 CardType 分发"
```

---

### Task 2: pack-builder — verify 按 cardType 分发

**Files:**

- Create: `packages/contracts/src/pack/validate-vocabulary-card.ts`
- Modify: `packages/contracts/src/pack/verify-content.ts`
- Modify: `packages/contracts/src/pack/verify-content.test.ts`

**Interfaces:**

- Consumes: `parsePackCardContent`、`isSupportedCardType`（Task 1）
- Produces:
  - `export function validateVocabularyCard(packId, card, manifestPaths): PackCardRow`
  - `validatePackCards` 循环内：`isSupportedCardType` → 调对应 validator

- [ ] **Step 1: 将 verify-content.ts 中 vocabulary 专属逻辑（knowledgeId/headword 匹配、asset 断言、content parse）移到 validate-vocabulary-card.ts**

- [ ] **Step 2: verify-content.ts 保留共用循环**（duplicate knowledgeId/sortOrder、空表检查），单卡校验改为：

```typescript
if (!isSupportedCardType(card.cardType)) {
  throw new PackVerificationError(
    'PACK_UNSUPPORTED_CARD_TYPE',
    `unsupported cardType: ${card.cardType}`,
  );
}
if (card.cardType === CARD_TYPE_VOCABULARY) {
  validated.push(validateVocabularyCard(packId, card, manifestPaths));
}
```

- [ ] **Step 3: 更新 verify-content.test.ts**

- 现有「拒绝非 vocabulary」用例 error code 改为 `PACK_UNSUPPORTED_CARD_TYPE`（若 ADR 允许；否则保持 `PACK_CONTENT_INVALID` 并在 ADR 注明——**实现时二选一并与测试一致**）

- [ ] **Step 4: 运行测试**

Run:

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/pack-builder test
pnpm --filter @remember/pack-builder build:pack
```

- [ ] **Step 5: Commit**

```bash
git add packages/contracts/src/pack/validate-vocabulary-card.ts packages/contracts/src/pack/verify-content.ts packages/contracts/src/pack/verify-content.test.ts
git commit -m "refactor(contracts): vocabulary 校验抽出并按 cardType 分发"
```

---

### Task 3: mobile 读卡 — sqlite 带出 cardType

**Files:**

- Modify: `apps/mobile/src/data/pack/pack-card-details.ts`
- Modify: `apps/mobile/src/use-cases/get-pack-card-detail.ts`（若仅 re-export 可不动）
- Create: `apps/mobile/src/data/pack/pack-card-details.test.ts`

**Interfaces:**

- Produces:
  - `export type PackCardDetail = ParsedPackCardContent & { knowledgeId: string; sortOrder: number; headword: string }`
  - `getPackCardDetail` SELECT 含 `cardType` 字段
  - `headword`：vocabulary 仍从 `content.prompt.headword` 取；未知 type 用 `knowledgeId` 兜底

- [ ] **Step 1: 写失败测试**（mock 最小 sqlite 或使用现有 test 模式；若 mobile 无 sqlite 测试基建，则测 **纯函数** `mapCardRowToDetail(row)` 抽出来测）

```typescript
// apps/mobile/src/data/pack/pack-card-details.test.ts
import { describe, expect, it } from 'vitest';
import { mapCardRowToDetail } from './pack-card-details.js';

describe('mapCardRowToDetail', () => {
  it('vocabulary 行映射含 cardType 与 headword', () => {
    const detail = mapCardRowToDetail({
      knowledgeId: 'p:en:word:hi',
      cardType: 'vocabulary',
      sortOrder: 1,
      content: JSON.stringify({
        prompt: { headword: 'hi', primaryAudio: 'assets/a.mp3' },
        reveal: { definitions: [{ text: '嗨' }], examples: [{ en: 'Hi.', zh: '嗨。' }] },
      }),
    });
    expect(detail?.cardType).toBe('vocabulary');
    expect(detail?.headword).toBe('hi');
  });
});
```

- [ ] **Step 2: 实现 mapCardRowToDetail + 更新 get/list/search**

- [ ] **Step 3: 运行测试**

Run: `pnpm --filter @remember/mobile test -- pack-card-details.test.ts`

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/data/pack/pack-card-details.ts apps/mobile/src/data/pack/pack-card-details.test.ts
git commit -m "feat(mobile): 读卡携带 cardType 并经 parsePackCardContent 解析"
```

---

### Task 4: 抽出 VocabularyStudyPanel（尚未接 registry）

**Files:**

- Create: `apps/mobile/src/learning/card-types/vocabulary/vocabulary-study-panel.tsx`
- Modify: `apps/mobile/src/screens/study-screen.tsx`

**Interfaces:**

- Produces: `VocabularyStudyPanel` props 与现 study-screen 卡片区一致（`content`、`revealed`、`onReveal`、lexicon 回调、音频回调等）

- [ ] **Step 1: 新建 vocabulary-study-panel.tsx**

从 `study-screen.tsx` **原样剪切**（非重写）：

- `StudyHeaderBand`
- `revealed ? StudyRevealScrollBody : StudyRecallPanel` 分支
- 相关 `ScrollView` styles

- [ ] **Step 2: study-screen 改为 import VocabularyStudyPanel**

行为应 **像素级一致**。

- [ ] **Step 3: 手工回归**

Run dev client，路径：书库 → 学习 → 三按钮 → 点词 → 音频。

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/learning/card-types/vocabulary/vocabulary-study-panel.tsx apps/mobile/src/screens/study-screen.tsx
git commit -m "refactor(mobile): 抽出 VocabularyStudyPanel，行为不变"
```

---

### Task 5: cardTypeRegistry + study-screen 分发

**Files:**

- Create: `apps/mobile/src/learning/card-types/types.ts`
- Create: `apps/mobile/src/learning/card-types/registry.ts`
- Create: `apps/mobile/src/learning/card-types/vocabulary/parse-content.ts`
- Create: `apps/mobile/src/learning/card-types/unsupported-card-panel.tsx`
- Modify: `apps/mobile/src/learning/card-types/vocabulary/vocabulary-study-panel.tsx`（如需适配 CardRendererProps）
- Modify: `apps/mobile/src/screens/study-screen.tsx`
- Modify: `apps/mobile/src/hooks/use-study-flow.ts`（`cardDetail` 类型；逻辑不变）
- Create: `apps/mobile/src/learning/card-types/registry.test.ts`

**Interfaces:**

```typescript
// types.ts
export type ReviewMode = 'sm2' | 'none' | 'interactive';

export interface CardRendererProps {
  packId: string;
  knowledgeId: string;
  sortOrder: number;
  content: unknown; // 各 Renderer 内窄化
  revealed: boolean;
  setRevealed: (value: boolean) => void;
  // …现 useStudyFlow 已暴露的 lexicon / 音频 handlers
}

export interface CardTypeDefinition {
  reviewMode: ReviewMode;
  Renderer: (props: CardRendererProps) => ReactElement;
}

// registry.ts
export const cardTypeRegistry: Record<string, CardTypeDefinition> = {
  vocabulary: { reviewMode: 'sm2', Renderer: VocabularyStudyPanel },
};

export function resolveCardTypeDefinition(cardType: string): CardTypeDefinition | null;
```

- [ ] **Step 1: 写 registry 测试**

```typescript
import { describe, expect, it } from 'vitest';
import { resolveCardTypeDefinition } from './registry.js';

describe('cardTypeRegistry', () => {
  it('vocabulary 已注册且 reviewMode 为 sm2', () => {
    const def = resolveCardTypeDefinition('vocabulary');
    expect(def?.reviewMode).toBe('sm2');
  });
  it('未知 type 返回 null', () => {
    expect(resolveCardTypeDefinition('story_reading')).toBeNull();
  });
});
```

- [ ] **Step 2: 实现 registry + UnsupportedCardPanel**（文案：「暂不支持此卡片类型」+ 返回书库按钮）

- [ ] **Step 3: study-screen 改造**

```text
cardDetail 存在时：
  def = resolveCardTypeDefinition(cardDetail.cardType)
  def ? <def.Renderer ... /> : <UnsupportedCardPanel />
showRatingBar = def?.reviewMode === 'sm2' && revealed && session?.currentItem && intervalLabels
```

- [ ] **Step 4: 运行测试 + check**

Run:

```powershell
pnpm --filter @remember/mobile test
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/learning/card-types/ apps/mobile/src/screens/study-screen.tsx apps/mobile/src/hooks/use-study-flow.ts
git commit -m "feat(mobile): cardTypeRegistry 分发 vocabulary 呈现"
```

---

### Task 6: 扫尾引用与搜索/预览

**Files:**

- Modify: `apps/mobile/src/components/search/pack-card-search-result-row.tsx`
- Modify: `apps/mobile/src/screens/pack-preview-screen.tsx`（预览仍映射 vocabulary sample；加注释或 guard `cardType === 'vocabulary'`）
- Modify: `docs/decisions/0012-card-type-registry.md`（追加「新增 cardType 检查清单」）

**Interfaces:**

- Consumes: `PackCardDetail.cardType`（Task 3）

- [ ] **Step 1: 搜索列表仍只支持 vocabulary headword**；类型上允许 `PackCardDetail`，UI 只展示 `headword`

- [ ] **Step 2: pack-preview 继续用 vocabulary 组件**；文件头注释：preview 仅适用于 vocabulary sample

- [ ] **Step 2: 全库 grep 确认无遗漏**

Run: `rg "parseCardContentJson" apps/mobile packages/contracts tools/pack-builder`

- [ ] **Step 3: 最终验证**

Run:

```powershell
pnpm check
pnpm --filter @remember/mobile test
pnpm --filter @remember/contracts test
pnpm --filter @remember/pack-builder test
```

- [ ] **Step 4: 手工回归清单**

1. 安装 `remember-test-pack`
2. 学习 3 张卡：未揭示 → 揭示 → 三按钮
3. 点词弹层、例句音频
4. 完成或退出再进，进度保留
5. 搜索 headword 进学习
6. 预览页（若有 sample）正常

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/components/search/ apps/mobile/src/screens/pack-preview-screen.tsx docs/decisions/0012-card-type-registry.md
git commit -m "chore(mobile): 搜索与预览对齐 cardType，补 ADR 扩展清单"
```

---

## 建议 Git 分支与 PR

```text
git checkout -b feat/card-type-registry main
```

| PR  | Tasks    | 说明                               |
| --- | -------- | ---------------------------------- |
| #1  | Task 0–2 | ADR + contracts + verify           |
| #2  | Task 3–5 | mobile 读卡 + registry（**核心**） |
| #3  | Task 6   | 扫尾                               |

可合并为 **单个 PR**（Tasks 0–6）若你单人 review；**禁止**与本计划外的 story UI 同 PR。

---

## 验收标准（Done）

- [ ] ADR 0012 已 merge
- [ ] vocabulary 学习路径手工回归通过（与 refactor 前一致）
- [ ] `pnpm check` 全绿
- [ ] `parsePackCardContent` / registry 对未知 type 有明确错误或未支持 UI
- [ ] `SUPPORTED_CARD_TYPES` 仍仅 `vocabulary`（新 type 未半套落地）
- [ ] 未改 Admin / API / 支付 / sync schema

---

## 新增 cardType 检查清单（写入 ADR 附录）

后续 `story_reading` 等 **另开计划**，按序：

1. ADR 或 amend 0012：content schema 与 `reviewMode`
2. `packages/contracts`：schema + `parsePackCardContent` 分支 + `SUPPORTED_CARD_TYPES` 追加
3. `validate-*-card.ts` + `verify-content` 注册
4. `apps/mobile/learning/card-types/<type>/`：Renderer + parse
5. `registry.ts` 注册一行
6. pack-builder 测试包 + mobile 手工回归
7. （可选）pack-editor 表单

---

## Self-Review

| 要求                 | Task               |
| -------------------- | ------------------ |
| ADR 约定             | Task 0             |
| contracts parse 分发 | Task 1             |
| verify 分发          | Task 2             |
| mobile 读 cardType   | Task 3             |
| UI 抽出 + registry   | Task 4–5           |
| 搜索/预览扫尾        | Task 6             |
| 不含 story/AI        | Global Constraints |
| 无 TBD 占位          | 全文               |

---

## 执行起手 Prompt（新窗口）

```text
请阅读并执行：
- docs/decisions/0012-card-type-registry.md（Task 0 先写）
- docs/superpowers/plans/2026-08-01-card-type-registry.md

使用 $build-learning-app、executing-plans，在分支 feat/card-type-registry 上按 Task 0→6 实施。

硬性要求：vocabulary 学习行为零变更；不实现 story_reading；每 Task commit；每 Task 跑计划内测试；全部完成后 pnpm check 全绿 + 手工回归清单。
```
