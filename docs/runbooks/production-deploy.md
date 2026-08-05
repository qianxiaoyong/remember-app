# 记得生产部署 Runbook（阶段 8）

日期：2026-08-04  
范围：单机腾讯云轻量 + Docker Compose + Caddy HTTPS  
状态：**Task 11 门禁完成**（`pnpm check` 全绿；真机 E2E defer 统一验收）

相关文档：

- [介绍站部署](./deploy-remember-site.md)
- [本地 API Docker 开发](./local-api-docker-dev.md)
- [PostgreSQL 备份恢复](./postgres-backup-restore.md)
- [Pack 更新 RC](./pack-update-rc.md)
- [RC 验收清单](./release-candidate-checklist.md)
- 子计划：`docs/superpowers/plans/2026-08-04-phase8-production-deployment.md`

---

## 1. 拓扑概览

```text
用户 / 运营浏览器
    │
    ├─ remember.wehub.top              → /srv/remember-site（静态介绍站）
    ├─ api.remember.wehub.top          → 127.0.0.1:3000（prod Compose api）
    ├─ admin.remember.wehub.top        → /srv/remember-admin + /api 反代
    │
    ├─ api.staging.remember.wehub.top  → 127.0.0.1:3001（staging Compose api）
    └─ admin.staging.remember.wehub.top → /srv/remember-admin-staging + /api 反代

Compose（infra/prod/）
    postgres:18.4-bookworm + api 镜像（monorepo build）
    数据卷：{project}-postgres-data、{project}-pack-storage

COS（单桶双前缀）
    packs/{packId}/{version}/pack.zip
    backups/postgres/{YYYY-MM-DD}/remember.dump
```

**staging / prod：** 同机两套 Compose project（`remember-staging` / `remember-prod`），独立 `.env`、端口、数据卷与 Caddy 子域。

---

## 2. 空机前提

| 项         | 要求                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| 服务器     | 腾讯云轻量；建议 2 vCPU / 4 GB+；系统盘留足 pack 与 DB 空间             |
| Docker     | Docker Engine 24+ 与 Compose v2（`docker compose version`）             |
| Caddy      | Caddy 2.x，systemd 托管；配置目录如 `/etc/caddy/`                       |
| 备案 / DNS | 大陆 HTTPS 需 ICP；A 记录指向公网 IP（见 §2.1）                         |
| 运维机     | Windows 或 Linux，已装 Node 22 + pnpm 10.33.2（Admin 构建、seed、校验） |
| 密钥       | 仅服务器 `infra/prod/.env.*` + 离线备份；**不进 Git / APK**             |
| 腾讯云 COS | 私有桶 + API 密钥（staging 可 mock 下载；prod 发版需 COS）              |

### 2.1 DNS 示例

| 记录                               | 指向            |
| ---------------------------------- | --------------- |
| `remember.wehub.top`               | 服务器公网 IP   |
| `api.remember.wehub.top`           | 同上            |
| `admin.remember.wehub.top`         | 同上            |
| `api.staging.remember.wehub.top`   | 同上（staging） |
| `admin.staging.remember.wehub.top` | 同上（staging） |

未备案前：可用本机 `127.0.0.1` + 端口做 Compose 验收；Caddy HTTPS 与公网域名待备案后启用。

### 2.2 防火墙

- 公网仅开放 **80 / 443**（Caddy）
- Compose API **只绑定** `127.0.0.1`（见 `infra/prod/compose.yaml`），勿映射 PG 到公网

---

## 3. 克隆与镜像记录

在服务器（或 CI 产物机）：

```bash
git clone https://github.com/YOUR_ORG/remember-app.git /opt/remember-app
cd /opt/remember-app
git checkout feat/phase8-release   # 发布时换为 tag，如 v0.8.0-rc1
git log -1 --oneline
```

**记录 digest（回滚用）：** 每次 `--build` 或 `pull` 后保存：

```bash
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml images --format json

# 或构建后：
docker inspect remember-staging-api-1 --format '{{.Image}}'
```

将 **git commit SHA** 与 **api 镜像 ID** 写入发布记录（Issue / RC 清单 §6）。

---

## 4. 环境配置与校验

### 4.1 复制 env

**staging：**

```powershell
cd D:\AIcoder\remember-app   # 或服务器 /opt/remember-app
copy infra\prod\.env.example infra\prod\.env.staging
```

**prod（批准上正式后）：**

