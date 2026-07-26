# 学习应用 MVP：成熟开源架构与部署方案审计

日期：2026-07-26  
状态：技术选型建议，供正式编码前确认

## 1. 结论先行

本项目不适合直接套用某个“全栈学习应用模板”。现有成熟模板通常会绑定 Next.js、tRPC、JWT、Supabase、GraphQL 或云端同步，这些都会与已经确认的 Expo 本地优先、NestJS REST、Prisma/PostgreSQL、服务端权益权威和不积压学习任务发生冲突。

最稳妥且代码量最小的组合是：

1. 移动端从 Expo 官方模板和官方 monorepo 规则起步，不采用第三方移动端脚手架。
2. API 从 NestJS 官方结构及 Prisma 官方 NestJS 示例起步，只借连接、迁移和测试结构，不照搬其直接返回 Prisma 模型的 CRUD。
3. 后台采用 React-admin 开源核心，自己写一个很薄的 `fetch` data provider 和 session auth provider。
4. 学习数据继续直接使用 `expo-sqlite`；不引入 WatermelonDB、RxDB、PowerSync 等同步框架。
5. SM-2 写成一个小型纯函数并用固定样例测试；不采用低维护度的 SM-2 包。FSRS 仅作为未来经产品决策后再迁移的候选。
6. 数据包签名可采用 `@noble/ed25519`，但须先完成一次 Android/Expo prebuild 小实验，并固化官方测试向量。
7. 微信支付客户端使用微信 OpenSDK；NestJS 后端没有官方 Node.js APIv3 SDK，不采用陈旧社区包，改为只实现项目必需接口的窄适配器，并用微信官方 Postman 脚本和沙箱式测试验证。
8. 中国大陆生产环境采用腾讯云轻量应用服务器 + Docker Compose + Caddy + PostgreSQL + COS；第一阶段不加 Kubernetes、Redis、消息队列和独立微服务。

这不是“重复造轮子”：业务代码只保留项目独有的学习状态、权益账本、数据包安装与微信支付适配；通用界面、数据库驱动、容器、TLS、云存储和短信均复用成熟组件。

## 2. 审计标准

候选方案按以下维度评估：

- 架构匹配：是否兼容现有技术决策，而不是迫使项目改技术栈。
- 维护状况：官方或主要维护者是否仍在更新，文档是否对应现代版本。
- 许可证：MVP 优先 MIT、Apache-2.0、BSD；避开会影响闭源商业分发的强 copyleft。
- 安全边界：是否会接触密码、会话、支付、权益、数据包签名或云密钥。
- 代码收益：引入后实际减少的代码是否大于适配、升级和排错成本。
- 可替换性：必须通过项目自己的接口隔离第三方实现。
- AI 可维护性：目录和调用链要短，不能引入大量“魔法配置”或网状依赖。

判定只有三类：

- **采用**：作为正式底座或依赖使用。
- **借鉴**：只复制结构、测试思路或少量实现，不把项目建立在它之上。
- **排除**：MVP 不使用，并说明重新评估的触发条件。

## 3. 总体采用矩阵

