# Staging API 部署指南（零基础逐步版）

日期：2026-08-05  
适用对象：已完成介绍站部署、第一次部署后端 API 的维护者  
Staging API URL：`https://api.staging.remember.wehub.top/`  
源码与配置：`/opt/remember-app`（服务器）、`infra/prod/`（Compose + env）

> 前置：介绍站见 [deploy-remember-site-beginner.md](./deploy-remember-site-beginner.md)。  
> 精简版 / Admin / seed / prod：见 [production-deploy.md](./production-deploy.md)。

---

## 1. 这套流程在做什么？

Staging API 是 **测试环境后端**：同一台服务器上跑 **PostgreSQL + NestJS API**，给 Admin 运营后台和手机 App 联调用。与正式 Production **数据隔离**（独立数据库卷、独立 `.env`）。

```text
  用户 / 手机 App / Admin 浏览器
              │
              ▼ HTTPS :443
         ┌─────────┐
         │  Caddy  │  api.staging.remember.wehub.top
         └────┬────┘
              │ 反代到本机 127.0.0.1:3001
              ▼
    ┌─────────────────────┐
    │ Docker Compose      │
    │  remember-staging   │
    │  ├─ api  (NestJS)   │  容器内监听 PORT=3000
    │  └─ postgres        │
    └─────────────────────┘
```

| 组件 | 作用 |
|------|------|
| **DNS** | `api.staging.remember.wehub.top` → 服务器公网 IP |
| **Docker Compose** | 一键启动 API + 数据库两个容器 |
| **`.env.staging`** | 密码、pepper、mock 开关等（**不进 Git**） |
| **Caddy** | 公网 HTTPS → 本机 `127.0.0.1:3001` |
| **`API_HOST_PORT=3001`** | 宿主机端口（给 Caddy 连） |
| **`PORT=3000`** | 容器内 API 监听端口（**不要改成 3001**） |

---

## 2. 部署前准备

| 项 | 要求 |
|----|------|
| 介绍站 | 已部署（可选，但建议先完成） |
| ICP 备案 | 大陆 HTTPS 需要 |
| 服务器 | 建议 2 vCPU / 4 GB+；已装 **Docker**、**Caddy** |
| 防火墙 | 公网仅 **80 / 443**；**不要**把 3001、5432 暴露到公网 |
| 本地 Windows | 有完整仓库；用于 `git archive` 打 zip |
| 登录方式 | 腾讯云 **OrcaTerm**（网页终端 + 文件上传） |

### 2.1 OrcaTerm 是什么？

腾讯云轻量控制台 → 实例 → **登录** 打开的网页终端。  
左侧 **文件夹图标** = 文件管理（上传 zip、静态文件）。  
你在介绍站部署时已用过，Staging 沿用同一方式。

---

## 3. 分阶段部署（实际操作顺序）

### 阶段 A：添加 Staging DNS

在 **DNSPod → wehub.top → 权威解析** 新增 **2 条 A 记录**：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `api.staging.remember` | A | 服务器公网 IP（如 `124.222.186.13`） |
| `admin.staging.remember` | A | 同上（Admin 下一阶段用） |

完整域名示例：`api.staging.remember.wehub.top`

**在服务器上验证（推荐）：**

```bash
nslookup api.staging.remember.wehub.top
nslookup admin.staging.remember.wehub.top
```

应返回你的公网 IP。

> **坑：** 本机 Windows 若开 Clash/V2Ray，`nslookup` 可能返回 `198.18.0.x`（fake-ip），**不能**据此判断。以 **服务器 nslookup** 或 DNSPod **生效检测** 为准。

---

### 阶段 B：确认 Docker 已安装

```bash
docker --version
docker compose version
```

期望：Docker 24+、Compose v2.x。

| 命令 | 中文解释 |
|------|----------|
| `docker --version` | 查看 Docker 引擎版本 |
| `docker compose version` | 查看 Compose 插件版本（V2 用 `docker compose`，不是旧版 `docker-compose`） |

---

### 阶段 C：把代码弄到服务器

#### 方式 1：git clone（理想情况）

```bash
sudo mkdir -p /opt
sudo chown ubuntu:ubuntu /opt
git clone https://github.com/qianxiaoyong/remember-app.git /opt/remember-app
cd /opt/remember-app
git checkout feat/phase8-release   # 或当前发布分支
```

