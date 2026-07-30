# Catalog、订单 Schema、pack_access 与兑换码 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地阶段 6 子计划 1——服务端目录（含 samplePreviews / introMedia）、Prisma 商业表首迁、`pack_access` 与兑换码 API；移动端市场/详情接真 catalog、轻量预览页与兑换码抽屉（不接真实 OpenSDK / 网络下载）。

**Architecture:** `packages/contracts` 冻结 catalog / redemption Zod → NestJS catalog + redemption 模块 → Prisma repository → PostgreSQL；移动端经 `catalog-api` / `redemption-api` 用例替换 `catalogSeed` 与 mock 购买，预览音频走公开 URL。

**Tech Stack:** NestJS 11、Prisma 6、PostgreSQL 18、Zod、`expo-router`、Vitest + supertest 集成测试

**Kickoff：** `docs/superpowers/plans/2026-07-30-phase6-catalog-payment-kickoff.md`  
**ADR：** `docs/decisions/0010-catalog-preview-redemption-and-media.md`  
**验收子集：** `docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §6.1–6.2（目录）、兑换码（ADR 0010 §4）

## Global Constraints

- **不改** pack 协议 `cards` / `lexicon` schema
- **不接** 微信 OpenSDK / 真实 `WechatPayClient` 生产回调（子计划 2）
- **不做** 网络 pack 下载 UI / signed URL（子计划 3）
- Prisma 模型 **不得** 直接作为 API 响应
- 目录 GET 接口 **无需登录**；兑换码 **必须登录**
- 展示价来自 catalog；**下单金额真值** 只在 create-order（子计划 2）
- 兑换码只存 **哈希**；日志无明文码
- 一码多人：`maxRedemptions` 由运营配置；同 `user+pack` 幂等「已拥有」
- 订单 / 支付 / `pack_access` / `redemption_events` **禁止物理删除**
- 子计划 1 迁表含 `payment_events`、`refunds`，但 **不实现** 支付/退款逻辑

---

## 文件结构（本计划锁定）

| 路径 | 职责 |
| --- | --- |
| `apps/api/prisma/schema.prisma` | 阶段 6 商业表 model |
| `apps/api/prisma/migrations/.../` | 首迁 SQL |
| `packages/contracts/src/catalog/` | 目录 list/detail/price Zod |
| `packages/contracts/src/redemption/` | redeem 请求/响应 Zod |
| `packages/contracts/src/pack-access/` | `me/pack-access` 响应 Zod |
| `apps/api/src/catalog/` | 公开目录模块 |
| `apps/api/src/redemption/` | 兑换 + pack_access 写入 |
| `apps/api/src/pack-access/` | 已购权益查询 |
| `apps/api/prisma/seed-catalog.ts` | dev/test 目录种子 |
| `apps/api/test/catalog-redemption.e2e.test.ts` | 集成测试 |
| `apps/mobile/src/data/api/catalog-api.ts` | HTTP 适配器 |
| `apps/mobile/src/data/api/redemption-api.ts` | 兑换 HTTP |
| `apps/mobile/src/data/api/pack-access-api.ts` | 权益 HTTP |
| `apps/mobile/src/use-cases/fetch-market-catalog.ts` | 替代 list 读 seed |
| `apps/mobile/src/use-cases/fetch-pack-detail-view-model.ts` | 替代 mock 详情 |
| `apps/mobile/src/screens/pack-preview-screen.tsx` | 轻量预览页 |
| `apps/mobile/src/screens/redeem-code-screen.tsx` | 兑换码全屏 |
| `apps/mobile/app/pack-preview.tsx` | 预览路由 |
| `apps/mobile/app/redeem.tsx` | 兑换路由 |

---

### Task 1: Prisma 阶段 6 商业表首迁

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260730120000_add_catalog_commerce_tables/migration.sql`

**Interfaces:**
- Produces: Prisma models `Pack`, `PackVersion`, `Order`, `PaymentEvent`, `PackAccess`, `Refund`, `RedemptionCode`, `RedemptionEvent`

**Schema 要点:**

