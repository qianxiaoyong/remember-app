# 阶段2五项高风险技术验证 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不猜测移动应用身份、不伪造微信能力且不开发业务页面的前提下，先完成可独立执行的微信APIv3密码学和PostgreSQL恢复验证，再经明确暂停点完成Android release上的SQLite、Ed25519及OpenSDK验证。

**Architecture:** 验证代码严格隔离在`technical-spikes`目录，结果、精确版本和结论写入ADR；验证失败时暂停并申请架构调整，不把临时代码扩散到产品模块。阶段分为立即可执行的服务端/环境批次和移动身份确认后的Android批次，前一批通过不代表阶段2整体完成。

**Tech Stack:** Node.js 22.23.1、pnpm 10.33.2、TypeScript 6.0.3、Node `crypto`、Docker Compose、PostgreSQL 18.4、Expo SDK 57、React Native 0.86、expo-sqlite、expo-file-system、@noble/ed25519、腾讯微信OpenSDK Android。

## Global Constraints

- App展示名称固定为“记得”，项目根目录和Git仓库名为`remember-app`。
- Android最低支持版本为Android 8；移动端最终验收必须使用正式签名的release APK和真实Android设备，不能以Expo Go、开发模式或JavaScript bundle代替。
- 当前不得猜测或自行写入Android `applicationId`、正式release签名、微信开放平台AppID、商户号或支付凭证。
- 移动身份顺序固定为“确认包名 → 生成正式签名 → 微信开放平台注册 → 获得AppID”，每一步都是独立暂停点。
- 在包名未确认前不得运行会生成默认包名的Expo prebuild，不得创建依赖`applicationId`路径的`WXPayEntryActivity`。
- 当前不创建`sendWechatPayRequest`、支付参数类型、支付成功事件、模拟注册成功、模拟支付成功或模拟真实回跳。
- 微信OpenSDK受限验证只证明核心类能进入release APK并经JS/Kotlin边界成功加载；没有AppID时不调用`registerApp`。
- 不创建通用五按钮页面；Android批次只允许一个自动运行并显示文本结果的临时入口，验收后删除。
- `packages/contracts`不在本阶段修改；阶段2不得发明阶段3的学习包字段或阶段6的正式支付Schema。
- APIv3实现只使用Node原生`crypto`和项目原生代码，不引入社区微信支付SDK或Axios。
- 统一使用pnpm和ESM，只保留根`pnpm-lock.yaml`；依赖必须安装到实际使用的workspace并锁定精确版本。
- `.env`、keystore、证书、私钥、完整令牌、数据库dump和构建产物不得提交或输出到日志。
- 支付、学习包验签、数据库恢复和OpenSDK原生边界在合并前必须接受独立上下文审查。
- 五项验证全部具有可重复命令、实际输出和明确结论前，阶段2保持`IN_PROGRESS`，不得进入阶段3。
- 只有用户确认执行本计划后才执行任务中的提交步骤；提交必须按明确路径暂存，一个提交只有一个目的。

## Execution Gates

```text
Task 0 Git分支门禁
→ Task 1 动态脱敏环境报告
→ Task 2 微信APIv3密码学
→ Task 3 Docker与PostgreSQL备份恢复
→ Task 4 Android工具链安装与复查
→ Pause A 确认applicationId
→ Pause B 生成正式release签名
→ 用户再次确认移动批次
→ Task 5 Expo多SQLite release实机验证
→ Task 6 Ed25519 release实机验证
→ Task 7 临时移动验证入口
→ Task 8 OpenSDK核心类受限加载验证
→ Pause C 微信开放平台注册
→ Pause D 获得AppID
→ 另写OpenSDK后续验证计划并再次确认
```

首次执行只允许Task 1至Task 4。Pause A之后的Task 5至Task 8即使文件计划已经列明，也必须重新取得用户确认。

---

### Task 0: Git分支门禁

**Files:**

- Preserve: 工作区全部已有文件
- Produce: Git分支`feat/technical-spikes`

**Interfaces:**

- Consumes: 干净的`main`分支。
- Produces: 所有阶段2修改唯一允许落入的功能分支。

- [x] **Step 1: 验证main工作区干净**

Run:

```powershell
git status --short --branch
git branch --show-current
```

Expected: 分别显示`## main`和`main`，没有用户未提交修改。

- [x] **Step 2: 从main创建并切换功能分支**

Run:

```powershell
git switch -c feat/technical-spikes
```

Expected: 输出`Switched to a new branch 'feat/technical-spikes'`。

- [ ] **Step 3: 每次实施前重新验证分支**

Run:

```powershell
git branch --show-current
git status --short
```

Expected: 当前分支严格为`feat/technical-spikes`；若为`main`立即停止，不得修改文件。

