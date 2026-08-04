# 阶段 8 启动说明（发布、部署与 RC 验收）

日期：2026-08-04  
状态：**已确认（产品对齐）** — 待写子计划并实施  
基线：`main` @ PR #14 merge 后（中心词库已 revert；阶段 0–7 mock/dev 已收口）  
总顺序：`docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md` §11

## 1. 本阶段一句话

把「记得」从 **本机 + mock** 推到 **可邀请内测的单机生产环境**：API + PostgreSQL 可部署、包可私有分发、数据库可备份恢复、用 **清单式 RC** 验收主链路；**不做** 重型 DevOps（K8s、全链路 APM、自动灰度）。

## 2. 阶段 8 不是什么（控重）

| 做（MVP）                                          | 不做（阶段 8.x / 公网规模化后） |
| -------------------------------------------------- | ------------------------------- |
| 单机 Docker Compose + Caddy HTTPS                  | Kubernetes、多区域、自动扩缩    |
| 一份生产 `.env` 校验脚本 + 部署 runbook            | 复杂配置中心 / Vault            |
| COS **一个**私有桶放 pack zip；营销图可走公开前缀  | CDN 全站、多桶策略、跨区域复制  |
| `pg_dump` 定时备份 + **手动**恢复演练 1 次         | 热备、PITR、异地双活            |
| 结构化日志 + `X-Request-Id`                        | Prometheus/Grafana 全套         |
| RC **勾选清单**（真人走一遍）                      | 自动化 soak / 混沌工程          |
| APK 更新：**检查版本 + 跳转下载页**（或静态 JSON） | 应用内差分升级、渠道包体系      |

## 3. 当前进度

```text
阶段 0–5  ✅（见各 phase completion）
阶段 6    ✅ mock/dev；§6.9 真实付/退 defer（Pause C/D）
阶段 7    ✅ Admin MVP（PR #5）
阶段 8    ⏸ 子计划 3 RC 清单就绪；P0 真机勾选待统一验收
```

**已有资产（复用，不重写）：**

| 资产                    | 路径                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| 本地 dev DB Compose     | `infra/dev/compose.yaml`                                                               |
| PG 备份恢复 Spike + ADR | `infra/technical-spikes/postgres/`、`docs/decisions/0003-postgresql-backup-restore.md` |
| 介绍站 + Caddy 示例     | `apps/site/`、`docs/runbooks/deploy-remember-site.md`                                  |
| Android release 构建    | `docs/runbooks/android-release-build-windows.md`、`docs/decisions/0004-*`              |
| 包安装原子替换          | ADR 0005、`installPackFromZipBytes`                                                    |
| 账号同步维护            | `docs/runbooks/account-sync-maintenance.md`                                            |

## 4. 已确认产品决策（2026-08-04）

| #   | 决策         | 内容                                                                                                      |
| --- | ------------ | --------------------------------------------------------------------------------------------------------- |
| D1  | **首发形态** | **邀请内测**（少量账号 + 兑换码/补发权益），不追求公开市场首发                                            |
| D2  | **支付**     | RC 可走 **兑换码 + mock 付**；真实微信付/退 **不挡** 部署与备份，但 **不挡** 「对外宣称已商用付退」       |
| D3  | **部署拓扑** | **一台**腾讯云轻量（或与介绍站同机）：Caddy → API；PostgreSQL 同机 Docker volume                          |
| D4  | **域名**     | API：`api.remember.wehub.top`（示例，备案后启用）；Admin：同机子路径或 `admin.` 子域二选一（子计划 2 定） |
| D5  | **密钥**     | 生产密钥 **仅** 服务器 `.env` + 本地离线备份；**不进** Git、**不进** APK                                  |
| D6  | **发布节奏** | 测试环境 = 生产 Compose 的 staging 副本（可同机不同端口或第二台轻量）；**人工**批准上正式                 |
| D7  | **包更新**   | 客户端已有下载安装链；阶段 8 **验证 + 文档化** 版本检查与断点续传边界，非重写                             |
| D8  | **中心词库** | **已 revert**；不在阶段 8 范围                                                                            |

## 5. 推荐子计划（实施前逐份写细节）

