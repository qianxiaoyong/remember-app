# 微信支付、订单与退款 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 收敛 ADR 0002/0003 spike 为生产 `WechatPayClient` 与 NestJS 订单/支付模块；服务端 create-order、回调幂等写 `pack_access`、查单与最小退款链；集成测试覆盖 §6.7 矩阵（mock 回调）；**不接** OpenSDK 实机付（Pause C/D）。

**Architecture:** `packages/contracts` 冻结订单/支付 DTO → `OrderModule`（锁价建单）+ `PaymentModule`（验签解密 + 事务幂等）→ `WechatPayClient`（原生 fetch + Node crypto）；移动端 create-order 后 **查服务端订单**，不本地解锁。

**Tech Stack:** NestJS 11、Prisma、PostgreSQL、Zod、Vitest + supertest；微信 APIv3 自研客户端（**禁止**社区 Node 支付 SDK）

**Kickoff：** `docs/superpowers/plans/2026-07-30-phase6-catalog-payment-kickoff.md`  
**依赖：** 子计划 1 @ `7202ae3`（商业表、catalog、redemption、pack_access）  
**验收：** checklist §6.3–6.4、§6.6–6.7（§6.8 真实付/退待 Pause C/D + 测试商户）

## Global Constraints

- **不接** 微信 OpenSDK 实机拉起 / §6.8 真实付退（Pause C/D）
- dev/test 可用 `WECHAT_PAY_MOCK_ENABLED=true` + 脚本/mock 回调
- 订单状态 **小写** 枚举：`pending` | `paid` | `refunding` | `refunded` | `closed`（统一 redemption 已写的 `paid`）
- 建单金额 **只读** `packs.priceCents`；客户端展示价不作真值
- 回调：原始 body + 头验签 → 解密 → **单事务** 写 `payment_events`、推进 `orders`、写 `pack_access`
- 权益 `userId`/`packId` **从锁定订单读**，不信回调 JSON 附加字段
- `notification_id`、`transaction_id` 唯一；冲突 → `PAYMENT_NOTIFICATION_CONFLICT`
- 订单/支付/退款/**payment_events** 禁止物理删除

---

## 文件结构

| 路径                                                   | 职责                                      |
| ------------------------------------------------------ | ----------------------------------------- |
| `packages/contracts/src/order/`                        | 建单/查单 Zod、状态枚举                   |
| `packages/contracts/src/payment/`                      | prepay 参数、回调解密后 payload（测试用） |
| `apps/api/src/payment/crypto/`                         | 从 spike 晋升的 5 个纯函数                |
| `apps/api/src/payment/wechat-pay-client.ts`            | HTTP + mock 模式                          |
| `apps/api/src/payment/wechat-pay-config.service.ts`    | 商户/env 读取                             |
| `apps/api/src/payment/payment-notification.service.ts` | 幂等事务（ADR 0003 生产化）               |
| `apps/api/src/payment/payment.controller.ts`           | 回调 raw body、dev mock 注入              |
| `apps/api/src/order/order.repository.ts`               | 订单 CRUD + 锁                            |
| `apps/api/src/order/order.service.ts`                  | createOrder、getOrder                     |
| `apps/api/src/order/order.controller.ts`               | `POST /orders`、`GET /orders/:id`         |
| `apps/api/test/payment-idempotency.e2e.test.ts`        | §6.7 矩阵                                 |
| `apps/api/test/helpers/payment-test-helper.ts`         | mock 回调、种子订单                       |

---

### Task 1: 契约 — 订单与支付 DTO

**Files:**

- Create: `packages/contracts/src/order/order-status.ts`
- Create: `packages/contracts/src/order/create-order.ts`
- Create: `packages/contracts/src/order/get-order.ts`
- Create: `packages/contracts/src/order/index.ts`
- Create: `packages/contracts/src/payment/app-prepay-params.ts`
- Create: `packages/contracts/src/payment/index.ts`
- Modify: `packages/contracts/src/index.ts`

**冻结：**

```typescript
// order-status.ts
export const orderStatusSchema = z.enum(['pending', 'paid', 'refunding', 'refunded', 'closed']);

// create-order.ts — POST /orders body
export const createOrderRequestSchema = z.object({ packId: z.string().min(1) }).strict();
export const createOrderResponseSchema = z
  .object({
    orderId: z.string().uuid(),
    packId: z.string().min(1),
    amountCents: z.number().int().positive(),
    status: orderStatusSchema,
    wechatPrepay: wechatAppPrepayParamsSchema, // mock 模式也返回同形
  })
  .strict();

// get-order.ts
export const orderDetailResponseSchema = z
  .object({
    orderId: z.string().uuid(),
    packId: z.string().min(1),
    amountCents: z.number().int().nonnegative(),
    status: orderStatusSchema,
    paidAt: z.string().datetime().optional(),
  })
  .strict();
```

- [ ] 契约测试 round-trip

---

### Task 2: 晋升密码学模块

**Files:**

- Create: `apps/api/src/payment/crypto/`（从 `technical-spikes/wechat-pay/` 复制 5 个实现 + types）
- Modify: spike 测试 import 路径 **或** 保留 spike 为 re-export（避免双份逻辑）

**Verify:** `pnpm --filter @remember/api test` — 原 spike 单测仍绿

---

### Task 3: WechatPayClient + 配置

**Files:**

- Create: `apps/api/src/payment/wechat-pay-config.service.ts`
- Create: `apps/api/src/payment/wechat-pay-client.ts`
- Modify: `apps/api/.env.example`

**Env（示例）：**

```text
WECHAT_PAY_MOCK_ENABLED=true
WECHAT_PAY_MCH_ID=
WECHAT_PAY_MCH_SERIAL=
WECHAT_PAY_MCH_PRIVATE_KEY_PEM=
WECHAT_PAY_API_V3_KEY=
WECHAT_PAY_APP_ID=
WECHAT_PAY_NOTIFY_URL=
```

**Mock 模式：**

- `createAppPrepay(order)` → 返回固定形 prepay 参数（不含真实签名）
- `queryByOutTradeNo` → 读 DB 订单状态映射

**生产模式（代码就绪，联调后启用）：**

- APP 下单 `POST /v3/pay/transactions/app`
- 查单 `GET /v3/pay/transactions/out-trade-no/{id}`
- 退款 `POST /v3/refund/domestic/refunds`

---

### Task 4: OrderModule — 建单与查单

**Routes（AuthGuard）：**

| 方法 | 路径               | 说明                                                                     |
| ---- | ------------------ | ------------------------------------------------------------------------ |
| POST | `/orders`          | body `{ packId }` → 锁价建 `pending` 订单 + 调 WechatPayClient 拿 prepay |
| GET  | `/orders/:orderId` | 仅订单所属 user；返回 status / paidAt                                    |

**Rules:**

- 已有 `pack_access` → 409 `PACK_ALREADY_OWNED`（可选提前拒单）
- 重复 pending 同 pack → 可返回已有 pending 或新建（计划：**新建**，简单）
- `out_trade_no` = `order.id`

---

### Task 5: PaymentNotificationService — 幂等事务

**Files:**

- Create: `apps/api/src/payment/payment-notification.service.ts`
- Create: `apps/api/src/payment/payment.repository.ts`
- Create: `apps/api/src/payment/payment.module.ts`
- Create: `apps/api/src/payment/payment.controller.ts`

**逻辑（对齐 ADR 0003 + 金额校验）：**

```text
验签 + 解密 → 取 notification_id / transaction_id / out_trade_no / amount
→ 事务：
   锁 payment_events by notification_id
   锁 orders by id FOR UPDATE
   校验：订单存在、status=pending、amount 一致、（生产）mchId 一致
   插入 payment_events（冲突则幂等比较）
   orders.status = paid
   pack_access upsert（user+pack 唯一）
```

**Route:**

- `POST /payment/wechat/notify` — **无** AuthGuard；raw body；Nest rawBody 中间件

**Dev mock 入口（仅 test/mock env）：**

- `POST /payment/test/simulate-notify` — 集成测试注入，跳过真实验签

---

### Task 6: Refund 最小链

**Files:**

- Create: `apps/api/src/refund/refund.service.ts`（薄层）
- Create: `apps/api/src/refund/refund.controller.ts` — `POST /orders/:id/refund`（AuthGuard + 仅 dev/test 或内部 token）

**状态机：**

- `paid` → `refunding` → `refunded`
- 退款成功 **不删** `pack_access`（MVP：标记订单 refunded；子计划 3 可细化撤销下载权）
- 迟到支付回调遇 `refunded` → 拒绝，不写 pack_access

---

### Task 7: 集成测试 — §6.7 矩阵

**File:** `apps/api/test/payment-idempotency.e2e.test.ts`

| 场景                                     | 预期                            |
| ---------------------------------------- | ------------------------------- |
| 同一 notification 两次                   | 第二次幂等；pack_access 仍 1 条 |
| 金额不符                                 | 拒绝；订单/权限不变             |
| 未知订单号                               | 拒绝                            |
| 相同 notification_id 不同 transaction_id | 409 冲突                        |
| 回调事务失败                             | 可安全重试                      |

---

### Task 8: 移动端（Pause C/D 前）

**Files:**

- Create: `apps/mobile/src/data/api/order-api.ts`
- Modify: `pack-detail-screen.tsx` — create-order → 提示「mock 支付待确认」→ 轮询 GET order
- **不** 调 OpenSDK；dev 可按钮「模拟支付完成」触发 test simulate-notify（仅 `__DEV__`）

---

### Task 9: 验证

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/api test
pnpm --filter @remember/api test:integration
```

---

## 自审

| checklist            | Task                              |
| -------------------- | --------------------------------- |
| §6.3 订单状态机      | 4, 5, 6                           |
| §6.4 WechatPayClient | 2, 3                              |
| §6.6 退款            | 6                                 |
| §6.7 幂等矩阵        | 5, 7                              |
| §6.8 真实付/退       | **Pause C/D** — 不纳入本计划 Done |