---

### Task 1: 动态、脱敏的环境状态报告

**Files:**

- Create: `tools/technical-spikes/read-environment-status.ps1`
- Modify after actual environment change: `docs/decisions/0001-local-android-toolchain.md`

**Interfaces:**

- Consumes: 当前PowerShell进程环境、`apps/mobile/app.json`、可选的构建配置文件、可调用的系统命令和当前连接设备。
- Produces: 只包含工具版本及`CONFIGURED`、`MISSING`、`NOT_APPLICABLE`、`MANUAL_CHECK_REQUIRED`状态的控制台报告；不返回全局失败码来阻塞无关任务。

- [ ] **Step 1: 为状态解析器编写Pester之外的纯PowerShell自测入口**

脚本接受可选`-ProjectRoot`，默认使用脚本位置向上解析仓库根；不得读取或输出环境变量集合。内部只检查以下证据：

- `node --version`、`pnpm --version`、`java -version`、`adb version`、`docker version`、`docker compose version`是否可调用。
- `JAVA_HOME`和`ANDROID_HOME`是否存在且目标目录存在，只输出状态，不输出路径。
- `apps/mobile/app.json`当前是否存在`expo.android.package`，只输出`CONFIGURED`或`MISSING`，不输出包名。
- 动态解析项目实际使用的构建配置，检查是否定义release构建profile，仅据此输出`RELEASE_BUILD_PROFILE=CONFIGURED|MISSING`；`eas.json`存在本身不构成签名证据。
- 独立检查本地Gradle签名配置引用、引用文件存在性及release变体是否明确绑定签名配置；能安全自动验证时输出`RELEASE_SIGNING_STATUS=CONFIGURED|MISSING`，EAS托管凭证或其他无法从本机非敏感证据确认的方案输出`MANUAL_CHECK_REQUIRED`。不得把`eas.json`存在、release profile存在或debug签名误报为正式release签名。
- 当前进程是否配置`EXPO_PUBLIC_WECHAT_APP_ID`与`WECHAT_PAY_MCH_ID`，只输出状态，不输出值。
- `adb devices`只统计已授权设备数量；读取Android API level时只输出API数字，不输出序列号、型号或设备名。

自测通过临时目录分别放入含/不含`android.package`的`app.json`、含/不含release profile的构建配置，以及可自动验证/缺失/只能人工核验的签名配置证据，断言状态随文件内容变化；不得硬编码`NOT_DECIDED`、`NOT_AVAILABLE`或任何假值。

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1 -SelfTest
```

Expected: 自测使用隔离临时目录覆盖上述动态分支，全部断言通过且不读取或输出真实敏感值。

- [ ] **Step 2: 实现只读状态报告**

脚本的报告字段固定为：

```text
NODE
PNPM
JDK_17
JAVA_HOME
ANDROID_SDK
ADB
ANDROID_DEVICE_COUNT
ANDROID_DEVICE_API_LEVELS
DOCKER_ENGINE
DOCKER_COMPOSE
ANDROID_APPLICATION_ID
RELEASE_BUILD_PROFILE
RELEASE_SIGNING_STATUS
WECHAT_APP_ID
WECHAT_MERCHANT_ID
```

工具版本可输出；路径、包名、AppID、商户号、设备序列号、证书指纹、别名和签名材料不得输出。缺失项标记`MISSING`；无法安全自动证明的正式签名状态标记`MANUAL_CHECK_REQUIRED`，脚本仍以退出码0完成报告。

- [ ] **Step 3: 运行当前环境报告并检查脱敏**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1
```

Expected: 每个状态都来自当前文件和环境证据；缺失的applicationId、AppID或商户配置显示`MISSING`，无法自动确认的正式签名显示`MANUAL_CHECK_REQUIRED`，且不显示任何具体值；报告不修改任何文件。

- [ ] **Step 4: 提交环境报告脚本**

```powershell
git add tools/technical-spikes/read-environment-status.ps1
git commit -m "chore: 增加技术验证环境状态报告"
```

---

### Task 2: 微信APIv3签名、Authorization、验签与解密

**Files:**

- Create: `apps/api/src/technical-spikes/wechat-pay/wechat-pay-crypto.types.ts`
- Create: `apps/api/src/technical-spikes/wechat-pay/build-wechat-signature-message.ts`
- Test: `apps/api/src/technical-spikes/wechat-pay/build-wechat-signature-message.test.ts`
- Create: `apps/api/src/technical-spikes/wechat-pay/build-wechat-authorization.ts`
- Test: `apps/api/src/technical-spikes/wechat-pay/build-wechat-authorization.test.ts`
- Create: `apps/api/src/technical-spikes/wechat-pay/verify-wechat-message.ts`
- Test: `apps/api/src/technical-spikes/wechat-pay/verify-wechat-message.test.ts`
- Create: `apps/api/src/technical-spikes/wechat-pay/decrypt-wechat-resource.ts`
- Test: `apps/api/src/technical-spikes/wechat-pay/decrypt-wechat-resource.test.ts`
- Create: `apps/api/src/technical-spikes/wechat-pay/official-wechat-samples.ts`
- Create after commands have run: `docs/decisions/0002-wechat-pay-apiv3-crypto.md`

