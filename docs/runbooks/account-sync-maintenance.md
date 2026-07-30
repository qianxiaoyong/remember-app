# 账号登录与云端同步维护手册

日期：2026-07-30  
范围：阶段 5 子计划 1（手机号登录、单主设备）+ 子计划 2（学习进度 outbox 上传、快照恢复）  
状态：已在 Windows + 真机 Release APK 联调验证  
关联：`docs/runbooks/local-api-docker-dev.md`、`docs/runbooks/android-release-build-windows.md`

---

## 1. 文档目的

记录「记得」App 账号登录与云端同步在实现、实机验收过程中踩过的坑、设计约束与后期维护要点，便于：

- 新同事或 AI 接手时快速定位问题域
- 实机联调失败时有对照清单
- 修改 sync 相关代码时避免重复引入已知缺陷

**本文不是产品 PRD**，也不替代架构原文；契约细节以 `packages/contracts/src/sync/` 与 Prisma schema 为准。

---

## 2. 功能边界（第一期）

### 2.1 同步什么

| 数据                             | 是否同步 | 存储位置                               |
| -------------------------------- | -------- | -------------------------------------- |
| `learning_states`（SM-2 进度）   | ✅       | 本地 `user.sqlite` ↔ 服务端 PostgreSQL |
| `study_sessions`（当前学习会话） | ❌       | 仅本地                                 |
| 已安装 pack 列表                 | ❌       | 仅本地                                 |
| 点词收藏                         | ❌       | 仅本地（阶段 4）                       |
| pack 内容                        | ❌       | 独立 zip 安装链                        |

### 2.2 两条独立链路

```text
链路 A — 上传（push）
  本地评分 confirmCardReview
    → 写 learning_states + sync_outbox
    → uploadPendingSyncOutbox（后台 worker / 登录后 / 评分后）
    → POST /api/v1/sync/learning-states/batch

链路 B — 恢复（pull）
  登录 verifySmsLogin
    → restoreLearningStatesFromSnapshot
    → GET /api/v1/sync/learning-states/snapshot
    → 按 clientVersion 合并写入本地 learning_states
```

**重要：** 设置里「删除本地数据」只清 `user.sqlite`；**再登录会从云端拉回进度**。这不是 bug，不能用来「从零测断网」——见 §6.3。

### 2.3 主设备规则

- 仅 **主设备**（`users.main_device_id` 与当前 `deviceId` 一致）可调用 sync 写接口
- 非主设备上传 → API **403** `NOT_MAIN_DEVICE`；本地 outbox **保留**，待抢回主设备后再传
- **顶号与 session（ADR 0009 §1a）：** 跨设备登录只更新 `main_device_id`，**不 revoke** 旧设备 session；旧设备 API → **403**，本地保留缓存用户与 Banner。同 `deviceId` 再次登录才 revoke 本机旧 session（旧 token → **401**）

---

## 3. 关键代码地图

| 职责                           | 路径                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| 契约（Zod）                    | `packages/contracts/src/sync/`                                                      |
| API 模块                       | `apps/api/src/sync/`                                                                |
| Prisma 表                      | `learning_states`、`sync_processed_events`                                          |
| 集成测试                       | `apps/api/test/sync-learning-states.e2e.test.ts`                                    |
| outbox 仓储                    | `apps/mobile/src/data/repositories/sync-outbox-repository.ts`                       |
| payload 解析（含 legacy 补全） | `apps/mobile/src/data/sync/resolve-sync-outbox-payload.ts`                          |
| 上传用例                       | `apps/mobile/src/use-cases/sync/upload-pending-sync-outbox.ts`                      |
| 快照恢复                       | `apps/mobile/src/use-cases/sync/restore-learning-states-from-snapshot.ts`           |
| 评分写 outbox                  | `apps/mobile/src/use-cases/confirm-card-review.ts`                                  |
| 登录后 sync                    | `apps/mobile/src/use-cases/auth/verify-sms-login.ts`                                |
| 断网会话缓存                   | `apps/mobile/src/use-cases/auth/get-current-session-user.ts`                        |
| 后台 worker                    | `apps/mobile/src/hooks/use-sync-worker.ts` + `components/shell/shell-sync-host.tsx` |
| 账号页状态                     | `apps/mobile/src/screens/account-screen.tsx`                                        |
| Release HTTP 明文              | `apps/mobile/plugins/with-android-cleartext-release.js`                             |