| 区域            | 候选                             | 判定        | 原因                                                                                  |
| --------------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| 移动端          | Expo 官方 `create-expo-app`      | 采用        | 与 Expo prebuild、pnpm、Android 首发完全一致                                          |
| Monorepo        | Expo 官方 monorepo 指南          | 采用        | 官方支持 pnpm workspace，避免过时 Metro 配置                                          |
| 全栈模板        | `create-t3-turbo`                | 借鉴        | monorepo 包边界成熟，但默认 Next.js、tRPC、Drizzle/Supabase、Better Auth 与本项目冲突 |
| API             | NestJS + Prisma 官方指南/示例    | 采用并裁剪  | 连接和迁移结构可靠；API 契约仍须使用项目 Zod schema                                   |
| NestJS 社区样板 | Brocoders、nestjs-prisma-starter | 排除        | JWT、GraphQL、TypeORM、Redis及企业功能过多，删改成本大于收益                          |
| 后台            | React-admin 开源核心             | 采用        | 订单、权益、知识库管理天然是列表、筛选、表单和详情场景                                |
| 后台替代        | Refine                           | 排除（MVP） | 灵活但选择面和 provider 组合更多，单人+AI项目反而增加决策与样板代码                   |
| 本地数据库      | `expo-sqlite`                    | 采用        | 官方、持久化、事务、prepared statement、FTS 能覆盖需求                                |
| 离线同步        | WatermelonDB                     | 排除        | 擅长大型响应式数据库和通用同步；本项目只有少量用户状态，模型/迁移/原生层成本不值      |
| 离线同步        | PowerSync / RxDB                 | 排除        | 引入同步服务、额外数据库适配器或商业能力，破坏简单 outbox 设计                        |
| 复习算法        | 项目内 SM-2 纯函数               | 采用        | 逻辑小、三按钮语义已确定、最容易测试和迁移                                            |
| 复习算法        | `ts-fsrs`                        | 未来候选    | 项目成熟，但算法和四档评分会改变既有产品语义，不是 SM-2 的无感替换                    |
| 数据包验签      | `@noble/ed25519`                 | 条件采用    | 体积小、零运行时依赖、供应链措施好；RN 需随机数/SHA-512 polyfill 验证                 |
| 微信支付后端    | 社区 Node APIv3 SDK              | 排除        | 无官方背书，主要候选维护/测试质量不足，处于资金链路不可接受                           |
| 微信支付后端    | 项目内窄适配器                   | 采用        | 仅封装签名、请求、验签、解密及所需支付接口，攻击面与依赖更小                          |
| 短信            | 腾讯云 Node.js SDK 3.0           | 采用并隔离  | 官方维护；只在 `SmsSender` 适配器内使用                                               |
| 对象存储        | 腾讯云 COS Node.js SDK           | 采用并隔离  | 官方支持；密钥仅服务端持有，按最小权限配置                                            |
| 反向代理        | Caddy 官方镜像                   | 采用        | 自动签发/续期 HTTPS，配置少，适合单机 Compose                                         |
| 容器示例        | Docker `awesome-compose`         | 借鉴        | 官方明确这些示例主要用于本地开发，不能原样用于生产                                    |
| 中国生产部署    | 腾讯云轻量服务器 + COS           | 采用        | 靠近目标用户，适合轻中量服务，运维面小                                                |
| 海外 PaaS       | Railway / Render                 | 仅测试候选  | 部署方便，但不适合作为面向中国大陆用户和微信回调的首选生产环境                        |

## 4. 移动端与 Monorepo

### 4.1 采用 Expo 官方底座

Expo 官方已经把 pnpm workspace 列为支持的 monorepo 方案。SDK 54 起支持 isolated dependencies，但官方也提醒部分 React Native 包仍可能不兼容，可切回 `nodeLinker: hoisted`。官方同时提醒 React、React Native 或原生模块出现重复版本会导致构建或运行问题。因此应遵循以下约束：

- 根目录只有一个 `pnpm-lock.yaml`。
- React、React Native、Expo 及所有原生模块只允许一个解析版本。
- 不复制旧文章里的 `watchFolders`、`resolver.nodeModulesPath` 等 Metro 补丁；先使用 Expo 当前自动配置。
- 使用 Expo prebuild 和 config plugin 接入微信 OpenSDK，不手工长期维护一份漂移的 Android 工程改动。
- 发布 APK 使用可复现的 release profile；云构建或本地构建均可，但签名材料不得进仓库。

