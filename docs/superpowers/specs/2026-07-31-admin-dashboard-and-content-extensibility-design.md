# 管理后台、运营驾驶舱与内容扩展设计

日期：2026-07-31  
状态：**已确认**（2026-07-31 产品对齐）  
关联：`2026-07-31-phase7-minimum-admin-kickoff.md`；架构 §4、§7、§14；ADR 0008；`2026-07-31-phase6-catalog-payment-completion.md`

## 1. 背景

MVP 第七项能力为 **最小管理后台**：发布知识库、查订单、补发/退款、兑换码运营、审计追溯。  
阶段 6 已落地 App 侧目录、mock 支付、兑换与下载链；**运营仍依赖 seed 脚本**，缺少浏览器端后台。

同时需对齐：

- **运营驾驶舱（大屏 A）**：阶段 7 首版纳入轻量 KPI，非通用 BI。
- **制包现状**：内容在外部订阅 AI 生成协议内 JSON → 人工放入 `pack-builder` source → **`pnpm --filter @remember/pack-builder build:pack`** → 上传发布；**不在 MVP 接 in-admin LLM**。
- **第二期扩展**：可能出现非当前卡片形式的新交互（如情景短句练习）；UI 未定。普通短句可继续用 `vocabulary` cardType。

**修订说明：** 总顺序 §10 原写「不实现仪表盘」；本 spec 将 **轻量运营驾驶舱** 纳入阶段 7 MVP，不引入图表平台、插件或低代码。

## 2. 目标与非目标

### 2.1 目标（阶段 7 MVP）

| # | 目标 |
| --- | --- |
| G1 | 管理员在 **Windows 浏览器** 登录独立后台，完成架构定义的 **五类运营操作** |
| G2 | **轻量驾驶舱 A**：交易、兑换、告警、知识库状态（无学习行为曲线） |
| G3 | **发布已 build 的 signed zip**（dev 可本地/mock 存储；校验与 App 同链） |
| G4 | **兑换码批次**生成与查询（替代仅 CLI seed） |
| G5 | 退款、补发、发布写 **不可变 audit_logs**；App session **不能**访问 admin API |
| G6 | 为 **cardType / protocolVersion 扩展** 留注册位，不在 MVP 实现新 UI 或 LLM 编排 |

### 2.2 非目标（阶段 7）

- in-admin 调用大模型、内容生产任务队列（另开 ADR）
- 通用 BI、自定义报表、插件市场
- 用户自制包、分销结算
- 后台直连 PostgreSQL（必须经 NestJS admin 模块 + Zod）
- 生产 COS / 真实微信退款（可 mock；Pause C/D 后与 §6.8 一并补）

## 3. 技术选型（沿用架构）

| 层 | 选型 |
| --- | --- |
| 前端 | `apps/admin`：React + Vite + **React-admin 开源核心**（MIT） |
| 数据 | 原生 `fetch` **dataProvider** + session **authProvider** |
| 图表 | MUI + **Recharts**（仅驾驶舱少量折线/柱图） |
| API | NestJS 模块化单体新增 **Admin 模块**；路由前缀 `/api/v1/admin/` |
| 鉴权 | `admin_users` + `admin_sessions`（opaque token 哈希）；与 App `sessions` **完全隔离** |
| 密码 | 成熟慢哈希（如 argon2/bcrypt）；**TOTP 字段预留**，MVP 可先密码登录 |
| 开发库 | **Docker PostgreSQL**（`pnpm dev:db`）+ 本机 API；见 `docs/runbooks/local-api-docker-dev.md` |

## 4. 运营驾驶舱 A（大屏）

### 4.1 信息架构

