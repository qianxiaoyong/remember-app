# 阶段 8 子计划 2：生产部署与恢复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付单机 staging/prod 可重复部署：Docker Compose + Caddy、生产 `.env` 校验、COS 私有桶 pack 分发与 DB 备份、请求追踪与结构化日志，以及从空机到 staging 的 runbook。

**Architecture:** `infra/prod/compose.yaml` 运行 `postgres:18.4-bookworm` + API 镜像；Caddy 反代 `api.*` 与托管 Admin 静态 `dist/`；API 新增 `CosPackStorage`（上传 + presign）；`PACK_DOWNLOAD_MOCK_ENABLED=false` 时返回 COS 预签名 URL；Windows/Linux 运维脚本 `pg_dump -Fc` 上传备份前缀。staging 与 prod 为同机两套 Compose project（不同 volume / 端口 / `.env`）。

**Tech Stack:** Docker Compose v2、Caddy 2、`postgres:18.4-bookworm`、NestJS 11、Prisma 6、腾讯云 COS SDK（`cos-nodejs-sdk-v5`）、PowerShell 备份脚本、Node 22 + pnpm 10.33.2

**分支：** `feat/phase8-release`（基线 `main` @ kickoff commit）  
**Kickoff：** `docs/superpowers/plans/2026-08-04-phase8-release-kickoff.md`  
**ADR：** `docs/decisions/0003-postgresql-backup-restore.md`  
**依赖：** 阶段 7 Admin 发版本地存储已实现；本子计划接 COS 与 Compose，不阻塞子计划 1（pack/App 更新验证）与子计划 3（RC 清单）。

## Global Constraints

- MVP：**单机 Compose + Caddy**；不做 K8s、全量 APM、自动 CI 部署生产。
- **Pause C/D**：真实微信付/退 **不挡** staging 部署；staging 默认 `WECHAT_PAY_MOCK_ENABLED=true`。
- **密钥不进 Git/APK**；`.env` 仅服务器本地 + 离线备份。
- Admin 托管：**`admin.remember.wehub.top`** 子域 → Caddy 静态 `apps/admin/dist`。
- API 公网基址：**`https://api.remember.wehub.top`**（备案前 runbook 允许 IP/staging 域名）。
- COS：**一个私有桶**；对象前缀 `packs/{packId}/{packVersion}/pack.zip` 与 `backups/postgres/{YYYY-MM-DD}/remember.dump`。
- PostgreSQL 镜像：**`postgres:18.4-bookworm`**（与 dev、ADR 0003 一致）。
- 每 Task 完成后运行 **`pnpm check`**；集成测试沿用现有 Vitest + supertest。
- Prisma 模型不得直出 API；pack 下载响应仍用 `packDownloadAuthorizationResponseSchema`。
- 上传 zip 仍走 `verifyPackZipBuffer`；失败不写 DB/COS。

## 已确认拓扑决策

| 决策           | 选择                                                 |
| -------------- | ---------------------------------------------------- |
| Admin          | `admin.remember.wehub.top` 独立子域                  |
| staging / prod | 同机双 Compose：`remember-staging` / `remember-prod` |
| COS            | 单桶双前缀（packs + backups）                        |
| COS 实现       | 本子计划 Task 4–6 完整落地（非 defer 骨架）          |

---

## 文件结构（本计划锁定）

| 路径                                                      | 职责                                               |
| --------------------------------------------------------- | -------------------------------------------------- |
| `infra/prod/compose.yaml`                                 | staging/prod 共用模板；`COMPOSE_PROJECT_NAME` 区分 |
| `infra/prod/.env.example`                                 | 全部必填变量说明，无真实值                         |
| `infra/prod/Caddyfile.example`                            | site + api + admin 三站点                          |
| `infra/prod/docker-entrypoint.sh`                         | 容器内 `prisma migrate deploy` → 启动 API          |
| `infra/prod/backup-db.ps1`                                | `pg_dump -Fc` + 可选 COS 上传                      |
| `infra/prod/restore-db.ps1`                               | 空库 `pg_restore --exit-on-error`（人工确认）      |
| `apps/api/Dockerfile`                                     | monorepo 多阶段 API 镜像                           |
| `.dockerignore`                                           | 缩小 build context                                 |
| `tools/scripts/validate-prod-env.mjs`                     | 启动前 env 校验 CLI                                |
| `apps/api/src/config/read-cos-config.ts`                  | COS 开关与凭证                                     |
| `apps/api/src/storage/cos-pack-storage.ts`                | PUT + presigned GET                                |
| `apps/api/src/storage/cos-pack-storage.test.ts`           | 单元测试（mock SDK）                               |
| `apps/api/src/common/request-id.middleware.ts`            | `X-Request-Id` 入/出                               |
| `apps/api/src/common/http-exception.filter.ts`            | 错误 JSON 含 `requestId`                           |
| `apps/api/src/pack-download/pack-download.service.ts`     | mock off → presign                                 |
| `apps/api/src/admin/packs/admin-pack-versions.service.ts` | 上传后 COS PUT                                     |
| `apps/api/test/pack-download-cos.e2e.test.ts`             | mock COS 的集成测试                                |
| `docs/runbooks/production-deploy.md`                      | 空机 → staging → 批准 → prod                       |
| `docs/runbooks/postgres-backup-restore.md`                | ADR 0003 生产步骤                                  |

