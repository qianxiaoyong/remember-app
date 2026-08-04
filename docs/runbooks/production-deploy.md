# 记得生产部署 Runbook（阶段 8）

日期：2026-08-04  
范围：单机腾讯云轻量 + Docker Compose + Caddy HTTPS  
状态：**进行中**（Task 8 骨架；Task 9–10 将补充备份与完整空机步骤）

相关文档：

- [介绍站部署](./deploy-remember-site.md)
- [本地 API Docker 开发](./local-api-docker-dev.md)
- [PostgreSQL 备份恢复](./postgres-backup-restore.md)（Task 9 创建）
- 子计划：`docs/superpowers/plans/2026-08-04-phase8-production-deployment.md`

---

## 1. 拓扑概览

```text
用户 / 运营浏览器
    │
    ├─ remember.wehub.top        → /srv/remember-site（静态介绍站）
    ├─ api.remember.wehub.top    → 127.0.0.1:3000（Compose api 容器）
    └─ admin.remember.wehub.top  → /srv/remember-admin + /api 反代到 3000

Compose（infra/prod/）
    postgres:18.4-bookworm + api 镜像
    数据卷：postgres-data、pack-storage
```

**staging / prod：** 同机两套 Compose project（`remember-staging` / `remember-prod`），不同 `.env`、端口与 Caddy 子域。详见下文 §5。

---

## 2. 前置条件

| 项 | 说明 |
| --- | --- |
| 服务器 | 腾讯云轻量，已装 Docker、Caddy |
| 备案 | 大陆 HTTPS 需 ICP；未备案前可用 IP + 自签仅内网联调 |
| DNS | `remember` / `api` / `admin` A 记录 → 服务器公网 IP |
| 密钥 | `infra/prod/.env` 仅放服务器；不进 Git |
| 校验 | `node tools/scripts/validate-prod-env.mjs infra/prod/.env` |

---

## 3. Caddy 配置

1. 复制 `infra/prod/Caddyfile.example` 到服务器 Caddy 配置（或 `include` 引入）。
2. 准备静态目录：
   - `/srv/remember-site` — 见 [deploy-remember-site.md](./deploy-remember-site.md)
   - `/srv/remember-admin` — 见 §4
3. 确认 Compose API 只监听 **`127.0.0.1:3000`**（prod）；staging 可用 `3001`。
4. 重载 Caddy：

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

5. 验收：

```bash
curl -I https://remember.wehub.top/
curl -I https://api.remember.wehub.top/api/v1/health
curl -I https://admin.remember.wehub.top/
```

---

## 4. Admin 静态构建与部署

Admin **不**在 Compose 内跑 dev server；构建 `dist/` 后由 Caddy 托管。

### 4.1 本地构建

```powershell
cd D:\AIcoder\remember-app
pnpm install
pnpm --filter @remember/admin build
```

产物：`apps/admin/dist/`。

**API 地址：** `admin.remember.wehub.top` 的 Caddy 已将 `/api/*` 反代到本机 API（与 dev Vite 代理一致），**无需**设置 `VITE_API_BASE_URL`。若 Admin 与 API 不同机或不用反代，构建前在 `apps/admin/.env` 设置：

```text
VITE_API_BASE_URL=https://api.remember.wehub.top
```

### 4.2 上传到服务器

```powershell
# 示例：scp 到 /srv/remember-admin（替换 user@host）
scp -r apps/admin/dist/* user@your-server:/srv/remember-admin/
```

staging 使用独立目录，例如 `/srv/remember-admin-staging`，与 `Caddyfile.example` 注释块对应。

### 4.3 验收

1. 浏览器打开 `https://admin.remember.wehub.top`
2. 使用 bootstrap 管理员登录（见 `infra/prod/.env` 的 `ADMIN_BOOTSTRAP_*`）
3. 驾驶舱可加载、无 CORS 报错

---

## 5. staging 与 prod（同机双 Compose）

| 项 | staging | prod |
| --- | --- | --- |
| Compose project | `remember-staging` | `remember-prod` |
| env 文件 | `infra/prod/.env.staging` | `infra/prod/.env.prod` |
| `API_HOST_PORT` | `3001` | `3000` |
| `NODE_ENV` | `staging` | `production` |
| mock SMS/付 | 允许 | prod 关闭 mock SMS |
| Caddy | `*.staging.remember.wehub.top` | 正式子域 |

启动 staging 示例：

```powershell
copy infra\prod\.env.example infra\prod\.env.staging
# 编辑填密码与 peppers
node tools/scripts/validate-prod-env.mjs infra/prod/.env.staging

docker compose --project-name remember-staging `
  --env-file infra/prod/.env.staging `
  --file infra/prod/compose.yaml up -d --build
```

---

## 6. API Compose 启动（摘要）

完整空机步骤在 Task 10 扩充；当前最小路径：

```powershell
node tools/scripts/validate-prod-env.mjs infra/prod/.env
docker compose --project-name remember-staging --env-file infra/prod/.env --file infra/prod/compose.yaml up -d --build
curl http://127.0.0.1:3000/api/v1/health
```

---

## 7. 相关

- Compose 模板：`infra/prod/compose.yaml`
- 环境样例：`infra/prod/.env.example`
- Android APK / 实机联调：见 [local-api-docker-dev.md](./local-api-docker-dev.md) §4

---

## 8. 待 Task 9–10 补充

- [ ] `pg_dump` 备份与 ADR 0003 恢复演练
- [ ] 空机到 prod 批准流程、镜像 digest 记录与回滚
- [ ] COS 生产密钥与 `PACK_DOWNLOAD_MOCK_ENABLED=false` 验收
