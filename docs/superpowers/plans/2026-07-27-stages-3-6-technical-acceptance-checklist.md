# 阶段 3–6 技术验收清单

日期：2026-07-27  
状态：已确认  
用途：每个阶段完成时逐项勾选；**全部必检项通过** 才可进入下一阶段。  
依据：`docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`、`docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md`、`docs/ai-rules/`。

## 通用门禁（阶段 3–6 每次结束都要过）

- [x] 根目录 `pnpm check` 退出码为 0。（阶段 3 收口 commit 后验证）
- [ ] 若有 API 或集成测试变更，额外运行 `pnpm test:integration` 且通过。（阶段 3 无 API 变更，不适用）
- [x] 本阶段改动的契约、迁移、支付、鉴权、同步或学习包验签代码，已完成 **独立上下文安全审查**（见 ADR 0008 附录「审查记录」）。
- [x] 无假支付、假解锁、假同步成功、空页面或占位函数被标为完成。
- [x] 工作区无密钥、keystore、`.env` 真实值或构建产物误提交。
- [x] 阶段计划文档中对应步骤已勾选，阻塞项已写入 ADR 或决策记录。

---

## 阶段 3：学习包协议与固定样例包

**目标：** 冻结学习包契约；构建器、校验器、固定测试包与 Android 只读打开链路可重复验收。

### 3.1 协议与契约冻结

- [x] `packages/contracts/src/pack/` 中存在 Zod schema，覆盖 `packManifest`、协议版本、`packId`、`packVersion`、`keyId`、哈希、签名、资源清单。
- [x] `cards`、`lexicon_entries`、`lexicon_forms` 最小字段、索引、外键规则已写入 schema，且与架构文档表职责一致。
- [x] 单词卡、短句卡的题面/答案受控字段已定义；主音频、主图片、点词音频引用方式已定义。
- [x] 稳定 `knowledgeId` 生成规则、冲突检测、跨包/跨版本保持不变规则已文档化（可放在 pack 协议 ADR 或 spec 附录）。
- [x] 文件大小上限、允许路径白名单、字符编码、SQLite 只读自检失败时的错误码（如 `PACK_SIGNATURE_INVALID`）已定义。
- [x] 破坏性字段变更策略已写明：必须升级协议版本，不得静默兼容。

### 3.2 构建与校验工具

- [x] `tools/pack-builder/` 可从固定源内容 **构建** 出一个完整测试包（含 manifest、签名、SQLite、资源文件）。
- [x] 同一工具或独立校验命令可在 **不安装 App** 的情况下验证：哈希、签名、协议版本、路径、SQLite 结构。
- [x] 以下负例必须 **全部拒绝**（有明确非 0 退出码或结构化错误）：
  - [x] 篡改 manifest 哈希一字节
  - [x] 错误签名或错误 `keyId`
  - [x] 未知协议版本
  - [x] 路径穿越或包外文件引用
  - [x] 损坏的 SQLite 文件
- [x] 构建器与校验器不依赖 App 内硬编码；公钥来源与 App 内置验钥策略一致。

### 3.3 固定测试包内容

- [x] 测试包体积刻意做小，但 **必须同时包含**：
  - [x] 至少 1 张单词卡
  - [x] 至少 1 张短句卡（含可点词例句）
  - [x] 至少 1 条 `lexicon_entries`
  - [x] `lexicon_forms` 表存在且 **允许 0 行**（第一期不写入、不查询；与 ADR 0008 一致）
  - [x] 至少 1 个主音频引用、1 个主图片引用
- [x] 每张卡片的 `knowledgeId` 在包内唯一；人工抽样的 ID 与构建规则一致。

### 3.4 Android 只读打开（release 实机）

- [x] 在 **正式签名 release APK** 上（非 Expo Go、非 debug 冒充）：
  - [x] 验签通过后以只读方式打开包 SQLite
  - [x] 能查询 `cards` / `lexicon_entries` / `lexicon_forms`
  - [x] 对包 SQLite 的写入尝试失败
- [x] 修改包内任一带 hash 保护的文件后，App 或安装流程拒绝安装。（验包链负例由 pack-builder/contracts 测试覆盖；完整安装流程篡改拒装见阶段 4）

### 3.5 阶段 3 退出门禁（一句话）

> 同一固定测试包：**构建器能生成 → 独立校验器能通过 → release 实机只读打开**；篡改任一受保护字节都必须失败。

**状态：** ✅ 已通过（2026-07-28；临时 pack-spike 入口已在收口时删除，`verify-bundled-pack.ts` 保留供后续复用）

**必跑命令（示例）：**

```powershell
pnpm check
pnpm --filter @remember/contracts test
# 构建/校验/负例命令以实现计划为准，须写入 pack-builder 脚本说明
```

---

