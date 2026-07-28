# 记得 MVP Master Development Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:writing-plans`为当前阶段生成任务级计划，再使用`superpowers:subagent-driven-development`（推荐）或`superpowers:executing-plans`逐项实施。本文只决定跨阶段顺序，不替代每个阶段的文件级实施计划。

**Goal:** 按依赖关系和技术风险构建一个Android首发、本地优先、可以真实微信付费的“记得”MVP。

**Architecture:** pnpm Monorepo包含Expo移动端、NestJS模块化单体API、React-admin后台、共享Zod契约和纯领域逻辑。学习体验以手机SQLite为主，订单和购买权限以PostgreSQL为权威；第一阶段通过腾讯云轻量服务器、Docker Compose、Caddy和COS部署。

**Tech Stack:** pnpm、TypeScript、React Native、Expo prebuild、expo-sqlite、NestJS、Prisma、PostgreSQL、Zod、React、Vite、React-admin、Docker Compose、Caddy、腾讯云短信/COS、微信OpenSDK和微信支付APIv3。

## Global Constraints

- App展示名称固定为“记得”，项目根目录和Git仓库名为`remember-app`。
- Android 8及以上，手机竖屏首发；不以Expo Go作为正式运行环境。
- 统一使用pnpm和ESM；只保留`pnpm-lock.yaml`，网络请求使用原生`fetch`。
- `packages/contracts`中的Zod schema是API和学习包协议唯一契约。
- 页面、组件和Controller不得直接访问SQLite、Prisma或文件系统。
- 订单、支付、退款和`pack_access`以服务器为权威并且必须可追溯恢复。
- 学习状态本地优先；没有学习的日期不产生积压的新学习任务。
- 用满足当前需求、安全和测试的最少代码实现，不预建分销、插件、微服务、Redis、消息队列或Kubernetes。
- 支付、鉴权、购买权限、同步、迁移和学习包验签必须在合并前进行独立上下文审查。
- 每个阶段开始前必须写独立任务级实施计划；一次只实施一个边界明确、可以独立验收的行为。
- 所有正式实现遵循`docs/ai-rules/`和`$build-learning-app` Skill。

---

## 1. 为什么按这个顺序

顺序遵循四条规则：

1. 先验证可能推翻技术路线的高风险点，再批量写业务代码。
2. 先跑通产品核心的本地学习闭环，再接账号和付费。
3. 先建立服务端资金与权限真值，再建设后台操作界面。
4. 每个阶段都必须留下一个可运行结果，不能长期积累无法整体验证的半成品。

五项高风险验证中，Expo多SQLite和知识库验签会影响移动端基础；微信OpenSDK和APIv3密码学会影响真实付费；备份恢复会影响订单与权限可追溯。因此它们位于正式业务实现之前。

## 2. 阶段总览

| 阶段 | 主要产出                   | 前置依赖 | 通过后得到什么                           |
| ---- | -------------------------- | -------- | ---------------------------------------- |
| 0    | 正式文档基线               | 无       | 所有AI使用同一架构、UI和编码规则         |
| 1    | Monorepo与质量门禁         | 阶段0    | 三个App和共享包可以统一检查与构建        |
| 2    | 五项高风险技术验证         | 阶段1    | 核心技术路线不再依赖猜测                 |
| 3    | 学习包协议与固定样例包     | 阶段2    | 移动端、构建工具和后台共享唯一内容契约   |
| 4    | 本地学习完整闭环           | 阶段3    | 不登录、不联网也能安装、学习、恢复和搜索 |
| 5    | 账号、同步与换机恢复       | 阶段4    | 学习状态形成可恢复云端副本               |
| 6    | 目录、订单、支付和购买权限 | 阶段5    | 邀请用户可以真实购买并安全解锁知识库     |
| 7    | 最小管理后台               | 阶段6    | 可以发布知识库、查询订单、退款和修复权限 |
| 8    | 更新、部署与发布验收       | 阶段7    | 获得可回退、可恢复的候选发布版本         |

## 3. 阶段0：正式文档基线

**产出目录：**

- `AGENTS.md`
- `skills/build-learning-app/`
- `docs/ai-rules/`
- `docs/research/2026-07-26-mature-architecture-audit.md`
- `docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`
- `docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md`
- 本开发顺序

**执行清单：**