```prisma
model Pack {
  packId            String   @id @map("pack_id")
  title             String
  displayTitle      String?  @map("display_title")
  primaryCategory   String   @map("primary_category")
  secondaryCategory String   @map("secondary_category")
  versionLabel      String   @map("version_label")
  contentTags       Json     @map("content_tags")
  cardCount         Int      @map("card_count")
  sizeLabel         String   @map("size_label")
  summary           String
  priceCents        Int      @map("price_cents")
  coverUrl          String?  @map("cover_url")
  coverBadge        String?  @map("cover_badge")
  coverLines        Json?    @map("cover_lines")
  samplePreviews    Json     @map("sample_previews")
  introMedia        Json?    @map("intro_media")
  currentVersionId  String?  @map("current_version_id") @db.Uuid
  status            String   @default("published")
  updatedAt         DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)
  // relations...
  @@map("packs")
}

model PackVersion {
  id               String   @id @default(uuid()) @db.Uuid
  packId           String   @map("pack_id")
  packVersion      String   @map("pack_version")
  cosObjectKey     String   @map("cos_object_key")
  sha256           String
  sizeBytes        BigInt   @map("size_bytes")
  keyId            String   @map("key_id")
  manifestSignature String  @map("manifest_signature")
  protocolVersion  Int      @map("protocol_version")
  status           String   @default("published")
  publishedAt      DateTime @map("published_at") @db.Timestamptz(6)
  @@unique([packId, packVersion])
  @@map("pack_versions")
}

model Order {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  packId      String   @map("pack_id")
  amountCents Int      @map("amount_cents")
  status      String
  channel     String?
  sourceCode  String?  @map("source_code")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)
  @@index([userId])
  @@index([packId])
  @@map("orders")
}

model PaymentEvent {
  id             BigInt   @id @default(autoincrement())
  notificationId String   @unique @map("notification_id")
  transactionId  String   @unique @map("transaction_id")
  orderId        String   @map("order_id") @db.Uuid
  processedAt    DateTime @map("processed_at") @db.Timestamptz(6)
  @@map("payment_events")
}

model PackAccess {
  id        BigInt   @id @default(autoincrement())
  userId    String   @map("user_id") @db.Uuid
  packId    String   @map("pack_id")
  orderId   String?  @map("order_id") @db.Uuid
  source    String
  grantedAt DateTime @map("granted_at") @db.Timestamptz(6)
  @@unique([userId, packId])
  @@map("pack_access")
}

model Refund {
  id        String   @id @default(uuid()) @db.Uuid
  orderId   String   @map("order_id") @db.Uuid
  status    String
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)
  @@map("refunds")
}

model RedemptionCode {
  id              String   @id @default(uuid()) @db.Uuid
  codeHash        String   @unique @map("code_hash")
  packId          String   @map("pack_id")
  maxRedemptions  Int      @map("max_redemptions")
  redeemedCount   Int      @default(0) @map("redeemed_count")
  expiresAt       DateTime? @map("expires_at") @db.Timestamptz(6)
  status          String   @default("active")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  @@map("redemption_codes")
}

model RedemptionEvent {
  id               String   @id @default(uuid()) @db.Uuid
  redemptionCodeId String   @map("redemption_code_id") @db.Uuid
  userId           String   @map("user_id") @db.Uuid
  packId           String   @map("pack_id")
  orderId          String?  @map("order_id") @db.Uuid
  redeemedAt       DateTime @map("redeemed_at") @db.Timestamptz(6)
  @@index([userId])
  @@map("redemption_events")
}
```

- [ ] **Step 1:** 写入 schema 与 migration SQL
- [ ] **Step 2:** 运行 `pnpm --filter @remember/api prisma migrate dev --name add_catalog_commerce_tables`（或 apply 已有 migration）
- [ ] **Step 3:** `pnpm --filter @remember/api typecheck` 通过

**Verify:**

```powershell
pnpm dev:db
pnpm --filter @remember/api prisma migrate deploy
pnpm --filter @remember/api typecheck
```

---

### Task 2: `packages/contracts` catalog 契约

