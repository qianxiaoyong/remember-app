# 阶段 7 启动说明（最小管理后台与运营驾驶舱）

日期：2026-07-31  
状态：**已 merge**（2026-08-01；**PR #5** → `main`）  
完成摘要：[`2026-08-01-phase7-minimum-admin-completion.md`](2026-08-01-phase7-minimum-admin-completion.md)  
基线：`main` @ `dd713ed`（阶段 6 mock 路径已 merge）  
Spec：**`docs/superpowers/specs/2026-07-31-admin-dashboard-and-content-extensibility-design.md`**

## 1. 本阶段要做什么（一句话）

在 **Windows 浏览器** 交付 **React-admin 最小后台**：知识库发版、订单/权益/退款/兑换码运营、**轻量驾驶舱 A**、审计追溯；**不接 in-admin LLM**；开发期对接 **Docker PostgreSQL + mock 外部服务**。

完整勾选项：`docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md` §10  
设计原件：`docs/superpowers/specs/2026-07-31-admin-dashboard-and-content-extensibility-design.md`

## 2. 当前进度

```text
阶段 0–6  ✅（阶段 6 见 2026-07-31-phase6-catalog-payment-completion.md）
阶段 7    ✅ 已 merge（PR #5 → `main`；见 [completion](2026-08-01-phase7-minimum-admin-completion.md)）
阶段 8    ⏸
```

**子计划对照：**

| 子计划 | 文档                                     | 状态 |
| ------ | ---------------------------------------- | ---- |
| 1      | `2026-07-31-admin-auth-and-audit-api.md` | ✅   |
| 2      | `2026-07-31-admin-operations-api.md`     | ✅   |
| 3      | `2026-07-31-admin-ui-and-dashboard.md`   | ✅   |

**退出门禁（spec §11）：** 五类运营 + 兑换码 + 驾驶舱 KPI；补发/退款/发布写 audit；App session → 401；admin 集成测试 49/49。非法 zip Admin E2E、全量 format 见 [completion 残余表](2026-08-01-phase7-minimum-admin-completion.md)。

**未纳入本阶段（可后续 7.x）：** in-admin LLM、MVP-B 完整手机号、驾驶舱 protocolVersion 分布 widget、生产 COS/真实微信退款。

**本地 dev 环境：** 已配置 Docker PG + API seed（见 `docs/runbooks/local-api-docker-dev.md`）。

## 3. 已确认产品决策（2026-07-31）

| #   | 决策            | 内容                                                                           |
| --- | --------------- | ------------------------------------------------------------------------------ |
| D1  | **驾驶舱**      | **选 A**：阶段 7 首版轻量 KPI（交易/兑换/告警/包状态）；不做学习行为曲线       |
| D2  | **制包**        | 外部 AI → source JSON → **现有 pack-builder build:pack** → 后台上传发布        |
| D3  | **AI in-admin** | **阶段 7 不做**；后期单独 ADR（content_jobs）                                  |
| D4  | **第二期 UI**   | 情景类交互未定；普通短句可继续 vocabulary；预留 cardType 注册，不提前定 schema |
| D5  | **后台形态**    | React-admin + 独立 admin 会话；**浏览器访问**，非 Windows 桌面程序             |
| D6  | **开发数据**    | **Docker PG** 模拟服务端数据；微信/COS/SMS 继续 mock                           |

## 4. 管理员菜单（目标 IA）

```text
记得 Admin
├── 📊 运营驾驶舱          ← Dashboard A（首页）
├── 📦 知识库
│   ├── 目录与定价（packs）
│   └── 版本与发布（pack_versions + 上传 zip）
├── 🎫 兑换码批次
├── 🧾 订单与支付事件
├── 🔑 用户权益 / 补发
├── ↩️ 退款
└── 📋 审计日志
```

## 5. 是否需要 3 份子计划？

**需要。** 推荐顺序：

| 顺序 | 文件（实施前创建）                                              | 核心交付                                                                                                  |
| ---- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1    | `docs/superpowers/plans/2026-07-31-admin-auth-and-audit-api.md` | Prisma：`admin_users`、`admin_sessions`、`audit_logs`；Admin 登录/登出；`AdminAuthGuard`；审计写入 helper |
| 2    | `docs/superpowers/plans/2026-07-31-admin-operations-api.md`     | 发版/upload+verify、订单只读、pack_access 补发、退款、兑换码批次；admin 契约 Zod                          |
| 3    | `docs/superpowers/plans/2026-07-31-admin-ui-and-dashboard.md`   | `apps/admin` React-admin；dataProvider/authProvider；Resource 页 + **Dashboard A**                        |

**依赖：** 1 → 2 → 3（UI 可 mock 2 的 API 并行度有限，建议严格顺序）。

## 6. 并行暂停（不阻塞阶段 7 大部分开发）

| 项             | 挡什么                    | 不挡什么                            |
| -------------- | ------------------------- | ----------------------------------- |
| **Pause C/D**  | 真实微信退款 API、OpenSDK | mock 退款状态机、订单/audit 联调    |
| **COS 生产桶** | 正式 zip 公有/CDN 分发    | dev 本地/mock 存储 + 现有 mock 下载 |
| **备案/HTTPS** | 公网 admin 域名           | `localhost` / 局域网 Vite 联调      |
| **TOTP**       | 管理员双因素              | MVP 密码登录；表字段可预留          |

