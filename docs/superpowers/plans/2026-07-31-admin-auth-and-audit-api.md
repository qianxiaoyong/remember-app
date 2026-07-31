# Admin Auth and Audit API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为阶段 7 管理后台建立独立鉴权与审计基础：Prisma 三表、Admin 登录/登出/me、`AdminAuthGuard`、可事务内调用的 `writeAuditLog` helper；App session 无法访问 admin 路由。

**Architecture:** `packages/contracts/src/admin/` 定义 Zod 契约 → NestJS `admin-auth` 与 `audit` 模块 → Prisma repository → PostgreSQL；opaque Bearer token（SHA-256 哈希存库，与 App auth 同模式但 **独立表**）；密码 Argon2id；审计 append-only。

**Tech Stack:** NestJS 11、Prisma 6、PostgreSQL 18（Docker）、Zod、`@node-rs/argon2`、Vitest + supertest 集成测试

**Kickoff：** `docs/superpowers/plans/2026-07-31-phase7-minimum-admin-kickoff.md`  
**Spec：** `docs/superpowers/specs/2026-07-31-admin-dashboard-and-content-extensibility-design.md` §9  
**Docker runbook：** `docs/runbooks/local-api-docker-dev.md`

## Global Constraints

- Admin API 前缀 **`/api/v1/admin/`**；与 App `/api/v1/` 并列；**禁止** App `sessions` 与 Admin `admin_sessions` 混用
- Prisma 模型 **不得** 直接作为 API 响应
- 管理员密码 Argon2id；DB 只存哈希；token 明文 **仅** 登录响应返回一次
- `audit_logs` append-only；repository **不提供** delete/update
- 子计划 1 **不实现** 运营 CRUD、驾驶舱、发版 upload（属子计划 2/3）
- dev：**Docker PG** + mock 外部服务；不接生产 COS / 真实微信退款
- TOTP 字段预留；MVP 仅密码登录
- 契约修改须通过 `pnpm --filter @remember/contracts test`

## 业务交付（本计划结束时）

1. 管理员用 loginName + password 登录，获得 Bearer token；可登出、查 `/admin/auth/me`
2. 受保护 admin 路由须 `AdminAuthGuard`；无 token / 无效 token → 401
3. App 用户 token 调 `/api/v1/admin/*` → 401
4. `AuditService.writeAuditLog` 可在事务内写入；集成测试可验证行存在
5. `pnpm seed:dev-bootstrap`（或等价 seed）创建 dev 管理员账号

---

### Task 1: Prisma 迁移 — admin_users / admin_sessions / audit_logs

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_add_admin_auth_and_audit/migration.sql`

**Schema:**

| 表               | 列                                | 说明                   |
| ---------------- | --------------------------------- | ---------------------- |
| `admin_users`    | `id` UUID PK                      |                        |
|                  | `login_name` TEXT UNIQUE          | 登录名                 |
|                  | `password_hash` TEXT              | Argon2id               |
|                  | `role` TEXT DEFAULT `super_admin` | MVP 仅一种             |
|                  | `status` TEXT DEFAULT `active`    |                        |
|                  | `totp_secret` TEXT NULL           | 预留                   |
|                  | `created_at` / `updated_at`       |                        |
| `admin_sessions` | `id` UUID PK                      |                        |
|                  | `token_hash` TEXT UNIQUE          | SHA-256                |
|                  | `admin_user_id` UUID FK           |                        |
|                  | `last_active_at`                  |                        |
|                  | `revoked_at` NULL                 |                        |
|                  | `created_at`                      |                        |
| `audit_logs`     | `id` UUID PK                      |                        |
|                  | `actor_admin_user_id` UUID FK     |                        |
|                  | `action` TEXT                     | 如 `pack_access.grant` |
|                  | `target_type` TEXT                | 如 `order`             |
|                  | `target_id` TEXT                  |                        |
|                  | `payload_summary` JSONB           | 摘要，无密钥           |
|                  | `result` TEXT                     | `success` \| `failure` |
|                  | `error_code` TEXT NULL            |                        |
|                  | `created_at`                      | 无 updated_at          |

**索引：** `admin_sessions(admin_user_id)`；`audit_logs(created_at DESC)`；`audit_logs(action)`

- [ ] **Step 1:** 在 schema.prisma 追加三 model（`@@map` snake_case）
- [ ] **Step 2:** 运行 `pnpm --filter @remember/api prisma migrate dev --name add_admin_auth_and_audit`
- [ ] **Step 3:** `pnpm --filter @remember/api typecheck`

---

### Task 2: `packages/contracts` admin 鉴权契约

**Files:**

- Create: `packages/contracts/src/admin/login.ts`
- Create: `packages/contracts/src/admin/session-admin.ts`
- Create: `packages/contracts/src/admin/audit-log-entry.ts`（写入 shape + 列表只读 preview，供子计划 2）
- Create: `packages/contracts/src/admin/index.ts`
- Modify: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/admin/admin.test.ts`