**Files:**
- Create: `packages/contracts/src/catalog/sample-preview.ts`
- Create: `packages/contracts/src/catalog/intro-media.ts`
- Create: `packages/contracts/src/catalog/pack-summary.ts`
- Create: `packages/contracts/src/catalog/list-packs.ts`
- Create: `packages/contracts/src/catalog/pack-detail.ts`
- Create: `packages/contracts/src/catalog/pack-price.ts`
- Create: `packages/contracts/src/catalog/index.ts`
- Create: `packages/contracts/src/catalog/catalog.test.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- Produces: `catalogPackSummarySchema`, `catalogPackDetailSchema`, `listCatalogPacksResponseSchema`, `catalogPackPriceResponseSchema`, `packSamplePreviewSchema`, `introMediaItemSchema`

**Zod 冻结（与 ADR 0010 / 现 `PackSamplePreview` 对齐）:**

```typescript
// sample-preview.ts
export const packSamplePreviewSchema = z.object({
  headword: z.string().min(1),
  zh: z.string().min(1),
  exampleEn: z.string().min(1),
  initial: z.string().min(1).optional(),
  previewAudioUrl: z.string().url().optional(),
}).strict();

// intro-media.ts
export const introMediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  posterUrl: z.string().url().optional(),
  sortOrder: z.number().int().nonnegative(),
}).strict();

// pack-summary.ts — 列表项
export const catalogPackSummarySchema = z.object({
  packId: z.string().min(1),
  title: z.string().min(1),
  displayTitle: z.string().min(1).optional(),
  primaryCategory: z.enum(['primary', 'junior', 'senior', 'postgraduate']),
  secondaryCategory: z.string().min(1),
  versionLabel: z.string().min(1),
  contentTags: z.array(z.string()),
  cardCount: z.number().int().positive(),
  sizeLabel: z.string().min(1),
  updatedAt: z.string().datetime(),
  priceCents: z.number().int().nonnegative(),
  coverUrl: z.string().url().optional(),
  coverBadge: z.string().min(1).optional(),
  coverLines: z.array(z.string()).optional(),
}).strict();
```

- [ ] **Step 1:** 写 failing 契约测试（非法 extra key 拒绝、samplePreviews 解析）
- [ ] **Step 2:** 实现 schema 文件
- [ ] **Step 3:** `pnpm --filter @remember/contracts test` 全绿

---

### Task 3: redemption 与 pack-access 契约

**Files:**
- Create: `packages/contracts/src/redemption/redeem-code.ts`
- Create: `packages/contracts/src/redemption/index.ts`
- Create: `packages/contracts/src/pack-access/list-my-pack-access.ts`
- Create: `packages/contracts/src/pack-access/index.ts`
- Create: `packages/contracts/src/redemption/redemption.test.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- Produces: `redeemCodeRequestSchema`, `redeemCodeResponseSchema`, `listMyPackAccessResponseSchema`

```typescript
// redeem-code.ts
export const redeemCodeRequestSchema = z.object({
  code: z.string().trim().min(4).max(64),
}).strict();

export const redeemCodeResponseSchema = z.object({
  packId: z.string().min(1),
  alreadyOwned: z.boolean(),
}).strict();

// list-my-pack-access.ts
export const listMyPackAccessResponseSchema = z.object({
  items: z.array(z.object({
    packId: z.string().min(1),
    grantedAt: z.string().datetime(),
    source: z.enum(['purchase', 'redemption']),
  }).strict()),
}).strict();
```

- [ ] **Step 1:** 契约测试
- [ ] **Step 2:** 实现并导出
- [ ] **Step 3:** `pnpm --filter @remember/contracts test` 全绿

---

### Task 4: Catalog API 模块（公开）

