# 中心词库 Schema 与契约 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地中心词库数据层基础——PostgreSQL 7 张 `content_*` 表、Admin lexicon Zod 契约、`@remember/domain` 词库纯函数（键规范化、搜索排序）；**不**实现 Admin API / UI / pack-editor。

**Architecture:** ADR 0013 表结构 → Prisma migration → `packages/contracts/src/admin/lexicon.ts`（API 契约唯一来源）→ `packages/domain/src/lexicon/`（与 DB/API 无关的纯逻辑）；与 `packs`/`orders` 零交叉。

**Tech Stack:** Prisma 6、PostgreSQL 18、Zod、Vitest

**Kickoff：** `docs/superpowers/plans/2026-08-04-central-lexicon-kickoff.md`  
**ADR：** `docs/decisions/0013-central-content-lexicon-outline.md`  
**Docker runbook：** `docs/runbooks/local-api-docker-dev.md`

## Global Constraints

- **新增** `content_*` 表族；**不改** `packs` / `orders` / `pack_access` / `users` 等现有表
- **不** 实现 NestJS 模块、Admin UI、pack-editor Workbench（属子计划 2–4）
- **不** 建 `content_enrichment_runs`；片段 **无** `llm_model` / `llm_prompt_version`
- Prisma 模型 **不得** 直接作为 API 响应（子计划 2 经契约映射）
- `lemma_key` / `form_key` 规范化逻辑在 `@remember/domain`，contracts 与 pack-builder 共用
- 契约修改须通过 `pnpm --filter @remember/contracts test`

## 业务交付（本计划结束时）

1. Prisma migration 创建 7 表，索引与外键与 ADR 0013 §4 一致
2. `packages/contracts/src/admin/lexicon.ts` 冻结 search/detail/by-form/batch-get/patch/enrich 请求响应 Zod
3. `packages/domain/src/lexicon/` 提供 `normalizeLemmaKey`、`normalizeFormKey`、`compareLemmaStatusForSearch`
4. `pnpm check` 全绿

---

