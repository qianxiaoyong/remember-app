# PostgreSQL 备份与恢复（生产 / staging）

日期：2026-08-04  
ADR：[0003 PostgreSQL 备份恢复验证](../decisions/0003-postgresql-backup-restore.md)  
脚本：`infra/prod/backup-db.ps1`、`infra/prod/restore-db.ps1`

---

## 1. 范围

| 做 | 不做 |
| --- | --- |
| `pg_dump -Fc` 定时/手动备份 | PITR / 热备 / 异地双活 |
| 同卷原地 `pg_restore` 演练 | 无确认的生产误恢复 |
| 核对 `orders` / `payment_events` / `pack_access` 行数 | 全库 every-table  diff |

**格式：** PostgreSQL custom format（`-Fc`），与 ADR 0003 spike 一致。

---

## 2. 前提

- Docker Compose 项目已运行（`infra/prod/compose.yaml`）
- 已配置 `infra/prod/.env`（含 `COMPOSE_PROJECT_NAME`、`POSTGRES_*`）
- 在仓库根或 `infra/prod` 目录执行 PowerShell 脚本
- **密码不出现在命令行**；仅通过 `--env-file` 注入

---

## 3. 备份

```powershell
cd D:\AIcoder\remember-app\infra\prod

# 默认读取 .\env
powershell -NoProfile -ExecutionPolicy Bypass -File .\backup-db.ps1

# 指定 staging env
powershell -NoProfile -ExecutionPolicy Bypass -File .\backup-db.ps1 -EnvFile .\.env.staging
```

**产物：** `infra/prod/artifacts/remember-YYYYMMDD-HHmmss.dump`（Git 忽略）

脚本会输出：

- 文件路径、`sizeBytes`、SHA-256
- 备份前 `orders` / `payment_events` / `pack_access` 计数

### 3.1 上传 COS（MVP 手动）

桶内建议前缀：`backups/postgres/{YYYY-MM-DD}/remember.dump`

```powershell
# 示例：使用腾讯云 coscli（需本机单独配置密钥，勿写入脚本）
# coscli cp .\artifacts\remember-20260804-120000.dump cos://YOUR_BUCKET/backups/postgres/2026-08-04/remember.dump
```

或使用 `-UploadToCos` 开关查看提示（MVP 不自动上传）。

### 3.2 建议 cron（Linux 服务器）

```cron
# 每日 03:00 备份（示例路径按服务器调整）
0 3 * * * cd /opt/remember-app/infra/prod && docker compose --env-file .env.prod -f compose.yaml exec -T postgres pg_dump -Fc -U remember -f /tmp/remember.dump remember && ...
```

Windows 服务器可用任务计划程序调用 `backup-db.ps1`。

---

## 4. 恢复（破坏性）

**警告：** `pg_restore --clean` 会删除并重建对象；仅对 **staging** 或 **已确认的空库/灾备演练** 执行。

```powershell
cd D:\AIcoder\remember-app\infra\prod

powershell -NoProfile -ExecutionPolicy Bypass -File .\restore-db.ps1 `
  -DumpPath .\artifacts\remember-YYYYMMDD-HHmmss.dump `
  -EnvFile .\.env.staging `
  -Force
```

流程：

1. `docker compose stop api`
2. `docker compose cp` dump → 容器 `/tmp`
3. `pg_restore --clean --if-exists --exit-on-error`
4. 打印商业表计数
5. `docker compose start api`

---

## 5. 验收 SQL

脚本内置；也可手动：

```sql
SELECT 'orders' AS table_name, count(*) FROM orders
UNION ALL SELECT 'payment_events', count(*) FROM payment_events
UNION ALL SELECT 'pack_access', count(*) FROM pack_access
ORDER BY table_name;
```

**通过标准：** 恢复后三张表计数与备份前一致（同一数据集）。

---

## 6. 本地 staging 演练记录（模板）

> 实施者在 staging 完成一次 backup → restore 后填写。

| 项 | 值 |
| --- | --- |
| 日期 | 2026-08-04 |
| 环境 | `remember-staging` |
| 备份文件 | `artifacts/remember-20260804-235203.dump` |
| 备份 SHA-256 | `5985970650F506ED45E51FB8C662D51A1F0FBA2BAA3987DE1C51F09DC0D143B6` |
| 备份前 orders / payment_events / pack_access | 0 / 0 / 0 |
| 恢复后 orders / payment_events / pack_access | 0 / 0 / 0 |
| 结果 | PASS（恢复后 `/api/v1/health` → `ok`） |
| 操作人 | AI agent（本地 Windows + Docker Desktop） |

---

## 7. 故障排查

| 现象 | 处理 |
| --- | --- |
| `DOCKER_CLI_NOT_FOUND` | 安装 Docker Desktop / 将 docker 加入 PATH |
| `POSTGRES_SERVICE_NOT_RUNNING` | `docker compose up -d postgres` |
| `pg_restore` 报对象不存在 | 首次空库可忽略部分 `--clean` 警告；应用库应已有 schema |
| 恢复后 API 502 | 等待 `api` 容器 migrate 完成；查 `docker compose logs api` |

---

## 8. 相关

- [production-deploy.md](./production-deploy.md)
- Spike 脚本：`infra/technical-spikes/postgres/run-backup-restore.ps1`