---

### Task 0: 分支与基线确认

**Files:** 无代码变更

- [ ] **Step 1:** 确认在 `feat/phase8-release`，基线含 kickoff commit

```powershell
git checkout feat/phase8-release
git log -1 --oneline
```

Expected: 含 `docs: add phase 8 release kickoff`

- [ ] **Step 2:** 确认 `pnpm check` 在分支基线全绿

```powershell
pnpm check
```

---

### Task 1: 生产 Compose 骨架

**Files:**

- Create: `infra/prod/compose.yaml`
- Create: `infra/prod/.env.example`

**Interfaces:**

- Produces: Compose 服务 `postgres`（internal）、`api`（build `apps/api/Dockerfile`，仅 expose 到 host `127.0.0.1:${API_HOST_PORT:-3000}`）

- [ ] **Step 1:** 创建 `infra/prod/.env.example`

```dotenv
# 复制为 infra/prod/.env（Git 忽略）；staging 与 prod 各一份，勿复用密码
COMPOSE_PROJECT_NAME=remember-staging
POSTGRES_DB=remember
POSTGRES_USER=remember
POSTGRES_PASSWORD=
API_HOST_PORT=3000
DATABASE_URL=
NODE_ENV=production
PORT=3000
API_PUBLIC_BASE_URL=https://api.staging.remember.wehub.top
AUTH_PHONE_PEPPER=
REDEMPTION_CODE_PEPPER=
PACK_DOWNLOAD_TOKEN_PEPPER=
SMS_MOCK_ENABLED=true
WECHAT_PAY_MOCK_ENABLED=true
PACK_DOWNLOAD_MOCK_ENABLED=true
COS_ENABLED=false
# COS_SECRET_ID=
# COS_SECRET_KEY=
# COS_REGION=ap-guangzhou
# COS_BUCKET=
# COS_PRESIGN_TTL_SECONDS=900
ADMIN_SESSION_TTL_DAYS=7
ADMIN_BOOTSTRAP_LOGIN_NAME=
ADMIN_BOOTSTRAP_PASSWORD=
# ADMIN_PACK_STORAGE_DIR=/data/pack-storage
```

- [ ] **Step 2:** 创建 `infra/prod/compose.yaml`

```yaml
services:
  postgres:
    image: postgres:18.4-bookworm
    environment:
      POSTGRES_DB: ${POSTGRES_DB:?POSTGRES_DB must be set}
      POSTGRES_USER: ${POSTGRES_USER:?POSTGRES_USER must be set}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 2s
      timeout: 3s
      retries: 30
    volumes:
      - postgres-data:/var/lib/postgresql
    restart: unless-stopped

  api:
    build:
      context: ../..
      dockerfile: apps/api/Dockerfile
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - '127.0.0.1:${API_HOST_PORT:-3000}:3000'
    volumes:
      - pack-storage:/data/pack-storage
    restart: unless-stopped

volumes:
  postgres-data:
  pack-storage:
```

- [ ] **Step 3:** 语法验证（无需真实密码启动）

```powershell
docker compose --project-name remember-staging --file infra/prod/compose.yaml config
```

Expected: 输出解析后的 compose；若缺 `.env` 则按提示创建后再跑

- [ ] **Step 4:** Commit

```powershell
git add infra/prod/compose.yaml infra/prod/.env.example
git commit -m "infra: add production compose skeleton and env example"
```

---

### Task 2: API Dockerfile 与容器入口

**Files:**