```text
┌──────────────────────────────────────────────────────────────────────┐
│  记得 · 运营驾驶舱          今日 ▼  近7天  近30天                      │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤
│ 支付成功额   │ 支付笔数     │ 退款额       │ 兑换成功     │ 新登录  │
├──────────────┴──────────────┴──────────────┴──────────────┴─────────┤
│  [折线] 近30日 GMV（paid orders）  │  [柱] 知识库销量 Top5              │
├────────────────────────────────────┼──────────────────────────────────┤
│  待处理告警                         │  知识库 / 协议摘要                 │
│  · 已付无 pack_access               │  已上架 n · 草稿 m               │
│  · 待处理退款                       │  protocolVersion 分布（只读）      │
│  · 兑换码将耗尽（可选）             │  最近发布版本列表                  │
└────────────────────────────────────┴──────────────────────────────────┘
```

### 4.2 指标与隐私

| 模块 | 指标 | 数据源 | 阶段 |
| --- | --- | --- | --- |
| 交易 | GMV、订单数、客单价、退款额 | `orders` / `refunds` / `payment_events` | 7 |
| 权益 | 新增 pack_access、补发次数 | `pack_access` + `audit_logs` | 7 |
| 兑换 | 兑换次数、码耗尽 | `redemption_events` | 7 |
| 用户 | 新注册、活跃登录（**计数**，无手机号明文） | `users` / `sessions` | 7 |
| 知识库 | 上架数、各包 paid 订单数、最新版本 | `packs` / `pack_versions` / `orders` | 7 |
| 告警 | 已付无权益、退款 pending、下载失败激增（阈值） | 聚合查询 | 7 |
| 学习行为 | DAU、留存、人均学习量 | 需匿名日聚合表 | **7.5+ defer** |

**禁止：** 展示学习正文、搜索词、具体掌握情况；驾驶舱 API 不得返回监护人手机号明文。

### 4.3 Admin Dashboard API（只读）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/admin/dashboard/summary` | KPI 卡片；query: `range=1d\|7d\|30d` |
| GET | `/api/v1/admin/dashboard/revenue-series` | 按日 GMV 序列 |
| GET | `/api/v1/admin/dashboard/top-packs` | 销量 Top N |
| GET | `/api/v1/admin/dashboard/alerts` | 待处理告警列表 |

实现：PostgreSQL 聚合；可加 5 分钟内存缓存；**不**引入 ClickHouse/Redis（MVP）。

## 5. 五类运营操作 + 兑换码

| 操作 | 管理员做什么 | Admin API / UI |
| --- | --- | --- |
| **1. 知识库与发版** | 编辑目录元数据；上传 **已签名 zip**；发布/下架版本 | `packs` CRUD；`pack_versions` 创建 + publish |
| **2. 订单查询** | 按用户/包/状态/时间筛选；看 payment_events | `orders` 只读列表/详情 |
| **3. 权益查询与补发** | 查 pack_access；核实后补发 | 只读 + `POST .../pack-access/grant`（写 audit） |
| **4. 退款** | 人工发起退款（客服流程） | `POST .../refunds`；调 WechatPayClient（mock/真） |
| **5. 审计** | 查谁何时做了什么 | `audit_logs` 只读列表 |
| **+ 兑换码** | 创建批次、上限、过期；查看 redeemed | `redemption_codes` 批次 API |

所有写操作：**事务 + audit_logs**；与支付回调并发时依赖现有 `pack_access(user,pack)` 唯一约束。

## 6. 知识库发布（MVP 工作流）

### 6.1 当前制包（阶段 7 不变）

```text
外部 AI → cards.json / lexicon.json / meta.json / assets/
       → tools/pack-builder/source/<name>/
       → pnpm --filter @remember/pack-builder build:pack
       → *.zip
       → 后台上传 → 服务端 verify → 入库 pack_versions → 发布
```

**「build」** 指仓库已有 **pack-builder CLI**，不是新写脚本。

### 6.2 服务端上传校验（与 App 同标准）