| 顺序 | 文件名（待创建）                               | 交付                                                                                          | 估重             |
| ---- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| 1    | `2026-08-04-phase8-pack-and-app-update.md`     | 验证 pack 版本更新/回退；APK 最低版本与 `protocolVersion` 强制策略（若缺则最小 API）；RC 用例 | 轻               |
| 2    | `2026-08-04-phase8-production-deployment.md`   | 生产 Compose + Caddy；env 校验；COS 私有桶接 Admin 发版；`pg_dump` 备份脚本                   | 中               |
| 3    | `2026-08-04-phase8-release-candidate-check.md` | RC 勾选清单 + 弱网/断网/小屏实机项；邀请账号全链路                                            | 轻（偏 runbook） |

**依赖：** 2 可先于 1 搭骨架（空 API 也能起）；**RC（3）必须 1+2 可跑**。  
**并行 Pause：** 真实微信支付（Pause C/D）仅影响 RC 清单中「真实付/退」几行，不阻塞 Compose/COS/备份。

## 6. 阶段 8 目标架构（MVP）

```text
                    ┌─────────────────────────────────────┐
  用户手机 App       │  腾讯云轻量（单机）                    │
  ───────────────►  │  Caddy :443                          │
                    │    ├─ remember.wehub.top  → 静态站    │
                    │    ├─ api.*             → API :3000   │
                    │    └─ admin.*           → Admin 静态  │
                    │  Docker: postgres:18.4 + api 容器     │
                    └──────────────┬──────────────────────┘
                                   │ presign / PUT
                                   ▼
                    ┌─────────────────────────────────────┐
                    │  COS 私有桶（pack zip）                 │
                    │  可选：公开前缀（封面/试听，已有 ADR）   │
                    └─────────────────────────────────────┘

  运维机（Windows）─ pg_dump ─► COS 或 同机加密目录（备份）
```

## 7. 并行暂停（Pause 矩阵）

| 项                              | 挡什么                            | 不挡什么                                        |
| ------------------------------- | --------------------------------- | ----------------------------------------------- |
| **Pause C/D** 微信 AppID / 商户 | OpenSDK 实机付、§6.9 正式退出门禁 | 部署 API、兑换码开通、mock 订单 RC              |
| **ICP 备案**                    | 大陆公网 HTTPS 域名               | 本机/局域网/staging IP 联调                     |
| **COS 生产密钥**                | 正式 zip 外链                     | 继续 dev mock 下载 + Admin 上传本地存储路径验证 |
| **短信模板**                    | 生产短信登录                      | dev mock OTP                                    |

## 8. 验收门禁（阶段完成）

### 8.1 必须全绿（P0）

- [x] `pnpm check` 在 `main` 全绿（发布分支同基线）— 2026-08-05 `feat/phase8-release` PASS
- [x] 生产 Compose **一键 up**（[production-deploy.md](../../runbooks/production-deploy.md) §5）；本地 staging `/health` OK
- [ ] Admin 在 staging 能 **上传 zip → 发布 → App 能下载安装学习** — **defer 统一真机验收**
- [x] `pg_dump` 备份 + **按 ADR 0003 流程恢复** 到空库，订单/`pack_access` 计数一致（2026-08-04 staging 演练 PASS）
- [ ] RC 清单 **P0 项** 在 Android 8+ 真机走通 — **defer 子计划 3 统一验收**
- [x] 生产 `.env` 经 **校验脚本** 启动前检查（`tools/scripts/validate-prod-env.mjs`）

### 8.2 可 defer 到 Pause 解除后（P1）

- [ ] 微信 **真实** 付 + 退完整闭环
- [ ] 腾讯云 SMS 生产模板
- [ ] COS CDN 加速、多环境分桶
- [ ] 自动 CI 部署到生产（阶段 8 仅要求 **文档化人工步骤**）

### 8.3 明确不验收

- 中心词库 / ECDICT
- 多管理员 TOTP、防暴力登录（见 phase 7 defer）
- 驾驶舱 protocolVersion widget

## 9. 子计划 1 轮廓（pack / App 更新）

**目标：** 确认现有实现满足内测，只补 **最小** 缺口。

- 核对：catalog 返回 `currentVersion` → App 比对 → 授权下载 → `installPackFromZipBytes` 原子替换（含 bundled 不降级逻辑）
- 核对：`protocolVersion` 不兼容时的 **明确错误**（非静默失败）
- 若缺：最小 **`GET /api/v1/app/release`**（或静态 `apps/site/release.json`）返回 `minAndroidVersion`、`latestApkUrl`、`forceUpdateBelow`
- 文档：`docs/runbooks/pack-update-rc.md`（待建）— 如何发新 pack 版本、如何验证用户侧更新

**不做：** 应用商店上架流程、多渠道包。

## 10. 子计划 2 轮廓（生产部署）

