# 0016 四 Tab 平级底栏导航（取代抽屉 Shell）

日期：2026-08-12  
状态：**已确认**（2026-08-12 随 PR #44 落地骨架，PR2 清理 dead code）  
关联：ADR [0015](./0015-shell-tab-keep-alive.md)（Tab 保活）、[0014](./0014-learning-activity-calendar.md)（学习日历）、UI 规范 [§3](../superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md)

---

## 1. 背景

### 1.1 问题

- MVP 早期 Shell 为 **左侧滑出抽屉 + 悬浮胶囊三 Tab**（学习 / 复习 / 资料）。
- 抽屉承载账号、常用功能、菜单列表与 90 天学习日历 widget；汉堡菜单与 Tab 入口重复，且抽屉打开/关闭与 Tab remount 叠加，带来 **JS 线程排队、首屏跳高** 等体验问题（见 ADR 0015 背景）。
- 产品对标竞品后确认：**四 Tab 平级底栏**（学习 / 复习 / 记录 / 我的），资料页改为 Stack 二级页。

### 1.2 目标

| 目标 | 说明                                                                |
| ---- | ------------------------------------------------------------------- |
| G1   | 底部 **四 Tab 等宽贴底**：学习、复习、记录、我的                    |
| G2   | **资料（market）** 移出 Tab，经学习页顶栏入口进入 Stack 页          |
| G3   | 原抽屉主体（账号、菜单、90 天日历 widget）迁入 **「我的」Tab**      |
| G4   | **完整月历 + 日明细** 迁入 **「记录」Tab**（`/record`）             |
| G5   | 保留 ADR 0015 的 **Expo Router Tabs 保活**；复习进行中仍隐藏 Tab 栏 |
| G6   | **删除** 左侧 `AppDrawer` 及 drawer 状态机，避免 dead code 与误用   |

### 1.3 非目标（本 ADR）

- 不重命名仍用于「我的」页的 `drawer-*` 组件文件名（历史命名，后续可单独 refactor）。
- 不改变复习算法、日历事件表、家长检查模式业务逻辑。
- 不在本 ADR 内做 UI polish（记录页月历样式、联系我们弹窗等，见独立 PR）。

---

## 2. 决策

### 2.1 路由结构

```text
app/(shell)/_layout.tsx     # Tabs + ShellTabBar + ShellContactOverlayHost
app/(shell)/library.tsx   # Tab: 学习
app/(shell)/review.tsx    # Tab: 复习
app/(shell)/record.tsx    # Tab: 记录（LearningCalendarScreen variant=tab）
app/(shell)/profile.tsx   # Tab: 我的（ProfileScreenBody）
app/market.tsx            # Stack: 资料（无 Tab 栏，带返回）
app/learning-calendar.tsx # Redirect → /record
```

- Tab 间导航：`router.navigate` 到目标 Tab href；已在目标 Tab 时 **no-op**。
- 旧路径 `/learning-calendar` **永久 redirect** 到 `/record`，保证深链与检查模式返回兼容。

### 2.2 顶栏与入口

| 页面 | 顶栏                | 说明                     |
| ---- | ------------------- | ------------------------ |
| 学习 | 搜索 + 资料图标     | 无汉堡菜单               |
| 复习 | 按现有复习/检查模式 | 有 session 时隐藏 Tab 栏 |
| 记录 | Tab 模式无返回键    | 标题「记录」             |
| 我的 | Tab 模式无返回键    | 账号区 + widget + 菜单   |
| 资料 | 返回 + 标题 + 搜索  | Stack 页                 |

### 2.3 抽屉删除与状态精简

**删除：**

- `AppDrawer` 组件及挂载
- `drawer-return-intent`（返回后重开抽屉）
- `useRestoreDrawerOnReturn`
- `ShellProvider` 内 `openDrawer` / `closeDrawer` / `dismissDrawer` / `isDrawerOpen`

**保留：**

- `ShellProvider` 的 `openContactPanel` / `closeContactPanel`（「联系我们」Shell 层 overlay）
- `useTabBarVisible` / `useSetTabBarVisible`（复习沉浸隐藏 Tab 栏）
- `ProfileScreenBody` + `LearningCalendarWidget`（仅 page 布局，focus 时加载）

### 2.4 Tab 栏实现

- 自定义 `ShellTabBar`（等宽四格），Expo Router `Tabs` 的 `tabBarStyle: { display: 'none' }`。
- `lazy: true`：首次进入 Tab 才挂载，降低冷启动成本。
- 复习 Tab 角标：`getReviewTabSummary().reviewableDueTotal`（可复习池口径）。

### 2.5 命名收敛

- `capsule*` 废弃别名移除；统一 `tabBar*`（`tabBarBottom`、`useTabBarVisible` 等）。
- `CapsuleBar` 已删除，由 `ShellTabBar` 取代。

---

## 3. 与 ADR 0015 / 0014 的关系

| 原文 ADR                    | 本 ADR 修订                                              |
| --------------------------- | -------------------------------------------------------- |
| 0015：三 Tab 胶囊 + 抽屉    | **四 Tab 贴底栏**，无抽屉；保活方案仍用 Expo Router Tabs |
| 0014：抽屉嵌入 90 天 widget | Widget 留在 **「我的」Tab**；完整月历在 **「记录」Tab**  |
| 0015：`/market` 为 Tab      | **`/market` 迁出 Tab**，改 Stack                         |

ADR 0015 中「抽屉 + 胶囊三 Tab」描述 **已被本 ADR 取代**；0015 中 Tabs 保活、focus 刷新等机制 **仍然有效**。

---

## 4. 验收

- [ ] 四 Tab 切换正常，复习 session 中 Tab 栏隐藏
- [ ] 学习页 → 资料 Stack → 返回
- [ ] `/learning-calendar` redirect 到记录 Tab
- [ ] 我的 Tab：账号、90 天 widget、菜单、联系我们 overlay
- [ ] 记录 Tab：月历 + 日明细
- [ ] 代码库无 `AppDrawer`、`drawer-return-intent`、`openDrawer` 引用
- [ ] `pnpm check`（mobile 范围）通过

---

## 5. 实施分期

| 阶段 | PR     | 内容                                                           |
| ---- | ------ | -------------------------------------------------------------- |
| PR1  | #44    | 四 Tab 骨架、路由、Profile 抽取；**刻意保留** drawer dead code |
| PR2  | 本 ADR | 删除 drawer dead code、`capsule*` 别名、补 ADR 0016            |
| 独立 | #45    | UI polish（记录月历样式、空态、联系我们抽屉），**非** PR2 范围 |
