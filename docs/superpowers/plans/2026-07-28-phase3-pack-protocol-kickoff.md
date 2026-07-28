# 阶段 3 启动说明（学习包协议落盘）

日期：2026-07-28  
状态：✅ 阶段 3 已完成（2026-07-28 收口）  
分支：`main` @ `16d62ca`（`feat/pack-protocol` 已合并）

## 1. 本阶段要做什么（不是再讨论）

**讨论对齐已完成**；阶段 3 任务是 **正式冻结并实现**，不要从零开会。

| 顺序 | 产出                            | 路径                                               |
| ---- | ------------------------------- | -------------------------------------------------- |
| 1    | 协议 ADR / spec（从对齐稿迁移） | `docs/decisions/0008-pack-protocol.md`（建议编号） |
| 2    | Zod 契约                        | `packages/contracts/src/pack/`                     |
| 3    | 构建 + 校验 CLI                 | `tools/pack-builder/`                              |
| 4    | 固定测试 zip 包                 | 仓库内固定样例（路径实施时定）                     |
| 5    | App 只读打开验收                | release 实机（阶段 3 退出门禁）                    |

**唯一对齐原件（已确认字段）：** [`.cursor/rules/pack-protocol-alignment.mdc`](../../../.cursor/rules/pack-protocol-alignment.mdc)  
实施时以该文件为准；若与架构 spec 冲突，先报告用户再改，不得静默偏离。

## 2. 当前进度（截至 2026-07-28）

```text
阶段 0  文档基线              ✅
阶段 1  Monorepo + 质量门禁    ✅
阶段 2  五项高风险技术验证      ✅（Task 9 Step 1–4 已通过）
阶段 3  学习包协议与固定样例包  ✅（ADR 0008、contracts、pack-builder、实机 pass）
阶段 4–8                      ⏸
```

### 阶段 2 结论摘要

| 项                  | ADR  | 结果                                |
| ------------------- | ---- | ----------------------------------- |
| 微信 APIv3 密码学   | 0002 | PASS                                |
| PostgreSQL 备份恢复 | 0003 | PASS                                |
| Android 身份与签名  | 0004 | 已验收                              |
| Expo 多 SQLite      | 0005 | PASS（backup 替换）                 |
| Ed25519 验签        | 0006 | PASS（同步 verify + @noble/hashes） |
| 微信 OpenSDK        | 0007 | LIMITED_PASS                        |

移动端 Spike **临时入口已删除**；`apps/mobile/modules/wechat-open-sdk/` **保留**。

### 并行暂停（不阻塞阶段 3）

- **Pause C/D**：微信开放平台 AppID、`registerApp`、支付回跳（见 `technical-spikes.md`）
- 官网 ICP 备案、`remember.wehub.top` 部署

## 3. 必用规则（按优先级）

1. [`AGENTS.md`](../../../AGENTS.md) — 根规则
2. [`docs/ai-rules/`](../../ai-rules/) — 编码、边界、安全、用词（写代码前按任务范围全读）
3. [`.cursor/rules/pack-protocol-alignment.mdc`](../../../.cursor/rules/pack-protocol-alignment.mdc) — **学习包协议已对齐项**（alwaysApply）
4. 架构：[`2026-07-26-learning-app-mvp-architecture-design.md`](../specs/2026-07-26-learning-app-mvp-architecture-design.md)
5. UI：[`2026-07-26-learning-app-mvp-ui-design.md`](../specs/2026-07-26-learning-app-mvp-ui-design.md)
6. 总顺序：[`2026-07-26-remember-app-mvp-development-order.md`](2026-07-26-remember-app-mvp-development-order.md) §6
7. 验收清单：[`2026-07-27-stages-3-6-technical-acceptance-checklist.md`](2026-07-27-stages-3-6-technical-acceptance-checklist.md) §阶段 3

**冲突处理：** 用户要求与架构/安全/数据规则冲突时，明确报告并等待确认。

## 4. 必用 Skill