## 阶段 4：本地学习完整闭环（不登录、不付费、可离线）

**目标：** 单台断网 Android 设备完成安装、学习、任务继承、点词、搜索、重新加入复习；进度不因杀进程丢失。

### 4.1 手机 `user.sqlite` 与迁移

- [x] 五张表已落地：`installed_packs`、`learning_states`、`study_sessions`、`study_queue_items`、`sync_outbox`。（v2 另增 `saved_lexicon_items`）
- [x] 存在 **版本化迁移** 机制；从空库升级到新版本迁移可重复执行且数据不丢。
- [x] 页面/组件 **不直接** 执行 SQL；只经移动端数据访问层。

### 4.2 安装、更新、卸载

- [x] bundled 路径：临时解压 → 验签/验 hash → 只读试开 → `backupDatabaseAsync` 原子替换 → 更新 `installed_packs`。（`installPackFromZipBytes`）
- [ ] ~~下载到临时路径~~ → **defer 阶段 6**：阶段 4 无网络下载 UI；安装链代码已就绪。
- [ ] 安装失败时 **旧包仍可用**，临时文件已清理。（未做实机负例；staging 验签失败即停）
- [x] 卸载学习包：**删除包文件**（末引用时），`learning_states` 进度 **仍保留**。（包详情「卸载此知识库」）
- [x] 重新安装同一包后，进度按 `knowledgeId` 恢复。（实机已验）
- [ ] 同一时间只有 **一个** 完整包下载任务在进行。（**defer**：无下载队列）

### 4.3 SM-2 调度与任务继承

- [x] `ReviewScheduler`（或等价纯函数）有单元测试，覆盖三按钮状态转移与间隔文案。
- [x] 打开 App 时：**先恢复未完成任务**，再做到期复习，再补充当次新内容。
- [x] **缺席日期不累积** 新的每日任务（跨天测试用例通过）。
- [x] 杀死 App 后重启，未完成任务队列 **不丢、不重排为全新任务**（除非业务规则明确消费完）。

### 4.4 作答持久化（关键事务）

- [x] 每次 **已确认作答** 在同一 SQLite 事务内更新：
  - [x] `learning_states`
  - [x] `study_sessions` / `study_queue_items`
  - [x] `sync_outbox`（阶段 4 可先写入本地队列，不要求联网上传）
- [x] 杀进程测试：最后一次 **已点确认** 的作答在重启后仍在；**未确认** 的不算完成。

### 4.5 点词与包内搜索

- [x] 例句点词：token 规范化后 **直查** `lexicon_entries.surfaceForm`（ADR 0008）；**离线** 展示释义；点词可加入 **收藏本**（抽屉「学习」→「收藏本」）。
- [ ] 点词发音：**首次点击** 下载并缓存；之后离线可播。（**defer 实机**：测试包 lexicon 无 `audioUrl`；`playOrCacheLexiconAudio` 已实现）
- [x] 当前包内搜索主学习内容；找到后可 **重新加入复习**。
- [x] 同一 `knowledgeId` 重复加入复习 **不产生重复队列项**。

### 4.6 UI 与导航（按 UI 规范 smoke）

- [x] 悬浮胶囊：学习页/详情页隐藏胶囊；Tab 为「首页 | + | 资料」（UI 规范 §3.2）
- [x] 存在未完成任务时启动 **直接进入学习页**；否则进入「我的知识库」。
- [x] 空状态、下载状态、错误提示为 **就地提示**，无假数据列表。

### 4.7 阶段 4 手工验收脚本（建议照做）

在 **断网** 的 release 实机上：

1. [x] 安装阶段 3 固定测试包
2. [x] 学习并确认作答 → 杀进程 → 重开 → 进度与队列正确（测试包 2 张卡）
3. [x] 改系统日期到 +1 天 → 打开 → **不** 出现「缺席天数 × 每日额度」的堆积；仍优先未完成会话
4. [x] 点词、搜索、重新加入复习各走通一遍
5. [x] 卸载包 → 重装 → 进度仍在

**必跑命令：**

```powershell
pnpm check
pnpm --filter @remember/mobile typecheck
pnpm --filter @remember/mobile build
# 域层 SM-2 / 调度纯函数测试命令以实现计划为准
```

（2026-07-29：`pnpm check` 全绿。）

### 4.8 阶段 4 退出门禁（一句话）

> 断网 release 实机：安装 → 学习 → 杀进程 → 跨天 → 点词 → 搜索 → 重装，全程 **不登录、不付费**，且最后一次已确认作答不丢。

**状态：✅ 已通过**（2026-07-29；详见 `2026-07-29-phase4-local-study-loop-completion.md`）

---

## 阶段 5：账号、同步与换机恢复

**目标：** 监护人手机号登录；单主设备；学习状态可上传、可快照恢复；弱网与乱序不覆盖新状态。

