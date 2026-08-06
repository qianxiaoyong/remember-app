# 阶段 5 启动说明（账号、同步与换机恢复）

日期：2026-07-29  
状态：**已确认，可直接规划与实施**（§11：`Q1:B Q2:A Q3:A`）  
基线：`main` @ `b601b51`（阶段 4 已收口）

## 1. 本阶段要做什么（一句话）

在 **不破坏阶段 4 离线学习** 的前提下，让 release 实机完成：**手机号登录 → 主设备切换 → 学习进度上传 → 换机快照恢复**；弱网、重复、乱序上传不得覆盖更新状态。

完整勾选项：`docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §5  
总顺序：`docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md` §8

## 2. 当前进度

```text
阶段 0–5  ✅（账号登录、主设备、进度上传与快照恢复；见 2026-07-30-phase5-account-sync-completion.md）
阶段 6–8  ⏸
```

阶段 4 摘要：`docs/superpowers/plans/2026-07-29-phase4-local-study-loop-completion.md`

### 并行暂停（不阻塞阶段 5 开发与本地联调）

| 项                               | 影响                             | 不挡什么                                      |
| -------------------------------- | -------------------------------- | --------------------------------------------- |
| ICP 备案 / `remember.wehub.top`  | 大陆正式域名 HTTPS、微信官网审核 | 本地 Docker API、内网/IP 联调、仓库内集成测试 |
| 腾讯云短信模板 / 签名审批        | 真机收真实验证码                 | 开发环境 mock 验证码通道、集成测试用固定码    |
| 阶段 6（目录 / 订单 / 微信支付） | 市场真值、购买、权益             | 本阶段登录与进度同步                          |

## 3. 是否需要 2 份子计划？

**需要。** 与 `development-order` §8 一致：

| 顺序 | 文件（实施前创建）                                                   | 核心交付                                                                                   |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1    | `docs/superpowers/plans/2026-07-29-phone-session-and-main-device.md` | Prisma 首迁；`users` / `sms_challenges` / `sessions`；短信登录；Keystore session；单主设备 |
| 2    | `docs/superpowers/plans/<date>-study-state-sync-and-restore.md`      | 服务端 `learning_states`；`packages/contracts` sync 契约；outbox 上传；快照恢复；双机验收  |

**推荐执行顺序：**

1. 读本文 + 架构 §8.4 / §10 + `data-and-security.md`。
2. 用 `writing-plans` 写子计划 1，实施至登录 + 主设备可测。
3. 再写子计划 2，实施同步与换机恢复。
4. 子计划 1 完成前 **不要** 在移动端接真同步上传（避免半套 session 半套 sync）。

## 4. 编码原则（必须遵守）

与阶段 4 kickoff §4 相同，另加：

- **契约先行：** `packages/contracts` 的 Zod schema 是 API 唯一网络契约；Prisma 模型不得直接作为响应。
- **最小 outbox：** 不引入 WatermelonDB / PowerSync 等通用同步框架（见 `docs/research/2026-07-26-mature-architecture-audit.md` §5.2）。
- **同步不阻塞学习：** 作答事务仍只写本地；上传在后台异步，失败保留 outbox 重试。
- **事务边界：** 主设备切换、outbox 确认删除、条件更新 `learning_states` 必须用数据库事务；事务内不等待外部网络。

## 5. 同步范围（建议默认 — 可直接写进子计划）

### 5.1 云同步 ✅

| 数据              | 方向                                                    | 说明                                           |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `learning_states` | 手机 → 服务端（增量 outbox）；服务端 → 手机（换机快照） | 含 SM-2 全字段，见 §6.2                        |
| 账号展示信息      | 服务端 → 手机                                           | 脱敏手机号、可选昵称（无昵称则显示「监护人」） |

### 5.2 不同步 ❌（阶段 5 明确不做）

| 数据                                   | 理由                                                       |
| -------------------------------------- | ---------------------------------------------------------- |
| `study_sessions` / `study_queue_items` | 进行中任务为本地会话态；换机后按本地 SM-2 重新生成队列即可 |
| `saved_lexicon_items`                  | 架构 §5：界面偏好类数据不云同步                            |
| `installed_packs`                      | 包文件仍本地下载/安装；阶段 6 才与服务端权益绑定           |
| 市场目录 / 订单 / 权益                 | 阶段 6                                                     |

### 5.3 阶段 4 技术债（子计划 2 必须修）

当前 outbox `payload` 缺少 SM-2 恢复字段（`easiness`、`intervalDays`、`repetitions`），子计划 2 须：

1. 扩展 `confirm-card-review` 写入完整 `LearningStateRow` 快照（或等价结构）；
2. 在 `packages/contracts` 定义 `SyncOutboxItemPayload` Zod；
3. 补契约测试，防止再次出现「能上传但不能恢复」。

## 6. 服务端与 API（建议默认）

### 6.1 PostgreSQL 表（阶段 5 首迁子集）

与架构 §7 一致，本阶段只迁：

- `users` — 手机号索引、可选 `displayName`、当前 `mainDeviceId`、状态
- `sms_challenges` — 验证码哈希、过期时间、尝试次数、 consumed 标记
- `sessions` — token 哈希、userId、deviceId、最后活动时间、撤销时间
- `learning_states` — userId + knowledgeId 唯一；SM-2 字段 + `clientVersion` + `updatedAt`

**手机号存储（建议默认）：** DB 存 **SHA-256(手机号 + 环境 pepper)** 用于查找；另存 **脱敏展示**（如 `138****5678`）供客户端展示。日志禁止明文手机号/验证码/令牌。

### 6.2 同步契约（建议默认）

**上传：** `POST /api/v1/sync/learning-states/batch`

- 请求：`{ items: [{ eventId, knowledgeId, clientVersion, payload }] }`
- `payload` 字段（Zod 冻结）：`packId`, `easiness`, `intervalDays`, `repetitions`, `dueAt`, `updatedAt`（`rating` 可选，仅审计/debug，不参与恢复）
- 服务端：按 `eventId` 幂等；按 `clientVersion` 条件更新；非主设备 **403**
- 响应：`{ acceptedEventIds: string[], rejected: [{ eventId, reason }] }`

**快照下载：** `GET /api/v1/sync/learning-states/snapshot`

- 响应：当前用户全部 `learning_states` 行（分页可选，MVP 可一次返回；量级小）

**批量上限（建议默认）：** 每批最多 **100** 条；客户端失败指数退避，初始 5s，上限 5min。

### 6.3 短信与安全参数（建议默认）

| 参数                  | 默认值                                                              |
| --------------------- | ------------------------------------------------------------------- |
| 验证码                | 6 位数字                                                            |
| 有效期                | 5 分钟                                                              |
| 同号重发间隔          | 60 秒                                                               |
| 单 challenge 最大尝试 | 5 次                                                                |
| 单号日发送上限        | 10 条（PostgreSQL 频控，不用 Redis）                                |
| Session 令牌          | 32 字节随机 opaque；DB 存 SHA-256                                   |
| Session 失效          | 90 天无活动（测试环境可配置缩短）                                   |
| 开发/测试 mock        | 环境变量开启时，固定码 `000000` 仅 dev/test；**禁止** 进 production |

### 6.4 设备标识（建议默认）

- 客户端首次启动生成 `deviceId`（UUID），存 **SecureStore**（与 session 分开；session 在 Keystore）。
- 登录请求携带 `deviceId`；服务端写入 `sessions.deviceId` 与 `users.mainDeviceId`。

## 7. 移动端：mock / 必须真做

### 7.1 登录与账号 UI

| 元素                                | 阶段 5                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| 登录页（轻量全屏：手机号 + 验证码） | **真做**                                                                                     |
| 抽屉账号区（头像/名称/脱敏号）      | **真做**（登录后）                                                                           |
| 账号信息页（点击抽屉头部）          | **真做**：脱敏号、最后同步时间、登出                                                         |
| 未登录时抽屉头部                    | **真做**：点击进登录页，不阻断其他功能                                                       |
| 登录引导（Q1:B，2026-08 修订）      | **冷启动不弹登录**；安装网络包、兑换码、购买等需账号场景再 Alert 引导登录（`returnTo` 回跳） |
| login-guide 页                      | 保留路由，不再冷启动自动跳转（P1 可改造或移除）                                              |
| 「今天已同步」                      | **建议默认：仅账号信息页展示**；知识库首页仍不展示（延续阶段 4）                             |
| 学习统计 / 订单与权益               | **不做**（UI 规范：阶段 5–6 再补）                                                           |

### 7.2 同步行为（建议默认）

| 时机              | 行为                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| 登录成功          | 若本地有 outbox 或未上传的 `learning_states`，**后台排队上传**（见 §11 题 2） |
| 换机 / 新设备登录 | 下载服务端快照写入本地（见 §11 题 2）                                         |
| 每次确认作答后    | **不等待**；异步触发 sync worker                                              |
| App 回到前台      | 若已登录且有 outbox，尝试上传                                                 |
| 同步失败          | 静默重试；学习页 **不弹** 阻塞对话框                                          |
| 主设备被顶        | 写接口 403 → 账号页 Banner「账号已在其他设备登录，进度仅保存在本机」          |

### 7.3 登出（建议默认）

- 清除 Keystore session；**不删除** 本地 `learning_states` / outbox / 已安装包。
- 登出后：本地学习仍可用；不再上传直至重新登录。

### 7.4 Mock 汇总

| 能力                          | 阶段 5     | 说明                            |
| ----------------------------- | ---------- | ------------------------------- |
| 手机号登录 + session          | ✅ 必须真  | 含集成测试（真 PostgreSQL）     |
| sync_outbox 上传              | ✅ 必须真  | 对 dev/staging API              |
| 换机快照恢复                  | ✅ 必须真  | 双机验收                        |
| 市场目录 / 价格               | ❌ 仍 Mock | 阶段 4 seed                     |
| 微信支付 / 订单 / pack_access | ❌ Mock    | 阶段 6                          |
| 30 天离线 **购买** 许可       | ❌ 阶段 6  | 本阶段只做 session 有效即可上传 |

## 8. 开发与验收环境（建议默认）

### 8.1 本地 API

- `apps/api` + Prisma + PostgreSQL：**Docker Compose** 见 `infra/dev/` 与 **`docs/runbooks/local-api-docker-dev.md`**
- 一键启动库：`pnpm dev:db`
- 移动端 dev 构建：`EXPO_PUBLIC_API_BASE_URL` 指向开发机局域网 IP（实机联调）

### 8.2 集成测试

- 登录 API：**真实 PostgreSQL**（checklist §5.2），非内存假库。
- 同步/主设备：子计划 2 定义具体测试文件；`pnpm test:integration` 纳入 CI。

### 8.3 双机 release 验收

- 需要两台 Android + 可达 API（备案完成前可用 IP + HTTP 或自签 HTTPS，**生产必须备案域名**）。
- 脚本见 checklist §5.7–5.8。

## 9. 技术约束（勿忘）

- 架构 §8.4、§9、§10；`data-and-security.md` 鉴权与删除规则。
- 服务端 `userId` **只** 从 session 解析，不信请求体。
- 单主设备：新登录事务内更新 `mainDeviceId` + 撤销旧 sessions。
- 旧设备写接口：**403**（建议默认，见 §11 题 3）。
- 不引入 Redis、不换绑手机号、不做自助注销（客服受理留阶段 7 后台或运维流程）。
- 阶段 4 已冻结：`verifyPackArchive`、点词直查、收藏本术语。

## 10. 建议 Git 分支

```text
git checkout -b feat/account-sync main
```

按子计划分 commit；子计划 1（登录可测）后再接 sync 大范围改动。

## 11. 已确认选项（2026-07-29）

**`✅ Q1:B  Q2:A  Q3:A`**

| 题  | 你的选择              | 落地含义                                                                           |
| --- | --------------------- | ---------------------------------------------------------------------------------- |
| Q1  | **B**（2026-08 修订） | 冷启动不弹登录；安装网络包/兑换/购买等需账号时再引导；bundled 内置包仍可不登录安装 |
| Q2  | **A**                 | 同一单词/知识点按 **版本号更高** 的进度为准，合并本地与云端，避免误覆盖            |
| Q3  | **A**                 | 被新手机顶掉后，旧手机 **不能再访问云端**；只能本地学，重新登录可抢回主设备        |

---

### Q1. 登录是否强制？（已选 B，2026-08 修订）

| 选项     | 含义                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| A        | 可选登录，无启动引导                                                              |
| **B ✅** | ~~首次安装引导登录，但允许「稍后」跳过~~ → **冷启动不弹登录**；需账号操作时再引导 |
| C        | 必须登录才能用（未选）                                                            |

### Q2. 本地进度 vs 云端快照？（已选 A）

| 选项     | 含义                       |
| -------- | -------------------------- |
| **A ✅** | 按知识点取版本号更高者合并 |
| B        | 换机一律以云端覆盖本地     |
| C        | 一律以本地覆盖云端         |

### Q3. 被顶掉的旧设备？（已选 A）

| 选项     | 含义                       |
| -------- | -------------------------- |
| **A ✅** | 读写均拒绝；旧机仅本地学习 |
| B        | 只读云端                   |
| C        | 24h 宽限期仍可写           |

---

## 12. 新窗口起手 Prompt（子计划 1）

见 `docs/superpowers/plans/2026-07-29-phone-session-and-main-device.md` 文末 **「新窗口起手 Prompt」** 整段复制。

## 13. 完成后需回报

- §11 确认结果与子计划进度
- `packages/contracts` 新增 auth/sync schema 列表
- Prisma 迁移与集成测试输出
- 双机 release 实机 checklist §5.7–5.8 结果
- dev API 启动方式（runbook 链接）
- 与建议默认的偏差说明

## 14. 相关文档

- 架构：`docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`
- UI：`docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md`（§9 抽屉账号区）
- 阶段 4：`docs/superpowers/plans/2026-07-29-phase4-local-study-loop-completion.md`
- 验收：`docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §5
- 安全：`docs/ai-rules/data-and-security.md`