- [ ] 将所有已确认文档复制到正式项目根目录。
- [ ] 确认架构文档包含成熟组件最终决定，而不是只链接研究报告。
- [ ] 确认UI规范状态为“已确认”。
- [ ] 确认`AGENTS.md`能指向架构、AI规则和Skill。
- [ ] 初始化Git前检查不存在密钥、临时截图、生成物或个人路径。

**退出门禁：** 新任务只读取正式根目录，就能回答“做什么、不做什么、如何命名、数据放在哪里、如何验收”。

## 4. 阶段1：Monorepo与质量门禁

**计划创建：** `docs/superpowers/plans/<date>-project-foundation.md`

**预期文件边界：**

```text
apps/mobile/
apps/api/
packages/contracts/
packages/config/
pnpm-workspace.yaml
package.json
tsconfig.json
```

`apps/admin`、`packages/domain`、`tools/pack-builder`和`infra`在首次拥有真实职责的阶段再创建，不建立空包或占位页面。

**执行顺序：**

- [ ] 初始化pnpm workspace和根脚本，不安装任何尚未使用的生产依赖。
- [ ] 从Expo官方模板建立`apps/mobile`，确认Android prebuild和release构建入口。
- [ ] 从NestJS官方模板建立`apps/api`，配置严格TypeScript和统一环境校验入口。
- [ ] 建立只包含真实健康检查契约的`contracts`包和共享配置包；`domain`等到SM-2阶段再创建。
- [ ] 建立格式、Lint、类型、单元测试、契约测试、依赖边界和密钥扫描命令。
- [ ] 配置CI只运行本阶段真实存在的检查，禁止假成功脚本。

**退出门禁：** 根目录`pnpm check`通过；移动端和API能独立启动或构建；依赖边界检查能拦截App互相导入及共享包反向依赖。

## 5. 阶段2：五项高风险技术验证

**计划创建：** `docs/superpowers/plans/<date>-technical-spikes.md`

这些验证代码可以是小实验，但结果、版本和结论必须写入ADR；验证失败时先调整架构，不把临时代码扩散到产品代码。

### 5.1 Expo多SQLite

- [x] 同时打开可写`user.sqlite`和一个只读知识库SQLite。（ADR [0005](../decisions/0005-expo-multi-sqlite.md)，2026-07-28 API 29 真机）
- [x] 验证查询、关闭句柄、临时文件替换和损坏文件回滚。
- [x] 在Android release包而不是只在开发模式验证。

### 5.2 Ed25519验签

- [x] 使用固定公钥和测试向量验证正确签名。（ADR [0006](../decisions/0006-ed25519-android-verification.md)）
- [x] 修改数据库、manifest和资源各一个字节，验证全部拒绝安装。
- [x] 记录`@noble/ed25519`、随机数与SHA-512 polyfill的精确兼容组合。（同步`verify` + `@noble/hashes` SHA-512；无需随机数 polyfill）

### 5.3 微信OpenSDK

- [x] 通过Expo config plugin或最小native bridge注册OpenSDK。（`apps/mobile/modules/wechat-open-sdk`，ADR [0007](../decisions/0007-wechat-opensdk-limited-validation.md)）
- [ ] 验证Android包名、签名、`WXPayEntryActivity`和返回App链路。（Pause C/D 后另计划）
- [x] 没有商户权限时只验证native调用边界，不伪造支付成功。（`LIMITED_PASS`）

### 5.4 微信APIv3密码学

- [x] 用官方样例验证请求签名、响应验签、回调验签和AES-GCM解密。（ADR [0002](../decisions/0002-wechat-pay-apiv3-crypto.md)）
- [ ] 设计`WechatPayClient`最小公开接口，不在实验中建立完整支付模块。
- [ ] 同一个官方通知重复处理两次，证明业务入口可以使用唯一ID实现幂等。

### 5.5 PostgreSQL备份恢复

- [x] 用Compose启动PostgreSQL测试实例并写入订单、支付事件和购买权限样例。（ADR [0003](../decisions/0003-postgresql-backup-restore.md)）
- [x] 使用`pg_dump -Fc`导出，在全新数据库执行恢复。
- [x] 验证三类记录和唯一约束完整恢复，并记录恢复命令与耗时。

**退出门禁：** 五项都有可重复命令、实际输出和明确通过/失败结论；失败项对应的架构调整已经获得确认。

## 6. 阶段3：学习包协议与固定样例包

**计划：** [`2026-07-28-phase3-pack-protocol-kickoff.md`](2026-07-28-phase3-pack-protocol-kickoff.md)、[`2026-07-28-phase3-pack-protocol-completion.md`](2026-07-28-phase3-pack-protocol-completion.md)