---

## 4. 版本合并规则（Q2:A）

- 每条进度有单调递增的 **`clientVersion`**（本地每次评分 +1）
- 服务端更新条件：`item.clientVersion > existing.clientVersion`
- 若 `existing.clientVersion >= item.clientVersion` → **`STALE_VERSION`**（幂等成功，不覆盖）
- 快照恢复：本地 `existing.clientVersion >= snapshot.clientVersion` 则 **跳过**（保留本地较新）
- 上传时 **`buildUploadItem` 始终用当前 `learning_states.clientVersion`**，不用 outbox 行里可能过期的版本号

**切勿**在 `STALE_VERSION` 后再次把同版本写回 outbox——这曾导致「待上传永远不归零」（见 §5.4）。

---

## 5. 已踩坑与修复记录

### 5.1 登录失败：Zod 报 `easiness` / `intervalDays` undefined

**现象：** 登录时弹窗出现 `[...] invalid_type` 等技术错误。  
**原因：** 阶段 4 遗留 outbox `payload` 缺 SM-2 全字段；登录路径 `await uploadPendingSyncOutbox` 解析失败抛错。  
**修复：**

- 登录与上传 **解耦**：`verifySmsLogin` 里 `runPostLoginSync` 后台 try/catch，不阻塞登录 UI
- `resolveSyncOutboxPayload` 优先从当前 `learning_states` 补全字段；legacy JSON 作兜底
- 登录页过滤 `ZodError` / `[` 开头的技术文案

### 5.2 飞行模式「像退出登录」

**现象：** 开飞行模式后账号页显示未登录。  
**原因：** `getCurrentSessionUser` 遇 `ApiNetworkError` 返回 `null`。  
**修复：** 断网时 **回退 `readCachedSessionUser()`**；401 仍清 session。

### 5.3 浏览器能开 health，App 报「无法连接服务器」

**现象：** 手机浏览器访问 `http://192.168.x.x:3000/api/v1/health` 正常；App 内 fetch 失败。  
**原因：** Android 9+ 默认禁止明文 HTTP；Release manifest 缺 `usesCleartextTraffic`。仅 `assembleRelease` 而不 `prebuild` 时，该属性可能被洗掉。  
**修复：**

- 注册 Expo 插件 `with-android-cleartext-release.js`
- runbook 增加打包前 `Select-String ... usesCleartextTraffic` 检查
- 确认 Windows 防火墙放行 **3000**（不仅 5432）

**维护：** 正式环境应改 HTTPS + 备案域名；cleartext 插件仅用于 **本地/内网联调 Release 包**，上线前需评估是否移除或按 build flavor 区分。

### 5.4 待上传永远有数据（死循环）★ 高频

**现象：** 「最后同步」时间在更新，但「待上传 N 条」永不归零，像一直在同步。  
**原因（两层）：**

1. 旧逻辑 `ensureSyncOutboxCoversLearningStates`：每次 upload 前后把已同步的 `learning_states` **重新写入 outbox**
2. 后续 `reconcileSyncOutboxAfterStaleRejects`：服务端返回 `STALE_VERSION`（已同步）→ 删 outbox → reconcile 发现 outbox 空 → **又 insert 同版本** → 无限循环

**修复：**

- **删除** ensure / reconcile 补写逻辑
- 上传前 **`dedupeSyncOutboxByKnowledgeId`**：同一 `knowledgeId` 只保留最高 `clientVersion` 一条（清理历史重复行）
- `STALE_VERSION` 视为成功：删 outbox 即可，**不得再补写**
- 账号页 3 秒轮询改为 **只读显示**（`countSyncOutboxItems`），不再每轮触发 upload

**回归测试：** `apps/mobile/src/use-cases/sync/upload-pending-sync-outbox.test.ts`

### 5.5 Sync Worker 不跑 / 关抽屉后不同步

**原因：** Worker 曾挂在 `AppDrawer` 内，抽屉关闭即卸载。  
**修复：** `ShellSyncHost` 挂根布局 `_layout.tsx`，全 App 生命周期运行。

