# 阶段 6 完成摘要（目录、订单、mock 支付、兑换码与购买权限）

日期：2026-07-31  
基线：`main` @ `243fc50`（kickoff 已确认）→ merge **PR #4**  
收口分支：`feat/catalog-and-payment`

## 交付物

| 子计划                                                 | 核心交付                                      | 状态        |
| ------------------------------------------------------ | --------------------------------------------- | ----------- |
| kickoff `2026-07-30-phase6-catalog-payment-kickoff.md` | ADR 0010 已确认；§11 全勾选                   | ✅          |
| 1 `2026-07-30-catalog-order-and-pack-access.md`        | 目录 API、兑换码、`pack_access`、预览页、契约 | ✅ mock/dev |
| 2 `2026-07-30-wechat-pay-and-refund.md`                | 订单、mock 回调、幂等、`pack_access` 写入     | ✅ mock/dev |
| 3 `2026-07-30-offline-pack-access.md`                  | 下载授权、网络安装、离线许可字段              | ✅ mock/dev |
| ADR `0010-catalog-preview-redemption-and-media.md`     | 三层媒体、兑换码、intro 未登录可看            | ✅          |
| checklist §6                                           | mock 路径勾选；§6.8/§6.9 defer 标注           | ✅          |

主要代码路径：

- API 目录/兑换/订单/支付/下载：`apps/api/src/catalog/`、`redemption/`、`order/`、`payment/`、`pack-download/`、`pack-access/`
- 契约：`packages/contracts/src/catalog/`、`order/`、`payment/`、`redemption/`、`pack-access/`、`pack-download/`
- 移动端：市场/详情/预览/兑换屏；`install-pack-from-network`、`purchase-pack-with-mock-payment`
- 集成测试：`catalog-redemption`、`payment-idempotency`、`pack-download` e2e（与阶段 5 auth/sync 共 33 条）

## 退出门禁

**mock/dev 路径（PR #4 merge 时验证）：**

- `pnpm check` — 全绿
- `pnpm test:integration` — **33/33** 通过
- `pnpm --filter @remember/mobile test` — **45/45** 通过

**§6.9 正式退出门禁（仍 defer）：**

- 测试商户 **真实 APP 付 + 真实退**（Pause C/D：微信 AppID / OpenSDK）
- 生产 COS 分发、`WechatPayClient` 生产适配器、退款状态机 UI

详见 `2026-07-27-stages-3-6-technical-acceptance-checklist.md` §6.8–§6.9。

## 产品决策落地（ADR 0010）

| 决策                      | 落地                                                   |
| ------------------------- | ------------------------------------------------------ |
| 三层媒体 A/B/C            | 公开 catalog + sample/intro；全量 zip 仅 `pack_access` |
| 兑换码 MVP                | 需登录；一码多人；同下载/安装链                        |
| intro / sample 未登录可看 | 目录 API 无鉴权；轻量预览页无 SM-2                     |
| 不做满减券                | 兑换码单独定义                                         |

## 审查后修复（PR #4 追加 commit）

1. **P1** `resetAuthTables` 先清 commerce 表（修复 auth/sync 集成测试 FK 回归）
2. **P1** 支付回调 `amountCents` 必填 + e2e
3. **P1** 兑换码 `FOR UPDATE` + 条件 `updateMany`；上限 e2e
4. **P1** 权益 API 失败 → `retry_access`，不降级为「立即购买」+ 单测
5. **P1** 集成测试 `applyIntegrationTestEnv()` 强制 pepper
6. **P2** mock 回调需订单 owner 或 `X-Mock-Payment-Secret`；独立 download pepper；兑换频控；release mock 门禁

## 已知残余（不阻塞 mock 路径 merge；后续跟进）

| 优先级 | 项                                                             | 建议处理时机             |
| ------ | -------------------------------------------------------------- | ------------------------ |
| P2     | 集成测试缺「用户 B 调 simulate 他人订单 → 403」                | 子计划 2 回归或阶段 7 前 |
| P2     | 已付订单的新 `payment_events` 未校验 `amountCents`（审计污染） | 接真实微信回调前         |
| P3     | 兑换频控为进程内 Map（多副本无效）                             | 阶段 7 或上 Redis 前     |
| P3     | 未登录点购买仅 toast，不跳登录（兑换页已跳）                   | UX 小改                  |
| P3     | 下载 token 在 URL query（日志/Referer 风险）                   | 生产 COS 前改 Header     |
| P3     | 兑换 e2e 为顺序上限测，非真并发压测                            | 可选补测                 |
| defer  | §6.5 `isOfflineLicenseValid` 未接入门禁 UI                     | 与真实付退一并           |
| defer  | §6.4 下载进度 UI、安装失败临时文件清理                         | 阶段 7 或实机专项        |

## Mock 与 dev 联调要点

| 项          | 处理                                                                                |
| ----------- | ----------------------------------------------------------------------------------- |
| mock 购买   | `EXPO_PUBLIC_MOCK_PAYMENT_ENABLED=true` + `__DEV__` 或 `APP_VARIANT=dev`            |
| mock 回调   | 订单 owner Bearer，或 `WECHAT_PAY_MOCK_NOTIFY_SECRET` + `X-Mock-Payment-Secret`     |
| 下载        | `PACK_DOWNLOAD_MOCK_ENABLED` + `PACK_DOWNLOAD_TOKEN_PEPPER` + `API_PUBLIC_BASE_URL` |
| 兑换码 seed | `pnpm --filter @remember/api seed:dev-bootstrap`（见 runbook）                      |
| 测试包音频  | fixtures / bundled zip 已含公开试听 mp3                                             |

## 阶段 6 范围外（defer → 阶段 7 / Pause C/D）

| 项                     | 说明                               |
| ---------------------- | ---------------------------------- |
| 微信 OpenSDK 实机付/退 | `WechatPayClient` 仍为 mock prepay |
| 生产 COS signed zip    | dev 用 mock zip 路径               |
| 退款 API / 后台        | checklist §6.6                     |
| 满减优惠券             | 明确不做                           |

## 下一阶段

阶段 7：最小管理后台（见 `2026-07-31-phase7-minimum-admin-kickoff.md`、spec `2026-07-31-admin-dashboard-and-content-extensibility-design.md`）。  
并行：Pause C/D 解除后补 §6.8 真实付/退；备案/COS 生产。