#### 方式 2：本机打 zip + OrcaTerm 上传（国内服务器常见）

服务器访问 GitHub 超时时用此方式。

**在你 Windows 电脑 PowerShell：**

```powershell
cd d:\AIcoder\remember-app
git archive -o d:\remember-app.zip feat/phase8-release
```

**OrcaTerm 文件管理：** 上传 `remember-app.zip` 到 `/opt/`。

**在服务器终端：**

```bash
sudo apt install -y unzip
mkdir -p /opt/remember-app
unzip -o /opt/remember-app.zip -d /opt/remember-app
ls /opt/remember-app/infra/prod/
```

应看到 `compose.yaml`、`.env.example` 等。

| 命令 | 中文解释 |
|------|----------|
| `git archive` | 只打包 Git 跟踪的文件，不含 `node_modules` |
| `unzip -o ... -d ...` | 解压并覆盖已有文件 |

> **坑：** `git clone` 报 `Failed to connect to github.com port 443` → 用 zip 上传，不是配置写错。

---

### 阶段 D：Docker 权限（ubuntu 用户）

若 `docker compose` 报 `permission denied ... docker.sock`：

```bash
sudo usermod -aG docker ubuntu
newgrp docker
docker ps
```

| 命令 | 中文解释 |
|------|----------|
| `usermod -aG docker ubuntu` | 把用户加入 `docker` 组 |
| `newgrp docker` | 当前会话立即生效（否则需重新登录 OrcaTerm） |

仍不行则 **关闭 OrcaTerm 重新登录**，或临时 `sudo docker compose ...`（不推荐长期）。

---

### 阶段 E：创建 `.env.staging`

```bash
cd /opt/remember-app/infra/prod
cp .env.example .env.staging
```

**生成 4 组随机密钥：**

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)"
echo "AUTH_PHONE_PEPPER=$(openssl rand -hex 32)"
echo "REDEMPTION_CODE_PEPPER=$(openssl rand -hex 32)"
echo "PACK_DOWNLOAD_TOKEN_PEPPER=$(openssl rand -hex 32)"
```

把输出**复制到 Windows 记事本**备用，然后：

```bash
nano .env.staging
```

**必填项对照表：**

| 变量 | Staging 填法 |
|------|----------------|
| `COMPOSE_PROJECT_NAME` | `remember-staging` |
| `POSTGRES_PASSWORD` | 上一步生成的密码 |
| `API_HOST_PORT` | **`3001`** |
| `PORT` | **`3000`**（容器内监听，勿与上一行混淆） |
| `DATABASE_URL` | `postgresql://remember:同上密码@postgres:5432/remember` |
| `NODE_ENV` | `staging` |
| `API_PUBLIC_BASE_URL` | `https://api.staging.remember.wehub.top` |
| 三个 `*_PEPPER` | 上一步生成的 hex |
| `SMS_MOCK_ENABLED` | `true` |
| `WECHAT_PAY_MOCK_ENABLED` | `true` |
| `PACK_DOWNLOAD_MOCK_ENABLED` | `true` |
| `COS_ENABLED` | `false` |
| `ADMIN_BOOTSTRAP_LOGIN_NAME` | 自定，如 `admin` |
| `ADMIN_BOOTSTRAP_PASSWORD` | 自定强密码（牢记，Admin 登录用） |

保存：`Ctrl+O` → Enter → `Ctrl+X`。

**Compose 的 api 服务读 `infra/prod/.env`，需同步一份：**

```bash
cp .env.staging .env
```

| 命令 | 中文解释 |
|------|----------|
| `cp .env.staging .env` | Compose 里 `env_file: .env` 指向此文件 |
| `nano` | 服务器上的文本编辑器 |

> **坑 1：** `DATABASE_URL=DATABASE_URL=postgresql://...` 多写一遍变量名 → Prisma 报 `URL must start with postgresql://`。只保留 **一个** `DATABASE_URL=`。  
> **坑 2：** 行首多空格（` PORT=3000`）→ Docker 可能读不到变量。每行应 **`KEY=value` 顶格写**。  
> **坑 3：** 用 `sed -i 's/\r$//'` 去掉 Windows 换行符：`sed -i 's/\r$//' .env.staging .env`

---

### 阶段 F：修复 entrypoint 换行符并构建