**Interfaces:**

- Consumes: Node `crypto`、微信官方请求签名/验签/回调解密样例和官方Postman脚本说明。
- Produces: 可测试的纯密码学函数；不创建网络客户端、订单服务、Controller或正式`WechatPayClient`实现。

公开类型固定为：

```ts
export interface WechatRequestSignatureInput {
  method: 'GET' | 'POST';
  path: string;
  timestamp: string;
  nonce: string;
  body: string;
}

export interface WechatAuthorizationInput extends WechatRequestSignatureInput {
  mchId: string;
  serialNo: string;
  privateKey: string;
}

export interface WechatMessageSignatureInput {
  timestamp: string;
  nonce: string;
  body: string;
  signature: string;
  publicKey: string;
}

export interface WechatEncryptedResource {
  algorithm: 'AEAD_AES_256_GCM';
  ciphertext: string;
  nonce: string;
  associatedData: string;
}
```

函数签名固定为：

```ts
export function buildWechatRequestSignatureMessage(input: WechatRequestSignatureInput): string;

export function buildWechatMessageSignatureMessage(
  input: Pick<WechatMessageSignatureInput, 'timestamp' | 'nonce' | 'body'>,
): string;

export function buildWechatAuthorization(input: WechatAuthorizationInput): string;

export function verifyWechatMessage(input: WechatMessageSignatureInput): boolean;

export function decryptWechatResource(
  resource: WechatEncryptedResource,
  apiV3Key: Uint8Array,
): Uint8Array;
```

- [ ] **Step 1: 写官方签名原文失败测试**

断言请求原文严格为：

```text
POST
/v3/pay/transactions/app
1554208460
593BEC0C930BF1AFEB40B4A08C8FB242
{"appid":"wx2421b1c4370ec43b"}
```

最后一行之后仍有一个ASCII LF。GET空body同样保留第五行空行及结尾LF。另增加带query的GET固定向量，例如`/v3/pay/transactions/out-trade-no/ORDER_001?mchid=1900007291`：签名原文必须保留原始path与query、不丢参数、不重排或重新编码，body为空且仍保留第五行空行和结尾LF。回调/响应原文严格为`timestamp\nnonce\nbody\n`。

- [ ] **Step 2: 实现并验证签名原文构造**

Run:

```powershell
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/build-wechat-signature-message.test.ts
```

Expected: POST、空body GET、带query GET的字段顺序、大小写、原始query和换行断言全部通过。

- [ ] **Step 3: 写完整Authorization失败测试**

使用运行期生成的RSA-2048临时密钥，固定`mchId`、`serialNo`、nonce和timestamp，断言输出认证类型严格为`WECHATPAY2-SHA256-RSA2048`，并且完整包含且只包含：

```text
mchid="..."
serial_no="..."
nonce_str="..."
timestamp="..."
signature="..."
```

测试从输出中提取Base64签名，使用临时公钥对同一签名原文验签；缺失字段、重复字段、空值、未转义引号或换行输入必须在生成前拒绝。

- [ ] **Step 4: 增加官方样例/Postman对照**

`official-wechat-samples.ts`只保存微信公开文档中的非敏感方法、路径、timestamp、nonce、mchid、serial_no、签名原文和公开Authorization示例；不保存官方或自建私钥、APIv3 key或真实项目配置。

测试必须同时做到：

1. 项目生成的签名原文与官方样例逐字节一致。
2. 官方Authorization示例符合项目验证的认证类型和五字段格式。
3. ADR记录官方文档URL、访问日期及`wechatpay-postman-script`对照的commit或release标识。

官方依据：

- `https://pay.wechatpay.cn/doc/v3/merchant/4012365336`
- `https://pay.wechatpay.cn/doc/v3/merchant/4013053420`
- `https://github.com/wechatpay-apiv3/wechatpay-postman-script`

- [ ] **Step 5: 实现Authorization并运行测试**

Run:

```powershell
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/build-wechat-authorization.test.ts
```

Expected: 临时密钥密码学断言与官方公开样例格式对照均通过。

- [ ] **Step 6: 写验签和AES-256-GCM失败测试**

