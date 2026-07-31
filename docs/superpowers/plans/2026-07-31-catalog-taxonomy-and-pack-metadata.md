# Catalog Taxonomy & Pack Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `$build-learning-app` / `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 资料页三层分类由后台可维护的 taxonomy 驱动（不再 App 写死）；知识库「基本信息」可编辑字段与手机资料页/详情页展示对齐；详情统计项（条数/大小/更新）保持 zip 同步只读。

**Architecture:** PostgreSQL 存全局分类树 + pack 挂载节点 ID → `packages/contracts` 扩展 catalog/admin 契约 → NestJS catalog/admin API → React-admin 分类管理 + 包表单联动 → Mobile 资料页从 API 读 taxonomy 渲染筛选，包元数据从 catalog 缓存/详情 API 读取。

**Tech Stack:** Prisma、PostgreSQL、Zod、`packages/contracts`、NestJS、React-admin、Expo/RN

**关联文档：**

- UI 规范 §6 知识库市场（三层分类交互）
- UI 规范 §7 知识库详情（Hero、包含内容、示例、introMedia）
- ADR [0010](../../decisions/0010-catalog-preview-redemption-and-media.md)（目录营销层 A：cover、summary、introMedia、samplePreviews）
- Admin 设计 `docs/superpowers/plans/2026-07-31-admin-operations-api.md`（知识库 CRUD 基线）

**建议 ADR（P0 实施前冻结）：** `docs/decisions/0011-catalog-taxonomy.md`（taxonomy 与 pack 挂载规则；实施 Task 1 时一并落盘）

---

## Global Constraints

- **不动** pack.zip / `packManifest` 协议；taxonomy 与运营元数据均在 **`packs` 表**（ADR 0010 §5）。
- 「全部」「全部版本」仅 **手机筛选 UI** 使用，**不入库**。
- Pack 上的分类必须为 taxonomy **节点 ID**（或稳定 slug + 服务端校验父子关系），禁止继续手输自由文本二级/版本。
- `cardCount`、`sizeLabel`、`updatedAt` 仍由 **版本上传/发布** 同步（现有 `syncPackCatalogMetadata`）；基本信息 Tab **只读展示**，不重复编辑。
- 契约变更在 `packages/contracts`；Prisma 模型不得直出 API。
- 写操作（taxonomy CRUD、pack PATCH）需 **AdminAuthGuard**；`GET /catalog/taxonomy` **无需登录**（与 catalog 列表一致）。
- 一次只合并一个可独立验收的行为；P0 与 P1 可分 PR。

---

## 背景与问题

### 手机资料页三层分类（当前 App 写死）

| 层级 | 手机 UI | 写死位置 | Pack 字段（旧） |
| --- | --- | --- | --- |
| 一级 | 顶栏 Tab（小学英语…） | `CATALOG_PRIMARY_OPTIONS` | `primaryCategory` enum |
| 二级 | 左侧栏（三年级…） | `listSecondaryCategories()` | `secondaryCategory` 自由文本 |
| 三级 | 版本下拉（人教版…） | `CATALOG_VERSION_OPTIONS` | `versionLabel` 自由文本 |

运营在后台改小类/版本字符串时，若 App 侧栏无对应项，**筛选不到**；新增一级/版本需发版。

### 包元数据（后台表单 vs 手机）

| 手机展示 | 后台基本信息 Tab | 说明 |
| --- | --- | --- |
| 资料页/详情封面 | ❌ | DB 有 `coverUrl/coverBadge/coverLines`，Admin 未暴露 |
| 内容标签 | ❌ | DB 有 `contentTags`，无表单 |
| 详情简介 | ✅ `summary` | 已可编辑 |
| 详情「包含内容」卡片 | ❌ | App 写死两条 |
| 详情「内容介绍」 | ❌ | DB/API 有 `introMedia`，无表单 |
| 详情「内容示例」 | ❌ | 仅 zip 首次上传可自动写入 |
| 详情条数/大小/更新 | （只读） | **手机已有**；zip 同步，后台可选只读展示 |

---

## 目标数据模型（P0）

