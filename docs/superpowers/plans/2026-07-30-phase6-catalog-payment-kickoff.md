# 阶段 6 启动说明（目录、订单、支付、兑换码与购买权限）

日期：2026-07-30  
状态：**已确认，可直接规划与实施**（§11 已全部勾选，2026-07-30）  
基线：`main` @ `a4572bf`（ADR/kickoff 草稿）→ 确认 commit 后开 `feat/catalog-and-payment`  
ADR：**`docs/decisions/0010-catalog-preview-redemption-and-media.md`**

## 1. 本阶段要做什么（一句话）

让 App 完成：**服务端目录（含免费预览）→ 微信支付或兑换码开通 → 授权下载 signed 包 → 安装学习**；客户端永远不能单独解锁；测试商户环境完成 **真实付 + 真实退**。

完整勾选项：`docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §6  
总顺序：`docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md` §9

## 2. 当前进度

```text
阶段 0–5  ✅（见 2026-07-30-phase5-account-sync-completion.md）
阶段 6    ✅ kickoff 已确认；子计划 1–3 待写/实施
阶段 7–8  ⏸
```

## 3. 已确认产品决策（2026-07-30）

| #   | 决策               | 内容                                                                        |
| --- | ------------------ | --------------------------------------------------------------------------- |
| D1  | **兑换码纳入 MVP** | 一码多人（`maxRedemptions`）；兑换后 **同一套** 下载/安装链；见 ADR 0010 §4 |
| D2  | **免费示例**       | 目录 API 下发 `samplePreviews`；**轻量预览页**（展示+试听，不学习）         |
| D3  | **示例媒体存储**   | **公开小文件 URL**（CDN/COS 只读前缀）；全量 zip **私有 COS**               |
| D4  | **介绍图/视频**    | `introMedia[]` 契约预留；**未登录、未购均可看**；阶段 6 可不填视频          |
| D5  | **满减优惠券**     | **仍不做**；兑换码 ≠ 优惠券（ADR 0010 修订表述）                            |

## 4. 三层内容边界（必读）

```text
┌─────────────────────────────────────────────────────────┐
│ A. 目录营销（packs 表 + 公开 URL）                       │
│    封面、summary、introMedia 图/视频 — 不登录可看        │
├─────────────────────────────────────────────────────────┤
│ B. 免费示例（samplePreviews + 预览页 + 公开试听文件）    │
│    未购可看 — 不登录可看                                 │
├─────────────────────────────────────────────────────────┤
│ C. 全量 pack.zip（pack_versions + 私有 COS）             │
│    仅 pack_access（购买或兑换）→ 下载授权 → 验签安装     │
└─────────────────────────────────────────────────────────┘
```

## 5. 是否需要 3 份子计划？

**需要。** 与 `development-order` §9 一致：

| 顺序 | 文件（实施前创建）                                                   | 核心交付                                                                                                         |
| ---- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1    | `docs/superpowers/plans/2026-07-30-catalog-order-and-pack-access.md` | Prisma：`packs`、`pack_versions`、`orders`、`pack_access`、`redemption_*`；目录 API；兑换码；移动端真目录+预览页 |
| 2    | `docs/superpowers/plans/2026-07-30-wechat-pay-and-refund.md`         | `WechatPayClient` 生产化；下单/回调/查单；`payment_events`；幂等矩阵                                             |
| 3    | `docs/superpowers/plans/2026-07-30-offline-pack-access.md`           | 下载授权；30 天离线许可；网络下载 UI；详情页购买状态机接真                                                       |

**推荐顺序：** 1 → 2 → 3；子计划 2 可用 mock 回调测 1 的 `pack_access`，但 **§6.8 真实付/退** 必须 2 完成。

## 6. 并行暂停（不阻塞阶段 6 大部分开发）

| 项                       | 挡什么                              | 不挡什么                                   |
| ------------------------ | ----------------------------------- | ------------------------------------------ |
| **Pause C/D** 微信 AppID | release OpenSDK 真拉起、§6.8 实机付 | 目录 API、订单、回调集成测试、mock 查单 UI |
| **测试商户密钥**         | 真实微信付/退                       | 官方 Postman 向量、DB 幂等、脚本注入回调   |
| **备案/正式域名**        | 生产 HTTPS 回调                     | 本地/IP 联调、脚本模拟回调                 |
| **COS 生产桶**           | 正式包分发                          | dev 固定测试 zip URL 或本地 COS 前缀       |

## 7. 服务端与契约（建议默认）

### 7.1 表（阶段 6 首迁子集）

| 表                  | 用途                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| `packs`             | 目录：标题、分类、summary、价格分、`cover`、`samplePreviews` JSON、`introMedia` JSON |
| `pack_versions`     | 不可变：zip COS key、hash、签名、协议版本、发布状态                                  |
| `orders`            | 用户、packId、金额快照、状态、可选 `source_code`/`channel`                           |
| `payment_events`    | 微信回调幂等                                                                         |
| `pack_access`       | user+pack 唯一权益                                                                   |
| `refunds`           | 退款状态机                                                                           |
| `redemption_codes`  | 码哈希、packId、maxRedemptions、redeemedCount、expiresAt                             |
| `redemption_events` | 兑换审计                                                                             |

### 7.2 目录 API（均 **无需登录**）

| 方法 | 路径                                  | 说明                                               |
| ---- | ------------------------------------- | -------------------------------------------------- |
| GET  | `/api/v1/catalog/packs`               | 列表（筛选同现 UI）                                |
| GET  | `/api/v1/catalog/packs/:packId`       | 详情：含 cover、samplePreviews、introMedia、展示价 |
| GET  | `/api/v1/catalog/packs/:packId/price` | 可选：下单前刷新价（真值仍只在 create-order）      |

**展示价：** 列表/详情可显示 `priceCents`；**下单金额只来自 create-order 响应**。

### 7.3 兑换码 API（需登录）

| 方法 | 路径                        | 说明                                                    |
| ---- | --------------------------- | ------------------------------------------------------- |
| POST | `/api/v1/redemption/redeem` | body: `{ code }` → 写 pack_access + event；已拥有则幂等 |

### 7.4 购买与下载（需登录 + pack_access）

沿用架构 §8.5；子计划 2/3 细化。下载前 **必须** 校验 `pack_access`；离线许可 30 天（架构 §10）。

## 8. 移动端：mock / 必须真做

| 元素                           | 阶段 6                                       |
| ------------------------------ | -------------------------------------------- |
| 市场/搜索列表                  | **真做**（服务端 catalog）                   |
| 详情封面、summary、标签        | **真做**                                     |
| `introMedia` 图/视频           | **契约真做**；无数据则不展示区块             |
| `samplePreviews` + **预览页**  | **真做**                                     |
| 示例试听                       | **真做**（公开 URL）                         |
| 价格展示                       | **真做**（服务端）；下单以 create-order 为准 |
| 立即购买                       | **真做** → 微信（Pause C/D 后实机）          |
| 兑换码抽屉入口                 | **真做**                                     |
| mock `catalogSeed` / mock 购买 | **删除或仅 dev fallback**                    |
| bundled 测试包                 | 可保留 dev 安装路径；市场展示走 catalog      |

## 9. 编码原则

- 契约先行：`packages/contracts`；Prisma 不得直出 API。
- 支付/兑换/权益：**事务 + 唯一约束**；权益 `userId`/`packId` 从订单或兑换记录读，不信客户端 body。
- 目录只读接口：**无 session 也可访问**（含 intro 视频）。
- 最小实现：不预建分销、Redis、MQ；`orders.source_code` 可空。

## 10. 建议 Git 分支

```text
git checkout -b feat/catalog-and-payment main
```

## 11. 审核清单（2026-07-30 已确认）

- [x] ADR 0010 三层媒体与「不做满减、做兑换码」
- [x] 兑换码 **需登录**（未登录只能看目录/预览，不能兑）
- [x] 一码多人 + `maxRedemptions`（运营在后台配，无全局默认）
- [x] 预览页范围：仅展示+试听，无 SM-2
- [x] intro 视频阶段 6 只预留字段、可不实现播放器以外的转码流水线
- [x] 子计划 3 才做网络下载 UI（阶段 4 defer 项）

## 12. 新窗口起手 Prompt（审核通过后复制）

```text
请阅读：
- docs/superpowers/plans/2026-07-30-phase6-catalog-payment-kickoff.md
- docs/decisions/0010-catalog-preview-redemption-and-media.md
- docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md §6
- docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md §9

使用 $build-learning-app 与 writing-plans，在分支 feat/catalog-and-payment 上先写子计划 1
（2026-07-30-catalog-order-and-pack-access.md），再 executing-plans 实施。

已确认：兑换码 MVP、一码多人、同下载链；sample 公开 URL；intro 未登录可看；轻量预览页。
不要接真实 OpenSDK 直到 Pause C/D；不要改 pack 协议 §cards 结构。
```

## 13. 相关文档

- 架构：`docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`
- UI：`docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md` §6–7
- 阶段 5：`docs/superpowers/plans/2026-07-30-phase5-account-sync-completion.md`
- 支付 spike：ADR 0002、0003；`apps/api/src/technical-spikes/wechat-pay/`
