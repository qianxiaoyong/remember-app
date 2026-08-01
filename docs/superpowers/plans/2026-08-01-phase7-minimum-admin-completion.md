# 阶段 7 完成摘要（最小管理后台与运营驾驶舱）

日期：2026-08-01  
基线：`main` @ `2c94bcc`（kickoff 已确认）→ merge **PR #5**  
收口分支：`feat/minimum-admin`  
完成摘要 HEAD：`main` @ merge 后 + 本文档 commit

## 交付物

| 子计划                                               | 核心交付                                                                           | 状态        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------- |
| kickoff `2026-07-31-phase7-minimum-admin-kickoff.md` | 子计划 1–3 + 增量 taxonomy/P1/用户 MVP-A                                           | ✅          |
| 1 `2026-07-31-admin-auth-and-audit-api.md`           | `admin_users` / `admin_sessions` / `audit_logs`；Admin 登录/登出；`AdminAuthGuard` | ✅ mock/dev |
| 2 `2026-07-31-admin-operations-api.md`               | 发版/upload+verify、五类运营、驾驶舱只读 API、兑换码                               | ✅ mock/dev |
| 3 `2026-07-31-admin-ui-and-dashboard.md`             | `apps/admin` React-admin；驾驶舱 A；Resource 页                                    | ✅          |
| 增量 taxonomy（P0）                                  | ADR 0011；Admin 分类管理；App 市场/书库筛选                                        | ✅          |
| 增量运营元数据（P1）                                 | 展示名、副标题、标签、taxonomy 关联等 Admin 可编辑                                 | ✅          |
| 增量 App 用户 MVP-A                                  | `GET /admin/users` 列表/详情；maskedPhone；运营联动                                | ✅          |

主要代码路径：

- Admin 认证/审计：`apps/api/src/admin-auth/`、`apps/api/src/audit/`
- 运营 API：`apps/api/src/admin/`（packs、orders、pack-access、refunds、redemption、users、dashboard、catalog-taxonomy）
- Admin UI：`apps/admin/src/`（dashboard、resources、data-provider、auth-provider）
- 契约：`packages/contracts/src/admin/`
- Mobile taxonomy：`apps/mobile/src/data/catalog/`、`use-cases/fetch-market-catalog.ts`
- 集成测试：`apps/api/test/admin-auth.e2e.test.ts`、`admin-operations.e2e.test.ts`、`catalog-taxonomy.e2e.test.ts`（共 **49/49**）

## 退出门禁

**mock/dev 路径（PR #5 merge 时验证）：**

- `pnpm typecheck` — 通过
- `pnpm --filter @remember/api test:integration` — **49/49** 通过
- `pnpm --filter @remember/admin build` — 通过
- 全量 `pnpm check` — **未通过** `format:check`（分支历史 Prettier 告警；不阻塞 mock 路径 merge，可单独 format PR）

**spec §11 对照（mock/dev 已达成 / 单人自用 defer）：**

| 要点                                                  | 状态                                        |
| ----------------------------------------------------- | ------------------------------------------- |
| 五类运营 + 兑换码批次 + 驾驶舱 A KPI                  | ✅                                          |
| 合法 zip 上传 verify → draft 版本；发布后可 mock 下载 | ✅                                          |
| 补发/退款/发布写 `audit_logs`                         | ✅                                          |
| App session 访问 `/api/v1/admin/*` → 401              | ✅                                          |
| admin 相关集成测试                                    | ✅ 49/49                                    |
| 上传**非法** zip Admin E2E 拒装                       | ⏸ defer（见残余表；上传链路上传重构后补测） |
| 全量 `pnpm check`                                     | ⏸ format 历史债务 defer                     |

## 产品决策落地（2026-07-31 kickoff + 2026-08-01 收口审查）