覆盖正确响应/回调验签；逐一篡改body、timestamp、nonce、签名和公钥后拒绝。AES-GCM覆盖正确解密；Base64解码后的密文格式明确为“加密内容 + 末尾16字节认证标签”，长度不大于16字节时直接拒绝，并覆盖错误算法、32字节之外的APIv3 key、错误nonce、AAD、ciphertext和认证标签全部抛出异常。

- [ ] **Step 7: 实现最小验签和解密函数**

使用`createVerify('RSA-SHA256')`与`createDecipheriv('aes-256-gcm', ...)`；AES-GCM先从Base64解码结果中切出末尾16字节并传给`setAuthTag()`，其余字节作为加密内容；不得捕获后返回假成功或空数据。

Run:

```powershell
pnpm --filter @remember/api test
pnpm --filter @remember/api typecheck
pnpm --filter @remember/api build
```

Expected: 全部退出码为0，测试不访问微信网络服务。

- [ ] **Step 8: 记录ADR并进行支付密码学独立审查**

ADR记录实际命令、Node版本、官方样例来源、Postman版本、通过分支、未验证的真实商户联调及生产`WechatPayClient`建议边界。独立审查必须检查换行、Authorization字段、原始body、RSA算法、GCM认证标签和敏感信息处理。

- [ ] **Step 9: 提交APIv3技术验证**

```powershell
git add apps/api/src/technical-spikes/wechat-pay docs/decisions/0002-wechat-pay-apiv3-crypto.md
git commit -m "test(api): 验证微信支付APIv3密码学"
```

---

### Task 3: PostgreSQL事务幂等、备份与空库恢复

**Files:**

- Create: `infra/technical-spikes/postgres/compose.yaml`
- Create: `infra/technical-spikes/postgres/.env.example`
- Create: `infra/technical-spikes/postgres/sql/001-create-spike-schema.sql`
- Create: `infra/technical-spikes/postgres/sql/002-seed-order.sql`
- Create: `infra/technical-spikes/postgres/sql/003-process-payment-notification.sql`
- Create: `infra/technical-spikes/postgres/sql/004-verify-business-effect.sql`
- Test: `infra/technical-spikes/postgres/sql/005-reject-conflicting-notification.sql`
- Create: `infra/technical-spikes/postgres/sql/006-verify-restored-data.sql`
- Create: `infra/technical-spikes/postgres/run-backup-restore.ps1`
- Modify: `.gitignore`
- Create after commands have run: `docs/decisions/0003-postgresql-backup-restore.md`

**Interfaces:**

- Consumes: Docker Compose与官方`postgres:18.4-bookworm`镜像。
- Produces: 两次均成功且无重复业务效果的幂等通知处理、冲突重放拒绝与事务回滚证据、custom-format dump、独立空库恢复结果及约束验证；不创建Prisma模型或正式迁移。

- [ ] **Step 1: 安装并验证Docker环境**

Docker Desktop/Engine安装属于外部环境操作，执行前取得权限。安装后运行：

```powershell
docker version
docker compose version
```

Expected: 两条命令退出码为0。失败时只标记Task 3暂停，不影响Task 2结论。

- [ ] **Step 2: 创建隔离的源库与恢复库Compose**

`compose.yaml`固定使用`postgres:18.4-bookworm`，定义`source-db`和`restore-db`两个服务、两个由Compose项目限定作用域的独立volume，不设置跨项目固定volume名称，不开放公网端口。所有命令固定使用Spike专属Compose项目名`remember-technical-spikes-postgres`。

`run-backup-restore.ps1`每次运行前只枚举带有`com.docker.compose.project=remember-technical-spikes-postgres`标签的容器和volume；任何候选资源标签不完全匹配时立即失败。确认作用域后仅执行：

```powershell
docker compose --project-name remember-technical-spikes-postgres --file infra/technical-spikes/postgres/compose.yaml down --volumes --remove-orphans
```

禁止使用`docker system prune`、`docker volume prune`或删除其他Compose项目资源。`.env.example`只列变量名与空值；实际`.env`保持Git忽略且缺失时脚本失败，不使用默认密码。

- [ ] **Step 3: 创建最小验证Schema和订单种子**

Schema只包含`orders`、`payment_events`、`pack_access`。`orders`必须保存权威`user_id`和`pack_id`，约束至少包括：

- `payment_events.notification_id`唯一。
- `payment_events.transaction_id`唯一。
- `pack_access(user_id, pack_id)`唯一。
- 支付事件与购买权限引用已存在订单。

`002-seed-order.sql`只写入一笔包含`user_id`和`pack_id`的待支付订单，不预写支付事件或购买权限。

- [ ] **Step 4: 实现可重复成功的事务通知处理**