**Endpoints（冻结）:**

| 方法 | 路径                        | 契约                                                   |
| ---- | --------------------------- | ------------------------------------------------------ |
| POST | `/api/v1/admin/auth/login`  | `adminLoginRequestSchema` → `adminLoginResponseSchema` |
| POST | `/api/v1/admin/auth/logout` | → `adminLogoutResponseSchema`                          |
| GET  | `/api/v1/admin/auth/me`     | → `adminSessionUserSchema`                             |

**adminLoginRequestSchema:**

```typescript
export const adminLoginRequestSchema = z
  .object({
    loginName: z.string().trim().min(1).max(64),
    password: z.string().min(8).max(128),
  })
  .strict();
```

**adminLoginResponseSchema:** `{ token: string, admin: adminSessionUserSchema }`

**adminSessionUserSchema:** `{ adminUserId: z.uuid(), loginName, role: z.enum(['super_admin']) }`

**auditLogWriteInputSchema（内部/helper）：** action, targetType, targetId, payloadSummary (record), result, errorCode optional

- [ ] **Step 1:** 实现上述 schema + 导出
- [ ] **Step 2:** 契约测试 round-trip + 拒绝未知字段
- [ ] **Step 3:** `pnpm --filter @remember/contracts test`

---

### Task 3: 配置与密码哈希

**Files:**

- Create: `apps/api/src/config/read-admin-auth-config.ts`
- Create: `apps/api/src/admin-auth/admin-password.ts`
- Create: `apps/api/src/admin-auth/admin-password.test.ts`
- Modify: `apps/api/.env.example`

**Env:**

| 变量                         | 说明                  |
| ---------------------------- | --------------------- |
| `ADMIN_SESSION_TTL_DAYS`     | 默认 7                |
| `ADMIN_BOOTSTRAP_LOGIN_NAME` | seed 用，默认 `admin` |
| `ADMIN_BOOTSTRAP_PASSWORD`   | seed 必填（dev）      |

**admin-password.ts:**

```typescript
import { hash, verify } from '@node-rs/argon2';

export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return verify(passwordHash, password);
}
```

- [ ] **Step 1:** 添加依赖 `@node-rs/argon2` 到 `apps/api`
- [ ] **Step 2:** 实现 config + password 模块与单元测试
- [ ] **Step 3:** `pnpm --filter @remember/api test`

---

### Task 4: AdminAuth 模块

**Files:**