**Files:**
- Create: `apps/api/src/catalog/catalog.repository.ts`
- Create: `apps/api/src/catalog/catalog.service.ts`
- Create: `apps/api/src/catalog/catalog.controller.ts`
- Create: `apps/api/src/catalog/catalog.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: contract schemas from Task 2
- Produces: HTTP handlers

**Routes（无 AuthGuard）:**

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| GET | `/catalog/packs` | query: `primaryCategory?`, `secondaryCategory?`, `versionLabel?`, `keyword?` → `{ items: CatalogPackSummary[] }` |
| GET | `/catalog/packs/:packId` | 404 `PACK_NOT_FOUND` → `CatalogPackDetail` |
| GET | `/catalog/packs/:packId/price` | 404 → `{ packId, priceCents }` |

**CatalogPackDetail** = summary 字段 + `summary` + `samplePreviews` + `introMedia?`

- [ ] **Step 1:** repository `listPublishedPacks`, `findPublishedPackDetail`
- [ ] **Step 2:** service 映射 Prisma JSON → Zod parse 输出
- [ ] **Step 3:** controller + module 注册
- [ ] **Step 4:** 手动 curl 或集成测试预备

---

### Task 5: Redemption 模块（需登录）

**Files:**
- Create: `apps/api/src/redemption/redemption-code-hash.ts`
- Create: `apps/api/src/redemption/redemption.repository.ts`
- Create: `apps/api/src/redemption/redemption.service.ts`
- Create: `apps/api/src/redemption/redemption.controller.ts`
- Create: `apps/api/src/redemption/redemption.module.ts`
- Modify: `apps/api/.env.example` — `REDEMPTION_CODE_PEPPER`

**Interfaces:**
- Consumes: `AuthGuard`, `requireAuthContext`, `redeemCodeRequestSchema`
- Produces: `POST /redemption/redeem`

**核心事务（伪代码）:**

```typescript
async redeem(userId: string, rawCode: string): Promise<RedeemCodeResponse> {
  const codeHash = hashRedemptionCode(rawCode, pepper);
  return this.prisma.$transaction(async (tx) => {
    const code = await tx.redemptionCode.findUnique({ where: { codeHash } });
    if (!code || code.status !== 'active') throw PACK_NOT_FOUND style;
    if (code.expiresAt && code.expiresAt < now) throw REDEMPTION_CODE_EXPIRED;
    const existing = await tx.packAccess.findUnique({ where: { userId_packId: { userId, packId: code.packId } } });
    if (existing) return { packId: code.packId, alreadyOwned: true };

    if (code.redeemedCount >= code.maxRedemptions) throw REDEMPTION_CODE_EXHAUSTED;

    const order = await tx.order.create({ data: { userId, packId: code.packId, amountCents: 0, status: 'paid', channel: 'redemption' } });
    await tx.packAccess.create({ data: { userId, packId: code.packId, orderId: order.id, source: 'redemption', grantedAt: now } });
    await tx.redemptionEvent.create({ data: { redemptionCodeId: code.id, userId, packId: code.packId, orderId: order.id, redeemedAt: now } });
    await tx.redemptionCode.update({ where: { id: code.id }, data: { redeemedCount: { increment: 1 } } });
    return { packId: code.packId, alreadyOwned: false };
  });
}
```

- [ ] **Step 1:** hash 工具 + 单元测试
- [ ] **Step 2:** repository + service
- [ ] **Step 3:** controller `@UseGuards(AuthGuard)` `@Post('redeem')`
- [ ] **Step 4:** 401 未登录、404 无效码、幂等已拥有

---

### Task 6: Pack Access 查询 API

**Files:**
- Create: `apps/api/src/pack-access/pack-access.repository.ts`
- Create: `apps/api/src/pack-access/pack-access.service.ts`
- Create: `apps/api/src/pack-access/pack-access.controller.ts`
- Create: `apps/api/src/pack-access/pack-access.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Route:**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/me/pack-access` | AuthGuard → `listMyPackAccessResponseSchema` |

- [ ] **Step 1:** list by userId
- [ ] **Step 2:** 注册模块

---

### Task 7: 目录 seed 脚本

**Files:**
- Create: `apps/api/prisma/seed-catalog.ts`
- Modify: `apps/api/package.json` — `"seed:catalog": "tsx prisma/seed-catalog.ts"`（或 node 等价）

**Seed 内容（dev/test）:**

1. `remember-test-pack` — 对齐现 bundled 测试包；`priceCents: 1`；`samplePreviews` 含公开试听 URL（dev 可用固定 HTTPS 或本地 nginx 前缀，写入 `CATALOG_PUBLIC_MEDIA_BASE_URL`）
2. `demo-primary-grade3` — 对齐现 mock 三年级条目
3. `pack_versions` 行：`remember-test-pack` @ `1.0.0`，`cosObjectKey` 占位，`sha256` 与测试包一致（从 fixtures 读取或硬编码 seed 值）

**测试兑换码（仅 dev/test）：**

- 明文 `TEST-REDEEM-001` → seed 时写入 hash（pepper 与 `.env.example` 一致）
- `maxRedemptions: 100`

- [ ] **Step 1:** 实现 seed 脚本（upsert idempotent）
- [ ] **Step 2:** 文档注释：integration test 依赖此 seed 或 test helper insert

---

### Task 8: 集成测试

**Files:**
- Create: `apps/api/test/catalog-redemption.e2e.test.ts`
- Modify: `apps/api/test/helpers/db-test-helper.ts` — `resetCommerceTables`, `seedCatalogFixtures`

**Cases:**

- [ ] `GET /catalog/packs` 无 token → 200，items ≥ 1
- [ ] `GET /catalog/packs/remember-test-pack` → 含 samplePreviews
- [ ] `GET /catalog/packs/missing` → 404 `PACK_NOT_FOUND`
- [ ] `POST /redemption/redeem` 无 token → 401
- [ ] 登录 + 有效码 → 200，`pack_access` 1 条
- [ ] 同用户再次兑换同 pack → 200 `alreadyOwned: true`，`pack_access` 仍 1 条
- [ ] 无效码 → 404
- [ ] `GET /me/pack-access` → 含刚兑换 packId

**Verify:**

```powershell
pnpm dev:db
pnpm --filter @remember/api test:integration
```

---

### Task 9: 移动端 catalog / pack-access / redemption API 适配器

**Files:**
- Create: `apps/mobile/src/data/api/catalog-api.ts`
- Create: `apps/mobile/src/data/api/pack-access-api.ts`
- Create: `apps/mobile/src/data/api/redemption-api.ts`

**Pattern（对齐 auth-api.ts）:**

```typescript
export async function fetchCatalogPacks(query: MarketCatalogQuery): Promise<CatalogPackSummary[]> {
  const params = new URLSearchParams(/* ... */);
  const raw = await apiFetchJson<unknown>(`/catalog/packs?${params}`);
  return listCatalogPacksResponseSchema.parse(raw).items;
}
```

- [ ] **Step 1:** 三个 API 文件 + Zod parse
- [ ] **Step 2:** 网络失败抛 `ApiNetworkError`；404 映射友好错误

---

### Task 10: 用例层接真 catalog（保留 dev fallback）

**Files:**
- Create: `apps/mobile/src/use-cases/fetch-market-catalog.ts`
- Create: `apps/mobile/src/use-cases/fetch-pack-detail-view-model.ts`
- Modify: `apps/mobile/src/use-cases/list-market-catalog.ts` — 改为 async wrapper 或废弃
- Modify: `apps/mobile/src/use-cases/get-pack-detail-view-model.ts` — 委托 fetch 版本
- Modify: `apps/mobile/src/screens/market-screen.tsx`, `market-search-screen.tsx`, `pack-detail-screen.tsx`
- Modify: `apps/mobile/src/catalog/pack-sample-preview.ts` — `previewAudioUrl` 替代 `previewAudio`（或兼容两者）

**Rules:**

- `__DEV__` 且 catalog API 失败时可 fallback `catalogSeed`（日志一次）
- 删除详情页「模拟已购买」Alert；购买按钮改为「即将开放微信支付」（子计划 2 前）
- `priceCents` → 格式化为 `¥x.xx` 展示；`isMockPrice: false`
- `hasPackAccess` 来自 `me/pack-access`（登录时）；未登录视为未购
- bundled 测试包仍可通过 `isBundledTestPack` 标记（catalog 字段 `isBundledTestPack?: boolean` 或 packId 前缀判断）

**Catalog 契约扩展（Task 2 同步）:**

```typescript
// pack-detail 可选
isBundledTestPack: z.boolean().optional(),
```

- [ ] **Step 1:** fetch use cases
- [ ] **Step 2:** 更新 screens 为 async load + loading/error 态
- [ ] **Step 3:** 移除 `mock-purchase-store` 引用（文件可保留至子计划 3 清理或本任务删除）

---

### Task 11: 轻量预览页

**Files:**
- Create: `apps/mobile/src/screens/pack-preview-screen.tsx`
- Create: `apps/mobile/app/pack-preview.tsx`
- Modify: `apps/mobile/src/components/pack-detail/pack-detail-sample-list.tsx` — 行点击 → 预览页；喇叭仍 inline 播放
- Modify: `apps/mobile/src/use-cases/play-public-preview-audio.ts` — 公开 URL 播放（expo-av 或现有 audio 封装）

**预览页内容:**

- 词头、中文释义、例句英/中
- 试听按钮（`previewAudioUrl` HTTPS）
- **无** SM-2、无加入复习、无进度写入
- 顶栏返回详情

**Route:** `/pack-preview?packId=...&headword=...`

- [ ] **Step 1:** 预览 screen + 路由
- [ ] **Step 2:** sample list 导航
- [ ] **Step 3:** 公开 URL 试听（不依赖 pack 安装）

---

### Task 12: introMedia 区块（契约真做，可无数据）

**Files:**
- Create: `apps/mobile/src/components/pack-detail/pack-detail-intro-media.tsx`
- Modify: `apps/mobile/src/screens/pack-detail-screen.tsx`

**Rules:**

- `introMedia` 按 `sortOrder` 渲染
- `image` → `Image`；`video` → 外链 `Linking.openURL` 或 WebView（MVP 简单方案：点击用系统播放器打开 URL）
- 数组空或 undefined → 不渲染区块

---

### Task 13: 兑换码抽屉与全屏

**Files:**
- Create: `apps/mobile/src/screens/redeem-code-screen.tsx`
- Create: `apps/mobile/app/redeem.tsx`
- Create: `apps/mobile/src/use-cases/redeem-pack-code.ts`
- Modify: `apps/mobile/src/shell/drawer-menu-config.ts` — redeem 改 route
- Modify: `apps/mobile/src/components/shell/app-drawer.tsx` — redeem 导航；未登录 → `/login`

**UX:**

- 输入框 + 确认按钮
- 成功：Toast/Alert「已开通 xxx」+ 刷新 pack-access
- 已拥有：友好提示
- 错误码映射：`REDEMPTION_CODE_EXPIRED`、`REDEMPTION_CODE_EXHAUSTED`、无效码

- [ ] **Step 1:** redeem screen
- [ ] **Step 2:** drawer 接线
- [ ] **Step 3:** 登录门禁

---

### Task 14: 全量验证

- [ ] `pnpm --filter @remember/contracts test`
- [ ] `pnpm --filter @remember/api test:integration`
- [ ] `pnpm --filter @remember/mobile test`
- [ ] `pnpm --filter @remember/api typecheck`
- [ ] `pnpm --filter @remember/mobile typecheck`

**本计划不验收（子计划 2/3）：** 真实微信支付、下载 signed zip、30 天离线许可 UI

---

## 自审（plan vs spec）

| 需求 | 任务 |
| --- | --- |
| ADR 0010 三层媒体 A/B 公开 | Task 2, 4, 11, 12 |
| samplePreviews + 预览页无 SM-2 | Task 11 |
| introMedia 未登录可看 | Task 2, 4, 12 |
| 兑换码 MVP 一码多人 | Task 5, 8 |
| pack_access 同下载链（写权益） | Task 5, 6 |
| 目录无登录 | Task 4 |
| 兑换需登录 | Task 5, 13 |
| 不改 pack cards | ✅ 无 pack 协议任务 |
| 不接 OpenSDK | ✅ 无支付任务 |
| Prisma 首迁含 payment/refund 表 | Task 1 |

**Gap:** 网络下载 / create-order / 真实付退 → 子计划 2–3
