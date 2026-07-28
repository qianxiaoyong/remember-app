# Pack Install and Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 release 实机上完成 remember-test-pack 验签安装，并在 `user.sqlite` 写入 `installed_packs` 记录；五表 schema 与版本化迁移就绪供后续子计划使用。

**Architecture:** 页面 → 用例 → 仓储适配器；`verifyPackArchive` 复用 `@remember/contracts`；pack 文件落盘于 `documentDirectory/packs/{packId}/`，SQLite 替换走 ADR 0005 `backupDatabaseAsync`；`user.sqlite` 经 `PRAGMA user_version` 递增迁移。

**Tech Stack:** Expo SDK 57、expo-sqlite 57.0.1、expo-file-system、fflate、@remember/contracts、TypeScript strict、vitest（schema 单测）

## Global Constraints

- 最小正确实现；页面不直连 SQL
- 不改 pack 协议；复用 `verifyPackArchive`
- 安装失败保留旧包；临时文件清理
- 抽屉术语「收藏本」本计划不涉及 UI
- 市场/支付/同步 mock 或不做
- 子计划 1 退出门禁：release 实机安装 remember-test-pack 且 `installed_packs` 有记录

---

### Task 1: user.sqlite schema 与迁移

**Files:**

- Create: `apps/mobile/src/data/user-db/user-db-schema.ts`
- Create: `apps/mobile/src/data/user-db/run-user-db-migrations.ts`
- Create: `apps/mobile/src/data/user-db/open-user-database.ts`
- Test: `apps/mobile/src/data/user-db/user-db-schema.test.ts`

**Interfaces:**

- Produces: `USER_DB_VERSION`, `MIGRATIONS: Record<number, string[]>`, `openUserDatabase(): SQLiteDatabase`

- [ ] **Step 1: 定义五表 DDL（version 1）**

`installed_packs`: packId PK, displayName, packVersion, sqlitePath, assetsDir, installStatus, installedAt, lastOpenedAt

`learning_states`: knowledgeId PK, packId, easiness, intervalDays, repetitions, dueAt, clientVersion, updatedAt

`study_sessions`: sessionId PK, packId, status, createdAt, updatedAt

`study_queue_items`: itemId PK, sessionId FK, knowledgeId, itemType, sortOrder, status; UNIQUE(sessionId, sortOrder)

`sync_outbox`: eventId PK, knowledgeId, clientVersion, payload, createdAt

- [ ] **Step 2: 迁移 runner**

读 `PRAGMA user_version`；逐版本执行 SQL；成功后 `PRAGMA user_version = N`；幂等可重复。

- [ ] **Step 3: 单测 schema 版本与表名清单**

Run: `pnpm --filter @remember/mobile test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/data/user-db/
git commit -m "feat(mobile): user.sqlite 五表 schema 与版本迁移"
```

---

### Task 2: 共享 pack 验包工具

**Files:**

- Create: `apps/mobile/src/data/pack/read-zip-entries.ts`
- Create: `apps/mobile/src/data/pack/create-expo-sqlite-reader.ts`
- Create: `apps/mobile/src/data/pack/verify-pack-zip-bytes.ts`
- Modify: `apps/mobile/src/pack/verify-bundled-pack.ts` — 委托新模块

**Interfaces:**

- Produces: `readZipEntries(bytes)`, `verifyPackZipBytes(bytes): Promise<VerifiedPackSummary>`
- `VerifiedPackSummary`: `{ packId, packVersion, cardCount, lexiconCount }`

- [ ] **Step 1: 从 verify-bundled-pack 抽取 zip 读取与 sqlite reader**
- [ ] **Step 2: verify-bundled-pack 改为薄封装，行为不变**
- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/data/pack/ apps/mobile/src/pack/
git commit -m "refactor(mobile): 抽取 pack 验包共享模块"
```

---

### Task 3: pack 安装适配器

**Files:**

- Create: `apps/mobile/src/data/pack/pack-storage-paths.ts`
- Create: `apps/mobile/src/data/pack/install-pack-from-zip.ts`
- Create: `apps/mobile/src/data/repositories/installed-pack-repository.ts`

**Interfaces:**

- Consumes: `verifyPackZipBytes`, `openUserDatabase`, expo-file-system, expo-sqlite
- Produces:
  - `getPackInstallPaths(packId): { packDir, sqlitePath, assetsDir }`
  - `installPackFromZipBytes(zipBytes): Promise<InstalledPackRow>`
  - `listInstalledPacks(): InstalledPackRow[]`
  - `uninstallPack(packId): void` — 删文件 + 删 installed_packs 行，保留 learning_states

安装顺序：解压到 cache 临时目录 → verifyPackArchive（只读试开）→ 写 assets → backupDatabaseAsync 到目标 pack.sqlite → 事务 upsert installed_packs → 清理临时目录。失败不更新 installed_packs。

- [ ] **Step 1: pack-storage-paths**
- [ ] **Step 2: install-pack-from-zip 实现完整链**
- [ ] **Step 3: installed-pack-repository CRUD**
- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/data/
git commit -m "feat(mobile): pack 验签安装链与 installed_packs 仓储"
```

---

### Task 4: 用例与开发验收入口

**Files:**

- Create: `apps/mobile/src/use-cases/install-bundled-test-pack.ts`
- Create: `apps/mobile/src/use-cases/list-installed-packs.ts`
- Modify: `apps/mobile/src/screens/start-screen.tsx` — 开发按钮：安装 bundled 包 + 显示已安装列表
- Modify: `apps/mobile/package.json` — 添加 vitest test 脚本

**Interfaces:**

- Consumes: installPackFromZipBytes, verifyBundledTestPack 的 zip 加载
- Produces: `installBundledTestPack(): Promise<InstalledPackRow>`, `listInstalledPacksUseCase()`

- [ ] **Step 1: 用例层薄封装**
- [ ] **Step 2: StartScreen 增加「安装测试包」与 installed_packs 列表（阶段 4 开发入口，子计划 4 替换为正式 UI）**
- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/use-cases/ apps/mobile/src/screens/ apps/mobile/package.json
git commit -m "feat(mobile): 开发入口安装 bundled 测试包"
```

---

### Task 5: 验证

- [ ] **Step 1: 安装依赖并跑门禁**

```powershell
pnpm install
pnpm check
pnpm --filter @remember/mobile typecheck
pnpm --filter @remember/mobile test
```

Expected: 全部退出码 0

- [ ] **Step 2: 实机验收（人工）**

release APK → 首页点「安装测试包」→ 显示 remember-test-pack → 可用 adb/sqlite3 或 App 内列表确认 `installed_packs` 有行

---

## 阶段 4 子计划 1 退出门禁

> release 实机安装 remember-test-pack 成功，`user.sqlite` 有 `installed_packs` 记录。

## 不在本计划范围

- SM-2 / study_sessions 业务逻辑（子计划 2）
- 点词 / 收藏本 / 搜索（子计划 3）
- 正式 UI 壳（子计划 4）
- saved_lexicon_items 表（子计划 3）