1. 接收 multipart zip（大小上限 200MB）
2. 临时目录解压
3. 复用/调用 pack-builder **verify** 逻辑（manifest、protocolVersion、hash、签名、sqlite、Zod content）
4. 失败 → 4xx + 结构化错误；**不**写入 COS/DB
5. 成功 → dev：本地 mock 存储或固定目录；生产（阶段 8）：COS 私有 key
6. 写 `pack_versions`（不可变）；更新 `packs.currentVersionId` 即发布

### 6.3 intro / sample 媒体

- 目录字段：`samplePreviews`、`introMedia`（JSON，ADR 0010）
- MVP：表单编辑 URL 或上传至 **公开只读前缀**（dev 可先填 URL；COS 阶段 8）
- **不**把 intro 视频塞进 pack.zip

## 7. 内容扩展（第二期对齐，阶段 7 只预留）

### 7.1 三层扩展模型

```text
L1 目录层（packs 表）
  contentTags、可选 learningProfile（仅运营标签，不驱动可执行逻辑）
        ↓
L2 协议层（contracts + pack-builder）
  protocolVersion++；cardType 新增；每种 cardType 独立 Zod
        ↓
L3 App 层（mobile）
  CardRendererRegistry；未知 cardType → 明确错误
```

### 7.2 第二期产品倾向（2026-07-31 对齐）

| 内容 | 倾向 |
| --- | --- |
| 普通短句 | 继续 `cardType: vocabulary`，现有 A/B 卡 UI |
| 情景短句练习 | **新交互未定**；预留新 cardType + 渲染器；**协议字段定稿后再 ADR** |
| SM-2 三按钮 | 默认共用；若新产品排除复习，另 ADR |

### 7.3 阶段 7 禁止锁死

- App 不得写死「仅 vocabulary」且无法注册新渲染器
- 后台展示 `protocolVersion`、manifest 内 cardType 摘要（只读）
- **不得**在 UI 未定时发明 `scenario_*` 具体 JSON 字段

## 8. AI 内容生产（后期 ADR，非阶段 7）

```text
（后期）导入批次资料 → content_jobs → 调 LLM → 人工审核 → source JSON
                                                      ↓
                                            同一 pack-builder build
```

MVP 不建 `content_jobs` 表；运营继续使用 **外部 AI + 本地 build**。

## 9. 安全与鉴权

- Admin 路由全局 `AdminAuthGuard`；权限枚举 MVP 可仅 `super_admin` 一种，表结构预留 role
- App `AuthGuard` token **拒绝** admin 路由
- 审计日志 append-only；无 DELETE
- 上传 zip 防路径穿越；验签私钥 **不进** admin 前端
- 独立上下文安全审查：admin 鉴权、补发、退款、发布

## 10. 开发环境

| 项 | 配置 |
| --- | --- |
| PostgreSQL | `pnpm dev:db` → Docker `remember_dev` @ `127.0.0.1:5432` |
| API | `pnpm --filter @remember/api dev` → `0.0.0.0:3000` |
| Admin | `pnpm --filter @remember/admin dev` → Vite 默认端口 |
| Admin 调 API | `VITE_API_BASE_URL=http://127.0.0.1:3000` |
| 种子 | `pnpm --filter @remember/api seed:dev-bootstrap` |
| 外网/mock | 短信/微信/下载同阶段 6 mock |

## 11. 验收要点（阶段 7 退出门禁）

- [ ] 管理员完成五类操作 + 兑换码批次 + 驾驶舱 A 可见 KPI
- [ ] 上传非法 zip 被拒绝；合法 zip 发布后可被 App mock 下载安装
- [ ] 补发/退款/发布均有 audit_logs
- [ ] App session 访问 `/api/v1/admin/*` → 401/403
- [ ] `pnpm check` + admin 相关集成测试通过

## 12. 相关文档

- Kickoff：`docs/superpowers/plans/2026-07-31-phase7-minimum-admin-kickoff.md`
- 阶段 6 收口：`docs/superpowers/plans/2026-07-31-phase6-catalog-payment-completion.md`
- 本地环境：`docs/runbooks/local-api-docker-dev.md`
- Pack 协议：ADR 0008
