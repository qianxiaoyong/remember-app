# 阶段 4 启动说明（本地学习完整闭环）

日期：2026-07-28  
状态：已确认，可直接规划与实施  
基线：`main` @ `17df09b`（阶段 3 已收口）

## 1. 本阶段要做什么（一句话）

在 **不登录、不付费、可断网** 的前提下，让 release 实机完成：**安装测试包 → SM-2 学习 → 杀进程/跨天继承 → 点词 → 搜索 → 卸载重装进度仍在**。

完整勾选项：`docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md` §4  
总顺序：`docs/superpowers/plans/2026-07-26-remember-app-mvp-development-order.md` §7

## 2. 当前进度

```text
阶段 0–3  ✅（pack 协议、验包、pack-builder、实机只读验收）
阶段 4    ← 当前
阶段 5–8  ⏸
```

阶段 3 摘要：`docs/superpowers/plans/2026-07-28-phase3-pack-protocol-completion.md`

### 并行暂停（不阻塞阶段 4）

- ICP 备案 + `remember.wehub.top` 部署（挡微信官网审核，不挡本地学习）
- Pause C/D：微信 AppID、OpenSDK 完整回跳（挡真实付费，不挡 mock UI）
- 服务端目录 / 真实订单 / 微信支付（阶段 6）

## 3. 是否需要 4 份子计划？

**需要。** 这不是可选装饰，而是仓库既定流程：

| 依据                   | 要求                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `development-order` §7 | 已列出 4 个 `<date>-*.md` 拆分                             |
| `writing-plans` Skill  | 多子系统必须先写 **任务级** 实施计划，再动代码             |
| `core-rules.md`        | 每个阶段开始前必须有独立任务级计划；一次只做一个可验收行为 |
| `boundaries.md`        | 页面 → 用例 → 领域 → 适配器；计划阶段就要划清文件职责      |

**推荐做法（新窗口按此执行）：**

1. 读本文 + UI 规范 + 架构 §8，**不要**一口气写完全部 UI。
2. 用 `writing-plans` 写 **子计划 1**，`executing-plans` 实施至可验收，再写子计划 2……
3. 每份子计划是 **独立可测** 的垂直切片，不是「先写满 4 份文档再编码」。

**4 份子计划文件名（实施前创建）：**

| 顺序 | 文件                                                               | 核心交付                                                      |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| 1    | `docs/superpowers/plans/2026-07-28-pack-install-and-library.md`    | `user.sqlite` 五表 + 迁移；pack 安装链；`installed_packs`     |
| 2    | `docs/superpowers/plans/2026-07-28-study-scheduler-and-session.md` | SM-2 纯函数 + 测试；任务生成/继承；作答同事务 + `sync_outbox` |
| 3    | `docs/superpowers/plans/2026-07-28-word-lookup-and-search.md`      | 点词直查；收藏本；包内搜索；重新加入复习                      |
| 4    | `docs/superpowers/plans/2026-07-28-mvp-mobile-ui.md`               | 按 UI 图 smoke：我的知识库、市场、详情、学习页、抽屉、胶囊    |

子计划 4 可与 1–3 **并行准备 UI 壳**，但 **真实数据绑定** 必须等对应域层就绪；禁止假数据冒充完成（验收清单通用门禁）。

## 4. 编码原则（必须遵守）

不确定「最小实现」时，**先读**再写：

- `docs/ai-rules/core-rules.md` §最小正确实现
- `docs/ai-rules/code-shape.md`（单文件职责、函数长度）
- `docs/ai-rules/boundaries.md`（页面不直连 SQL/Prisma）
- `$build-learning-app` Skill 第 4 步：「Choose the minimum correct implementation」

**高内聚低耦合在本项目中的含义：**

- **高内聚：** 一个文件/模块只做一件事（如 `ReviewScheduler` 只算 SM-2，不碰 UI）。
- **低耦合：** 页面只调用用例；用例依赖 **端口接口** + 领域纯函数；SQLite 只在适配器层。
- **最小实现：** 满足当前验收的最少代码；不为阶段 5/6 预建插件系统、通用框架或空壳层。
- **UI 微调：** 布局/间距/字号可在不违背 UI 规范 §4 的前提下随实机效果调整；**不**改导航结构、主流程、mock/真做边界。

## 5. UI：按图实现 + mock / 必须真做

视觉参考：用户确认的 5 张 UI 稿 + `docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md` §13 HTML 原型。

**原则：** 界面结构按图与规范；**业务真值** 只来自本地 SQLite / 已冻结 pack 契约。UI 最终可微调，但不得用 mock 数据通过阶段门禁。

### 5.1 我的知识库（图 1）

| 元素                                         | 阶段 4                                                  |
| -------------------------------------------- | ------------------------------------------------------- |
| 布局：概览卡 + 已安装列表 + 胶囊 + 菜单/搜索 | **真做**（结构）                                        |
| 已安装知识库名称、进度、继续/开始学习        | **真做**（读 `installed_packs` + `learning_states`）    |
| 待复习 / 学习中 / 已掌握 / 总条数            | **真做**（从本地状态聚合；样式可简化）                  |
| 「今天已同步」                               | **不做** 或 **隐藏**（云端同步 = 阶段 5；勿假同步成功） |
| 搜索（仅已安装包名）                         | **真做**（本地过滤）                                    |

### 5.2 知识库市场（图 2）

| 元素                             | 阶段 4                                                 |
| -------------------------------- | ------------------------------------------------------ |
| 分类/年级/版本筛选 + 卡片列表 UI | **真做**（结构 + 交互）                                |
| 目录数据、价格、条数             | **Mock**（本地 JSON / 硬编码种子；标注 `catalogSeed`） |
| 点击进详情                       | **真做**（路由 + 传 packId）                           |
| 联网拉目录                       | **阶段 6**                                             |