**必须确定（已冻结，见 ADR [0008](../decisions/0008-pack-protocol.md)）：**

- [x] `packManifest`版本、`packId`、`packVersion`、协议版本、hash、签名、资源清单和`keyId`。
- [x] `cards`、`lexicon_entries`、`lexicon_forms`三张表的最小字段、索引和外键。
- [x] 单词与短句卡片的题面/答案受控字段，主音频、图片及点词音频引用方式。
- [x] 稳定`knowledgeId`生成、冲突检测和跨版本保持规则。
- [x] 文件大小、允许路径、字符编码、SQLite只读自检和失败错误码。
- [x] AI生成内容进入构建器前的结构校验和人工抽样边界（pack-builder 构建链 + Zod）。

**实现产出（已完成）：**

- [x] `packages/contracts/src/pack/`中的Zod schema。
- [x] `tools/pack-builder/`中的最小构建、校验和签名命令。
- [x] 固定测试包（单词 + 短句 + lexicon + 音视频资源）。
- [x] 损坏hash、错误签名、未知协议和路径穿越负例。

**退出门禁：** ✅ 构建 → 独立校验 → release 实机只读打开（pack-spike 验收后临时入口已删除）。

## 7. 阶段4：本地学习完整闭环

**计划拆分：**

1. `<date>-pack-install-and-library.md`
2. `<date>-study-scheduler-and-session.md`
3. `<date>-word-lookup-and-search.md`
4. `<date>-mvp-mobile-ui.md`

**执行顺序：**

- [ ] 建立`user.sqlite`五张表及版本化迁移。
- [ ] 实现下载到临时文件、验证、只读打开、原子安装、更新和卸载保留进度。
- [ ] 实现“我的知识库”名称搜索、知识库市场、详情和下载状态。
- [ ] 先以纯函数完成SM-2三按钮状态转移和动态间隔文案测试。
- [ ] 实现任务生成：恢复未完成任务、到期复习、补充本次新内容；缺席日期不累积新任务。
- [ ] 在同一SQLite事务保存作答结果、任务位置和`sync_outbox`。
- [ ] 实现当前知识库搜索和重新加入复习，重复加入不制造重复任务。
- [ ] 实现例句点词、变形到原形查询、离线释义和首次语音缓存。
- [ ] 按已确认UI规范完成悬浮胶囊、详情页、学习页、更多菜单和全局抽屉。

**退出门禁：** 一台断网Android设备可以安装固定测试包、退出重启、跨天继承原任务、完成三按钮复习、点词、搜索遗忘内容并重新加入复习；杀死App不会丢失最后一次已确认作答。

## 8. 阶段5：账号、同步与换机恢复

**计划拆分：**

1. `<date>-phone-session-and-main-device.md`
2. `<date>-study-state-sync-and-restore.md`

**执行顺序：**

- [ ] 设计并迁移`users`、`sms_challenges`、`sessions`和服务端`learning_states`。
- [ ] 接入腾讯云短信SDK 3.0适配器，完成频控、验证码哈希、有效期和尝试次数。
- [ ] 实现高熵opaque session、数据库token哈希和Android Keystore保存。
- [ ] 实现单主设备事务切换和旧会话撤销。
- [ ] 实现`sync_outbox`批量上传、事件ID幂等、客户端版本条件更新和确认后删除。
- [ ] 实现服务器快照下载以及换机恢复；明确展示只能恢复到最后成功同步状态。
- [ ] 验证弱网、重复、乱序、超时、App被杀和服务器恢复后继续上传。

**退出门禁：** 两台测试设备可以完成登录、主设备切换和云端快照恢复；旧设备不能继续写服务器；重复或乱序同步不能覆盖更新状态；离线学习不被同步失败阻塞。

## 9. 阶段6：目录、订单、支付和购买权限

**计划拆分：**

1. `<date>-catalog-order-and-pack-access.md`
2. `<date>-wechat-pay-and-refund.md`
3. `<date>-offline-pack-access.md`

**执行顺序：**

