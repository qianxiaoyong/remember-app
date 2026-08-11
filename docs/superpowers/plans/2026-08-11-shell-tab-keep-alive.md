# Shell 底部胶囊 Tab 保活 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 [ADR 0015](../decisions/0015-shell-tab-keep-alive.md) 消除底部三 Tab 切换时的 remount 与内容区跳高；保留 CapsuleBar + 抽屉 + 沉浸页规则。

**Architecture:** `(shell)/_layout` 由 `Stack` 改为 Expo Router `Tabs`（`lazy: false`，隐藏默认 tabBar）；`review` 路由迁入 `(shell)` 组；Tab 切换 `navigate` 替代 `replace`；首页 focus 刷新改为 silent / 局部更新，避免整页空态。

**Tech Stack:** Expo Router、`@react-navigation/bottom-tabs`（经 Expo 封装）、TypeScript strict、vitest。

## Global Constraints

- 行为以 **ADR 0015（待确认 → 实施前需产品确认）** 为准。
- **保留** UI §3.2 悬浮胶囊外观；**不**暴露系统 TabBar。
- **不**引入自研 KeepAlive / Tab Registry / 全局页面缓存。
- **不**恢复首页快照方案。
- 沉浸页（study、pack 详情、learning-calendar 等）仍在 **根 Stack**，逻辑不变。
- 每 Task 结束跑列出的验证；合并前 `pnpm check` 全绿。
- 每 Task 一次 commit；独立 PR `feat/shell-tab-keep-alive`。
- 正式实现遵循 `docs/ai-rules/` 与 `$build-learning-app`。

## 范围外（defer）

| 项                        | 说明               |
| ------------------------- | ------------------ |
| Tab 滑动动画              | ADR 允许第一期关闭 |
| 自研 KeepAlive 框架       | ADR 明确不做       |
| 复习 Tab 外其他页面的保活 | 仅 shell 三 Tab    |
| 首页 stats 内存缓存跨进程 | 非本 PR            |

## 依赖与实施顺序

```text
Task 1 路由迁移 review ──► Task 2 Tabs layout
Task 2 ──► Task 3 navigateShellTab + 测试
Task 3 ──► Task 4 library focus 刷新（不 remount 空态）
Task 4 ──► Task 5 回归测试 + RC
```

---

## 文件结构（完成后）

```text
docs/decisions/0015-shell-tab-keep-alive.md

apps/mobile/app/(shell)/_layout.tsx              # Stack → Tabs
apps/mobile/app/(shell)/review.tsx             # 自 app/review.tsx 迁入
apps/mobile/app/review.tsx                       # 删除

apps/mobile/src/shell/shell-tab-transition.ts    # replace → navigate
apps/mobile/src/shell/shell-tab-transition.test.ts

apps/mobile/src/screens/library-screen.tsx       # focus 刷新语义（如需）
```

---

## Task 1：将 `/review` 迁入 `(shell)` 组

**Files:**

- Create: `apps/mobile/app/(shell)/review.tsx`（自 `app/review.tsx` 复制）
- Delete: `apps/mobile/app/review.tsx`

- [ ] 新建 `(shell)/review.tsx`，内容与现 `review.tsx` 一致（inspect query 解析不变）
- [ ] 删除根级 `app/review.tsx`
- [ ] 确认深链仍可用：`/review`、`/review?inspect=1&…`（日历日明细、家长检查）
- [ ] `pnpm --filter @remember/mobile typecheck`

**Commit:** `refactor(mobile): 将 review 路由迁入 shell 组`

---

## Task 2：`(shell)/_layout` Stack 改 Tabs

**Files:**

- Modify: `apps/mobile/app/(shell)/_layout.tsx`

- [ ] `import { Tabs } from 'expo-router'` 替代 `Stack`
- [ ] 配置：
  - `screenOptions={{ lazy: false, headerShown: false, tabBarStyle: { display: 'none' } }}`
  - 或 `tabBar={() => null}`（与 Expo Router 版本 API 对齐）
  - `animationEnabled: false`（或平台等价项）
- [ ] 保留 `ShellProvider`、`ShellCapsuleTabBar`、`ShellDrawerHost` 结构不变
- [ ] 移除仅适用于 Stack 的 `consumeShellTabTransition` / `animationDuration`（若 Tabs 不支持则删引用）
- [ ] 三屏 `library` / `review` / `market` 均在 Tabs 下注册

**Verify:**

- [ ] 手动：三 Tab 可切换，胶囊与抽屉始终可见
- [ ] `pnpm --filter @remember/mobile typecheck`

**Commit:** `feat(mobile): shell 布局改用 Tabs 保活三 Tab`

---

## Task 3：`navigateShellTab` 改用 navigate

**Files:**

- Modify: `apps/mobile/src/shell/shell-tab-transition.ts`
- Create: `apps/mobile/src/shell/shell-tab-transition.test.ts`

- [ ] `ShellTabRouter` 类型改为 `navigate`（保留 `replace` 仅给非 Tab 场景若仍需）
- [ ] `navigateShellTab` 内三处 `router.replace` → `router.navigate`
- [ ] 已在目标 Tab 时 early return（现有逻辑保留）
- [ ] 测试：
  - 调用 navigate 而非 replace
  - 同 Tab 不重复导航
  - `resolveShellTabFromPathname` 三路径
- [ ] `pnpm --filter @remember/mobile test`

**Commit:** `fix(mobile): Tab 切换改用 navigate 避免 remount`

---

## Task 4：首页 focus 刷新与保活共存

**Files:**

- Modify: `apps/mobile/src/screens/library-screen.tsx`（按需）

- [ ] 审查 `useFocusEffect` / `isLibraryLoading` + `EMPTY_OVERVIEW` 首帧逻辑
- [ ] 保活后 **再次 focus 不应** 整页重置为 loading 空态；改为：
  - 有缓存数据时 silent refresh，或
  - 仅 `RefreshControl` / 局部 placeholder
- [ ] `consumeLibraryNeedsRefresh` 仍触发数据更新
- [ ] 确认 `deferAfterFirstPaint` 与 `useRestoreDrawerOnReturn` 行为不退化

**Verify:**

- [ ] 手动：首页滚动 → 切资料 → 切回，滚动位置保留且无高度跳变
- [ ] 手动：装包后回首页，列表更新且不明显闪空

**Commit:** `fix(mobile): 首页 focus 刷新适配 Tab 保活`

---

## Task 5：回归与 RC

- [ ] `pnpm check`
- [ ] `pnpm --filter @remember/mobile test`
- [ ] 真机清单（ADR §2.6 手测 5 条）
- [ ] 可选：`tools/mobile/build-standalone-release-apk.ps1` 装机构建

**Commit（若仅文档/无代码）：** `chore: shell tab keep-alive RC`

---

## PR 描述模板

```markdown
## Summary

- Shell 三 Tab 改用 Expo Router Tabs（lazy: false）保活
- review 路由迁入 (shell) 组；Tab 切换 navigate 替代 replace
- 修复首页 ↔ 资料切换 remount 跳高

## Test plan

- [ ] 首页 ↔ 资料 ↔ 复习快速切换无整页闪空
- [ ] 首页滚动位置跨 Tab 保留
- [ ] 学习/详情/日历/家长检查回归
- [ ] pnpm check 全绿
```
