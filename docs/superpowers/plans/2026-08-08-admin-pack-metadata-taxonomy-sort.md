# Admin 分类排序、包元数据上传与 App 空态 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `$build-learning-app` / `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按 Task 逐项实施。

**Goal:** 运营可在后台调整分类顺序（App 同步）；知识库封面与内容介绍图片可上传；内容标签可自定义且删除需确认；App 详情页对后台留空的板块整块隐藏（含标题）。

**Architecture:** 分类排序复用现有 `sortOrder` + Admin PATCH；营销图新增 Admin 媒体上传 API（dev 本地目录 + 静态 URL，staging/prod 可接 COS 公开前缀）；Mobile 各 section 组件空数组 `return null`，去掉写死 fallback。

**Tech Stack:** NestJS、Prisma、Zod、`packages/contracts`、React-admin、Expo/RN、MUI

**分支：** `feat/admin-pack-metadata-and-taxonomy-sort`

**关联文档：**

- ADR [0010](../../decisions/0010-catalog-preview-redemption-and-media.md)（目录营销层 A：cover、introMedia）
- ADR [0011](../../decisions/0011-catalog-taxonomy.md)（taxonomy 与 pack 挂载）
- 计划 `docs/superpowers/plans/2026-07-31-catalog-taxonomy-and-pack-metadata.md`（taxonomy 与 pack 元数据基线，**本计划为其增量**）
- UI 规范 `docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md` §7 知识库详情

**前置：** PR #28 已合并（删库跳转 + checkError 修复）。

---

## Global Constraints

- **本轮不做：** 后台完整手机号（MVP-B）；in-admin LLM；pack.zip 协议变更。
- 分类排序 **不改 DB schema**；公开 taxonomy API 已 `orderBy sortOrder asc`，Mobile 已按 API 顺序渲染。
- 媒体上传仅服务 **目录营销层 A**（封面、`introMedia` 图片）；**不进** pack.zip；与 `POST .../versions` zip 上传分离。
- Admin 留空 = App **不渲染该 section（含标题）**；禁止用写死默认文案或 headword 占位冒充有内容。
- 契约变更只在 `packages/contracts`；写操作需 AdminAuthGuard。
- 一次 Task 一个可独立验收行为；建议分 2–3 个小 PR 或同一分支多 commit。

---

## 背景与现状（2026-08-08 审计）

| 能力                          | 后端                       | Admin UI                        | App                                                |
| ----------------------------- | -------------------------- | ------------------------------- | -------------------------------------------------- |
| 分类 `sortOrder`              | ✅ 字段 + PATCH + 查询排序 | ❌ 仅只读「序」列，无拖拽/改序  | ✅ 跟 API 顺序                                     |
| 封面 `coverUrl`               | ✅ PATCH 存字符串          | ❌ 仅 URL 文本框                | ✅ 渲染                                            |
| 内容介绍 `introMedia`         | ✅ JSON 字段               | ❌ 仅 URL；无上传               | ✅ 有数据则渲染；**空则隐藏**                      |
| 内容标签 `contentTags`        | ✅ `string[]`              | ❌ 固定 4 项下拉；删 tag 无确认 | ✅ 展示                                            |
| 包含内容 `includedHighlights` | ✅                         | ✅ 可编辑                       | ❌ **空时用写死默认两条**                          |
| 内容示例 `samplePreviews`     | ✅ + extract API           | ✅ 可编辑/抽取                  | ❌ **始终显示标题**；无 preview 时用 headword 占位 |

**用户澄清（本轮范围）：**

1. 内容标签：支持自定义；**删除单个标签需 `AdminMiniConfirmDialog` 确认**。
2. 内容介绍图片：Admin 需上传入口（与封面共用上传能力）。
3. 后台置空 → App 对应板块 **整块不出现**（含标题）。
4. 手机号后台明文：**不在本轮**。

---

## API 概要（新增/复用）

### 复用（分类排序）

| 方法  | 路径                                             | 说明                  |
| ----- | ------------------------------------------------ | --------------------- |
| PATCH | `/api/v1/admin/catalog/taxonomy/primaries/:id`   | body 可含 `sortOrder` |
| PATCH | `/api/v1/admin/catalog/taxonomy/secondaries/:id` | 同上                  |
| PATCH | `/api/v1/admin/catalog/taxonomy/versions/:id`    | 同上                  |

