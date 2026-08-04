# 中心词库 Admin API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 `AdminLexiconModule`——search / detail / by-form / batch-get / patch / enrich（限流）；patch 写 `audit_logs`；**不**改 packs/orders 业务逻辑。

**Architecture:** `packages/contracts` 已冻结 Zod → `apps/api/src/admin/lexicon/`（repository + mapper + service + controller）→ Prisma `content_*`；enrich 走 mock（dev/test）或可配置 HTTP LLM；排序用 `@remember/domain` `compareLemmaStatusForSearch`。

**Tech Stack:** NestJS 11、Prisma 6、PostgreSQL、Zod、Vitest + supertest 集成测试

**Kickoff：** `docs/superpowers/plans/2026-08-04-central-lexicon-kickoff.md`  
**前置：** `docs/superpowers/plans/2026-08-04-central-lexicon-schema-and-contracts.md`  
**ADR：** `docs/decisions/0013-central-content-lexicon-outline.md` §3.1、§6

## Global Constraints

- 新目录 `apps/api/src/admin/lexicon/`；**禁止** `AdminPacksService` import lexicon repository
- 路由前缀 `/api/v1/admin/lexicon/`；须 `AdminAuthGuard`
- Prisma 模型 **不得** 直接作为 API 响应（经 mapper + Zod parse）
- patch / publish 写 `audit_logs`（action `lexicon.patch` / `lexicon.publish`）
- enrich **限流** 默认 5 并发；无 `enrichment_runs` 表；片段 `source=llm`、无模型版本字段
- 搜索 **含 draft**；可选 `status` 过滤；**published 排序优先**
- 子计划 2 **不** 实现 Admin UI、pack-editor Workbench、ECDICT 导入

---

### Task 1: 配置与 domain 依赖

**Files:**

- Create: `apps/api/src/config/read-lexicon-config.ts`
- Modify: `apps/api/package.json`（`@remember/domain` workspace 依赖）
- Modify: `apps/api/.env.example`

**Env:**

| 变量                            | 默认                      | 说明               |
| ------------------------------- | ------------------------- | ------------------ |
| `LEXICON_ENRICH_MOCK_ENABLED`   | `true`（未设时 dev/test） | mock 产出草稿片段  |
| `LEXICON_ENRICH_MAX_CONCURRENT` | `5`                       | enrich 并发上限    |
| `LEXICON_ENRICH_API_URL`        | 空                        | 可选 HTTP LLM 端点 |
| `LEXICON_ENRICH_API_KEY`        | 空                        | 可选 Bearer        |

- [ ] **Step 1:** 实现 config reader
- [ ] **Step 2:** 添加 `@remember/domain` 依赖

---

### Task 2: Repository + Mapper

**Files:**

- Create: `apps/api/src/admin/lexicon/admin-lexicon.repository.ts`
- Create: `apps/api/src/admin/lexicon/admin-lexicon.mapper.ts`
- Create: `apps/api/src/admin/lexicon/validate-fragment-content.ts`

**Interfaces:**

- `searchLemmas(q, status?, limit, offset)` → `{ rows, total }`；SQL `ORDER BY CASE status …` published 优先
- `findDetailByLemmaKey` / `findDetailByFormKey` / `findDetailsByLemmaKeys`
- `upsertLemmaWithPatches(tx, patch, adminUserId)` — 事务内 patch

**Mapper:** Prisma row → camelCase ISO 字符串 → `adminLexiconDetailSchema.parse`

- [ ] **Step 1:** repository 查询与 patch 持久化
- [ ] **Step 2:** mapper + fragment content Zod 校验

---

### Task 3: Service + Enrich 限流

**Files:**

- Create: `apps/api/src/admin/lexicon/admin-lexicon-enrich.service.ts`
- Create: `apps/api/src/admin/lexicon/admin-lexicon.service.ts`

**Enrich:**

- 进程内计数信号量，`active >= max` → `429 LEXICON_ENRICH_RATE_LIMITED`
- mock：按 `fragmentTypes` 返回 `source: 'llm'` 草稿（不持久化）
- 可选：POST `LEXICON_ENRICH_API_URL`（JSON body，失败回退 mock 或 502）

**Patch:**

- 支持新建 lemma（无行时 `source=manual`, `status=draft`）
- `status: published` 时写 `publishedAt` / `publishedByAdminId`
- 事务 + `auditService.writeAuditLog`

- [ ] **Step 1:** enrich service + 限流
- [ ] **Step 2:** lexicon service 编排

---

### Task 4: Controller + 模块注册

**Files:**

- Create: `apps/api/src/admin/lexicon/admin-lexicon.controller.ts`
- Modify: `apps/api/src/admin/admin.module.ts`

**路由（顺序：静态路径先于 `:lemmaKey`）:**

| 方法  | 路径                             |
| ----- | -------------------------------- |
| GET   | `admin/lexicon/search`           |
| GET   | `admin/lexicon/by-form/:formKey` |
| POST  | `admin/lexicon/batch-get`        |
| PATCH | `admin/lexicon`                  |
| POST  | `admin/lexicon/enrich`           |
| GET   | `admin/lexicon/:lemmaKey`        |

- [ ] **Step 1:** controller + guard
- [ ] **Step 2:** 注册 AdminLexicon* providers

---

### Task 5: 集成测试

**Files:**

- Create: `apps/api/test/admin-lexicon.e2e.test.ts`
- Modify: `apps/api/test/helpers/db-test-helper.ts`（`resetContentLexiconTables`）
- Modify: `apps/api/test/helpers/integration-env.ts`

**Cases:**

1. 无 token → 401
2. search：seed draft + published；published 排在 draft 前
3. GET detail / by-form / batch-get
4. PATCH 更新 + `audit_logs` 行存在
5. enrich 返回 `draftFragments`（mock）
6. App token 调 admin lexicon → 401

- [ ] **Step 1:** helper + seed fixture
- [ ] **Step 2:** e2e 测试
- [ ] **Step 3:** `pnpm --filter @remember/api test:integration`

---

### Task 6: 全仓验证

- [ ] **Step 1:** `pnpm check`

---

## 后续依赖

- 子计划 3 Admin UI 消费本模块 API
- 子计划 4 pack-editor Workbench 调 batch-get / search
