# 中心词库 pack-editor LexiconWorkbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** pack-editor 新增 `LexiconWorkbench`——扫词 → 查 Admin 中心词库 → 默认追加进 source；冲突时人工选替换/跳过；story 写 `sidebar[]`，vocabulary 写 `lexicon.json`。

**Architecture:** Vite local-api 代理 Admin lexicon（Bearer，服务端读 env）；`PackLexiconAdapter` 分 story / vocabulary；纯函数负责 scan / map / conflict / apply；UI 为对话框。

**前置：** 子计划 1–2（contracts + Admin API）；子计划 3 可选（运营侧维护词条）

**ADR：** `docs/decisions/0013-central-content-lexicon-outline.md` §3.1、§6

## Global Constraints

- **不**改 `build-pack` 验签与 ADR 0008 协议
- **不**回写包私有字段到中心库（story `tier` / `vocabId`）
- 进包 **默认追加**；同键内容不一致 → **冲突 UI**（替换 / 跳过）
- LocalTTS 属子计划 6，本期不做
- App **零改动**

---

### Task 1: local-api lexicon 代理 + lexicon.json 读写

**Files:**

- Create: `tools/pack-editor/src/server/lexicon-proxy.ts`
- Create: `tools/pack-editor/src/server/lexicon-proxy-handlers.ts`
- Modify: `tools/pack-editor/src/server/routes.ts`
- Modify: `tools/pack-editor/src/server/local-api-handlers.ts`
- Modify: `tools/pack-editor/src/api/local-api-client.ts`

**Env（进程环境，启动 pack-editor 前设置）：**

| 变量                     | 说明                                         |
| ------------------------ | -------------------------------------------- |
| `LEXICON_API_BASE_URL`   | 默认 `http://127.0.0.1:3000`                 |
| `LEXICON_ADMIN_TOKEN`    | 可选；Bearer token                           |
| `LEXICON_ADMIN_LOGIN`    | 无 token 时登录名，默认同 API bootstrap      |
| `LEXICON_ADMIN_PASSWORD` | 无 token 时密码（可与 `apps/api/.env` 一致） |

**路由：**

| 方法 | 路径                                  | 转发                     |
| ---- | ------------------------------------- | ------------------------ |
| GET  | `/local-api/lexicon/search?q=`        | Admin search             |
| GET  | `/local-api/lexicon/by-form/:formKey` | Admin by-form            |
| POST | `/local-api/lexicon/batch-get`        | Admin batch-get          |
| GET  | `/local-api/packs/:packId/lexicon`    | 读 source `lexicon.json` |
| PUT  | `/local-api/packs/:packId/lexicon`    | 写 source `lexicon.json` |

---

### Task 2: Workbench 纯函数 + Adapter

**Files:**

- Create: `tools/pack-editor/src/lexicon-workbench/types.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/scan-surfaces.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/map-central-lemma.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/detect-conflicts.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/apply-import-plan.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/story-sidebar-adapter.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/vocabulary-lexicon-adapter.ts`
- Create: `tools/pack-editor/src/lexicon-workbench/*.test.ts`

---

### Task 3: API 客户端 + UI

**Files:**

- Create: `tools/pack-editor/src/api/lexicon-api-client.ts`
- Create: `tools/pack-editor/src/components/lexicon-workbench/lexicon-workbench-dialog.tsx`
- Modify: `tools/pack-editor/src/components/story-timeline-editor.tsx`
- Modify: `tools/pack-editor/src/pages/card-edit-page.tsx`
- Modify: `tools/pack-editor/src/styles/components.css`

---

### Task 4: 文档与验证

- Modify: `docs/runbooks/pack-editor-local.md`
- [ ] `pnpm --filter @remember/pack-editor test`
- [ ] `pnpm check`