## 7. 服务端与契约（建议默认）

### 7.1 新增表（子计划 1 迁移）

| 表               | 用途                                                  |
| ---------------- | ----------------------------------------------------- |
| `admin_users`    | 登录名、密码摘要、状态；可选 `totp_secret` 预留       |
| `admin_sessions` | token 哈希、过期、撤销                                |
| `audit_logs`     | actor、action、target、payload 摘要、结果；**不可删** |

### 7.2 Admin API 前缀

全部 **`/api/v1/admin/`**；与 App `/api/v1/` 并列；**禁止** App session 混用。

**示例（子计划 2 细化）：**

| 方法           | 路径                                        | 说明                         |
| -------------- | ------------------------------------------- | ---------------------------- |
| POST           | `/admin/auth/login`                         | 管理员登录                   |
| POST           | `/admin/auth/logout`                        | 登出                         |
| GET            | `/admin/dashboard/summary`                  | 驾驶舱 KPI                   |
| GET            | `/admin/dashboard/alerts`                   | 告警                         |
| GET/POST/PATCH | `/admin/packs` …                            | 目录 CRUD                    |
| POST           | `/admin/packs/:packId/versions`             | 上传 zip + verify + 创建版本 |
| POST           | `/admin/packs/:packId/versions/:id/publish` | 设为 currentVersion          |
| GET            | `/admin/orders` …                           | 订单列表/详情                |
| GET            | `/admin/pack-access` …                      | 权益查询                     |
| POST           | `/admin/pack-access/grant`                  | 补发（audit）                |
| POST           | `/admin/refunds`                            | 发起退款（audit）            |
| POST           | `/admin/redemption-codes/batch`             | 批次生成                     |
| GET            | `/admin/audit-logs`                         | 审计列表                     |

契约落盘：`packages/contracts/src/admin/`（新建）。

### 7.3 发布 zip 校验

- 必须走与 `tools/pack-builder verify` 等价的服务端校验链
- `protocolVersion` 不支持则拒绝；展示 manifest 摘要供运营核对
- dev 存储：本地目录或复用 mock 路径；**不**要求阶段 7 接 COS SDK

## 8. 前端（React-admin）

| 项           | 决定                                                           |
| ------------ | -------------------------------------------------------------- |
| 脚手架       | Vite + React + TypeScript；pnpm workspace `apps/admin`         |
| 框架         | React-admin 开源核心；**不用** Enterprise                      |
| dataProvider | 原生 `fetch` → admin API；统一错误码                           |
| authProvider | session（httpOnly cookie 或 Bearer；实现时二选一并写 runbook） |
| Dashboard    | 自定义 `<Admin dashboard={Dashboard}>` + Recharts              |
| 风格         | 简洁运营风；不复制 demo 电商皮肤                               |

## 9. 编码原则

- 契约先行；Prisma 不直出 admin 响应
- 所有资金/权益变更：**事务 + audit_logs**
- 后台 **不得** 直连 PG；App **不得** 调 admin API
- 最小实现：不预建 AI jobs、报表构建器、多租户
- cardType 扩展：**registry 模式**，MVP 仅实现 vocabulary 展示字段

## 10. 建议 Git 分支

```text
git checkout -b feat/minimum-admin main
```

## 11. 审核清单（2026-07-31 已确认）

- [x] 驾驶舱选 **A**（轻量 KPI，无学习曲线）
- [x] 制包：外部 AI + pack-builder build + 后台上传
- [x] 阶段 7 **不接** in-admin LLM
- [x] 第二期情景交互未定；仅预留 cardType/protocol 扩展
- [x] dev：**Docker PG** + mock 微信/COS
- [x] React-admin 开源核心（不换 Refine）
- [x] 修订总顺序「不做仪表盘」为 **轻量驾驶舱 only**

## 12. 新窗口起手 Prompt

```text
请阅读：
- docs/superpowers/plans/2026-07-31-phase7-minimum-admin-kickoff.md（已确认）
- docs/superpowers/specs/2026-07-31-admin-dashboard-and-content-extensibility-design.md（已确认）
- docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md §10
- docs/runbooks/local-api-docker-dev.md

使用 $build-learning-app 与 writing-plans，在分支 feat/minimum-admin 上先写子计划 1
（2026-07-31-admin-auth-and-audit-api.md），再 executing-plans 实施。

已确认：驾驶舱 A；pack-builder build 后上传；不接 LLM；Docker PG dev。
Admin 与 App session 隔离；补发/退款/发布写 audit_logs。
不要接生产 COS/真实微信退直到 Pause C/D；不要提前定情景 cardType schema。
```

## 13. 相关文档

- 架构：`docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md` §4、§7、§14
- 阶段 6 收口：`docs/superpowers/plans/2026-07-31-phase6-catalog-payment-completion.md`
- 阶段 7 收口：`docs/superpowers/plans/2026-08-01-phase7-minimum-admin-completion.md`
- Pack 协议：ADR 0008
- 成熟选型：`docs/research/2026-07-26-mature-architecture-audit.md` §7