### 5.6 集成测试偶发失败

**原因：** 多 worker 并行写同一 PostgreSQL。  
**修复：** `test:integration` 加 `--maxWorkers=1`；`resetAuthTables` 先清 sync 表。

### 5.7 双机顶号后 A 像登出 / B 未拉云端进度

**现象：** B 登录后 A 跳登录页；B 进度不如 A 云端全。  
**原因：**

1. **P1-1 误用「撤销全部 session」**：A 收到 401 而非 403，客户端清 token → 像登出（与 Q3:A 冲突）
2. **登录后 `void runPostLoginSync`**：恢复快照失败被吞、或成功但首页未 `markLibraryNeedsRefresh`

**冻结策略（ADR 0009）：**

- **跨设备顶号（1a）**：只改 `mainDeviceId`，**不 revoke** A 的 session；A → **403** `NOT_MAIN_DEVICE` + Banner
- **同 deviceId 再登录**：只 revoke **本 deviceId** 旧 session；旧 token → 401
- **登录 await 快照** + `markLibraryNeedsRefresh()`；失败向用户报错
- 合并仍 **Q2:A（2a）**；本地无该行时自动写入云端

**回归测试：** `auth-main-device.e2e.test.ts`、`sync-learning-states.e2e.test.ts`（A 上传 → B snapshot）

---

## 6. 实机验收指南

### 6.1 环境准备

```powershell
# 终端 1：数据库
pnpm dev:db

# 终端 2：API（监听 0.0.0.0）
pnpm --filter @remember/api dev

# 健康检查（电脑）
curl http://127.0.0.1:3000/api/v1/health

# 健康检查（手机浏览器，同 Wi-Fi）
# http://<电脑局域网IP>:3000/api/v1/health
```

移动端 API 地址（Release 构建时 bake 进包）：

```text
EXPO_PUBLIC_API_BASE_URL=http://<电脑局域网IP>:3000
```

Mock 验证码：**`000000`**（仅 dev/test）

### 6.2 推荐验收场景

| #   | 场景                        | 预期                        |
| --- | --------------------------- | --------------------------- |
| 1   | A 机学习 → 账号页待上传归零 | 上传成功                    |
| 2   | B 机同号登录                | 进度与 A 一致（快照恢复）   |
| 3   | 非主设备尝试学习上传        | 403，outbox 保留            |
| 4   | 主设备抢回后                | outbox eventually 清空      |
| 5   | 断网评分 1 张 → 联网        | 待上传 1 → 归零（可选抽检） |

集成测试（无需真机）：

```powershell
pnpm --filter @remember/api test:integration
# 期望 11/11 通过（含 sync e2e）
```

### 6.3 无法「删数据测断网」的原因

- 删本地数据 + 登录 = **故意触发快照恢复**
- 测试包若已全部学完，没有新评分就不会产生 outbox

**可选最小断网抽检（不必清数据）：**

1. 保持登录，开飞行模式
2. 找 **今天能复习** 的卡评一次 → 待上传 +1
3. 关飞行模式 → 待上传归零

若无卡可复习：在 dev 库把某条 `learning_states.due_at` 改到过去，或装未学完的小测试包。

**子计划 2 验收结论：** 上传 + 快照 + 集成测试通过即可；断网抽检为加分项。

---

## 7. Release APK 构建注意

完整流程见 `docs/runbooks/android-release-build-windows.md`。sync 联调额外要点：

1. **短路径构建**（`D:\r\b` 等），避免 Windows 260 字符限制
2. **`expo prebuild --clean`** 后再 `assembleRelease`，确保 cleartext 插件生效
3. 打包前必查 manifest：

```powershell
Select-String -Path "apps\mobile\android\app\src\main\AndroidManifest.xml" -Pattern "usesCleartextTraffic"
```

4. 改 JS 后若只 robocopy `src`，用 **`assembleRelease --rerun-tasks`** 强制 rebundle；`gradlew clean` 在 Windows 上可能因 CMake codegen 目录缺失失败
5. 产物可复制到 `dist/remember-phase5-sync.apk` 便于 adb 安装

---

