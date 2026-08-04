# 中心词库 ECDICT 导入 CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** 交付 `@remember/lexicon-import` CLI——读取 ECDICT CSV → 校验/映射 → 写入 `content_*`（`content_import_batches` 幂等）；**不**改 Admin API / pack-editor / App。

**Architecture:** 纯函数解析（`@remember/domain` 键规范化）→ Prisma 批次导入；CSV 流式读取；`file_sha256` 唯一批次；`lemma_key` 冲突跳过。

**前置：** 子计划 1 schema + domain；本地 PostgreSQL（`DATABASE_URL`）

**ADR：** `docs/decisions/0013-central-content-lexicon-outline.md` §2、§4.5、§8

## Global Constraints

- **不**做全库语义清洗；**不**覆盖已有 `lemma_key`
- 导入词条 `status=draft`、`source=ecdict`；片段/词形 `source=ecdict`
- 批次 `file_sha256` 已完成 → 幂等退出
- **无** Admin 导入 UI（本计划仅 CLI）
- **不**改 packs/orders/App

---

### Task 1: 解析与映射纯函数

**Files:**

- Create: `tools/lexicon-import/src/ecdict/*`
- Create: `tools/lexicon-import/fixtures/ecdict-sample.csv`
- Create: `tools/lexicon-import/src/ecdict/*.test.ts`

- [ ] `parseExchangeField` — ECDICT exchange → formType + displayForm
- [ ] `mapEcdictRow` — CSV 行 → lemma + fragments + forms + tagKeys
- [ ] 单元测试

---

### Task 2: Prisma 批次导入 + CLI

**Files:**

- Create: `tools/lexicon-import/src/import/import-ecdict-batch.ts`
- Create: `tools/lexicon-import/src/cli.ts`
- Create: `tools/lexicon-import/package.json` 等

**CLI:**

```text
remember-lexicon-import ecdict --file <path> [--version <label>] [--limit N] [--dry-run]
```

- [ ] sha256 幂等批次
- [ ] 流式 CSV + 逐条 create（冲突 skip）
- [ ] 统计 inserted / skipped / error

---

### Task 3: 文档与验证

- Modify: `docs/runbooks/local-api-docker-dev.md`
- [ ] `pnpm --filter @remember/lexicon-import test`
- [ ] `pnpm check`
