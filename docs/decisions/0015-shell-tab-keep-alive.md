# 0015 Shell 底部胶囊 Tab 保活（Expo Router Tabs）

日期：2026-08-11  
状态：**已确认**（2026-08-11 产品确认采用 Expo Router Tabs 轻量方案）  
关联：UI 规范 [§3.2](../superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md)（悬浮胶囊三 Tab）、ADR [0013](./0013-unified-review-pool-and-leitner-scheduler.md)（复习 Tab）、ADR [0014](./0014-learning-activity-calendar.md)（日历返回首页体验）

---

## 1. 背景

### 1.1 问题

- 底部胶囊在 **首页 / 复习 / 资料** 之间切换时，当前实现通过 **`router.replace` + 根级 `Stack`** 换路由。
- 每次切换会 **卸载旧页、挂载新页**，页面内 `useState` 丢失；首页 `library-screen` 在 remount 后首帧出现空占位再撑开，用户感知为 **轻微跳高 / 一闪**。
- **`/review` 路由在 `(shell)` 组外**（`app/review.tsx`），与 `/library`、`/market` 不在同一 Shell 布局下，切换复习 Tab 时 **整棵 Shell（抽屉 + 胶囊）也会重建**。
- 曾尝试 **首页内存快照** 遮首帧，但无法解决 focus 刷新与抽屉恢复时序，已回滚。

### 1.2 目标

| 目标 | 说明                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| G1   | 三 Tab 切换时 **主屏组件保持挂载**（保活），切换回来 **状态与滚动位置保留**          |
| G2   | 消除 remount 导致的 **内容区高度跳变**                                               |
| G3   | **保留现有 UI**：悬浮 `CapsuleBar` 外观与三 Tab 语义不变                             |
| G4   | **保留 Shell 能力**：`ShellProvider`、抽屉、角标、沉浸页（学习/详情）叠在 Shell 之上 |
| G5   | 改动 **最小、可测**；不引入自研 KeepAlive 框架                                       |

### 1.3 非目标（本 ADR）

- **不做**自研「Tab Registry + KeepAlive 容器 + 页面生命周期 + 全局缓存」五层架构（复杂度高，MVP 不需要）。
- **不做**首页快照 / 全局页面缓存层（已证伪不够且增加时序 bug）。
- **不改变**沉浸页规则：学习页、包详情、日历页等仍 **隐藏胶囊**，走根 `Stack` push/pop。
- **不改变**复习算法、日历、家长检查等业务逻辑。
- **不强制**保留 Tab 间 Stack 滑动动画；保活优先，动画可简化或关闭。

---

## 2. 决策

### 2.1 方案选型

**采用 Expo Router 原生 `Tabs`（`lazy: false`）作为 Shell 内 Tab 容器**，外层仍保留 `(shell)/_layout` 提供的 App Shell（抽屉 + 自定义胶囊栏）。

| 方案                                                     | 结论                    |
| -------------------------------------------------------- | ----------------------- |
| 继续 `Stack` + `replace`                                 | 否决 — remount 根因未除 |
| 首页快照                                                 | 否决 — 已回滚           |
| 自研 KeepAlive + Registry + 生命周期 + 缓存              | 否决 — MVP 过度设计     |
| **Expo Router `Tabs` + `lazy: false` + 隐藏默认 TabBar** | **采纳**                |

### 2.2 路由结构

```text
app/_layout.tsx                    # 根 Stack（沉浸页、日历、登录等）
app/(shell)/_layout.tsx            # Tabs（lazy: false）+ CapsuleBar + Drawer
app/(shell)/library.tsx            # Tab: 首页
app/(shell)/review.tsx             # Tab: 复习（自 app/review.tsx 迁入）
app/(shell)/market.tsx             # Tab: 资料
app/study.tsx                      # 根 Stack push，无胶囊
app/pack/[packId].tsx              # 同上
…
```

- **`app/review.tsx` 删除**，复习路由仅保留 `(shell)/review.tsx`，URL 仍为 `/review`。
- 三 Tab **同属 `(shell)` 组**，共享 **同一** `ShellProvider` / 抽屉 / 胶囊实例。

### 2.3 Tab 切换语义

- Tab 间导航：**`router.navigate('/library' | '/review' | '/market')`**，禁止 `replace`。
- 已在目标 Tab 时：**no-op**（与现逻辑一致）。
- `shell-tab-transition.ts` 保留 **方向判定**（供将来可选动效）；第一期 Tabs **`animationEnabled: false`** 或等价配置，避免与 React Navigation Tab 默认行为冲突。
- 从沉浸页 **`router.push` / `router.back`** 回 Shell 时，**不销毁**已挂载 Tab 子树。

### 2.4 保活与刷新

| 场景                 | 行为                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab 切换             | 组件 **不卸载**；`useState`、ScrollView 偏移保留                                                                                               |
| 回到首页 Tab         | **仍可在 `useFocusEffect` 中刷新数据**（如 `libraryNeedsRefresh`），但 **不 remount**；加载态不得整页闪空（用局部 skeleton 或 silent refresh） |
| 抽屉 → 日历 → 返回   | 沿用 ADR 0014 的 defer / refresh signal；与保活正交                                                                                            |
| 登录 / 装包 / 卸载包 | 现有 refresh signal 触发 **数据重拉**，不要求 remount                                                                                          |

### 2.5 UI 约束（不变）

- 继续使用 **`CapsuleBar`** 自定义组件；`Tabs` 的 `tabBar` 设为 **`() => null`** 或 `display: 'none'`。
- 胶囊文案与顺序：**首页 | 复习 | 资料**（UI §3.2）。
- 复习 Tab 角标逻辑 **不变**（到期数）。

### 2.6 测试与验收

- 单元：`navigateShellTab` 改为 `navigate` 后补测试。
- 手测：
  1. 首页 ↔ 资料 快速切换 **无整页空白闪一下**
  2. 首页列表滚动后切走再切回 **滚动位置仍在**
  3. 复习 Tab 与首页/资料切换 **抽屉与胶囊不闪烁重建**
  4. 学习页 / 包详情 / 日历 / 家长检查 **行为与合并前一致**
  5. 冷启动仍进 `/library`

---

## 3. 风险与缓解

| 风险                           | 缓解                                                            |
| ------------------------------ | --------------------------------------------------------------- |
| 三 Tab 同时挂载 **内存略增**   | 仅 3 个列表页，MVP 可接受；`lazy: false` 可控                   |
| 首页 focus 刷新与保活 **并存** | 明确「只 refetch 不 reset state」；必要时用 refreshKey 局部更新 |
| Tabs 无 Stack 滑动动画         | 第一期关闭 Tab 动画；体验以「不跳」为主                         |
| 深链 `/review?inspect=…`       | 路由文件迁移后 URL 不变，query 解析逻辑原样迁入                 |

---

## 4. 与架构/UI 差异说明

- UI 规范写「不使用传统贴底 Tab 栏」— 仍满足：用户只见 **悬浮 CapsuleBar**；底层 `Tabs` 为 **实现细节**，不暴露系统 TabBar。
- 架构未规定 Shell 必须用 Stack；本 ADR 将 `(shell)` 容器从 Stack 改为 Tabs，**仅影响 Tab 保活**，不改变 use-case / 数据层。

---

## 5. 确认后下一步

1. 实施计划：`docs/superpowers/plans/2026-08-11-shell-tab-keep-alive.md`
2. 独立 PR，合并前 `pnpm check` + 真机 Tab 切换验收