`001-create-spike-schema.sql`同时创建只供Spike调用的`process_spike_payment_notification(notification_id, transaction_id, order_id, processed_at)` PL/pgSQL函数；函数不得接收`user_id`或`pack_id`。函数先以`notification_id`查询并锁定既有事件：若既有`transaction_id`或`order_id`与本次输入任一不同，使用固定错误标识`PAYMENT_NOTIFICATION_CONFLICT`抛出异常；完全相同则返回`false`并成功结束，不再更新订单或写入权益。

首次处理必须以`order_id`读取并`FOR UPDATE`锁定订单，从该订单取得权威`user_id`和`pack_id`；未知订单直接拒绝。随后使用`INSERT ... ON CONFLICT (notification_id) DO NOTHING`处理并发竞争；未插入时重新读取并锁定冲突事件，再执行相同的一致性判断。只有确实插入新事件时才推进已锁定订单，并用订单中读取的`user_id`和`pack_id`写入`pack_access`，不能相信或接收通知调用方提供的用户和学习包。

`003-process-payment-notification.sql`在单个事务中调用该函数：

```sql
BEGIN;
SELECT process_spike_payment_notification(
  :'notification_id',
  :'transaction_id',
  :'order_id',
  :'processed_at'
);
COMMIT;
```

函数内部的事件插入与权益插入保留精确冲突目标的`ON CONFLICT`，但不得用`DO NOTHING`吞掉不一致重放。`003`通过`psql -v ON_ERROR_STOP=1`执行，函数异常必须令整个事务失败且由连接结束回滚。

- [ ] **Step 5: 证明第二次执行成功且业务效果不重复**

`run-backup-restore.ps1`使用`psql -v ON_ERROR_STOP=1`连续执行完全相同的通知两次，分别记录退出码。`004-verify-business-effect.sql`断言：

- 两次命令退出码均为0。
- 订单状态为`PAID`。
- `payment_events`恰好1行。
- `pack_access`恰好1行。
- `pack_access.user_id`和`pack_access.pack_id`严格等于已锁定`orders`行中的权威字段。
- 第二次执行前后上述计数不变。

唯一约束是最终防线，但正常重复通知必须走成功的幂等路径，不能依赖唯一冲突异常。

- [ ] **Step 6: 证明冲突重放被拒绝且事务回滚**

`005-reject-conflicting-notification.sql`先在事务内把已支付订单状态临时改回`PENDING`，再调用同一`notification_id`。`run-backup-restore.ps1`分别传入：

1. 不同`transaction_id`、相同`order_id`。
2. 相同`transaction_id`、不同`order_id`。

两次命令都必须以非0退出并包含固定错误标识`PAYMENT_NOTIFICATION_CONFLICT`，否则主脚本失败。每次预期失败后重新连接并运行`004-verify-business-effect.sql`，断言订单仍为`PAID`、原事件字段未变化、`payment_events`与`pack_access`仍各1行，从而证明异常前的临时订单更新也已回滚，而非仅由唯一约束报错。

- [ ] **Step 7: 导出并恢复到独立空数据库**

Run through script:

```text
pg_dump -Fc
pg_restore --exit-on-error
```

dump写入`infra/technical-spikes/postgres/artifacts/`并被Git忽略。恢复目标必须是从未执行过Schema或种子的独立数据库。

在`pg_restore`之前，脚本必须连接`restore-db`并执行以下等效断言，结果不为0立即失败：

```sql
SELECT count(*)
FROM pg_catalog.pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'payment_events', 'pack_access');
```

该空库来自本次运行刚安全清理并重新创建的Spike专属`restore-data` volume；不能通过先恢复再清表来制造“空库”。

- [ ] **Step 8: 验证恢复数据、约束和冲突回滚**

`006-verify-restored-data.sql`验证三张表数据、外键、三个唯一约束与幂等重放能力。恢复库再次执行通知脚本两次，两次仍成功且业务行数保持1；随后重跑两种冲突输入，仍必须得到固定错误且通过事务回滚断言。

- [ ] **Step 9: 记录恢复证据并独立审查**

ADR记录PostgreSQL精确版本、镜像、Compose项目名、被安全清理的本项目资源计数、恢复前业务表计数、dump大小、SHA-256、备份耗时、恢复耗时、正常重放退出码、两种冲突退出码、回滚断言和恢复后计数。审查必须检查事务边界、重放输入一致性校验、`ON CONFLICT`目标、资源清理标签和恢复库确实为空。

- [ ] **Step 10: 提交PostgreSQL技术验证**

```powershell
git add .gitignore infra/technical-spikes/postgres docs/decisions/0003-postgresql-backup-restore.md
git commit -m "test(infra): 验证支付记录备份恢复与幂等"
```