依据：[Expo monorepo 指南](https://docs.expo.dev/guides/monorepos/)、[`create-expo-app`](https://docs.expo.dev/more/create-expo/)、[Expo Prebuild/config plugin](https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial/)、[APK 构建](https://docs.expo.dev/build-reference/apk/)。

### 4.2 不采用全栈模板

`create-t3-turbo` 是成熟的 pnpm/Turborepo/Expo 示例，适合借鉴 workspace、共享配置、CI 命令和包导出边界。但其核心是 Next.js/TanStack、tRPC、Drizzle/Supabase 和 Better Auth，并明确把 Expo 视为 monorepo 代码共享的一部分，而不是本项目这种离线学习客户端。因此：

- 可借鉴：`apps/*`、`packages/*`、根脚本、共享 ESLint/TypeScript 配置。
- 不复制：tRPC、Next.js、Supabase、OAuth/JWT、共享 UI 层。
- 不把它 fork 后大量删除；从官方模板分别生成 mobile/api/admin，最终组合更干净。

依据：[`create-t3-turbo`](https://github.com/t3-oss/create-t3-turbo)。

## 5. 本地 SQLite 与同步

### 5.1 直接使用 `expo-sqlite`

`expo-sqlite` 数据会跨重启持久保存，支持事务、prepared statement 和 FTS，足够承载：

- 一个用户状态库：安装记录、当前学习指针、卡片复习状态、待同步事件、弹窗词条缓存。
- 每个知识库一个只读内容 SQLite 文件，但所有包共用同一套表结构，不是每包创建一张业务表。

必须使用参数化查询。Expo 官方明确提醒 `execAsync()` 不转义参数，直接拼接外部输入会产生 SQL 注入风险。它只应用于受控迁移常量，不用于用户输入、搜索词或数据包字段。

依据：[Expo SQLite 官方文档](https://docs.expo.dev/versions/latest/sdk/sqlite/)。

### 5.2 为什么不采用通用离线同步框架

WatermelonDB 是可靠且成熟的项目，适合数万条可变、响应式记录和复杂双向同步；PowerSync 则需要额外本地适配器及同步服务，官方文档也说明其原生数据库适配器不能在 Expo Go 中直接运行。它们没有“质量问题”，而是与本项目问题规模不匹配：

- 知识库内容是只读且可重新下载，不需要逐行双向同步。
- 真正需要恢复的只有少量学习状态；订单和权益始终以服务器为准。
- 当前冲突策略可由 `event_id + updated_at/version + server snapshot` 清楚实现。
- 引入通用同步引擎会增加 schema 映射、迁移、原生模块、服务部署和问题定位路径。

因此 MVP 使用一个小 outbox：状态改变时本地事务同时更新状态和写入事件；联网后批量提交；服务器按事件 ID 幂等处理并返回最新快照。失败保留事件重试，不按“每天”生成或积压新任务。

依据：[WatermelonDB](https://github.com/Nozbe/WatermelonDB)、[PowerSync Expo/React Native 设置](https://docs.powersync.com/intro/setup-guide)。

## 6. API 与服务端数据

### 6.1 采用 NestJS + Prisma 官方结构，但不照搬 CRUD

Prisma 官方提供了当前 NestJS 指南及可运行示例，适合复用 `PrismaService`、迁移、测试和 Docker 环境。风险在于示例为了教学会让 controller 直接操作/返回 Prisma 模型；本项目不能这样做。

正式边界应保持：

`Controller -> Use case/service -> Repository interface -> Prisma repository -> PostgreSQL`

其中：

- `packages/contracts` 中的 Zod schema 是移动端、后台与 API 的唯一网络契约。
- Prisma model 只存在于 API 数据层，不导出到 controller response。
- 订单、支付事件、权益流水为可追溯记录；权益当前态可重建，不用学习状态承担资金证据。
- session 使用随机 opaque token；数据库只存 token 哈希。每个需登录 API 查询会话和权限，MVP 不加 Redis。
- 支付回调、发放权益、退款均使用数据库事务与唯一约束实现幂等。

依据：[Prisma 的 NestJS 官方指南](https://docs.prisma.io/docs/guides/frameworks/nestjs)、[Prisma 官方 Nest 示例](https://github.com/prisma/prisma-examples/tree/latest/orm/nest)、[NestJS 官方仓库](https://github.com/nestjs/nest)。

### 6.2 排除社区大样板

`nestjs-prisma-starter`、Brocoders boilerplate 等不是坏项目，但默认带入 GraphQL、Passport-JWT、TypeORM、Redis、文件上传、邮件或复杂角色体系。为了适配本项目，需要先删除大量代码，再重新实现 opaque session、REST/Zod 和权益账本；这既不省时间，也会让 AI 误沿模板扩展。

判定：只在遇到具体实现问题时阅读其测试或 Docker 配置，不 fork、不作为项目祖先。

候选来源：[`nestjs-prisma-starter`](https://github.com/notiz-dev/nestjs-prisma-starter)、[Brocoders NestJS boilerplate](https://github.com/brocoders/nestjs-boilerplate)。

## 7. 管理后台

### 7.1 推荐 React-admin

后台需要的知识库上架、版本发布、订单查询、权益修复、退款和审计日志，本质上都是 resource 的列表、筛选、详情、创建/修改和权限控制。React-admin 提供成熟的 Vite SPA、data provider 和 auth provider 结构，MIT 许可允许商业使用。

采用边界：

- 只用开源核心，不购买或预埋 Enterprise 功能。
- 写一个原生 `fetch` 的 `dataProvider`，将统一错误格式映射给 UI。
- 写一个 session-cookie `authProvider`；真正授权仍在 NestJS 后端，前端隐藏按钮不算权限控制。
- 页面仍按项目的简约 UI 做，不套演示站的视觉与复杂仪表盘。
- 第一阶段不做通用低代码 schema builder。

与 Refine 相比，React-admin 更有主见，少一个人反复选择路由、表格、表单和 provider 组合的成本。若编码时确认后台真的只有不超过三个完全定制页面，可以重新 ADR 为纯 React+Vite；除此以外 React-admin 的代码收益更高。

依据：[React-admin 仓库](https://github.com/marmelab/react-admin)、[Vite/部署](https://marmelab.com/react-admin/Deploy.html)、[Data Provider](https://marmelab.com/react-admin/doc/5.4/DataProviders.html)、[认证](https://marmelab.com/react-admin/doc/5.7/Authentication.html)、[授权](https://marmelab.com/react-admin/Permissions.html)、[Refine 仓库](https://github.com/refinedev/refine)。

## 8. 复习算法

### 8.1 MVP 保持小型 SM-2

GitHub 上的 SM-2 TypeScript 包普遍体量小但维护、测试样例和采用度有限。SM-2 核心状态转移本身很短，把它变成纯函数更符合项目“最小正确代码”的规则：

- 输入：上次状态、当前时间、用户三个评分之一。
- 输出：新间隔、下次复习时间、熟练度/次数等明确状态。
- 固定时钟，不读数据库、不发请求、不播放 UI。
- 用表格驱动测试覆盖首次学习、连续答对、忘记、跨时区和长时间未学习。

### 8.2 FSRS 不在 MVP 偷换

`ts-fsrs` 属于维护较好、MIT 许可的 TypeScript FSRS 实现，FSRS 项目目标是改善旧式 SM-2 的排程效果。但它通常使用四档评分，并具有不同参数和状态含义。当前 UI 已确认三个按钮，因此直接引入会造成算法与文案不一致。

判定：将 `ReviewScheduler` 保持为一个项目接口；MVP 实现 SM-2。只有在收集到真实复习数据、确定四档/三档映射和迁移规则后，才通过 ADR 评估 FSRS。

依据：[`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs)、[FSRS 说明](https://github.com/open-spaced-repetition/fsrs4anki/wiki/ABC-of-FSRS)。

## 9. 知识库文件验签

数据包必须先验证 manifest/schema/version、文件大小与 hash，再验证发行签名，最后才打开 SQLite；安装过程使用临时目录，全部成功后原子切换，失败清理临时文件并保留旧版本。

`@noble/ed25519` 是一个很小、MIT、零运行时依赖的实现，并提供签名发布和供应链说明。其当前版本代码是重写版，项目明确说明当前版本尚未独立审计，但旧版曾接受 Cure53 审计；React Native 还需要安全随机数和 SHA-512 polyfill。由于客户端只做公钥验签、不生成签名，风险面相对可控，但不能未经实机验证直接采用。

采用条件：

1. 在 Android release build 验证正确签名、错误签名、被篡改文件和超大文件。
2. 私钥只存在后台离线/受控发布环境，绝不进入 mobile、API 镜像或仓库。
3. 公钥带 `key_id`，协议允许未来轮换。
4. 锁定精确版本和完整性；升级需重跑测试向量。

依据：[`@noble/ed25519`](https://github.com/paulmillr/noble-ed25519)。

## 10. 微信支付专项审计

### 10.1 客户端采用官方 OpenSDK

APP 支付必须由后端先取得 `prepay_id`，客户端通过微信 OpenSDK `sendReq` 拉起微信。Android 需要实现 `WXPayEntryActivity`；Android 13 的 intent-filter 还有官方特别说明。客户端返回的成功状态不能作为发放权益依据，返回 App 后必须查服务端订单；最终以服务端查单和支付回调为准。

依据：[APP 支付开发指引](https://pay.wechatpay.cn/doc/v3/merchant/4013070176)、[APP 调起支付](https://pay.wechatpay.cn/doc/v3/merchant/4013070351)、[OpenSDK 接入](https://pay.wechatpay.cn/doc/v3/merchant/4013289321)。

### 10.2 后端不采用社区 Node SDK

微信支付官方 APIv3 团队当前列出的服务端 SDK 是 Java、PHP、Go，没有官方 Node.js SDK。常见社区包 `wechatpay-node-v3` 最近发布较久，仓库测试脚本曾显示“no test specified”，历史变更又涉及签名/解密问题；把它放在资金与权益链路上风险高于自己维护一个窄适配器。

NestJS 中只实现以下能力：

- 构造 APIv3 Authorization 签名并发送原生 `fetch` 请求。
- 校验微信响应签名。
- APP 下单、订单查询、退款、退款查询。
- 对回调的原始 body 验签，再用 APIv3 key 做 AES-GCM 解密。
- 将微信通知 ID、微信交易号、商户订单号建立唯一约束，事务内幂等写支付事件和权益流水。
- 回调失败可重试；不能因客户端回调、重复通知或接口超时重复发权益。
- 定时查漏仅扫描“已发起但未终态”的订单，不引入消息队列。

测试资料应来自微信官方 APIv3 文档和官方 Postman 脚本，不自己臆造密码学样例。官方文档要求回调通过 timestamp、nonce、原始请求体构建验签串，并对密文 Base64 解码后用 APIv3 密钥解密。

依据：[微信支付 APIv3 官方组织](https://github.com/wechatpay-apiv3)、[官方 Postman 脚本](https://github.com/wechatpay-apiv3/wechatpay-postman-script)、[APP 下单](https://pay.wechatpay.cn/doc/v3/merchant/4013070347)、[支付成功回调](https://pay.wechatpay.cn/doc/v3/merchant/4013070368)、[APIv3 概述](https://pay.wechatpay.cn/doc/v3/merchant/4012081606)、[被排除的社区包](https://github.com/klover2/wechatpay-node-v3-ts)。

这是本项目第一项必须做专项人工+AI复核的代码，优先级高于学习进度同步。

## 11. 短信与对象存储

短信和 COS 都有腾讯云官方 Node.js SDK，可通过项目适配器复用：

- `SmsSender.sendCode()` 内使用腾讯云 SDK 3.0；验证码本身只存哈希、有效期、尝试次数和发送频控。
- `PackStorage` 内使用 `cos-nodejs-sdk-v5`；永久 SecretKey 只在服务器环境变量/密钥管理中，使用子账号最小权限。
- 移动端下载公开或短期签名 URL，不持有 COS SecretId/SecretKey。
- 供应商返回结构不穿透到 controller 或业务层，未来换 OSS 只改适配器。

腾讯云官方已标记短信 SDK 2.0 未来可能停止维护，应使用 3.0。COS 官方也建议临时密钥和最小权限；本项目若所有上传均由后台完成，客户端甚至不需要临时密钥。

依据：[腾讯云短信 Node.js SDK 3.0](https://cloud.tencent.com/document/product/382/56060)、[SDK 2.0 维护提示](https://cloud.tencent.com/document/product/382/5804)、[COS Node.js SDK](https://cloud.tencent.com/document/product/436/8629)。

## 12. 生产部署建议

### 12.1 第一阶段拓扑

```text
Android App
   ├── HTTPS API ──> Caddy
   │                  └── NestJS API container
   │                         └── PostgreSQL container + persistent volume
   └── 知识库/音频/图片/APK ──> Tencent COS

Admin SPA ──HTTPS──> Caddy ──> static files / NestJS API

定时备份：PostgreSQL pg_dump(custom format) ──加密/校验──> COS private bucket
```

建议配置：

- 腾讯云轻量应用服务器，选择靠近主要用户的中国大陆地域。
- Ubuntu LTS + Docker Engine/Compose plugin，不依赖宝塔面板。
- Compose 只含 `caddy`、`api`、`postgres`；后台静态文件可由 Caddy 提供。
- PostgreSQL 不开放公网端口，只在内部 Compose 网络可见。
- Caddy 仅开放 80/443，并持久化证书数据；官方支持自动签发和续期 HTTPS。
- COS 使用独立私有桶保存数据库备份，公开/签名访问桶保存知识库和媒体；权限分离。
- 每日 `pg_dump -Fc`，上传后校验，保留滚动版本；每月至少做一次真实恢复演练。
- 应用日志输出 stdout，支付/权益另存结构化审计记录；第一阶段不部署 ELK。

PostgreSQL 官方说明备份有 SQL dump、文件系统备份和连续归档三类；`pg_dump` 可在并发使用中获得一致导出，但官方也提醒它并非所有生产规模下的完整持续备份方案。MVP 数据量较小时可先采用每日 dump + 异地 COS + 恢复演练；当订单量或恢复点目标提高时，再迁移到腾讯云托管 PostgreSQL 或 WAL/PITR。

依据：[腾讯云轻量服务器](https://cloud.tencent.com/document/product/1207)、[Docker CE 镜像](https://cloud.tencent.com/document/product/1207/60423)、[轻量服务器限制](https://cloud.tencent.com/document/product/1207/44569/)、[Caddy 自动 HTTPS](https://caddyserver.com/docs/automatic-https)、[Caddy Docker/运行](https://caddyserver.com/docs/running)、[PostgreSQL 备份](https://www.postgresql.org/docs/current/backup.html)、[`pg_dump`](https://www.postgresql.org/docs/current/app-pgdump.html)。

### 12.2 为什么不把 Railway/Render 当大陆生产首选

Railway 的 monorepo、Dockerfile 和 PostgreSQL 部署体验很好，适合快速测试。需要注意：Railway 不直接运行原始 Docker Compose，而是把服务转换为 Railway services；其 PostgreSQL 模板基于官方镜像，但日常运维、备份配置仍由使用者负责。Render 同样适合 Docker Web Service。

这两个平台可作为短期测试环境，但本项目主要用户在中国大陆，且涉及微信支付回调、国内短信、APK/媒体分发与后续备案，生产环境放在国内云更少网络和合规不确定性。使用大陆服务器和域名上线前必须预留 ICP 备案时间。

依据：[Railway monorepo](https://docs.railway.com/guides/deploying-a-monorepo)、[Railway Docker Compose](https://docs.railway.com/guides/docker-compose)、[Railway PostgreSQL](https://docs.railway.com/databases/postgresql)、[Railway 备份](https://docs.railway.com/volumes/backups)、[Render Docker](https://render.com/docs/docker)、[腾讯云备案限制](https://cloud.tencent.com/document/product/243/18911)。

## 13. 推荐项目骨架

```text
apps/
  mobile/                 Expo + React Native + expo-sqlite
  api/                    NestJS modular monolith
  admin/                  React + Vite + React-admin core
packages/
  contracts/              Zod API/pack schemas and plain TS types
  config/                 shared TS/ESLint config only
infra/
  compose.yaml
  Caddyfile
  scripts/                backup, restore-check, deploy
docs/
  adr/
  pack-protocol/
```

依赖方向必须是单向的：

- apps 可以依赖 `contracts` 和 `config`。
- `contracts` 不依赖任何 app、Prisma、React Native 或 React-admin。
- mobile 不依赖 api 源代码，admin 不依赖 api 源代码。
- API 模块之间通过明确 service/interface 协作，支付模块不能直接修改学习状态。
- 第三方 SDK 只出现在 adapter 文件中。

第一阶段 API 模块保持有限：`auth`、`catalog`、`orders`、`payments`、`entitlements`、`sync`、`admin`。不要为未来分销增加模块或表，只在订单来源保留一个普通、可空的 `source_code`/`channel` 字段；真正做分销时再设计归因、结算和风控。

## 14. 需要先做的五个技术验证

在批量写业务代码前，用 1～2 天完成五个可丢弃的小实验；它们比继续选框架更有价值：

1. **Expo 多 SQLite**：安装一个只读 pack DB，同时读写用户 DB，验证 Android release 性能、文件替换和损坏回滚。
2. **包验签**：`@noble/ed25519` 在 Expo prebuild release 中验证官方/自建固定向量，篡改一个字节必须失败。
3. **微信 OpenSDK**：验证包名、签名、`WXPayEntryActivity` 和从微信返回 App；没有真实商户配置时先把 native bridge 跑通。
4. **微信 APIv3 加密链路**：对官方签名/验签/解密样例做自动化测试；回调重复两次只能生成一次权益流水。
5. **灾难恢复**：从空服务器用 Compose 启动，再从 COS 的 dump 恢复订单、支付事件和权益，验证可追溯性。

任何一个实验失败，都只调整对应 adapter 或技术决策，不扩散到业务层。

## 15. 依赖引入门槛

正式编码时，每个新增生产依赖必须满足：

1. 先说明它替代了哪段实际代码；没有明确收益则不加。
2. 检查官方来源、许可证、最近维护、未解决安全公告和 Node/Expo 兼容范围。
3. 精确锁定版本并提交 `pnpm-lock.yaml`；不在代码中依赖未固定 CDN。
4. 运行类型检查、单元测试、Android release 构建和依赖漏洞扫描。
5. 支付、密码学、鉴权、数据库驱动升级必须单独 review。
6. 不因“未来可能用到”提前添加 SDK。

目前允许进入首批依赖清单的核心项只有：Expo/React Native 官方依赖、`expo-sqlite`、NestJS、Prisma、PostgreSQL driver、Zod、React/Vite、React-admin、腾讯云 SMS/COS 官方 SDK，以及通过实验后的 `@noble/ed25519`。微信 OpenSDK 通过 Expo config plugin/native bridge 接入。其余候选均在出现真实需求后再评估。

## 16. 最终决策

### 直接采用

- Expo 官方 app/monorepo/prebuild 方案
- `expo-sqlite`
- NestJS + Prisma 官方集成方式
- React-admin 开源核心
- Zod 合约包
- 腾讯云短信 SDK 3.0、COS Node SDK（适配器隔离）
- Caddy、Docker Compose、PostgreSQL 官方镜像
- 腾讯云轻量服务器 + COS 的 MVP 生产拓扑

### 只借鉴

- `create-t3-turbo` 的 workspace 与共享配置组织
- Prisma 官方 Nest 示例的连接、迁移与测试方式
- Docker `awesome-compose` 的 Compose 写法（官方明确不可原样生产部署）
- `ts-fsrs` 的测试和未来迁移思路

### MVP 排除

- T3/tRPC/Next.js/Supabase 全栈底座
- GraphQL/JWT/Redis 型 NestJS boilerplate
- WatermelonDB、RxDB、PowerSync 等通用同步平台
- 社区微信支付 Node SDK
- 低维护 SM-2 npm 包
- Kubernetes、微服务、消息队列、Redis、通用插件系统、分销系统预实现
- Railway/Render 作为中国大陆生产主环境

### 唯一需谨慎自研的部分

微信支付 Node.js APIv3 窄适配器。原因不是偏好自研，而是官方没有 Node SDK，社区候选又不足以承载资金链路。该适配器必须限制功能范围、使用 Node 原生密码学和 `fetch`、依照官方样例测试，并接受专项 review。除此之外，不再自研通用基础设施。
