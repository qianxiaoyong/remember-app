# 本地 API 开发环境（Docker PostgreSQL）

日期：2026-07-29  
范围：阶段 5 子计划 1（手机号登录、主设备）；**不是**正式生产部署。

## 1. 前提

- 已安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows）
- Node.js 22.x、pnpm 10.33.2（与仓库根 `package.json` 一致）
- 本机 **不需要** 腾讯云短信、备案域名；开发环境使用 **mock 验证码**

## 2. 一键启动数据库

### 首次准备

```powershell
cd D:\AIcoder\remember-app
Copy-Item infra\dev\.env.example infra\dev\.env
# 编辑 infra\dev\.env，设置 POSTGRES_PASSWORD（任意强密码，勿提交 Git）
```

### 启动 / 停止

```powershell
# 方式 A：根目录脚本（推荐）
pnpm dev:db

# 方式 B：PowerShell 脚本
powershell -NoProfile -ExecutionPolicy Bypass -File infra\dev\start-dev-db.ps1

# 停止并删除容器（保留数据卷）
pnpm dev:db:down
```

启动成功后，在 `apps/api/.env` 配置 `DATABASE_URL`（勿提交 Git）：

- 协议：`postgresql`
- 用户：`remember`
- 密码：与 `infra/dev/.env` 中 `POSTGRES_PASSWORD` 相同
- 主机：`127.0.0.1`
- 端口：`5432`
- 数据库：`remember_dev`

## 3. 启动 API

Prisma 与 auth 模块落地后，在 **第二个终端**：

```powershell
cd D:\AIcoder\remember-app
pnpm install
pnpm --filter @remember/api dev
```

健康检查：`http://127.0.0.1:3000/api/v1/health`（端口以 API 配置为准）

## 3.1 启动管理后台（阶段 7）

在 **第三个终端**（API 与 Docker PG 已运行）：

```powershell
cd D:\AIcoder\remember-app
pnpm --filter @remember/admin dev
```

浏览器打开：`http://127.0.0.1:5173`

- 默认通过 Vite 代理访问 API（`vite.config.ts` → `127.0.0.1:3000`）
- 登录账号见 `apps/api/.env` 的 `ADMIN_BOOTSTRAP_*`（seed 后可用）
- 若需直连 API，在 `apps/admin/.env` 设置 `VITE_API_BASE_URL=http://127.0.0.1:3000`（需 API 开启 CORS 或仍用代理）

## 4. 手机实机联调

1. 电脑与手机同一 Wi‑Fi
2. 查电脑局域网 IP：`ipconfig` → 例如 `192.168.1.100`
3. 移动端 dev 构建环境变量：

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
```

4. 开发环境 mock 验证码：**`000000`**（仅 dev/test；正式环境禁用）

## 5. 集成测试

```powershell
pnpm dev:db
pnpm --filter @remember/api test:integration
```

集成测试使用 **真实 PostgreSQL**（本 Docker 实例或 CI 提供的库），不使用内存假库。

## 6. 与正式环境的区别

| 项         | 本地 dev                          | 正式                     |
| ---------- | --------------------------------- | ------------------------ |
| PostgreSQL | Docker `remember-dev`             | Compose + 不映射公网端口 |
| 短信       | mock 固定码                       | 腾讯云 SDK 3.0           |
| HTTPS      | 可 HTTP + IP                      | 备案域名 + Caddy         |
| 密钥       | `infra/dev/.env`、`apps/api/.env` | 服务器密钥管理           |

## 7. 故障排查

- **`POSTGRES_PASSWORD must be set`**：检查 `infra/dev/.env` 是否存在且已填密码
- **端口 5432 占用**：改 `infra/dev/compose.yaml` 端口映射或停止本机其他 PostgreSQL
- **手机连不上 API**：检查 Windows 防火墙是否放行 3000；API 需监听 `0.0.0.0` 而非仅 localhost
- **登录/同步/outbox/换机恢复等深层问题**：见 [账号登录与云端同步维护手册](./account-sync-maintenance.md)

## 8. ECDICT 导入中心词库（CLI）

子计划 5 提供 `@remember/lexicon-import`，将 [ECDICT](https://github.com/skywind3000/ECDICT) CSV 写入 `content_*` 表。

### 准备

1. 数据库已启动（§2），`apps/api/.env` 已配置 `DATABASE_URL`
2. 下载 `ecdict.csv`（UTF-8）到本机任意路径
3. 编译 CLI：

```powershell
pnpm --filter @remember/lexicon-import build
```

### 导入

```powershell
# 加载 DATABASE_URL（PowerShell 示例，路径按本机调整）
$env:DATABASE_URL = (Get-Content apps\api\.env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL=',''

# 试跑（不写库）
pnpm --filter @remember/lexicon-import import:ecdict -- --file D:\data\ecdict.csv --dry-run --limit 100

# 正式导入（可 --limit 做小批量验证）
pnpm --filter @remember/lexicon-import import:ecdict -- --file D:\data\ecdict.csv --version 2024-01
```

**行为：**

- `file_sha256` 幂等：同一文件已成功导入则直接退出
- 已有 `lemma_key` **跳过**，不覆盖
- 新词条 `status=draft`、`source=ecdict`
- 失败批次可修正后重跑（同 sha256 且 `status=failed` 会重置计数重试）

导入后在 Admin **中心词库** 搜索验证；draft 词条可手动发布后进 pack-editor 补词。
