# Word Lookup and Search Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans.

**Goal:** 点词直查 `lexicon_entries.surfaceForm`、收藏本（`packId+surfaceForm`）、包内搜索、重新加入复习（不重复队列项）；发音首次缓存。

**Architecture:** 复用 `@remember/contracts` 的 `normalizeSurfaceForm`；pack 库只读查 lexicon；`user.sqlite` v2 增 `saved_lexicon_items`；用例层编排。

## Global Constraints

- 不用 `lexicon_forms`；抽屉术语「收藏本」
- 页面不直连 SQL
- 子计划 3 用 dev 页验收，正式 UI 壳留子计划 4

### Task 1: migration v2 + lexicon 仓储

### Task 2: 收藏本 / 搜索 / rejoin 用例

### Task 3: 学习页点词弹窗 + /search + /favorites

**退出门禁：** 实机可点词、收藏、搜索、重新加入复习且不重复入队。