---

### Task 4: Android工具链安装与动态复查

**Files:**

- Modify after actual installation: `docs/decisions/0001-local-android-toolchain.md`
- Reuse: `tools/technical-spikes/read-environment-status.ps1`

**Interfaces:**

- Consumes: JDK 17、Android SDK API 36、Build Tools、Platform Tools、ADB及真实Android 8+设备。
- Produces: 可进行后续release构建的环境事实；不产生Android身份或原生工程。

- [ ] **Step 1: 安装JDK 17和Android SDK工具**

外部安装需要权限。只安装JDK 17、Android SDK API 36、对应Build Tools与Platform Tools；不安装微信SDK，不运行Expo prebuild。

- [ ] **Step 2: 运行动态环境报告**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1
```

Expected: 工具链项根据实际安装结果动态变化并显示安全版本信息；身份、构建profile和签名项仍分别根据当前项目证据显示`CONFIGURED`、`MISSING`或`MANUAL_CHECK_REQUIRED`，没有硬编码状态或敏感值。

- [ ] **Step 3: 更新工具链ADR**

记录实际JDK、SDK、Build Tools和ADB版本，以及以下尚未解除的暂停条件：applicationId、release签名、微信平台注册和AppID。

- [ ] **Step 4: 提交工具链事实**

```powershell
git add docs/decisions/0001-local-android-toolchain.md
git commit -m "docs: 记录Android工具链安装状态"
```

---

## Pause A: 确认Android applicationId

用户必须先明确批准长期使用的Android `applicationId`。批准前禁止修改`apps/mobile/app.json`、运行Expo prebuild或生成默认包名。

批准后只允许把用户给出的精确值写入：

- Modify: `apps/mobile/app.json`

写入后运行`read-environment-status.ps1`只能报告`CONFIGURED`，不能打印包名。

## Pause B: 生成正式release签名

必须在Pause A解除后，由用户确认本地keystore或EAS凭证方案。keystore和密码位于仓库外，只在ADR记录公开指纹、算法、有效期和保管边界。

- Create after exact decisions exist: `docs/decisions/0004-android-app-identity-and-signing.md`

Pause A和B解除后仍不得自动执行移动端任务；必须向用户提交当前状态并再次取得Task 5至Task 8的执行确认。

---

### Task 5: Expo多SQLite Android release实机验证

**Files:**

- Create: `apps/mobile/src/technical-spikes/sqlite/create-spike-database.ts`
- Create: `apps/mobile/src/technical-spikes/sqlite/replace-spike-database.ts`
- Create: `apps/mobile/src/technical-spikes/sqlite/run-sqlite-spike.ts`
- Modify: `apps/mobile/package.json`
- Modify: `pnpm-lock.yaml`
- Create after real device run: `docs/decisions/0005-expo-multi-sqlite.md`

**Interfaces:**

- Consumes: 已确认applicationId、正式release签名、`expo-sqlite@57.0.1`和`expo-file-system@57.0.1`。
- Produces: 多SQLite、只读查询、关闭句柄、同目录替换和损坏回滚的真实设备结论。

验证必须同时打开可写`user-spike.sqlite`和设置`PRAGMA query_only = ON`的`pack-spike.sqlite`；包库写入必须失败。关闭句柄后替换正常候选，损坏候选经`PRAGMA integrity_check`拒绝且旧库继续可读。只使用`spike_marker`表，不定义正式学习包字段。

Run:

```powershell
pnpm --filter @remember/mobile typecheck
pnpm --filter @remember/mobile exec expo prebuild --platform android --clean
```

然后使用已批准的release签名配置构建APK并通过ADB安装到真实设备。ADR记录设备API level、构建命令、每个断言和替换/回滚结果，不记录设备序列号。

---

### Task 6: Ed25519 Android release实机验证

**Files:**

- Create: `apps/mobile/src/technical-spikes/signature/configure-ed25519.ts`
- Create: `apps/mobile/src/technical-spikes/signature/signature-vectors.ts`
- Create: `apps/mobile/src/technical-spikes/signature/verify-spike-content.ts`
- Create: `apps/mobile/src/technical-spikes/signature/run-signature-spike.ts`
- Modify: `apps/mobile/package.json`
- Modify: `pnpm-lock.yaml`
- Create after real device run: `docs/decisions/0006-ed25519-android-verification.md`

**Interfaces:**

- Consumes: `@noble/ed25519@3.1.0`、`@noble/hashes@2.2.0`、公开固定向量和正式签名release APK。
- Produces: 正确验签、错误输入拒绝以及React Native SHA-512兼容结论。

移动端只验签，不生成密钥或签名。正确公开向量必须通过；错误公钥、截断签名、非法长度，以及数据库、manifest、资源三个公开样例各篡改一字节后必须拒绝。ADR明确记录SHA-512配置；验证路径若不需要随机数，不安装随机数polyfill，若实机证据证明加载要求随机源则暂停并提交依赖变更说明。

---

### Task 7: 单一临时移动验证入口

**Files:**

- Create temporarily: `apps/mobile/app/technical-spike.tsx`
- Create temporarily: `apps/mobile/src/technical-spikes/run-mobile-spikes.ts`
- Modify temporarily: `apps/mobile/src/screens/start-screen.tsx`

**Interfaces:**

- Consumes: Task 5、6与8的runner。
- Produces: 自动运行的纯文本`PASS`、`FAIL`、`PAUSED`结果；不接受输入，不提供五个按钮。

页面只调用`runMobileSpikes()`，不直接访问SQLite、文件系统或原生模块。Task 9的release实机重复验收和证据记录完成后，删除两个临时文件并移除`start-screen.tsx`入口，再重建release APK确认删除完整；不得把它保留成开发工具页面。

---

### Task 8: 微信OpenSDK核心类受限加载验证

**Files:**

- Create: `apps/mobile/modules/wechat-open-sdk/package.json`
- Create: `apps/mobile/modules/wechat-open-sdk/expo-module.config.json`
- Create: `apps/mobile/modules/wechat-open-sdk/index.ts`
- Create: `apps/mobile/modules/wechat-open-sdk/src/wechat-open-sdk-module.ts`
- Create: `apps/mobile/modules/wechat-open-sdk/android/build.gradle`
- Create: `apps/mobile/modules/wechat-open-sdk/android/src/main/java/com/remember/wechatopensdk/WechatOpenSdkModule.kt`
- Create: `apps/mobile/src/technical-spikes/wechat/assert-wechat-open-sdk-loaded.ts`
- Create after real device run: `docs/decisions/0007-wechat-opensdk-limited-validation.md`

**Interfaces:**

- Consumes: 腾讯发布的`com.tencent.mm.opensdk:wechat-sdk-android:6.8.34`以及正式签名release APK。
- Produces: `assertWechatOpenSdkLoaded(): Promise<void>`；成功只表示核心类经过JS/Kotlin边界被真实加载，失败必须抛错。

官方示例真实公开的核心入口是`WXAPIFactory.createWXAPI(...)`和`IWXAPI.registerApp(...)`，没有可依赖的运行时SDK版本读取API。本任务不创建或调用注册接口，而是在Kotlin中直接引用`WXAPIFactory`与`IWXAPI`类型并强制加载类；类缺失、链接失败或调用异常时让Expo模块把错误传播到JS，禁止返回硬编码版本、`true`或假成功对象。

当前明确不创建：

- `WXPayEntryActivity`
- 任何`<applicationId>/wxapi/`源码路径
- `sendWechatPayRequest`
- `registerWechatApp`
- 支付参数类型或支付结果事件
- 模拟回跳Activity

官方依据：

- `https://pay.wechatpay.cn/doc/v3/merchant/4013289321`
- `https://pay.wechatpay.cn/doc/v3/merchant/4012164512`
- `https://central.sonatype.com/artifact/com.tencent.mm.opensdk/wechat-sdk-android/versions`