### Taxonomy 表（建议命名）

```text
catalog_primary_nodes
  id            UUID PK
  slug          TEXT UNIQUE NOT NULL    -- 稳定 ID，如 primary
  label         TEXT NOT NULL           -- 展示：小学英语
  sort_order    INT NOT NULL
  status        active | archived
  created_at / updated_at

catalog_secondary_nodes
  id            UUID PK
  primary_id    UUID FK → catalog_primary_nodes
  slug          TEXT NOT NULL           -- 如 grade3
  label         TEXT NOT NULL           -- 如 三年级
  sort_order    INT NOT NULL
  status        active | archived
  UNIQUE (primary_id, slug)

catalog_version_nodes
  id            UUID PK
  slug          TEXT UNIQUE NOT NULL    -- 如 pep
  label         TEXT NOT NULL           -- 如 人教版
  sort_order    INT NOT NULL
  status        active | archived
```

### Pack 挂载（替换 enum + 自由文本）

```text
packs 表新增（或迁移替换旧列）：
  primary_node_id    UUID FK NOT NULL
  secondary_node_id  UUID FK NOT NULL  -- 必须属于 primary_node_id
  version_node_id    UUID FK NOT NULL

保留冗余 label 列（可选，只读缓存）便于列表与迁移期兼容；权威以 node FK 为准。
```

**迁移策略：** seed 默认节点（primary/junior/senior/postgraduate + 常见二三级 + 人教/外研/译林），按旧 `primaryCategory + secondaryCategory + versionLabel` 映射 FK；无法映射的 pack 进迁移脚本报告。

---

## API 概要

### 公开（Mobile）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/catalog/taxonomy` | 返回 `{ primaries: [{ id, slug, label, children: [...] }], versions: [...] }`；仅 `active` 节点 |
| GET | `/api/v1/catalog/packs` | 列表项含 `primaryNodeId/secondaryNodeId/versionNodeId` 及展示 label（或嵌套节点摘要） |
| GET | `/api/v1/catalog/packs/:packId` | 详情不变 + taxonomy label；`summary` 已在列表下发（已实现） |

### Admin

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET/POST/PATCH/DELETE | `/api/v1/admin/catalog/taxonomy/...` | 一级/二级/版本 CRUD + 排序 |
| PATCH | `/api/v1/admin/packs/:packId` | 分类改为 node FK 三联；校验父子关系 |

**删除规则：** 节点下仍有 pack 或（二级）仍有子节点时 **409**，需先迁移 pack 或归档。

---

## Phase P0 — Taxonomy + 手机筛选 + 包分类联动

**验收口径：** 后台增删改分类后，手机资料页下拉刷新即可看到新 Tab/侧栏/版本项；包选分类后能被正确筛中；不依赖 App 内置常量。

### Task P0-1: ADR 0011 + 契约骨架

**Files:**

- `docs/decisions/0011-catalog-taxonomy.md`
- `packages/contracts/src/catalog/taxonomy.ts`
- `packages/contracts/src/admin/catalog-taxonomy.ts`

**内容：** taxonomy 树 Zod；Admin CRUD request/response；`catalogPackSummary` 增加 node 字段（或嵌套 `taxonomy` 对象）。

**Verify:** `pnpm --filter @remember/contracts test`

---

### Task P0-2: Prisma 迁移 + seed