- Create: `apps/api/src/admin-auth/admin-auth.repository.ts`
- Create: `apps/api/src/admin-auth/admin-auth.service.ts`
- Create: `apps/api/src/admin-auth/admin-auth.guard.ts`
- Create: `apps/api/src/admin-auth/admin-auth.controller.ts`
- Create: `apps/api/src/admin-auth/admin-auth.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**

- Consumes: `hashSessionToken` / `createSessionToken` from `auth/crypto.ts`（复用，不混表）
- Produces: `AdminAuthService.resolveAuthenticatedContext(token)` → `{ adminUserId, sessionId, role }`
- Produces: `AdminAuthGuard`, `requireAdminAuthContext(request)`

**Core behaviors:**

1. **login:** 查 loginName → verify password → status active → create session → 返回 token + admin 摘要；失败 `401 ADMIN_CREDENTIALS_INVALID`
2. **logout:** 撤销当前 admin session
3. **me:** 返回 adminSessionUser
4. **resolveAuthenticatedContext:** 查 admin_sessions + TTL + touch lastActiveAt

- [ ] **Step 1:** repository + service
- [ ] **Step 2:** guard + controller（路径 `admin/auth`）
- [ ] **Step 3:** 注册 AdminAuthModule

---

### Task 5: Audit 模块（写入 helper）

**Files:**

- Create: `apps/api/src/audit/audit.repository.ts`
- Create: `apps/api/src/audit/audit.service.ts`
- Create: `apps/api/src/audit/audit.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**

- Produces: `AuditService.writeAuditLog(input, tx?)` — 可选 Prisma 事务客户端，供子计划 2 补发/退款/发布同事务写入
- **不提供** delete/update/list（列表属子计划 2）

```typescript
export interface WriteAuditLogInput {
  actorAdminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  payloadSummary: Record<string, unknown>;
  result: 'success' | 'failure';
  errorCode?: string;
}
```

- [ ] **Step 1:** repository create-only
- [ ] **Step 2:** service 校验 action/target 非空
- [ ] **Step 3:** export AuditModule

---

### Task 6: Dev seed 管理员

**Files:**

- Modify: `apps/api/scripts/seed-dev-bootstrap.ts`
- Modify: `apps/api/.env.example`

**Behavior:** 若设置 `ADMIN_BOOTSTRAP_PASSWORD`，upsert `ADMIN_BOOTSTRAP_LOGIN_NAME`（默认 admin）管理员；密码 Argon2 哈希；已存在则更新 password_hash（dev 便利）

- [ ] **Step 1:** seed 逻辑 + 文档注释
- [ ] **Step 2:** 本地 `pnpm --filter @remember/api seed:dev-bootstrap` 验证

---

### Task 7: 集成测试与 test helper

**Files:**

- Create: `apps/api/test/admin-auth.e2e.test.ts`
- Modify: `apps/api/test/helpers/db-test-helper.ts` — `resetAdminTables`
- Modify: `apps/api/test/helpers/integration-env.ts` — admin env defaults

**Cases:**

- [ ] 正确 loginName/password 登录成功，返回 token；me 返回 admin 信息
- [ ] 错误密码 → 401 `ADMIN_CREDENTIALS_INVALID`
- [ ] logout 后 token 失效
- [ ] 无 token 访问受保护 admin 路由 → 401
- [ ] **App 用户 token** 访问 `GET /api/v1/admin/auth/me` → 401
- [ ] `AuditService.writeAuditLog` 写入后 DB 有行（测试中从 app 取 service）

**Verify:**

```powershell
pnpm dev:db
pnpm --filter @remember/api test:integration
pnpm --filter @remember/api typecheck
pnpm check
```

---

## 与子计划 2/3 的接口约定

| 产出                                         | 消费者                             |
| -------------------------------------------- | ---------------------------------- |
| `AdminAuthGuard` + `requireAdminAuthContext` | 子计划 2 全部 `/admin/*` 写/读路由 |
| `AuditService.writeAuditLog(input, tx?)`     | 子计划 2 补发、退款、发布          |
| `adminSessionUserSchema`                     | 子计划 3 React-admin authProvider  |
| `auditLogEntrySchema`                        | 子计划 2 `GET /admin/audit-logs`   |

## 验收清单

- [ ] 三表迁移可 apply；dev seed 可创建管理员
- [ ] Admin 登录/登出/me 契约与实现一致
- [ ] App session 无法访问 admin API
- [ ] audit helper 可写且不可删
- [ ] 集成测试 + typecheck + check 通过
