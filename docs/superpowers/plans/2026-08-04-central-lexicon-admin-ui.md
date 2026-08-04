# 中心词库 Admin UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** `apps/admin` 新增「中心词库」CustomRoute——搜索列表（published 优先已由 API 排序）、详情页、发布操作、状态徽标；消费子计划 2 Admin Lexicon API。

**Architecture:** `lexicon-api.ts` → CustomRoutes（非 react-admin Resource CRUD）→ 列表 `/lexicon` + 详情 `/lexicon/:lemmaKey`；复用 `AdminPageHeader` / `AdminPanel` / `LemmaStatusChip`。

**前置：** 子计划 1–2；Kickoff §4 菜单

## Global Constraints

- **不**改 packs/orders 既有页；**不**接 enrich UI（可后续）
- 列表含 draft；徽标区分 `published` / `draft` / `archived`
- 发布 = PATCH `status: published`（API 写 audit）
- 无 ECDICT 导入 UI（子计划 5）

---

### Task 1: API 客户端 + 状态徽标

**Files:**

- Create: `apps/admin/src/api/lexicon-api.ts`
- Create: `apps/admin/src/components/lemma-status-chip.tsx`

- [ ] search / getDetail / patchLexicon，响应经 contracts Zod parse

---

### Task 2: 列表页

**Files:**

- Create: `apps/admin/src/resources/lexicon/lexicon-list-page.tsx`

- [ ] 搜索框 + 可选状态筛选；表格展示 headword / lemmaKey / 徽标 / ipa / pos
- [ ] 点击行进入详情

---

### Task 3: 详情页 + 发布

**Files:**

- Create: `apps/admin/src/resources/lexicon/lexicon-detail-page.tsx`
- Create: `apps/admin/src/resources/lexicon/index.ts`

- [ ] 展示 fragments / forms / tags
- [ ] draft →「发布」按钮

---

### Task 4: 路由与菜单

**Files:**

- Modify: `apps/admin/src/App.tsx`
- Modify: `apps/admin/src/layout/admin-menu.tsx`
- Modify: `apps/admin/src/layout/admin-route-meta.ts`
- Modify: `apps/admin/src/components/admin-status-chips.tsx`（audit action 文案）

---

### Task 5: 验证

- [ ] `pnpm check`
