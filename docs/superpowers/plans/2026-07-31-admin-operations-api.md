# Admin Operations API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 交付阶段 7 子计划 2：Admin 运营 API（驾驶舱 A、知识库发版、订单/权益/退款/兑换码、审计列表）；写操作事务 + audit_logs；dev mock 退款与本地 zip 存储。

**Architecture:** `packages/contracts/src/admin/` 扩展 Zod → `apps/api/src/admin/` 模块化 NestJS（Dashboard / Packs / Orders / PackAccess / Refunds / Redemption / AuditLogs）→ 复用 `@remember/pack-builder/verify` 与 `AuditService`；全局 `AdminAuthGuard`。

**Tech Stack:** NestJS 11、Prisma、PostgreSQL、Zod、`@remember/pack-builder`、`multer` 上传、Vitest + supertest

**依赖：** 子计划 1（`AdminAuthGuard`、`AuditService.writeAuditLog`）  
**Kickoff：** `docs/superpowers/plans/2026-07-31-phase7-minimum-admin-kickoff.md`  
**Spec：** `docs/superpowers/specs/2026-07-31-admin-dashboard-and-content-extensibility-design.md` §4–§6

## Global Constraints

- 全部路由 **`/api/v1/admin/`** + `AdminAuthGuard`；App session 拒绝
- 写操作（补发、退款、上传、发布）**事务 + audit_logs**
- 上传 zip：**200MB** 上限；走 `verifyPackZipBuffer` 全链；失败不写 DB/磁盘
- 退款：**仅 mock**（`WECHAT_PAY_MOCK_ENABLED`）；Pause C/D 前不接真实微信退
- dev 存储：`ADMIN_PACK_STORAGE_DIR` 或默认 `data/pack-storage`；不接生产 COS
- Prisma 模型不得直出 API；契约在 `packages/contracts/src/admin/`

## 业务交付

1. 驾驶舱 KPI / 折线 / Top packs / 告警（只读）
2. 知识库目录 CRUD、上传 zip 版本、发布 currentVersion
3. 订单列表/详情（含 payment_events、refunds）
4. 权益列表 + 补发（audit）
5. mock 退款（audit）
6. 兑换码批次生成 + 列表
7. 审计日志列表

---

### Task 1: Admin 契约扩展

**Files:** `packages/contracts/src/admin/{dashboard,orders,pack-access,refunds,redemption,packs,audit-log-list}.ts`

**Verify:** `pnpm --filter @remember/contracts test`

---

### Task 2: Pack verify 服务化

**Files:**

- `tools/pack-builder/src/verify-pack-buffer.ts` + export `./verify`
- `apps/api/src/pack-verify/`

**Verify:** 合法 fixture zip 通过；篡改 zip 返回 `PACK_*` 码

---

### Task 3: AdminModule — 驾驶舱 + 审计列表

**Routes:**

- `GET /admin/dashboard/summary|revenue-series|top-packs|alerts`
- `GET /admin/audit-logs`

---

### Task 4: 订单与权益

**Routes:**

- `GET /admin/orders`、`GET /admin/orders/:orderId`
- `GET /admin/pack-access`、`POST /admin/pack-access/grant`

---

### Task 5: 退款 + 兑换码

**Routes:**

- `POST /admin/refunds`（mock 状态机 paid→refunding→refunded）
- `POST /admin/redemption-codes/batch`、`GET /admin/redemption-codes`

---

### Task 6: 知识库发版

**Routes:**

- `GET/POST/PATCH /admin/packs`
- `POST /admin/packs/:packId/versions`（multipart `file`）
- `POST /admin/packs/:packId/versions/:versionId/publish`

---

### Task 7: 集成测试

**File:** `apps/api/test/admin-operations.e2e.test.ts`

**Cases:** dashboard、grant+audit、refund+audit、redemption batch、upload zip、App token 403/401

**Verify:** `pnpm --filter @remember/api test:integration`

## 与子计划 3 的接口

- React-admin `dataProvider` 消费本计划全部 GET/POST/PATCH
- Dashboard 组件绑定 `dashboard/*` 端点

## 验收清单

- [x] Admin 契约落盘并通过测试
- [x] 五类运营写操作 + 驾驶舱只读 API 可用
- [x] 合法 zip 上传 verify → draft 版本（非法 zip Admin E2E defer，见 [completion](2026-08-01-phase7-minimum-admin-completion.md)）
- [x] 补发/退款/上传/发布写 audit_logs
- [x] 集成测试通过（49/49）