**Files:**

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/*_catalog_taxonomy`
- `apps/api/scripts/seed-catalog-taxonomy.mjs`（或并入 `seed-dev-bootstrap`）
- `apps/api/scripts/migrate-pack-taxonomy-fks.mjs`

**Verify:** 迁移后现有 seed pack 均有合法 FK；`en-grade3-v1-rj` 映射到 小学 / 三年级 / 人教版

---

### Task P0-3: Catalog taxonomy API（公开 + Admin CRUD）

**Files:**

- `apps/api/src/catalog/catalog-taxonomy.service.ts`
- `apps/api/src/catalog/catalog-taxonomy.controller.ts`
- `apps/api/src/admin/catalog-taxonomy/*`
- 更新 `catalog.mapper.ts`、`catalog.repository.ts` 筛选逻辑（按 node FK）

**Verify:** `apps/api/test/catalog-taxonomy.e2e.test.ts` — 公开 GET、Admin CRUD、删节点有 pack 时 409

---

### Task P0-4: Admin UI — 分类管理

**Files:**

- `apps/admin/src/resources/catalog-taxonomy/`（或 `settings/catalog-taxonomy.tsx`）
- 菜单：内容 → **分类管理**（与知识库并列）

**交互：**

- 一级列表 + 排序
- 选中一级 → 编辑二级列表
- 版本标签全局列表
- 删除/归档前显示关联 pack 数量

**Verify:** 手工：新增「四年级」→ 保存 → API GET taxonomy 可见

---

### Task P0-5: Admin UI — 知识库基本信息分类联动

**Files:**

- `apps/admin/src/resources/packs.tsx`
- `apps/admin/src/api/catalog-taxonomy-api.ts`

**改动：** 一级/二级/版本改为 **级联 Select**（数据来自 taxonomy API）；移除固定 `packChoices` 四枚举 + 手输小类/版本。

**Verify:** 编辑 `en-grade3-v1-rj` 保存后 DB FK 正确

---

### Task P0-6: Mobile — 资料页读 taxonomy

**Files:**

- `apps/mobile/src/data/api/catalog-taxonomy-api.ts`
- `apps/mobile/src/use-cases/fetch-catalog-taxonomy.ts`
- `apps/mobile/src/screens/market-screen.tsx`
- `apps/mobile/src/components/market/market-primary-tabs.tsx`
- `apps/mobile/src/components/market/market-version-dropdown.tsx`
- 删除或降级 `catalog-seed.ts` 中 `CATALOG_PRIMARY_OPTIONS`、`CATALOG_VERSION_OPTIONS`、`listSecondaryCategories` 硬编码（offline fallback 可读缓存 taxonomy）

**Verify:**

- 资料页三级筛选选项来自 API
- 切换一级重置二级为「全部」
- 搜索定位仍可用（更新 navigation  payload 为 node id/slug）
- `pnpm --filter @remember/mobile typecheck` + 相关单测

---

### Task P0-7: Mobile — 详情顶栏分类文案

**Files:**

- `apps/mobile/src/use-cases/format-pack-detail-labels.ts`
- `apps/mobile/src/catalog/map-catalog-api.ts`

**改动：** `categoryContextLabel` 读 pack 上 taxonomy **label**（非 slug）。

**Verify:** 详情顶栏显示「小学英语 · 三年级」类文案

---

### Task P0-8: P0 集成验收

**Verify:**

- `pnpm --filter @remember/api test:integration`（catalog + admin taxonomy 用例）
- `pnpm --filter @remember/mobile test`
- 手工：Admin 新增版本「北师大版」→ 手机资料页刷新 → 可选 → 包挂载后可筛中

---

## Phase P1 — Pack 元数据编辑（与 taxonomy 正交）

**验收口径：** 后台「基本信息」能编辑手机详情/列表依赖的运营字段；详情页展示与后台一致（刷新 catalog 缓存后）。

### Task P1-1: 契约 — 包扩展字段

**Files:**

- `packages/contracts/src/admin/packs.ts` — 增加 `coverUrl`、`coverBadge`、`coverLines`、`contentTags`、`includedHighlights[]`、`introMedia`、`samplePreviews`
- `packages/contracts/src/catalog/pack-summary.ts` — 确认 `summary`、cover 字段齐全
- 新增 `includedHighlightSchema`（`title`、`description`、`sortOrder?`）

**Verify:** contracts test

---

### Task P1-2: Admin API — PATCH pack 扩展字段

**Files:**

- `apps/api/src/admin/packs/admin-packs.service.ts` — update/create 写入 cover、tags、highlights、introMedia、samplePreviews

**Verify:** admin e2e PATCH 各字段 round-trip

---

### Task P1-3: Admin UI — 基本信息表单扩展

**Files:**

- `apps/admin/src/resources/packs.tsx`

**区块：**

| 区块 | 字段 | 控件 |
| --- | --- | --- |
| 内容标签 | `contentTags` | 多选 + 自定义（预设：词汇、上册、下册、全册） |
| 封面 | `coverUrl`、`coverBadge`、`coverLines[]` | URL + 角标 + 动态行 |
| 包含内容 | `includedHighlights[]` | 1～4 行，title + description |
| 内容介绍 | `introMedia[]` | type/url/poster/sortOrder |
| 内容示例 | `samplePreviews[]` | 列表编辑 + **「从当前发布版本抽取」** 按钮 |
| 只读统计 | `cardCount`、`sizeLabel`、`updatedAt`、`currentPackVersion` | 展示，附「由发布版本自动更新」说明 |

**Verify:** 保存后在 catalog detail API 可见

---

### Task P1-4: Mobile — 读 includedHighlights

**Files:**

- `apps/mobile/src/components/pack-detail/pack-detail-included-section.tsx`
- `apps/mobile/src/catalog/map-catalog-api.ts`
- `apps/mobile/src/use-cases/get-pack-detail-view-model.ts`

**规则：** `includedHighlights` 非空则用配置；否则保留现有两条默认文案。

**Verify:** 单测 + 详情页手工

---

### Task P1-5: Mobile — samplePreviews / introMedia 缓存

**Files:**

- `apps/mobile/src/use-cases/resolve-catalog-item-for-detail.ts`（详情 merge 进 catalog cache，已有 summary 逻辑可扩展）

**Verify:** 离线读缓存时简介/示例/intro 不丢

---

### Task P1-6: P1 集成验收

**Verify:**

- 后台改 `contentTags` → 资料页卡片标签更新
- 后台改 `includedHighlights` → 详情「包含内容」更新
- 后台改 cover 字段 → 资料页/详情封面更新
- `cardCount`/`sizeLabel`/`updatedAt` 仍仅随发版变化，基本信息不可编辑

---

## 非目标（本计划不做）

- 分类多语言
- 封面/intro 视频 **上传到 COS** 的后台上传器（P1 先 URL；上传走后续 runbook）
- 修改 pack.zip 内 cards 结构
- 首页「已安装资料」列表改版（仍用 `displayName` + 本地进度）

---

## PR 拆分建议

| PR | 范围 |
| --- | --- |
| PR-1 | ADR 0011 + contracts + Prisma + seed/migrate |
| PR-2 | API taxonomy + Admin CRUD + e2e |
| PR-3 | Admin 分类管理 UI + pack 分类联动 |
| PR-4 | Mobile taxonomy 筛选 + 详情 label |
| PR-5 | P1 admin pack 字段 + mobile included/cover/tags |

---

## 总验收清单

### P0

- [ ] `GET /catalog/taxonomy` 无需登录，返回排序后的三层结构
- [ ] Admin 可 CRUD 一级/二级/版本；有 pack 依赖时删除失败
- [ ] Pack 编辑页三级分类为级联选择，保存 FK 合法
- [ ] 手机资料页筛选 **不再依赖** `catalog-seed.ts` 写死选项（offline 可读上次 taxonomy 缓存）
- [ ] 现有 seed pack 迁移后筛选行为与迁移前等价
- [ ] 集成测试通过

### P1

- [ ] 基本信息可编辑：`contentTags`、cover 三字段、`includedHighlights`、`introMedia`、`samplePreviews`
- [ ] 基本信息只读展示：`cardCount`、`sizeLabel`、`updatedAt`、当前版本
- [ ] 手机详情「包含内容」可读后台配置
- [ ] samplePreviews 支持从当前发布 zip 抽取
- [ ] contracts + admin e2e + mobile 相关测试通过

---

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 旧 App 只认 enum slug | 发版同步；API 过渡期可同时返回旧 `primaryCategory` 字符串（只读冗余） |
| taxonomy 缓存过期 | 资料页下拉刷新；App 启动 warm taxonomy + catalog |
| 二级/版本字符串历史数据不一致 | 一次性迁移脚本 + 无法映射清单人工处理 |
| `includedHighlights` 空 | App 默认两条，与现网一致 |