可选优化：新增 `POST .../reorder` 批量更新（同一 scope 内 `{ orderedIds: string[] }`），减少拖拽时 N 次 PATCH。**MVP 可先用逐条 PATCH**。

### 新增（营销媒体上传）

| 方法 | 路径                         | 说明                                                       |
| ---- | ---------------------------- | ---------------------------------------------------------- |
| POST | `/api/v1/admin/media/upload` | `multipart/form-data`，字段 `file`；返回 `{ url: string }` |

**校验：** jpg/jpeg/png/webp；单文件 ≤ 2MB（封面）；intro 图可同限或 5MB（写 runbook 备注即可）。

**存储：**

- **dev：**`apps/api/data/media/`（或 `readAdminPackConfig` 旁新增 `readAdminMediaConfig`）+ Nest 静态路由 `/api/v1/media/...` 或相对 URL。
- **staging/prod（后续）：** COS 公开前缀；本轮可先 dev 可用 + 契约/接口稳定，COS 接法见 `docs/runbooks/production-deploy.md` §9。

**禁止：** 上传路径穿越；未鉴权访问；日志记录完整文件内容。

---

## Task 分解

### Task 1：分类管理排序 UI（P0）

**Files：**

- Modify: `apps/admin/src/resources/catalog-taxonomy/catalog-taxonomy-panels.tsx`
- Modify: `apps/admin/src/resources/catalog-taxonomy/catalog-taxonomy-page.tsx`
- Modify: `apps/admin/src/api/catalog-taxonomy-api.ts`
- Test（可选）: Admin 组件测试或 e2e 改序后 GET taxonomy 顺序

**行为：**

- 一级侧栏、二级表格、页内分类表格支持 **↑↓ 按钮**（MVP；拖拽可 defer）。
- 点击后调用 PATCH 更新 `sortOrder`（交换相邻项或重算 10/20/30 间距）。
- 成功后刷新 taxonomy 列表；失败 toast。
- **不改** Mobile 代码（回归：资料页 Tab/侧栏/版本顺序与后台一致）。

**验收：**

- [x] 调整「初中英语」与「小学英语」顺序 → App 顶栏 Tab 顺序变化
- [x] 二级、页内分类同理
- [x] `pnpm check` 全绿

---

### Task 2：Admin 媒体上传 API（P0）

**Files：**

- Create: `apps/api/src/admin/media/admin-media.module.ts`（或挂在 admin 模块下）
- Create: `apps/api/src/admin/media/admin-media.controller.ts`
- Create: `apps/api/src/admin/media/admin-media.service.ts`
- Create: `apps/api/src/config/read-admin-media-config.ts`
- Modify: `packages/contracts/src/admin/media.ts`（upload response schema）
- Test: `apps/api/test/admin-media-upload.e2e.test.ts`

**行为：**

- Admin 鉴权 + multipart 解析（与 pack zip 上传类似，限 MIME/大小）。
- 保存文件，返回可写入 `coverUrl` / `introMedia[].url` 的 HTTPS/相对 URL。
- 非法类型、超大、空文件 → 4xx + Zod/业务码。

**验收：**

- [x] curl/集成测试上传 png → 200 + url
- [x] 未登录 → 401
- [x] 返回 URL 在浏览器可访问（dev）

---

### Task 3：封面与内容介绍上传 UI（P0）

**Files：**

- Create: `apps/admin/src/components/admin-image-upload-field.tsx`
- Modify: `apps/admin/src/resources/pack-catalog-detail-fields.tsx`
- Modify: `apps/admin/src/api/packs-api.ts` 或新建 `media-api.ts`

**行为：**

- **封面：** URL 输入旁增加「上传图片」→ 调 Task 2 API → 写入 `coverUrl` + 刷新预览。
- **内容介绍：** `introMedia` 行内 `type=image` 时显示上传按钮；`type=video` 仍 URL（或外链）。
- 保留 URL 手填（CDN 外链场景）。

**验收：**

- [x] 上传封面 → 保存 pack → App 详情 Hero 显示新图
- [x] 上传 intro 图 → App「内容介绍」出现图片

---

### Task 4：内容标签自定义 + 删除确认（P1）

**Files：**

- Create: `apps/admin/src/resources/content-tags-input.tsx`
- Modify: `apps/admin/src/resources/pack-catalog-detail-fields.tsx`

**行为：**

