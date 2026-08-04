# 中心词库 LocalTTS（pack-editor 串行队列）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** pack-editor 经 local-api **串行**代理制包机 [LocalTTS](https://github.com/qianxiaoyong/LocalTTS)（`127.0.0.1:7860`），合成 mp3 写入 `assets/audio/`；**不**改 build-pack 验签、App、Admin API。

**Architecture:** `POST /local-api/tts/synthesize` → 进程内队列（serial=1）→ `POST {LOCAL_TTS_BASE_URL}/api/synthesize` → 写 pack source 资产；vocabulary / story 编辑页提供生成按钮。

**ADR：** `docs/decisions/0013-central-content-lexicon-outline.md` §2、§6

## Global Constraints

- 队列 **串行**（同时仅 1 个 LocalTTS 请求）
- 输出路径须在 `assets/` 下且 `.mp3` / `.wav`
- **不**改 App；**不**服务端跑 TTS
- LocalTTS 未启动时返回可读错误

---

### Task 1: 服务端代理 + 串行队列

**Files:**

- Create: `tools/pack-editor/src/server/local-tts-config.ts`
- Create: `tools/pack-editor/src/server/local-tts-client.ts`
- Create: `tools/pack-editor/src/server/tts-synthesis-queue.ts`
- Create: `tools/pack-editor/src/server/tts-handlers.ts`
- Modify: `tools/pack-editor/src/server/paths.ts`
- Modify: `tools/pack-editor/src/server/routes.ts`

---

### Task 2: 客户端 + UI

**Files:**

- Create: `tools/pack-editor/src/api/tts-api-client.ts`
- Create: `tools/pack-editor/src/utils/suggest-audio-path.ts`
- Create: `tools/pack-editor/src/components/tts-synthesize-button.tsx`
- Modify: `tools/pack-editor/src/components/vocabulary-card-form.tsx`
- Modify: `tools/pack-editor/src/components/story-lesson-fields.tsx`
- Modify: `tools/pack-editor/src/pages/card-edit-page.tsx`

---

### Task 3: 测试 + 文档

- Create: `tools/pack-editor/src/server/*.test.ts`
- Modify: `docs/runbooks/pack-editor-local.md`
- [x] `pnpm check`
