# MVP Mobile UI Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans.

**Goal:** 按 UI 规范交付正式壳：我的知识库、知识库市场、详情、学习页、悬浮胶囊、全局抽屉；真实数据绑定子计划 1–3 域层；市场目录与购买 mock。

**Architecture（解耦原则）：**

- `theme/`：设计 token，不含业务
- `components/shell/`：胶囊、抽屉、顶栏，只收 props/回调
- `components/ui/`：通用按钮/卡片
- `components/{library,market,study,pack}/`：领域展示块，无 SQL
- `hooks/`：页面状态与用例桥接（如 `useStudyFlow`）
- `screens/`：组合 shell + hooks，不写 SQL
- `use-cases/`：编排与聚合
- `catalog/`：市场 mock 种子（标注 `catalogSeed`）

## Global Constraints

- 页面不直连 SQLite；经用例
- 抽屉术语「收藏本」；MVP 只显示已实现入口
- mock 购买/价格须标注非服务端真值（kickoff §5）
- 布局/间距可微调，不改导航结构与主流程

### Task 1: theme + shell 组件

- `colors.ts` / `spacing.ts` 对齐 UI §4
- `ScreenScaffold`、`AppHeader`、`CapsuleBar`、`AppDrawer`
- `ShellProvider` 管理抽屉开关

### Task 2: 用例与 catalog

- `resolve-app-launch-target`：有 pending 任务 → 学习页
- `get-library-overview` / `get-installed-pack-summaries`
- `catalog-seed` + `list-market-catalog` + `get-pack-detail-view-model`
- `mock-purchase-store`（本地文件持久化 mock 已购）

### Task 3: 常规页（胶囊可见）

- `LibraryScreen` 替换 dev StartScreen
- `MarketScreen` 分类/筛选/卡片
- 路由 `(shell)/library`、`(shell)/market`

### Task 4: 沉浸页

- `PackDetailScreen`：mock 购买 + 真安装
- `StudyScreen` 重构：进度顶栏、更多菜单、两阶段卡、点词
- `SearchScreen` / `FavoritesScreen` 接 theme + packId 参数

### Task 5: 启动路由与抽屉入口

- `app/index.tsx` Redirect
- 抽屉：下载管理、收藏本、关于/设置 smoke

**退出门禁：** 冷启动 pending → 学习；胶囊互切；详情/学习无胶囊；收藏本/搜索/点词/重新入队仍可用。