| 场景                       | Skill                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 任何写代码 / 改契约 / 测试 | `$build-learning-app`（原件 `skills/build-learning-app/`，Cursor 副本 `.cursor/skills/build-learning-app/`） |
| 多步实施前                 | `writing-plans` → 写 `docs/superpowers/plans/` 实施计划                                                      |
| 执行计划                   | `executing-plans` 或 `subagent-driven-development`                                                           |
| 声称完成 / 通过门禁前      | `verification-before-completion`（必须跑命令看输出）                                                         |
| 创造性扩展 cardType 等     | 先 `brainstorming`，但 **本阶段以已对齐稿为准，默认不扩展**                                                  |

## 5. 阶段 3 退出门禁（一句话）

固定测试包：**构建 → 独立校验 → release 实机只读打开**；任一字节篡改必须失败。

完整勾选项见 [`2026-07-27-stages-3-6-technical-acceptance-checklist.md`](2026-07-27-stages-3-6-technical-acceptance-checklist.md) §3。

## 6. 技术约束（实施时勿忘）

- **契约唯一来源：** `packages/contracts` Zod；可选字段 **省略键**，不用 `null` 占位。
- **pack 交付物：** 单文件 `.zip`（`packManifest.json` + `pack.sqlite` + `assets/`），非 APK。
- **验签：** Ed25519；移动端配置见 ADR 0006。
- **pack 安装：** SQLite 优先 `backupDatabaseAsync` 或等价安全路径（见 ADR 0005）。
- **点词：** 直查 `lexicon_entries.surfaceForm`；`lexicon_forms` 第一期 0 行。
- **错误码：** 稳定 `PACK_*`；UI 展示人话，不直接展示码。
- **secrets：** keystore、`signing.properties`、Ed25519 私钥 **不进 Git**（`D:\AIcoder\remember-secrets\`）。

## 7. 环境与构建备忘

| 项                         | 值                                                              |
| -------------------------- | --------------------------------------------------------------- |
| 仓库                       | `D:\AIcoder\remember-app`                                       |
| applicationId              | `com.remember.app`                                              |
| Android release 短路径构建 | `D:\r\a`（见 `docs/runbooks/android-release-build-windows.md`） |
| 签名环境变量               | `REMEMBER_ANDROID_SIGNING_PROPERTIES`                           |
| PostgreSQL Spike           | 需 Docker Desktop + 进程作用域 `POSTGRES_PASSWORD`              |
| 全仓库门禁                 | 根目录 `pnpm check`                                             |

## 8. 建议 Git 分支

```text
git checkout -b feat/pack-protocol main
```

阶段 3 完成后 merge 回 `main`；不要在本阶段改阶段 4+ 业务页面。

## 9. 新窗口起手 Prompt（复制即用）

```text
请阅读 docs/superpowers/plans/2026-07-28-phase3-pack-protocol-kickoff.md
和 .cursor/rules/pack-protocol-alignment.mdc。
使用 $build-learning-app。阶段 3：把已对齐的学习包协议落盘为
ADR + packages/contracts Zod + tools/pack-builder + 固定测试 zip。
不要重新讨论协议字段；对齐稿无变更。完成后按 stages-3-6 验收清单 §3 自检。
```

## 10. 完成后需回报的内容

阶段 3 **整阶段完成** 时，请在新窗口汇总：

- 变更文件列表
- `pnpm check` 输出结论
- 测试 zip 路径与 verify 命令
- 实机只读打开结果（API level 即可，无设备序列号）
- 未决项 / 与对齐稿的偏差（若有）

**是否复制回本窗口审核：** 见下节建议。

## 11. 审核建议（给产品负责人）

| 情况                                              | 是否需要复制回来给原窗口 / 人工审核               |
| ------------------------------------------------- | ------------------------------------------------- |
| 日常小步 commit、单文件 schema                    | **不必**；看 Git diff 即可                        |
| 阶段 3 **全部退出门禁通过**                       | **建议**复制摘要或开 PR 让人过目 ADR + 测试包结论 |
| 发现与 `pack-protocol-alignment.mdc` 冲突需改协议 | **必须**；先确认再改契约                          |
| 准备进入阶段 4                                    | **建议**；阶段 4 依赖阶段 3 冻结的 pack 契约      |

Routine 进度不必逐条复制；**阶段门禁节点**（阶段 3 完成、重大协议变更）值得复制回来做一次审查。