ADR状态只能写`LIMITED_PASS`或`FAIL`，不能写“OpenSDK接入完成”。

---

## Pause C: 微信开放平台注册

使用已确认包名和正式release签名指纹，由用户在微信开放平台注册移动应用并等待审核。注册完成前不得增加`registerApp`、`WXPayEntryActivity`或真实回跳断言。

## Pause D: 获得AppID

用户提供与包名和签名匹配的AppID后，另写一份具有精确文件路径和接口的OpenSDK后续计划。该计划单独决定注册、`WXPayEntryActivity`和真实回到App的验证范围；商户权限仍缺失时不得创建支付请求或声称支付链路通过。

---

### Task 9: 阶段汇总与完整门禁

**Files:**

- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-07-26-technical-spikes.md`
- Modify: 已执行任务对应ADR，仅填写实际结果

- [ ] **Step 1: 重跑首批环境与服务端Spike验收**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools/technical-spikes/read-environment-status.ps1 -SelfTest
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/build-wechat-signature-message.test.ts
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/build-wechat-authorization.test.ts
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/verify-wechat-message.test.ts
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/decrypt-wechat-resource.test.ts
powershell -NoProfile -ExecutionPolicy Bypass -File infra/technical-spikes/postgres/run-backup-restore.ps1
```