代码从 Windows zip 上传时，`docker-entrypoint.sh` 可能带 **CRLF**，容器报：

```text
exec /entrypoint.sh: no such file or directory
```

**在构建前执行：**

```bash
sed -i 's/\r$//' /opt/remember-app/infra/prod/docker-entrypoint.sh
```

**启动 Compose（首次会较久，约 10～20 分钟）：**

```bash
cd /opt/remember-app
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml up -d --build
```

| 参数 | 中文解释 |
|------|----------|
| `--project-name remember-staging` | 容器/网络/卷前缀，与 prod 隔离 |
| `--env-file infra/prod/.env.staging` | 供 Compose 替换 `${API_HOST_PORT}` 等 |
| `--file infra/prod/compose.yaml` | 服务定义（postgres + api） |
| `up -d --build` | 后台启动并构建 API 镜像 |

仅重建 API：

```bash
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml up -d --build api
```

---

### 阶段 G：健康检查

**等 30～60 秒**（entrypoint 内会跑 `prisma migrate deploy`），再测：

```bash
curl -s -w "\nHTTP_CODE:%{http_code}\n" http://127.0.0.1:3001/api/v1/health
```

期望：

```text
{"status":"ok"}
HTTP_CODE:200
```

**容器内验证（无 wget 时用 Node）：**

```bash
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml exec api \
  node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(async r=>console.log(r.status,await r.text()))"
```

查看状态：

```bash
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml ps
```

期望 PORTS 列：`127.0.0.1:3001->3000/tcp`，postgres `healthy`。

查看 API 日志：

```bash
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml logs api --tail 40
```

期望含：`Nest application successfully started`。

| 命令 | 中文解释 |
|------|----------|
| `curl -s` | 静默模式，只输出 body |
| `-w "\nHTTP_CODE:%{http_code}\n"` | 额外打印 HTTP 状态码 |
| `HTTP_CODE:000` | **完全连不上**（多等一会或见下方坑） |
| `exec api node -e ...` | 在 api 容器内执行 Node 一行脚本 |

> **坑：** 容器刚 `Started` 立刻 curl → `HTTP_CODE:000`，API 还在迁移数据库。等半分钟再试。  
> **坑：** `curl -s` 返回 `{"status":"ok"}` 但和提示符粘在一行，是 **JSON 末尾无换行**，不是失败。  
> **坑：** 容器内应测 **`3000`**，不是 `3001`（3001 是宿主机映射端口）。

---

### 阶段 H：Caddy HTTPS 反代

编辑 Caddy 配置：

```bash
sudo nano /etc/caddy/Caddyfile
```

在末尾追加：

```caddy
api.staging.remember.wehub.top {
	encode gzip
	reverse_proxy 127.0.0.1:3001
}
```

重载：

```bash
sudo systemctl reload caddy
```

公网验收：

```bash
curl -s https://api.staging.remember.wehub.top/api/v1/health
```

期望：`{"status":"ok"}`。

| 配置 | 中文解释 |
|------|----------|
| `reverse_proxy 127.0.0.1:3001` | HTTPS 请求转发到本机 Docker 映射端口 |
| `127.0.0.1` | 仅本机可直连 API，公网必须走 Caddy |

---

## 4. 命令速查表

| 命令 | 在哪里 | 一句话 |
|------|--------|--------|
| `nslookup api.staging.remember.wehub.top` | 服务器 | 验证 DNS |
| `git archive -o remember-app.zip BRANCH` | 本机 | 打包源码 |
| `sed -i 's/\r$//' infra/prod/docker-entrypoint.sh` | 服务器 | 修复 CRLF |
| `cp .env.example .env.staging` | 服务器 | 创建环境配置 |
| `cp .env.staging .env` | 服务器 | 给 Compose api 服务用 |
| `docker compose ... up -d --build` | 服务器 | 构建并启动 |
| `docker compose ... ps` | 服务器 | 查看容器状态 |
| `docker compose ... logs api --tail 40` | 服务器 | 查看 API 日志 |
| `curl -s http://127.0.0.1:3001/api/v1/health` | 服务器 | 本机健康检查 |
| `curl -s https://api.staging.remember.wehub.top/api/v1/health` | 任意 | 公网健康检查 |
| `sudo systemctl reload caddy` | 服务器 | 应用 Caddy 配置 |