### 5.3 知识库详情（图 3）

| 元素                               | 阶段 4                                                              |
| ---------------------------------- | ------------------------------------------------------------------- |
| 详情页结构、预览、底部主按钮状态机 | **真做**（UI + 本地状态机）                                         |
| 展示价格                           | **Mock 展示**（须标注非服务端真值，规范 §7）                        |
| 「立即购买」                       | **Mock**（Toast「阶段 6 开放」或 dev 开关切到「已购买」便于测安装） |
| 下载 / 安装 / 进度                 | **真做**（对 **固定测试包** 或本地文件；走 `verifyPackArchive`）    |
| 微信支付                           | **阶段 6**                                                          |

**阶段 4 退出门禁安装路径：** 至少支持从 **内置或 sideload 的 `remember-test-pack.zip`** 完成验包 → 安装 → 学习；市场购买可 mock。

### 5.4 全局抽屉（图 4，B 版）

| 元素                   | 阶段 4                                                                      |
| ---------------------- | --------------------------------------------------------------------------- |
| B 版分组与条目         | **真做**（结构）                                                            |
| 监护人账号 + 手机号    | **Mock 占位**（未登录；点击可提示阶段 5）                                   |
| 学习统计               | **可简化** 或 **隐藏**（非退出门禁必检；见 development-order §13 删减顺序） |
| 下载管理               | **真做**（列表本地安装/下载任务即可）                                       |
| **收藏本**             | **真做**（`packId + surfaceForm` 列表；入口在「学习」分组）                 |
| 订单与权益             | **Mock**（阶段 6）                                                          |
| 基础设置 / 帮助 / 关于 | **Smoke**（静态页或占位，无假完成声明）                                     |

**术语：** 用户可见 **「收藏本」**（非「生词本」）；见 ADR 0008、UI §9。

### 5.5 学习页（图 5）

| 元素                                   | 阶段 4                                         |
| -------------------------------------- | ---------------------------------------------- |
| 两阶段卡片（题面 → 点空白出答案）      | **真做**（pack `vocabulary` content）          |
| 忘记 / 模糊 / 记得 + 动态间隔          | **真做**（SM-2 + 本地持久化）                  |
| 例句点词弹窗                           | **真做**（直查 `lexicon_entries.surfaceForm`） |
| 点词发音首次缓存                       | **真做**（可先用包内/测试 URL）                |
| 右上角更多：搜索当前包 / 切换包 / 设置 | **真做**（搜索与重新加入复习为门禁必检）       |
| 杀进程 / 跨天任务继承                  | **真做**（门禁核心）                           |

### 5.6 Mock 汇总表

| 能力                         | 阶段 4    | 说明                                           |
| ---------------------------- | --------- | ---------------------------------------------- |
| pack 验签安装                | ✅ 必须真 | 复用 `@remember/contracts` `verifyPackArchive` |
| user.sqlite 进度             | ✅ 必须真 | 五表 + 迁移 + 事务                             |
| SM-2 / 任务队列              | ✅ 必须真 | 纯函数 + 集成测试                              |
| 市场目录 / 服务端价格        | ❌ Mock   | 本地 seed                                      |
| 登录 / 同步 / 「今天已同步」 | ❌ 不做   | 阶段 5                                         |
| 微信支付 / 订单 / 权益       | ❌ Mock   | 阶段 6                                         |
| 备案 / 官网                  | ❌ 不相关 | 不挡阶段 4                                     |

## 6. 技术约束（勿忘）

- **pack 安装：** ADR 0005（`backupDatabaseAsync` 或等价安全替换）、ADR 0008（验包链不重写）。
- **点词：** 直查 `surfaceForm`；**不用** `lexicon_forms`。
- **收藏本：** 存 `packId + surfaceForm`；抽屉「学习」→「收藏本」。
- **页面不直接 SQL：** 经 `apps/mobile` 数据访问层 / 用例。
- **sync_outbox：** 阶段 4 只写入本地队列，不上传。
- **假完成禁止：** 验收清单通用门禁。

## 7. 建议 Git 分支

```text
git checkout -b feat/local-study-loop main
```

按子计划分子 commit；子计划 1 完成且可安装测试包后再叠 UI 大范围改动。

## 8. 新窗口起手 Prompt（复制即用）

```text
请阅读 docs/superpowers/plans/2026-07-28-phase4-local-study-loop-kickoff.md、
docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md、
docs/superpowers/plans/2026-07-27-stages-3-6-technical-acceptance-checklist.md §4。
使用 $build-learning-app；编码前读 docs/ai-rules/（core、code-shape、boundaries、words、testing-and-review）。

阶段 4：本地学习闭环。先用 writing-plans 写子计划 1
（2026-07-28-pack-install-and-library.md），再用 executing-plans 实施。
遵守 kickoff §4 最小实现与 §5 mock/真做边界；抽屉「收藏本」非「生词本」。
不要登录/付费/真同步/改 pack 协议。UI 可按实机微调但不改主流程。
子计划 1 验收：release 实机可安装 remember-test-pack 且 installed_packs 有记录。
```

## 9. 完成后需回报

- 各子计划进度与变更文件列表
- `pnpm check` 与域层/SM-2 测试输出
- 断网 release 实机 §4.7 脚本结果（API level 即可）
- mock 项与偏差说明
- UI 相对设计稿的微调记录（若有）

## 10. 相关文档

- UI：`docs/superpowers/specs/2026-07-26-learning-app-mvp-ui-design.md`
- 架构：`docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md`
- Pack：ADR 0008、`.cursor/rules/pack-protocol-alignment.mdc`
- 阶段 3：`docs/superpowers/plans/2026-07-28-phase3-pack-protocol-completion.md`