| 决策                                    | 落地                                                   |
| --------------------------------------- | ------------------------------------------------------ |
| 驾驶舱选 **A**（轻量 KPI，无学习曲线）  | Dashboard：KPI、GMV 折线、Top5、告警、包状态           |
| 制包：外部 AI + pack-builder + 后台上传 | 版本上传 multipart + `PackVerifyService`               |
| 阶段 7 **不接** in-admin LLM            | 未实现 content_jobs                                    |
| React-admin 开源核心 + 浏览器访问       | `apps/admin` @ Vite 5173                               |
| dev：Docker PG + mock 微信/COS          | 见 runbook                                             |
| **单人自用**（2026-08-01）              | 登录防暴力/TOTP/HttpOnly 等 defer 至公网/multi-user 前 |

## 审查后修复（PR #5 及收口）

1. **P1** PATCH pack 未传 `status` 时 Zod default 误改已上架包为 `draft`；未传 `cardCount` 默认 `0` → PATCH 专用 schema
2. **P2** Admin 壳层滚动：顶栏/Sidebar 固定，主内容区独立滚动
3. **P2** Dashboard / 用户详情 redirect 列表筛选：`{ filter: {...} }` 传参（React-admin 约定）
4. **P2** Mobile taxonomy 磁盘缓存与 `fetch-market-catalog` 合并逻辑

## 已知残余（不阻塞 mock 路径 merge；后续跟进）

| 优先级 | 项                                           | 理由 / 建议处理时机                                          |
| ------ | -------------------------------------------- | ------------------------------------------------------------ |
| defer  | Admin 登录防暴力 / 限速 / 多 session revoke  | 单人自用；公网/multi-user 前                                 |
| defer  | 发布时磁盘 zip 与 DB sha256 二次校验         | 单人运维认为过度                                             |
| defer  | 上传 zip「先写磁盘后开事务」原子性           | 上传业务即将重构                                             |
| defer  | spec §11「非法 zip 拒装」Admin E2E           | 等上传重构一并补测（服务端 verify 已有，缺负例 e2e）         |
| defer  | TOTP、登录锁定、localStorage→HttpOnly cookie | 公网 admin 前                                                |
| P3     | 全量 `pnpm format:check`                     | 单独 chore PR                                                |
| P3     | MVP-B 完整手机号展示                         | 阶段 7.x 或合规需求时                                        |
| P3     | 驾驶舱 protocolVersion 分布 widget           | 阶段 7.x                                                     |
| P3     | in-admin LLM / content_jobs                  | 单独 ADR                                                     |
| defer  | 生产 COS / 真实微信退款                      | Pause C/D                                                    |
| P3     | 告警「已有兑换记录的兑换码批次」语义         | 当前文案已准确（非「将耗尽」）；若需「余量不足」需新查询条件 |

## Mock 与 dev 联调要点

| 项             | 处理                                                                  |
| -------------- | --------------------------------------------------------------------- |
| Admin 登录     | `pnpm --filter @remember/api seed:dev-bootstrap`（Docker 重启后必须） |
| 凭据           | `admin` / `dev-only-admin-password`（见 `apps/api/.env.example`）     |
| Admin UI       | `pnpm --filter @remember/admin dev` → http://127.0.0.1:5173           |
| API            | `pnpm --filter @remember/api dev` → 3000；Vite 代理 `/api`            |
| 集成测试副作用 | `audit_logs` 会写入测试「补发用户权益」等记录，属预期                 |

## 阶段 7 范围外（defer → 阶段 8 / Pause C/D）

| 项                       | 说明               |
| ------------------------ | ------------------ |
| 微信 OpenSDK 实机付/退   | 仍为 mock          |
| 生产 COS signed zip      | dev 本地/mock 存储 |
| Caddy + Compose 生产部署 | 阶段 8             |
| 备份恢复演练             | 阶段 8             |
| RC 全链路验收            | 阶段 8             |

## 下一阶段

阶段 8：包/App 更新、生产部署、COS、备份恢复、RC 验收（见 `2026-07-26-remember-app-mvp-development-order.md` §11）。  
实施前建议新建 kickoff：`docs/superpowers/plans/2026-08-01-phase8-release-kickoff.md`（本次仅指向，未创建）。