- Create: `apps/api/Dockerfile`
- Create: `infra/prod/docker-entrypoint.sh`
- Create: `.dockerignore`

**Interfaces:**

- Produces: 镜像内工作目录 `/app`；entrypoint 执行 migrate + `node apps/api/dist/main.js`

- [ ] **Step 1:** 创建 `.dockerignore`

```gitignore
node_modules
**/node_modules
**/.git
**/dist
apps/api/data
apps/api/test
**/*.test.ts
**/*.test.mjs
tools/pack-builder/fixtures
infra
docs
.gitignore
```

- [ ] **Step 2:** 创建 `infra/prod/docker-entrypoint.sh`

```bash
#!/bin/sh
set -eu
cd /app/apps/api
npx prisma migrate deploy
exec node dist/main.js
```

- [ ] **Step 3:** 创建 `apps/api/Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
COPY packages/domain/package.json packages/domain/
COPY packages/config/package.json packages/config/
COPY tools/pack-builder/package.json tools/pack-builder/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages packages
COPY tools/pack-builder tools/pack-builder
COPY apps/api apps/api
RUN pnpm --filter @remember/contracts build \
 && pnpm --filter @remember/pack-builder build \
 && pnpm --filter @remember/api exec prisma generate \
 && pnpm --filter @remember/api build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/tools/pack-builder ./tools/pack-builder
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY infra/prod/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
```

- [ ] **Step 4:** 本地构建镜像

```powershell
docker build -f apps/api/Dockerfile -t remember-api:local .
```

Expected: build 成功

- [ ] **Step 5:** 填好 `infra/prod/.env` 后启动并探活

```powershell
docker compose --project-name remember-staging --env-file infra/prod/.env --file infra/prod/compose.yaml up -d --build
curl http://127.0.0.1:3000/api/v1/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 6:** Commit

```powershell
git add apps/api/Dockerfile infra/prod/docker-entrypoint.sh .dockerignore
git commit -m "infra: add multi-stage API Dockerfile with migrate entrypoint"
```

---

### Task 3: 生产环境变量校验脚本

**Files:**

- Create: `tools/scripts/validate-prod-env.mjs`
- Modify: `package.json`（根，添加 `"check:prod-env": "node tools/scripts/validate-prod-env.mjs"`）

**Interfaces:**

- Produces: `validateProdEnv(envPath?)` — 缺必填项 `process.exit(1)`

- [ ] **Step 1:** 写校验脚本（核心逻辑）

```javascript
#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const REQUIRED = [
  'POSTGRES_PASSWORD',
  'DATABASE_URL',
  'NODE_ENV',
  'PORT',
  'API_PUBLIC_BASE_URL',
  'AUTH_PHONE_PEPPER',
  'REDEMPTION_CODE_PEPPER',
  'PACK_DOWNLOAD_TOKEN_PEPPER',
  'ADMIN_BOOTSTRAP_LOGIN_NAME',
  'ADMIN_BOOTSTRAP_PASSWORD',
];