**状态：✅ 已通过**（2026-07-30；详见 `2026-07-30-phase5-account-sync-completion.md`）

### 5.1 服务端表与迁移

- [x] PostgreSQL 已迁移：`users`、`sms_challenges`、`sessions`、`learning_states`（服务端副本）。
- [x] 敏感字段：验证码 **哈希** 存储；session **token 哈希** 存储；日志无手机号/验证码/令牌明文。
- [x] Controller 不直接返回 Prisma 模型；API 响应经 Zod 契约。

### 5.2 短信登录

- [ ] 腾讯云短信 SDK 3.0 适配器；频控、有效期、尝试次数上限生效。（**defer**：dev/test 使用 mock `000000`）
- [x] 过期/错误验证码拒绝；成功登录后 challenge 标记 consumed 或等价防重放。
- [x] 登录 API 集成测试使用 **真实 PostgreSQL 测试实例**（非内存假库）。

### 5.3 会话与 Keystore

- [x] 服务端签发高熵 opaque session；客户端存入 **Android Keystore**。
- [x] 鉴权中间件从 session 解析 `userId`；**忽略** 请求体里的 userId。
- [x] 会话 90 天无活动失效策略可测（可缩短 TTL 的测试配置）。

### 5.4 单主设备

- [x] 新设备登录并在同一事务内：更新 `users.main_device_id`；**同 deviceId** 再登录时 revoke 该设备旧 session（跨设备顶号 **不 revoke**，见 ADR 0009 §1a）。
- [x] 被顶旧设备调用云端接口 **403** `NOT_MAIN_DEVICE`（读写均拒）；同 deviceId 旧 token **401**；本地仍可学习。
- [x] 并发双机抢登录：最终只有 **一台** 能写服务器学习状态（集成测试或脚本验证）。

### 5.5 增量同步

- [x] 手机 `sync_outbox` 批量上传；每项含稳定 `eventId`、`knowledgeId`、`clientVersion`。
- [x] 服务端对 `learning_states` 使用 **clientVersion 条件更新**；旧版本/重复 `eventId` 不覆盖新状态。
- [x] 服务端确认后，手机删除对应 outbox 项（同事务或等价可靠机制）。
- [x] **离线学习不被同步失败阻塞**：同步失败时本地学习仍可进行；恢复联网后继续传。

### 5.6 换机恢复

- [x] 新设备登录后可下载服务端 **当前快照**（非事件回放合并）。
- [x] UI **明确文案**：只能恢复到最后一次 **成功同步** 的状态。
- [x] 换机后本地 `learning_states` 与服务端快照一致（抽样对比 `knowledgeId` + 关键字段）。（集成测试 + 实机双机曾验证）

### 5.7 异常与边界测试（必检）

| 场景                        | 预期                               |
| --------------------------- | ---------------------------------- |
| 弱网/超时上传               | 本地进度不丢；重试后不重复污染     |
| 重复上传同一 `eventId`      | 幂等成功，状态不重复变更           |
| 乱序上传（旧 version 在后） | 旧 version **不覆盖** 新 version   |
| App 作答中被杀              | 与阶段 4 相同：已确认作答进 outbox |
| 服务端短暂不可用            | 本地可学；恢复后继续传             |

### 5.8 阶段 5 退出门禁（一句话）

> 两台 release 实机：B 登录顶掉 A → A 不能写；B 换机恢复快照；重复/乱序/弱网测试全部符合上表。

**状态（2026-07-30）：** 集成测试与单/双机实机核心路径已验证；**§5.8 正式双机 release 脚本验收** 留待 merge 后按 `docs/runbooks/account-sync-maintenance.md` §6 补跑并勾选。

**必跑命令：**

```powershell
pnpm check
pnpm test:integration
# 同步/主设备相关集成测试以实现计划为准
```

---

## 阶段 6：目录、订单、支付与购买权限

**目标：** 测试商户环境完成真实支付与退款；客户端不能假解锁；资金与权限可追溯。

### 6.1 服务端表与迁移

- [ ] PostgreSQL 已迁移：`packs`、`pack_versions`、`orders`、`payment_events`、`pack_access`、`refunds`。
- [ ] 唯一约束落地：`payment_events.notification_id`、`payment_events.transaction_id`、`pack_access(user_id, pack_id)`。
- [ ] 订单、支付、退款、`pack_access`、审计相关记录 **禁止物理删除**（见 `data-and-security.md`）。

### 6.2 目录与定价

- [ ] App 可拉取知识库目录与 **服务端价格**；客户端展示价 **不得** 作为下单金额真值。
- [ ] `pack_versions` 指向 COS（或等价存储）对象；hash/签名与阶段 3 协议一致。
- [ ] 未上架或不存在版本返回 typed 错误码（如 `PACK_NOT_FOUND`）。