- `AutocompleteArrayInput` + `freeSolo`：可输入自定义标签；常用四项作 `choices` 提示。
- 删除 chip 时 **不立即移除**：弹出 `AdminMiniConfirmDialog`（标题如「移除标签？」，描述含标签名）→ 确认后更新表单。
- 去重、trim；空串拒绝。

**验收：**

- [x] 输入「专项」并保存 → 列表/详情可见
- [x] 删标签有确认；取消则不删

---

### Task 5：App 详情空板块隐藏（P0）

**Files：**

- Modify: `apps/mobile/src/components/pack-detail/pack-detail-included-section.tsx`
- Modify: `apps/mobile/src/components/pack-detail/pack-detail-sample-list.tsx`
- Modify: `apps/mobile/src/use-cases/resolve-pack-sample-previews.ts`
- Test: `apps/mobile/src/use-cases/resolve-pack-sample-previews.test.ts`（新建或扩展现有）
- Test: 组件或 screen 级：`samplePreviews=[]` 且 `includedHighlights=[]` 时不渲染对应节点

**行为：**

- `PackDetailIncludedSection`：`highlights.length === 0` → `return null`（**删除 `DEFAULT_INCLUDED_ITEMS`**）。
- `PackDetailSampleList`：`samples.length === 0` → `return null`。
- `resolvePackSamplePreviews`：**去掉** `sampleHeadwords` 占位 fallback；仅返回真实 `samplePreviews`（bundled test pack 本地音频 merge 逻辑保留）。
- `PackDetailIntroMedia` 已符合，勿改。

**验收：**

- [x] 后台清空「包含内容」「内容示例」「内容介绍」→ App 详情无对应标题
- [x] 有数据时正常展示
- [x] `pnpm check` 全绿

---

### Task 6：收口与文档（P1）

**Files：**

- Modify: `docs/runbooks/local-api-docker-dev.md`（若新增 media 目录/env）
- 本计划文末勾选 Task 验收项

**验收：**

- [x] 全链路：改序 → 上传封面/intro → 自定义标签 → App 空态
- [x] 无本轮范围外改动（手机号、COS prod 可 defer 备注）

---

## PR 建议拆分

| PR  | 内容                               |
| --- | ---------------------------------- |
| 1   | Task 1 分类排序                    |
| 2   | Task 2 + 3 媒体上传 API + Admin UI |
| 3   | Task 4 + 5 标签 + App 空态         |

或单分支多 commit，合并前 `pnpm check` 全绿。

---

## 新窗口起手 Prompt（复制即用）

```text
请阅读并严格按顺序实施：
- docs/superpowers/plans/2026-08-08-admin-pack-metadata-taxonomy-sort.md（主计划）
- docs/decisions/0010-catalog-preview-redemption-and-media.md
- docs/decisions/0011-catalog-taxonomy.md
- docs/ai-rules/（实施前全读；含 data-and-security、testing-and-review）

使用 $build-learning-app 与 superpowers:executing-plans（或 subagent-driven-development），在分支 feat/admin-pack-metadata-and-taxonomy-sort 上从 Task 1 开始逐项实施。

范围：
- 分类管理排序 UI（Admin）；App 已跟 API sortOrder，仅需回归
- Admin 媒体上传 API + 封面/内容介绍图片上传 UI
- 内容标签 freeSolo + 删除确认（复用 AdminMiniConfirmDialog）
- App 详情：includedHighlights / samplePreviews / introMedia 为空时整块隐藏（含标题）；去掉 included 默认文案与 sampleHeadwords 占位

明确不做：
- 后台完整手机号（MVP-B）
- pack.zip 协议变更
- in-admin LLM

本地联调：
- pnpm dev:db && migrate && seed:dev-bootstrap
- pnpm --filter @remember/api dev（3000）
- pnpm --filter @remember/admin dev（5173，/api 代理到 3000）
- Admin 登录：admin / dev-only-admin-password

每完成一个 Task：跑相关测试 + pnpm check；合并前全绿。完成后回报变更文件、验收勾选、剩余 defer（如 COS prod 公开前缀）。
```

## 完成后需回报

- 变更文件列表
- 各 Task 验收勾选
- `pnpm check` 输出摘要
- Admin 改序 + 上传 + App 空态手测结果
- defer 项：COS 生产公开前缀、taxonomy 拖拽排序（若只做 ↑↓）