function loadEnvFile(path) {
  if (!existsSync(path)) throw new Error(`ENV_FILE_NOT_FOUND: ${path}`);
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function requireNonEmpty(name) {
  if (!process.env[name]?.trim()) {
    console.error(`MISSING: ${name}`);
    return false;
  }
  return true;
}

const envPath = process.argv[2] ?? 'infra/prod/.env';
loadEnvFile(envPath);
let ok = REQUIRED.every(requireNonEmpty);

const nodeEnv = process.env.NODE_ENV?.trim();
if (nodeEnv === 'production' && process.env.SMS_MOCK_ENABLED === 'true') {
  console.error('INVALID: SMS_MOCK_ENABLED must not be true when NODE_ENV=production');
  ok = false;
}

const cosEnabled = process.env.COS_ENABLED === 'true';
const mockDownload = process.env.PACK_DOWNLOAD_MOCK_ENABLED !== 'false';
if (nodeEnv === 'production' && !mockDownload && !cosEnabled) {
  console.error('INVALID: production pack download requires COS_ENABLED=true when mock is off');
  ok = false;
}
if (cosEnabled) {
  for (const key of ['COS_SECRET_ID', 'COS_SECRET_KEY', 'COS_REGION', 'COS_BUCKET']) {
    ok = requireNonEmpty(key) && ok;
  }
}

if (!ok) process.exit(1);
console.log('OK: prod env validated');
```

- [ ] **Step 2:** 运行校验

```powershell
node tools/scripts/validate-prod-env.mjs infra/prod/.env.example
```

Expected: 缺值项 FAIL（example 故意留空）；创建填好的 `infra/prod/.env` 后应 PASS

- [ ] **Step 3:** Commit

```powershell
git add tools/scripts/validate-prod-env.mjs package.json
git commit -m "chore: add production env validation script"
```

---

### Task 4: COS 配置与存储适配器

**Files:**

- Create: `apps/api/src/config/read-cos-config.ts`
- Create: `apps/api/src/config/read-cos-config.test.ts`
- Create: `apps/api/src/storage/cos-pack-storage.ts`
- Create: `apps/api/src/storage/cos-pack-storage.test.ts`
- Create: `apps/api/src/storage/storage.module.ts`
- Modify: `apps/api/package.json`（添加 `cos-nodejs-sdk-v5`）
- Modify: `apps/api/src/app.module.ts`（import `StorageModule`）

**Interfaces:**

- Produces:
  - `readCosConfig(): { enabled: boolean; secretId; secretKey; region; bucket; presignTtlSeconds }`
  - `CosPackStorage.putObject(key: string, body: Buffer): Promise<void>`
  - `CosPackStorage.getPresignedDownloadUrl(key: string): Promise<string>`

- [ ] **Step 1:** 安装依赖

```powershell
pnpm --filter @remember/api add cos-nodejs-sdk-v5
```

- [ ] **Step 2:** 实现 `read-cos-config.ts`（`COS_ENABLED=false` 时不读 secret）

- [ ] **Step 3:** 实现 `CosPackStorage` — `putObject` 用 `putObject` API；presign 用 `getObjectUrl` + `Sign: true`，Expires = TTL

- [ ] **Step 4:** 单元测试 mock `COS` 构造函数，断言 `putObject` / `getObjectUrl` 参数

```powershell
pnpm --filter @remember/api test src/config/read-cos-config.test.ts src/storage/cos-pack-storage.test.ts
```

Expected: PASS

- [ ] **Step 5:** Commit

```powershell
git add apps/api/package.json apps/api/src/config/read-cos-config.ts apps/api/src/storage apps/api/src/app.module.ts pnpm-lock.yaml
git commit -m "feat(api): add COS pack storage adapter"
```

---

### Task 5: Admin 上传接 COS

**Files:**

- Modify: `apps/api/src/admin/packs/admin-pack-versions.service.ts`
- Modify: `apps/api/test/admin-operations.e2e.test.ts`（或新增用例）

**Interfaces:**

- Consumes: `CosPackStorage.putObject(cosObjectKey, zipBytes)`
- 行为：`COS_ENABLED=true` 时本地写入 **成功后** PUT COS；COS 失败 → 抛错、事务不写 DB（现有 transaction 回滚）

- [ ] **Step 1:** 注入 `CosPackStorage`；在 `writeFile` 之后、`$transaction` 之前调用 `putObject`（或 transaction 内 COS 失败则整体失败）

- [ ] **Step 2:** `COS_ENABLED=false` 时保持现有仅本地磁盘行为

- [ ] **Step 3:** 集成测试：`COS_ENABLED=false` 现有 49 项仍绿；可选新增 vi.mock CosPackStorage 断言 PUT 被调用

```powershell
pnpm --filter @remember/api test:integration
```

- [ ] **Step 4:** Commit

```powershell
git commit -m "feat(api): upload admin pack versions to COS when enabled"
```

---

### Task 6: App 下载 presign（替换 mock-only 路径）

**Files:**

- Modify: `apps/api/src/pack-download/pack-download.service.ts`
- Modify: `apps/api/src/pack-download/pack-download.module.ts`
- Create: `apps/api/test/pack-download-cos.e2e.test.ts`

**Interfaces:**

- Consumes: `CosPackStorage.getPresignedDownloadUrl(version.cosObjectKey)`
- Produces: `downloadUrl` 为 HTTPS presigned URL（非 API proxy）

- [ ] **Step 1:** 重构 `createDownloadAuthorization`：

```typescript
// 伪代码 — 实施时写完整分支
if (this.packDownloadConfigService.readMockEnabled()) {
  // 现有 mock：downloadUrl → API /packs/:id/download?token=
} else if (readCosConfig().enabled) {
  const downloadUrl = await this.cosPackStorage.getPresignedDownloadUrl(version.cosObjectKey);
  return { packId, packVersion, sha256, sizeBytes, downloadUrl, offlineLicenseExpiresAt };
} else {
  throw new ServiceUnavailableException({ code: 'PACK_DOWNLOAD_NOT_CONFIGURED', ... });
}
```

- [ ] **Step 2:** `sha256` / `sizeBytes` 仍来自 DB 行（权威），不从 COS HEAD

- [ ] **Step 3:** 集成测试：mock Cos 返回固定 URL；`PACK_DOWNLOAD_MOCK_ENABLED=false` + `COS_ENABLED=true` 时响应 schema 合法

- [ ] **Step 4:** 全量 API 测试

```powershell
pnpm --filter @remember/api test
pnpm --filter @remember/api test:integration
```

- [ ] **Step 5:** Commit

```powershell
git commit -m "feat(api): presign COS URLs for production pack downloads"
```

---

### Task 7: 请求追踪 ID 与异常 filter

**Files:**

- Create: `apps/api/src/common/request-id.middleware.ts`
- Create: `apps/api/src/common/http-exception.filter.ts`
- Create: `apps/api/src/common/request-id.middleware.test.ts`
- Modify: `apps/api/src/main.ts`

**Interfaces:**

- Produces: 请求头 `X-Request-Id`（客户端传入则沿用，否则 UUID）；响应头回显；`HttpException` JSON body 增加 `requestId`

- [ ] **Step 1:** 中间件：`req.requestId = header ?? crypto.randomUUID()`；`res.setHeader('X-Request-Id', requestId)`

- [ ] **Step 2:** 全局 `HttpExceptionFilter`：`{ code, message, requestId }`

- [ ] **Step 3:** 单元/集成测试：带 `X-Request-Id: test-req-1` 请求 health，响应头一致

- [ ] **Step 4:** Commit

```powershell
git commit -m "feat(api): add X-Request-Id middleware and error filter"
```

---

### Task 8: Caddy 示例与 Admin 静态部署说明

**Files:**

- Create: `infra/prod/Caddyfile.example`
- Modify: `apps/admin/vite.config.ts`（生产 `base: '/'`，无需子路径）
- Create: `docs/runbooks/production-deploy.md`（Task 10 扩充；本 Task 先写 Caddy 段）

**Interfaces:**

- Produces: Caddy 三站点块模板

- [ ] **Step 1:** `infra/prod/Caddyfile.example`

```caddy
remember.wehub.top {
	root * /srv/remember-site
	encode gzip
	file_server
}

api.remember.wehub.top {
	encode gzip
	reverse_proxy 127.0.0.1:3000
}

admin.remember.wehub.top {
	root * /srv/remember-admin
	encode gzip
	file_server
	try_files {path} /index.html
}
```

staging 副本：改用 `api.staging.*` / `admin.staging.*` 或同文件注释块 + 不同端口（runbook 说明）。

- [ ] **Step 2:** Admin 构建与部署步骤写入 runbook 草稿：

```powershell
pnpm --filter @remember/admin build
# scp -r apps/admin/dist/* user@server:/srv/remember-admin/
```

- [ ] **Step 3:** Commit

```powershell
git add infra/prod/Caddyfile.example apps/admin/vite.config.ts docs/runbooks/production-deploy.md
git commit -m "docs(infra): add production Caddy example and admin static deploy notes"
```

---

### Task 9: PostgreSQL 备份与恢复脚本

**Files:**

- Create: `infra/prod/backup-db.ps1`
- Create: `infra/prod/restore-db.ps1`
- Create: `docs/runbooks/postgres-backup-restore.md`

**Interfaces:**

- Consumes: `COMPOSE_PROJECT_NAME`、`infra/prod/.env` 中 `POSTGRES_*`
- Produces: `artifacts/remember-{timestamp}.dump`（`-Fc`）；可选上传 `backups/postgres/{date}/remember.dump`

- [ ] **Step 1:** `backup-db.ps1` 核心：

```powershell
# 从运行中 postgres 容器 exec pg_dump
docker compose --project-name $ProjectName --env-file $EnvFile --file $ComposeFile `
  exec -T postgres pg_dump -Fc -U $PostgresUser $PostgresDb > $DumpPath
```

- [ ] **Step 2:** 可选 COS 上传段（读 `COS_*` 环境变量；用 Node 一行脚本或 `coscli`；文档化即可，密钥不进脚本）

- [ ] **Step 3:** `restore-db.ps1`：`docker compose stop api` → `pg_restore --clean --exit-on-error` → 核对计数 SQL：

```sql
SELECT 'orders' AS t, count(*) FROM orders
UNION ALL SELECT 'payment_events', count(*) FROM payment_events
UNION ALL SELECT 'pack_access', count(*) FROM pack_access;
```

- [ ] **Step 4:** 在 **staging** 人工演练 1 次，结果记录到 `postgres-backup-restore.md`

- [ ] **Step 5:** Commit

```powershell
git commit -m "infra: add postgres backup and restore scripts for production"
```

---

### Task 10: 部署 runbook 与 staging 门禁

**Files:**

- Create/Modify: `docs/runbooks/production-deploy.md`

**内容大纲（实施时写完整步骤）：**

1. 空机前提：Docker、Caddy、域名/DNS（或 staging IP）
2. 克隆仓库 / 拉取镜像 digest
3. 复制 `infra/prod/.env.example` → `.env`；填密钥；`node tools/scripts/validate-prod-env.mjs`
4. `docker compose up -d --build`；`curl /health`
5. `pnpm --filter @remember/api seed:dev-bootstrap`（仅 staging 首次）或 runbook 写 seed 命令
6. Admin build + scp + Caddy reload
7. 手机 `EXPO_PUBLIC_API_BASE_URL` 指向 staging API；走兑换 → 下载 → 学习
8. **批准上 prod**：复制 `.env` 模板、`COMPOSE_PROJECT_NAME=remember-prod`、新 DB volume、人工 checklist
9. **回滚**：`docker compose pull` 上一 tag / `up` 旧 digest

- [x] **Step 1:** 写完 runbook 全文

- [x] **Step 2:** 在 kickoff §8.1 相关项打勾（staging 可跑通）

- [ ] **Step 3:** Commit

```powershell
git commit -m "docs: add production deploy and postgres backup runbooks"
```

---

### Task 11: 全量检查与子计划验收

- [x] **Step 1:** `pnpm check`（2026-08-05 PASS）

- [ ] **Step 2:** staging 端到端（人工）：Admin 上传 zip → 发布 → App presign 下载 → 安装学习 — **defer 统一真机验收**

- [x] **Step 3:** 备份 + 恢复演练计数一致（ADR 0003，Task 9）

- [x] **Step 4:** 确认密钥未进入 Git（`pnpm check:secrets` PASS；`infra/prod/.env` gitignored）

- [x] **Step 5:** 更新 kickoff §3 / §8.1 进度

---

## 与子计划 1 / 3 的接口

| 子计划              | 接口                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **1 pack/App 更新** | 需要本子计划 staging `API_PUBLIC_BASE_URL`；`currentVersion` 与 presign 下载在 staging 验证 |
| **3 RC 清单**       | 引用 `production-deploy.md` staging URL、备份 runbook、请求 ID 日志格式                     |

---

## 验收清单（本子计划 Done）

- [x] `infra/prod` Compose 一键 up；`/api/v1/health` OK
- [x] `validate-prod-env.mjs` 缺变量失败、完整 env 通过
- [ ] staging：Admin 上传 → 发布 → App COS presign 下载 → 安装学习 — **defer 真机**
- [x] `pg_dump` + ADR 0003 恢复到空库，商业表计数一致
- [x] 响应含 `X-Request-Id`（staging API 重建后验证）
- [x] `pnpm check` 全绿
- [x] 密钥未进 Git/APK（secretlint PASS）

## Defer（Pause / P1）

- [ ] 真实微信付/退（Pause C/D）
- [ ] 腾讯云 SMS 生产模板
- [ ] COS CDN、多环境分桶
- [ ] CI 自动部署生产

---

## Self-Review（计划自检）

| kickoff 要求              | 对应 Task          |
| ------------------------- | ------------------ |
| Compose + Caddy           | 1, 2, 8            |
| env 校验                  | 3                  |
| COS 私有桶 pack           | 4, 5, 6            |
| pg_dump 备份恢复          | 9                  |
| X-Request-Id + 结构化日志 | 7                  |
| staging → 人工批准 prod   | 8, 10              |
| 不做 K8s/APM/CI 生产      | Global Constraints |

无 TBD 占位；Task 边界可独立 review。

---

**Plan complete.** 实施选项：

1. **Subagent-Driven（推荐）** — 每 Task 独立 subagent + 任务间 review
2. **Inline Execution** — 本会话按 Task 0→11 逐步执行，每步 `pnpm check`