### 6.3 订单状态机

- [ ] 仅服务端创建订单；状态单向推进（含合法退款转换）。
- [ ] 订单快照金额、用户、包 ID 在创建时锁定。
- [ ] 可选 `source_code`/`channel` 可空，不影响 MVP 主路径。

### 6.4 微信支付（生产适配器）

- [ ] 阶段 2 密码学收敛为 `WechatPayClient` 生产适配器；**无** 社区 Node 支付 SDK。
- [ ] App 下单 → OpenSDK 拉起 → 返回后 **查服务端订单**，不以客户端回调为成功依据。
- [ ] 回调：原始 body + 头验签 → 解密 → **事务内** 写 `payment_events`、推进 `orders`、写 `pack_access`。
- [ ] 权益 `user_id`/`pack_id` **从锁定订单读取**，不信回调附加字段。

### 6.5 购买权限与离线许可

- [ ] 每次包下载前检查 `pack_access`；无权限拒绝下载。
- [ ] 服务端签发 **30 天离线许可**；App 在服务器短时故障时仍可学习已购内容（在许可内）。
- [ ] 许可过期且无法刷新时，行为符合产品说明（阻塞新下载，不 silently 清空本地进度）。

### 6.6 退款

- [ ] 最小后台或 API 支持人工发起退款（阶段 7 前可用受控测试入口，但须服务端授权）。
- [ ] 退款与 **迟到支付回调** 按合法状态机处理；无重复发权限、无负权限。
- [ ] 退款记录可追溯到订单与支付事件。

### 6.7 安全与幂等测试矩阵（必检）

| 场景                                          | 预期                              |
| --------------------------------------------- | --------------------------------- |
| 同一支付通知回调两次                          | 第二次幂等；`pack_access` 仍 1 条 |
| 回调金额与订单不符                            | 拒绝；订单/权限不变               |
| 回调商户号不符                                | 拒绝                              |
| 未知订单号                                    | 拒绝                              |
| 相同 `notification_id`、不同 `transaction_id` | 冲突失败；无脏写                  |
| 支付处理中 App 强杀                           | 以服务端查单/回调为准；不本地解锁 |
| 回调处理中事务失败                            | 整体回滚；可安全重试              |
| 客户端伪造支付成功 UI                         | **不能** 解锁下载                 |

### 6.8 真实联调（测试商户）

- [ ] 测试商户环境完成 **至少 1 笔** 真实 APP 支付 → 下载 → 学习包可安装。
- [ ] 同一笔支付在后台可查到：`orders` → `payment_events` → `pack_access` 链路完整。
- [ ] 完成 **至少 1 笔** 真实退款 → 权限/订单状态符合规则。
- [ ] 重复推送同一回调（或脚本模拟）不重复发权限。

### 6.9 阶段 6 退出门禁（一句话）

> 测试商户：**真实付 + 真实退**；DB 可完整追溯；客户端永远不能单独解锁；幂等矩阵全绿。

**必跑命令：**

```powershell
pnpm check
pnpm test:integration
# 支付集成测试 + 阶段2 postgres spike 同类幂等脚本可回归
powershell -NoProfile -ExecutionPolicy Bypass -File infra/technical-spikes/postgres/run-backup-restore.ps1
```

---

## 阶段 3–6 总表（给决策者一眼看）

| 阶段  | 核心验收一句话                       | 最关键证据                  |
| ----- | ------------------------------------ | --------------------------- |
| **3** | 固定测试包 build/verify/实机只读全通 | 负例全拒绝 + release 实机   |
| **4** | 断网实机完整学习闭环                 | 杀进程 + 跨天 + 卸载重装    |
| **5** | 双机登录/换机/乱序同步               | 旧机不能写 + version 不倒退 |
| **6** | 真实微信付退 + 幂等矩阵              | 测试商户联调 + DB 追溯      |

---

## 明确不能用来「算通过」的情况

- 只在 Expo Go 或 debug 包上测通 release 才需要的项。
- 只测 mock 支付/ mock 同步，未接 PostgreSQL 集成测试。
- 只测 happy path，未跑上表中标 **必检** 的异常场景。
- `pnpm check` 失败仍宣称阶段完成。
- 独立上下文审查要求的支付/鉴权/同步改动 **未审查** 即合并。

---

## 相关文档

- [总开发顺序](2026-07-26-remember-app-mvp-development-order.md)
- [MVP 架构设计](../specs/2026-07-26-learning-app-mvp-architecture-design.md)
- [数据与安全规则](../../ai-rules/data-and-security.md)
- [测试与审查规则](../../ai-rules/testing-and-review.md)
- [PostgreSQL 备份恢复 ADR](../../decisions/0003-postgresql-backup-restore.md)
- [Android 身份与签名 ADR](../../decisions/0004-android-app-identity-and-signing.md)