**目标：** 一份能抄的 runbook + 可重复 Compose。

建议交付物：

| 交付                                  | 说明                                                               |
| ------------------------------------- | ------------------------------------------------------------------ |
| `infra/prod/compose.yaml`             | `postgres` + `api`（`admin` 可先 `vite build` 静态由 Caddy 托管）  |
| `infra/prod/.env.example`             | 列出全部必填变量，无真实值                                         |
| `tools/scripts/validate-prod-env.mjs` | 启动前校验                                                         |
| `docs/runbooks/production-deploy.md`  | 从空机到 staging 的步骤                                            |
| COS                                   | Admin 发版写 `cos_object_key`；App 下载走 presign（替换 mock URL） |
| 备份                                  | `infra/prod/backup-db.ps1` 或 cron 示例；上传到 COS 备份前缀       |

**PostgreSQL：** 沿用 `postgres:18.4-bookworm`（与 ADR 0003、dev 一致）。

**Caddy：** 参考 `apps/site/Caddyfile.example` 扩展 `reverse_proxy`。

## 11. 子计划 3 轮廓（RC 验收）

**目标：** 给「没发布经验」的操作者一份 **勾选表**，不是自动化平台。

建议结构：

1. **环境准备**（staging URL、测试账号、兑换码、APK 版本号）
2. **学习链路**（下载、断网学习、点词、复习、搜索 rejoin）
3. **账号链路**（换机恢复、主设备切换）
4. **商业链路**（兑换码开包；mock 付可选；退款 staging mock）
5. **回归**（杀进程、弱网、320dp、系统字体放大）
6. **发布签字**（谁批准、哪一 git tag、哪一镜像 digest）

产出：`docs/runbooks/release-candidate-checklist.md`（可打印/复制到 issue）。

## 12. 建议实施顺序（给单人开发者）

```text
Week A  子计划 2 骨架：prod Compose + staging + env 校验 + 部署 runbook
Week B  子计划 2 收尾：COS 接 Admin 发版 + pg_dump 备份 + 恢复演练 1 次
Week C  子计划 1：pack/APK 更新验证 + 补最小版本 API（若缺）
Week D  子计划 3：RC 清单实机跑 + 修 P0 + 打 RC tag
        （Pause C/D 解除后补 RC 清单中的真实付/退行）
```

不必严格按周；**优先让 staging 能「Admin 发版 → 手机学」**。

## 13. 文档清单（新窗口读什么）

| 文档                                                           | 用途              |
| -------------------------------------------------------------- | ----------------- |
| 本文                                                           | 范围、Pause、门禁 |
| `2026-07-26-remember-app-mvp-development-order.md` §11         | 总清单原文        |
| `2026-07-27-stages-3-6-technical-acceptance-checklist.md`      | 阶段 6 defer 对照 |
| `2026-08-01-phase7-minimum-admin-completion.md` §阶段 7 范围外 | 已知 defer        |
| `docs/runbooks/local-api-docker-dev.md`                        | dev 对照          |
| `docs/runbooks/deploy-remember-site.md`                        | Caddy/备案        |
| `docs/decisions/0003-postgresql-backup-restore.md`             | 备份恢复          |
| `docs/runbooks/android-release-build-windows.md`               | 打 RC APK         |

## 14. 新窗口起手 Prompt

```text
仓库 remember-app（产品名「记得」）。请实施阶段 8。

## 必读
- docs/superpowers/plans/2026-08-04-phase8-release-kickoff.md（本文）
- docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md §11
- docs/decisions/0003-postgresql-backup-restore.md
- docs/runbooks/deploy-remember-site.md
- 使用 $build-learning-app 与 writing-plans

## 硬规则
- MVP：单机 Compose + Caddy；不做 K8s / 全量 APM
- 真实微信付/退不挡 staging 部署（Pause C/D）
- 密钥不进 Git/APK
- 先写子计划再 implementing；每步 pnpm check

## 建议顺序
1. 写 2026-08-04-phase8-production-deployment.md 并搭 infra/prod 骨架
2. pack/app 更新验证
3. RC checklist runbook

先写子计划 2 大纲，等我确认再写代码。
```

## 15. 相关

- 阶段 7 completion：`docs/superpowers/plans/2026-08-01-phase7-minimum-admin-completion.md`
- 阶段 6 completion：`docs/superpowers/plans/2026-07-31-phase6-catalog-payment-completion.md`
- 中心词库：已 revert（PR #14）；未来另开 ADR，不在阶段 8