## 8. 后期维护清单

### 8.1 修改 sync 代码前

- [ ] 读 `packages/contracts/src/sync/` 契约变更是否需迁移
- [ ] 服务端与移动端 **同一套** payload 字段（SM-2 全量）
- [ ] 不在 upload 成功路径上 **自动补写 outbox**（除非用户产生新学习事件）
- [ ] `STALE_VERSION` = 已成功，客户端删 outbox 即止
- [ ] 非主设备 403 时 **保留 outbox**，不 silent drop
- [ ] 登录路径 **不得 await** 可能失败的 upload（避免阻塞登录）

### 8.2 修改后必跑

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/api test:integration
pnpm --filter @remember/mobile test
pnpm --filter @remember/mobile typecheck
```

### 8.3 新增表/字段

1. Prisma migration + `resetAuthTables` / 专用 reset 更新
2. contracts Zod + `sync.test.ts`
3. `resolveSyncOutboxPayload` / `buildSyncOutboxPayload` 对齐
4. 集成测试覆盖 happy path + STALE + 幂等 eventId

### 8.4 生产环境差异（未来）

| 项         | 当前 dev/联调          | 生产目标                |
| ---------- | ---------------------- | ----------------------- |
| API URL    | `http://局域网IP:3000` | HTTPS 备案域名          |
| Cleartext  | Release 插件放行       | 应关闭或仅 debug flavor |
| 短信       | mock `000000`          | 腾讯云                  |
| PostgreSQL | Docker 本地            | 服务器 Compose          |

上线前：**移除或按 flavor 禁用 cleartext**；`EXPO_PUBLIC_API_BASE_URL` 指向正式 HTTPS。

### 8.5 运维排查速查

| 用户现象              | 优先检查                                                              |
| --------------------- | --------------------------------------------------------------------- |
| 无法连接服务器        | cleartext manifest、防火墙 3000、API 是否 `0.0.0.0`、IP 是否变        |
| 登录失败带 `[` 技术字 | outbox legacy payload、Zod 契约、是否误 await upload                  |
| 待上传不归零          | 是否又引入 ensure/reconcile；查 `sync_outbox` 行数与重复 knowledgeId  |
| 换机无进度            | snapshot API、登录后是否调 restore；服务端 `learning_states` 是否有行 |
| 非主设备无法同步      | 设计如此；抢主设备后再传                                              |
| 删本地又有了          | snapshot 恢复正常行为                                                 |

### 8.6 禁止再次引入的反模式

1. **`ensureSyncOutboxCoversLearningStates`**：扫描全表 learning_states 写 outbox
2. **STALE 后 reconcile 补写同版本 outbox**
3. **登录主流程 await upload**（legacy outbox 一条坏数据拖死登录）
4. **断网返回 null session**（误显示未登录）
5. **账号页高频轮询里调用 upload**（与 worker 叠加、难排查）
6. **仅 assembleRelease 不 prebuild** 导致 cleartext 丢失

---

## 9. API 端点速查

| 方法 | 路径                                    | 说明                       |
| ---- | --------------------------------------- | -------------------------- |
| POST | `/api/v1/sync/learning-states/batch`    | 批量上传；需主设备 session |
| GET  | `/api/v1/sync/learning-states/snapshot` | 全量快照；登录后恢复用     |

错误码（移动端 `ApiRequestError.code`）：

- `NOT_MAIN_DEVICE` — 非主设备写
- 网络层 — `ApiNetworkError`（超时、连接拒绝、cleartext 拦截等）

---

## 10. 相关文档索引

- 子计划 2 实施计划：`docs/superpowers/plans/2026-07-30-study-state-sync-and-restore.md`
- 阶段 5 kickoff：`docs/superpowers/plans/2026-07-29-phase5-account-sync-kickoff.md`
- 本地 API：`docs/runbooks/local-api-docker-dev.md`
- Android Release：`docs/runbooks/android-release-build-windows.md`
- 验收清单：`docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §5.5–5.8

---

## 11. 变更日志（维护者追加）

| 日期       | 摘要                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| 2026-07-30 | 初版：子计划 2 实机踩坑、outbox 死循环修复、cleartext、断网会话、验收与维护清单 |