```powershell
copy infra\prod\.env.example infra\prod\.env.prod
```

### 4.2 必填项（编辑 `.env.staging` / `.env.prod`）

| 变量                              | staging 建议                                            | prod 建议                          |
| --------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| `COMPOSE_PROJECT_NAME`            | `remember-staging`                                      | `remember-prod`                    |
| `POSTGRES_PASSWORD`               | 强密码（与 prod **不同**）                              | 强密码                             |
| `API_HOST_PORT`                   | `3001`                                                  | `3000`                             |
| `NODE_ENV`                        | `staging`                                               | `production`                       |
| `DATABASE_URL`                    | `postgresql://remember:PASSWORD@postgres:5432/remember` | 同上（密码与上表一致）             |
| `API_PUBLIC_BASE_URL`             | `https://api.staging.remember.wehub.top`                | `https://api.remember.wehub.top`   |
| `AUTH_PHONE_PEPPER` 等三个 pepper | 随机 32+ 字节 hex                                       | **全新** pepper，勿复用 staging    |
| `SMS_MOCK_ENABLED`                | `true`                                                  | `false`（需腾讯云 SMS 模板）       |
| `WECHAT_PAY_MOCK_ENABLED`         | `true`                                                  | `true`（Pause C/D 解除前）         |
| `PACK_DOWNLOAD_MOCK_ENABLED`      | `true`（无 COS 时）                                     | `false`（需 COS）                  |
| `COS_ENABLED`                     | `false` 或 `true`                                       | `true`（mock 下载关闭时 **必填**） |
| `ADMIN_BOOTSTRAP_*`               | staging 管理员                                          | prod 独立账号                      |

### 4.3 启动前校验

```powershell
node tools/scripts/validate-prod-env.mjs infra/prod/.env.staging
# 或
pnpm check:prod-env -- infra/prod/.env.staging
```

缺变量或 prod 规则违规（如 `SMS_MOCK_ENABLED=true` + `NODE_ENV=production`）会 **exit 1**。

---

## 5. Staging 首次部署

### 5.1 启动 Compose

```powershell
cd D:\AIcoder\remember-app

docker compose --project-name remember-staging `
  --env-file infra/prod/.env.staging `
  --file infra/prod/compose.yaml up -d --build
```

容器 `api` 启动时会自动执行 `prisma migrate deploy`（见 `infra/prod/docker-entrypoint.sh`）。

### 5.2 健康检查

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/v1/health
# 期望：{ "status": "ok" }
```

经 Caddy 后：

```bash
curl -s https://api.staging.remember.wehub.top/api/v1/health
```

### 5.3 首次 seed（catalog + 管理员 + 测试兑换码）

Postgres **默认不映射**宿主机端口。在 **已 clone 仓库且已 `pnpm install` 的机器**上，用容器 IP 连接：

**PowerShell（Windows / Docker Desktop）：**

```powershell
$project = "remember-staging"
$envFile = "infra/prod/.env.staging"

# 读取 .env 中的变量（示例：手动设置或 dot-source）
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
    Set-Item -Path "env:$($matches[1])" -Value $matches[2]
  }
}

$pgContainer = docker ps --filter "name=${project}-postgres" --format "{{.Names}}" | Select-Object -First 1
$pgIp = docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" $pgContainer
$env:DATABASE_URL = "postgresql://${env:POSTGRES_USER}:${env:POSTGRES_PASSWORD}@${pgIp}:5432/${env:POSTGRES_DB}"