### Task 1: Prisma 迁移 — content_* 七表

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260804100000_add_content_lexicon/migration.sql`

**Models（`@@map` snake_case）:**

| 表                        | 要点                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `content_lemmas`          | `lemma_key` UNIQUE；`status` default `draft`；`published_by_admin_id` FK → `admin_users` |
| `content_lemma_fragments` | FK → lemmas；`fragment_type` + `sort_order`；`content` JSONB                             |
| `content_lemma_forms`     | `form_key` UNIQUE PK；FK → lemmas                                                        |
| `content_tags`            | `tag_key` UNIQUE                                                                         |
| `content_lemma_tag_links` | `@@id([lemmaId, tagId])`                                                                 |
| `content_import_batches`  | `file_sha256` UNIQUE（幂等）                                                             |
| `content_lemma_assets`    | FK → lemmas；`asset_kind` + `storage_kind`                                               |

**索引：** `content_lemmas(status)`；`content_lemmas(headword)`；`content_lemma_fragments(lemma_id, fragment_type)`；`content_lemma_forms(lemma_id)`

- [ ] **Step 1:** 在 schema.prisma 追加七 model 及关系
- [ ] **Step 2:** 手写 migration SQL（与 Prisma generate 一致）
- [ ] **Step 3:** `pnpm --filter @remember/api exec prisma generate`

---

### Task 2: `packages/contracts` admin lexicon 契约

**Files:**

- Create: `packages/contracts/src/admin/lexicon.ts`
- Modify: `packages/contracts/src/admin/index.ts`
- Modify: `packages/contracts/src/admin/admin.test.ts`

**枚举（Zod）：**

- `lemmaStatusSchema`: `draft` \| `published` \| `archived`
- `lemmaSourceSchema`: `ecdict` \| `manual` \| `ai` \| `merged` \| `llm`（片段 source 含 llm）
- `fragmentTypeSchema`: `definition_zh` \| `definition_en` \| `example` \| `mnemonic` \| `morphology` \| `note`
- `lemmaFormTypeSchema`: `past` \| `plural` \| `gerund` \| `third_person` \| `comparative` \| `superlative` \| `other`
- `lemmaAssetKindSchema`: `pronunciation_us` \| `pronunciation_uk` \| `example_audio`
- `lemmaAssetStorageKindSchema`: `pack_relative` \| `cos`

**片段 content schema（`.strict()`）：**

| fragment_type   | 字段                                      |
| --------------- | ----------------------------------------- |
| `definition_zh` | `{ text, pos? }`                          |
| `definition_en` | `{ text }`                                |
| `example`       | `{ en, zh, note? }`                       |
| `mnemonic`      | `{ text }`                                |
| `morphology`    | `{ root?, prefix?, suffix?, breakdown? }` |
| `note`          | `{ text }`                                |

**API 契约（子计划 2 实现端点，本计划冻结 shape）：**

| 方法  | 路径                                     | Schema                                         |
| ----- | ---------------------------------------- | ---------------------------------------------- |
| GET   | `/api/v1/admin/lexicon/search`           | query → `adminLexiconSearchResponseSchema`     |
| GET   | `/api/v1/admin/lexicon/:lemmaKey`        | → `adminLexiconDetailSchema`                   |
| GET   | `/api/v1/admin/lexicon/by-form/:formKey` | → `adminLexiconByFormResponseSchema`           |
| POST  | `/api/v1/admin/lexicon/batch-get`        | `adminLexiconBatchGetRequestSchema` → response |
| PATCH | `/api/v1/admin/lexicon`                  | `adminLexiconPatchRequestSchema` → response    |
| POST  | `/api/v1/admin/lexicon/enrich`           | `adminLexiconEnrichRequestSchema` → response   |

**Search 响应项：** `lemmaKey`, `headword`, `status`, `ipa?`, `pos?`, `source` — **published 排序由 API 层用 domain 函数实现，契约只描述数组**

- [ ] **Step 1:** 实现 fragment content 与 API schema
- [ ] **Step 2:** 导出至 `admin/index.ts`
- [ ] **Step 3:** 契约测试 round-trip + 拒绝未知字段
- [ ] **Step 4:** `pnpm --filter @remember/contracts test`

---

### Task 3: `packages/domain` lexicon 纯函数

**Files:**

- Create: `packages/domain/src/lexicon/normalize-keys.ts`
- Create: `packages/domain/src/lexicon/search-sort.ts`
- Create: `packages/domain/src/lexicon/normalize-keys.test.ts`
- Create: `packages/domain/src/lexicon/search-sort.test.ts`
- Modify: `packages/domain/src/index.ts`

**Interfaces:**

- `normalizeLemmaKey(input: string): string | null` — trim、小写、仅 `[a-z0-9'-]`（与 ADR lemma_key 一致）
- `normalizeFormKey(input: string): string | null` — 同 lemma_key 规则（点词形 `went` 等）
- `lemmaStatusRank(status: 'draft' \| 'published' \| 'archived'): number` — published=0, draft=1, archived=2
- `compareLemmaStatusForSearch(a, b): number` — 供 search ORDER BY 等价逻辑

- [ ] **Step 1:** 实现 normalize + sort 函数
- [ ] **Step 2:** 单元测试边界（标点 strip、空串、published 优先）
- [ ] **Step 3:** `pnpm --filter @remember/domain test`

---

### Task 4: 全仓验证

- [ ] **Step 1:** `pnpm check`
- [ ] **Step 2:** 确认 `apps/api` 集成测试无回归（migration 仅增表，不改旧表）

---

## 后续子计划依赖

- 子计划 2 `2026-08-04-central-lexicon-admin-api.md` 依赖本计划 Task 1–3
- 子计划 5 ECDICT 导入依赖 Task 1 `content_import_batches`
- 子计划 4 pack-editor 依赖子计划 2 API + 本计划 contracts