**完整 compose 前缀（后文缩写为 `$DC`）：**

```bash
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml
```

---

## 5. 踩坑汇总（本次实录）

| # | 现象 | 原因 | 处理 |
|---|------|------|------|
| 1 | `git clone` 连接 GitHub 443 超时 | 国内服务器访问 GitHub 不稳定 | 本机 `git archive` + OrcaTerm 上传 zip |
| 2 | `permission denied` docker.sock | ubuntu 不在 docker 组 | `usermod -aG docker ubuntu` + `newgrp docker` |
| 3 | `exec /entrypoint.sh: no such file or directory` | `docker-entrypoint.sh` 为 CRLF | `sed -i 's/\r$//'` 后 `--build api` |
| 4 | Prisma `URL must start with postgresql://` | `DATABASE_URL=DATABASE_URL=postgresql://...` 重复 | 改成单个 `DATABASE_URL=postgresql://...` |
| 5 | `HTTP_CODE:000` | API 尚在 `prisma migrate`；或刚 recreate | 等 30～60 秒；看 `logs api` |
| 6 | `curl -s`  seemingly 无输出 | 其实有 JSON，与 prompt 粘连 | 用 `curl -v` 或 `-w HTTP_CODE` |
| 7 | 本机 nslookup 得 `198.18.0.x` | Clash fake-ip | 在**服务器**上 nslookup |
| 8 | `od$ cp` 报错 | 粘贴多了 shell 提示符字符 | 只输入 `cp .env.staging .env` |
| 9 | 容器内 `wget`/`ps` 不存在 | API 镜像为 slim | 用 `node -e "fetch(...)"` |
| 10 | 混淆 `PORT` 与 `API_HOST_PORT` | 映射 3001→3000，进程听 3000 | `PORT=3000`，`API_HOST_PORT=3001` |

---

## 6. 验收清单

- [ ] DNS：`api.staging.remember.wehub.top` → 公网 IP
- [ ] `docker compose ps`：api `Up`，postgres `healthy`
- [ ] `curl http://127.0.0.1:3001/api/v1/health` → `{"status":"ok"}`
- [ ] `curl https://api.staging.remember.wehub.top/api/v1/health` → `{"status":"ok"}`
- [ ] 腾讯云防火墙：**未**对公网开放 3001、5432
- [ ] `.env.staging` / `.env` 已离线备份，**未**提交 Git

---

## 7. 本阶段完成后：建议下一步

| 顺序 | 任务 | 文档 |
|------|------|------|
| 1 | **seed** 管理员 + 测试兑换码 + 目录 pack | [production-deploy.md §5.3](./production-deploy.md) |
| 2 | 构建并部署 **Admin** → `admin.staging.remember.wehub.top` | [production-deploy.md §6–§7](./production-deploy.md) |
| 3 | 手机 APK 指向 staging API 联调 | [production-deploy.md §8](./production-deploy.md) |
| 4 | RC 勾选清单验收 | [release-candidate-checklist.md](./release-candidate-checklist.md) |

**seed 前置：** 服务器或本机需 `pnpm install` 后执行 `pnpm --filter @remember/api seed:dev-bootstrap`（需能连上 staging 的 Postgres 容器 IP，详见 production-deploy §5.3）。

---

## 8. 日常运维

**查看 API 日志：**

```bash
cd /opt/remember-app
docker compose --project-name remember-staging \
  --env-file infra/prod/.env.staging \
  --file infra/prod/compose.yaml logs -f api
```

**更新代码后重新部署：**

1. 本机重新 `git archive` 并上传覆盖 `/opt/remember-app`（或 `git pull`）
2. `sed -i 's/\r$//' infra/prod/docker-entrypoint.sh`（若从 Windows 上传）
3. `docker compose ... up -d --build api`

**改 `.env` 后：**

```bash
cp .env.staging .env
docker compose ... up -d --force-recreate api
```

---

## 9. 相关文档

- [deploy-remember-site-beginner.md](./deploy-remember-site-beginner.md) — 介绍站
- [production-deploy.md](./production-deploy.md) — 全栈 runbook（Admin、seed、prod）
- [local-api-docker-dev.md](./local-api-docker-dev.md) — 本机 Docker 开发
- [release-candidate-checklist.md](./release-candidate-checklist.md) — RC 验收