Expected: 环境报告保持脱敏且退出码为0；四个精确测试文件分别通过；PostgreSQL脚本再次从自己的空volume开始，正常重放、两种冲突回滚、备份、恢复前空库断言和恢复后复验全部通过。

- [ ] **Step 2: 在Pause A、Pause B和移动批次确认后重跑Android验收**

以下命令不得在身份与签名暂停点解除前运行：

```powershell
pnpm --filter @remember/mobile exec expo-doctor
pnpm --filter @remember/mobile typecheck
pnpm --filter @remember/mobile exec expo prebuild --platform android --clean
Push-Location apps/mobile/android
.\gradlew.bat assembleRelease
Pop-Location
$spikeApplicationId = (Get-Content -Raw -LiteralPath apps/mobile/app.json | ConvertFrom-Json).expo.android.package
if ([string]::IsNullOrWhiteSpace($spikeApplicationId)) { throw 'ANDROID_APPLICATION_ID_MISSING' }
adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk
adb shell monkey -p $spikeApplicationId 1
```

Expected: `expo-doctor`、`typecheck`和`assembleRelease`退出码为0；APK安装成功；`adb shell monkey`只负责启动App，不声称或断言它会进入`technical-spike`路由。启动后由验收人员在App中人工点击临时“技术验证”入口，再记录真实Android 8或更高设备上SQLite、Ed25519和OpenSDK加载边界的非硬编码结果。不得为此增加Deep Link、scheme或路由跳转参数；记录API level和三项结果，不记录设备标识或包名。若APK产物名由已确认的签名方案改变，先将实际稳定产物路径更新进本计划并再次确认，不使用模糊搜索或猜测路径。

- [ ] **Step 3: 删除临时入口并重建release APK**

删除`apps/mobile/app/technical-spike.tsx`和`apps/mobile/src/technical-spikes/run-mobile-spikes.ts`，移除`start-screen.tsx`中的临时入口，然后再次运行`expo-doctor`、`typecheck`和`assembleRelease`，确认正式产物不再包含Spike入口。

- [ ] **Step 4: 运行仓库完整门禁**

Run:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contract
pnpm test:integration
pnpm check:deps
pnpm check:secrets
pnpm build
git status --short
git diff --check
```

APIv3与PostgreSQL通过只完成两个子项；Android工具链安装只表示环境就绪；SQLite或Ed25519缺少正式签名release实机结果时为`PAUSED`；OpenSDK核心类加载最多为`LIMITED_PASS`。五项没有全部达到架构退出门禁时，阶段2保持`IN_PROGRESS`并禁止进入阶段3。

## Allowed Paths

正式计划文件本身属于允许修改范围：

- `docs/superpowers/plans/2026-07-26-technical-spikes.md`

首次执行Task 1至Task 4只允许修改：

- `tools/technical-spikes/**`
- `apps/api/src/technical-spikes/**`
- `infra/technical-spikes/**`
- `docs/decisions/0001-local-android-toolchain.md`
- `docs/decisions/0002-wechat-pay-apiv3-crypto.md`
- `docs/decisions/0003-postgresql-backup-restore.md`
- `.gitignore`
- 本计划的执行勾选和实际记录

Pause A和B解除并再次取得确认后，才增加：

- `apps/mobile/app.json`
- `apps/mobile/package.json`
- `apps/mobile/app/technical-spike.tsx`
- `apps/mobile/src/screens/start-screen.tsx`
- `apps/mobile/src/technical-spikes/**`
- `apps/mobile/modules/wechat-open-sdk/**`
- `pnpm-lock.yaml`
- `docs/decisions/0004-android-app-identity-and-signing.md`
- `docs/decisions/0005-expo-multi-sqlite.md`
- `docs/decisions/0006-ed25519-android-verification.md`
- `docs/decisions/0007-wechat-opensdk-limited-validation.md`

不在上述清单中的文件不得修改。共享契约、根配置、正式API模块、Prisma、业务页面、后台和学习包构建器均不在本阶段范围。

## Self-Review Record

- Spec coverage: 五项高风险验证均有任务或明确暂停点；APIv3和PostgreSQL可独立先完成。
- Placeholder scan: 未写入未知包名、签名、AppID、商户号或依赖`applicationId`的路径。
- Type consistency: APIv3类型和函数名在测试与产出中保持一致；移动端OpenSDK唯一接口为`assertWechatOpenSdkLoaded(): Promise<void>`。
- Security review: Authorization五字段、官方样例对照、带query GET、原始body、AES-GCM末尾16字节认证标签、从已锁定订单读取权益主体、冲突重放拒绝与回滚、Spike专属volume清理、敏感值脱敏和正式签名人工核验边界均有明确验收。
- Scope review: 没有业务页面、正式支付模块、正式数据库迁移、学习包协议或假成功实现。