pnpm --filter @remember/api seed:dev-bootstrap
```

**Linux（服务器本机）：**

```bash
set -a && source infra/prod/.env.staging && set +a
PG_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' remember-staging-postgres-1)
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_IP}:5432/${POSTGRES_DB}"
pnpm --filter @remember/api seed:dev-bootstrap
```

**写入内容：**

- 目录 pack：`remember-test-pack`、`demo-primary-grade3`（已发布 1.0.0）
- 管理员：`ADMIN_BOOTSTRAP_LOGIN_NAME` / `ADMIN_BOOTSTRAP_PASSWORD`
- 兑换码：`TEST-REDEEM-001`、`TEST-REDEEM-GRADE3`

**仅 staging 首次执行**；重复执行 upsert，安全但会重置 bootstrap 密码 hash。

### 5.4 日志与请求 ID

```powershell
docker compose --project-name remember-staging --env-file infra/prod/.env.staging --file infra/prod/compose.yaml logs -f api
```

对外响应应含 `X-Request-Id`；错误 JSON 含 `requestId`（Task 7）。

---

## 6. Caddy 配置

1. 复制 `infra/prod/Caddyfile.example` 到服务器（或 `import` 进 `/etc/caddy/Caddyfile`）。
2. 取消注释 **staging** 块，端口与 Compose 一致（staging API → `127.0.0.1:3001`）。
3. 静态目录：
   - `/srv/remember-site` — [deploy-remember-site.md](./deploy-remember-site.md)
   - `/srv/remember-admin` — prod Admin（§7）
   - `/srv/remember-admin-staging` — staging Admin
4. 校验并重载：

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

5. 验收：

```bash
curl -I https://remember.wehub.top/
curl -s https://api.staging.remember.wehub.top/api/v1/health
curl -I https://admin.staging.remember.wehub.top/
```

---

## 7. Admin 静态构建与部署

Admin **不在** Compose 内跑 dev server；构建 `dist/` 后由 Caddy 托管。

### 7.1 本地构建

```powershell
cd D:\AIcoder\remember-app
pnpm install
pnpm --filter @remember/admin build
```

产物：`apps/admin/dist/`。

**API 地址：** `admin.*.remember.wehub.top` 的 Caddy 已将 `/api/*` 反代到本机 API，**通常无需** `VITE_API_BASE_URL`。若 Admin 与 API 不同机：

```text
VITE_API_BASE_URL=https://api.staging.remember.wehub.top
```

### 7.2 上传到服务器

```powershell
scp -r apps/admin/dist/* user@your-server:/srv/remember-admin-staging/
# prod：/srv/remember-admin/
```

### 7.3 验收

1. 打开 `https://admin.staging.remember.wehub.top`
2. 使用 `ADMIN_BOOTSTRAP_*` 登录
3. 驾驶舱加载正常、无 CORS 报错
4. **发版链路（Task 11 完整验）：** 上传 zip → 发布 → App 下载安装

---

## 8. 手机联调（staging）

1. 使用 **release 或 preview APK**（见 [android-release-build-windows.md](./android-release-build-windows.md)）。
2. 构建时指向 staging API：

```text
EXPO_PUBLIC_API_BASE_URL=https://api.staging.remember.wehub.top
```

3. 登录：staging 下 `SMS_MOCK_ENABLED=true`，验证码 **`000000`**。
4. 走通：**兑换码**（`TEST-REDEEM-001`）→ **下载 pack** → **学习**。
5. `PACK_DOWNLOAD_MOCK_ENABLED=true` 时走 API mock 下载；关闭 mock 后需 COS（§9）。

---

## 9. COS 生产配置

当 `PACK_DOWNLOAD_MOCK_ENABLED=false` 且 `NODE_ENV=production` 时，**必须** `COS_ENABLED=true` 且填齐 `COS_*`（校验脚本会拦截）。

| 步骤 | 操作                                                             |
| ---- | ---------------------------------------------------------------- |
| 1    | 腾讯云创建 **私有** 桶；记录 `region`、`bucket`                  |
| 2    | 子账号密钥写入 `.env.prod`（`COS_SECRET_ID` / `COS_SECRET_KEY`） |
| 3    | `COS_ENABLED=true`，`PACK_DOWNLOAD_MOCK_ENABLED=false`           |
| 4    | `validate-prod-env.mjs` 通过 → `docker compose ... up -d`        |
| 5    | Admin 上传 zip → API PUT 到 `packs/{packId}/{version}/pack.zip`  |
| 6    | App 授权下载应返回 **presigned HTTPS URL**（非 mock 本地路径）   |

**验收：**

```powershell
# 关闭 mock 后，集成测试参考 apps/api/test/pack-download-cos.e2e.test.ts
pnpm --filter @remember/api test:integration
```

备份前缀：`backups/postgres/{date}/` — 见 [postgres-backup-restore.md](./postgres-backup-restore.md) §3.1。

---

## 10. 批准上 prod（人工 checklist）

在 staging 端到端通过后，**单独会话**执行：

- [ ] RC / 子计划 1 pack 更新验证完成（或已知风险已记录）
- [ ] `infra/prod/.env.prod` 已从 example 复制，**全新** DB 密码与 peppers
- [ ] `COMPOSE_PROJECT_NAME=remember-prod`，`API_HOST_PORT=3000`
- [ ] `NODE_ENV=production`，`SMS_MOCK_ENABLED=false`（或 Pause 矩阵允许项）
- [ ] `validate-prod-env.mjs infra/prod/.env.prod` 通过
- [ ] **勿**复制 staging 的 Docker volume；prod 使用独立卷（首次 `up` 自动创建）
- [ ] Caddy prod 块指向 `127.0.0.1:3000`；Admin 部署到 `/srv/remember-admin`
- [ ] 记录 git tag + api 镜像 digest
- [ ] **prod 不做** `seed:dev-bootstrap`（除非内测期故意写入测试 catalog；正式 catalog 走 Admin）

```powershell
docker compose --project-name remember-prod `
  --env-file infra/prod/.env.prod `
  --file infra/prod/compose.yaml up -d --build

Invoke-RestMethod http://127.0.0.1:3000/api/v1/health
```

---

## 11. 回滚

### 11.1 API 镜像回滚

```powershell
# 1. 检出上一发布 tag
git checkout v0.8.0-previous

# 2. 重建并强制重建容器
docker compose --project-name remember-prod `
  --env-file infra/prod/.env.prod `
  --file infra/prod/compose.yaml up -d --build --force-recreate api

# 3. 验证 health
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health
```

若使用 registry 镜像而非本地 build：

```bash
docker compose pull api
docker compose up -d api
```

### 11.2 Admin 静态回滚

保留上一版 `dist/` tarball；`scp` 覆盖 `/srv/remember-admin/` 即可，无需重启 Compose。

### 11.3 数据库回滚

**无自动 down migration。** 仅：

- 从 [postgres-backup-restore.md](./postgres-backup-restore.md) 的 dump **恢复到 staging 演练**
- prod 误操作：停 api → `restore-db.ps1` → 核对商业表计数 → 启 api

---

## 12. 日常运维摘要

| 操作              | 命令 / 文档                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| 查看状态          | `docker compose --project-name remember-staging --env-file infra/prod/.env.staging -f infra/prod/compose.yaml ps` |
| 重启 api          | `... compose restart api`                                                                                         |
| 备份 DB           | `infra/prod/backup-db.ps1 -EnvFile infra/prod/.env.prod`                                                          |
| 恢复 DB（破坏性） | `infra/prod/restore-db.ps1 -DumpPath ... -Force`                                                                  |
| env 校验          | `pnpm check:prod-env -- infra/prod/.env.prod`                                                                     |

---

## 13. staging / prod 对照表

| 项                 | staging                       | prod                   |
| ------------------ | ----------------------------- | ---------------------- |
| Compose project    | `remember-staging`            | `remember-prod`        |
| env 文件           | `infra/prod/.env.staging`     | `infra/prod/.env.prod` |
| `API_HOST_PORT`    | `3001`                        | `3000`                 |
| `NODE_ENV`         | `staging`                     | `production`           |
| mock SMS / 付      | 允许                          | SMS mock 禁止          |
| pack 下载          | 可 mock                       | COS presign            |
| seed:dev-bootstrap | 首次                          | 否（Admin 录入）       |
| Admin 目录         | `/srv/remember-admin-staging` | `/srv/remember-admin`  |

---

## 14. 阶段 8 文档完成情况

| 项                                 | 状态                                    |
| ---------------------------------- | --------------------------------------- |
| Compose + `.env.example`           | ✅                                      |
| `validate-prod-env.mjs`            | ✅                                      |
| Caddy 示例 + Admin 部署            | ✅                                      |
| 备份 / 恢复 runbook + staging 演练 | ✅（2026-08-04）                        |
| 空机 → staging → prod / 回滚       | ✅ 本文                                 |
| COS presign 端到端                 | ⏸ defer 统一真机验收                    |
| RC 真机清单                        | ✅ runbook 就绪；P0 勾选 defer 统一验收 |
| `pnpm check`                       | ✅ 2026-08-05                           |
| `X-Request-Id`                     | ✅ staging API 重建后                   |

---

## 15. 相关文件

- Compose：`infra/prod/compose.yaml`
- 环境样例：`infra/prod/.env.example`
- Caddy 示例：`infra/prod/Caddyfile.example`
- 备份脚本：`infra/prod/backup-db.ps1`、`infra/prod/restore-db.ps1`
- Android APK：[android-release-build-windows.md](./android-release-build-windows.md)