- [ ] 设计并迁移`packs`、`pack_versions`、`orders`、`payment_events`、`pack_access`和`refunds`。
- [ ] 实现知识库目录、版本和服务端价格查询；客户端价格不作为下单真值。
- [ ] 实现订单状态机和服务端创建订单。
- [ ] 将阶段2验证过的`WechatPayClient`收敛为生产适配器。
- [ ] 实现APP下单、客户端OpenSDK拉起、返回后查单和支付回调。
- [ ] 在事务中完成验签后订单推进、支付事件和购买权限唯一写入。
- [ ] 实现每次知识库下载的服务端`pack_access`检查和30天离线许可。
- [ ] 实现退款状态机；退款与迟到支付回调按合法状态转换处理。
- [ ] 覆盖重复回调、金额不符、商户不符、未知订单、回调重放、超时查单和事务回滚。

**退出门禁：** 测试商户环境完成一次真实支付和一次退款；客户端回调不能单独解锁；同一支付通知重复发送不会重复发权限；订单、支付、退款和权限可以从数据库记录相互追溯。

## 10. 阶段7：最小管理后台

**计划创建：** `docs/superpowers/plans/<date>-minimum-admin.md`

**执行顺序：**

- [ ] 迁移`admin_users`、`admin_sessions`和`audit_logs`，管理员密码使用成熟哈希。
- [ ] 安装React-admin开源核心，写原生`fetch` data provider和session auth provider。
- [ ] 实现知识库及版本发布、订单查询、购买权限查询/补发、退款操作和审计列表。
- [ ] 每个后台API同时校验后台会话和操作权限；前端隐藏按钮不代替服务端授权。
- [ ] 退款、补发和发布写不可变审计日志；不实现仪表盘、图表、插件或通用低代码配置。

**退出门禁：** 管理员能够完成MVP运营所需的五类操作；普通App会话不能访问后台接口；所有资金和权限变更都有操作者、时间、对象和结果记录。

## 11. 阶段8：更新、部署与发布验收

**计划拆分：**

1. `<date>-pack-and-app-update.md`
2. `<date>-production-deployment-and-recovery.md`
3. `<date>-release-candidate-check.md`

**执行顺序：**

- [ ] 完整验证知识库版本检查、下载恢复、原子替换和旧版本回退。
- [ ] 实现普通APK更新提醒和协议不兼容时的强制更新判断。
- [ ] 建立Caddy、API和PostgreSQL生产Compose，所有环境密钥从单一配置入口验证。
- [ ] 配置COS知识库/媒体/APK与备份权限，生产密钥不进入App和仓库。
- [ ] 建立版本化镜像、测试环境自动部署和正式环境人工批准流程。
- [ ] 配置结构化日志、请求追踪ID、服务器/磁盘/数据库/备份基础告警。
- [ ] 从空服务器和COS备份完成订单、支付、退款与购买权限恢复演练。
- [ ] 在Android 8、小屏320dp、弱网、断网和系统字体放大环境执行主流程验收。
- [ ] 使用邀请测试账号完成登录、购买、下载、学习、同步、换机恢复和退款全链路。

**退出门禁：** 同一候选镜像先通过测试环境再由开发者批准进入正式环境；能够回退到上一镜像；能够从异地备份恢复资金和权限记录；没有P0/P1问题及未解释的P2问题。

## 12. 阶段内的固定工作方式

每个阶段都按以下循环执行：

```text
确认阶段范围
→ 写任务级实施计划
→ 冻结本任务共享接口
→ 先写失败测试
→ 最小实现
→ 运行局部检查
→ 独立上下文审查
→ 修复后运行完整检查
→ 设备或测试环境验收
→ 更新文档并由用户决定是否进入下一阶段
```

共享契约、数据库schema、根配置和锁文件必须串行修改。只有文件互不重叠且接口已经冻结的工作才能并行。AI不得用假接口、假支付成功、空页面或占位函数把阶段标记为完成。

## 13. 日程参考与删减顺序

AI写代码速度不是主要瓶颈；真实瓶颈是协议决策、Android原生接入、微信资质、支付联调和恢复验证。理想情况下阶段1至8可以约两周完成，但发布日期以阶段门禁为准，不以日历强行宣告完成。

若需要压缩范围，按以下顺序删减：

1. 学习统计、下载管理的非必要展示。
2. 动效、骨架屏和非关键视觉细节。
3. 后台便利筛选与批量操作。
4. 非核心技术统计和体验优化。

不得删减：本地状态事务、任务继承、购买权限服务端校验、支付验签与幂等、会话安全、知识库验签、订单/权限备份及恢复演练。

## 14. 下一项工作

正式编码前先执行阶段1的项目基础计划；学习包字段仍未确认，因此阶段3开始前必须单独完成“学习包协议”引导式对齐。阶段1和阶段2不得凭空发明卡片答案字段。
