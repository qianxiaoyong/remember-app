# 中心内容词库 — 启动说明（Kickoff）

日期：2026-08-04  
状态：**已确认（产品对齐）** — 待新窗口写子计划并实施  
ADR 大纲：**`docs/decisions/0013-central-content-lexicon-outline.md`**  
基线：从 `main` 开分支（merge 后最新）

## 1. 本阶段一句话

交付 **服务端 PostgreSQL 中心词库（`content_*`）** + **Admin 词库子域** + **pack-editor 搜库补词/TTS**；**不**改 App 学习、订单、发版 upload 既有逻辑。

## 2. 产品决策（已对齐）

| #   | 决策 | 内容                                                                                       |
| --- | ---- | ------------------------------------------------------------------------------------------ |
| D1  | 定位 | 维度补全 + AI 包漏词补洞；非替代 AI 制包                                                   |
| D2  | 手机 | 仍只读 pack 快照（ADR 0008）；C 端在线查整库 **本期不做**                                  |
| D3  | 搜索 | **含 draft**；**published 排序优先** + UI 状态徽标                                         |
| D4  | 进包 | 默认 **追加**；冲突人工选替换/跳过；包私有字段 **不回库**                                  |
| D5  | 导入 | ECDICT 批次；格式校验 + 幂等；**不**全库语义清洗                                           |
| D6  | AI   | Admin enrich API；**限流 ~5 并发**；无 `enrichment_runs`；片段 **无** llm 模型版本字段     |
| D7  | TTS  | 制包机 LocalTTS（`D:\LocalTTS`，`127.0.0.1:7860`）；pack-editor **串行队列**；App 不装 TTS |
| D8  | 隔离 | 见 ADR 0013 §3.1；**唯一旧流程交叉 = pack-editor 搜库**                                    |

## 3. 不在本期

- App / 收藏本快照扩展（可另开 7.x）
- 用户侧在线查中心库 API
- 服务端跑 TTS
- `content_jobs` 表、全量 ECDICT 清洗
- 改 ADR 0008 pack 协议

## 4. 目标菜单（Admin 增量）

```text
记得 Admin
├── …（现有驾驶舱/知识库/订单等不变）
└── 📖 中心词库          ← 新增
    ├── 搜索 / 详情 / 发布
    └── （可选）导入批次列表只读
```

pack-editor：story / vocabulary 编辑页增加 **「从中心库补词」** 入口（LexiconWorkbench）。

## 5. 推荐子计划（实施前逐份写细节）

| 顺序 | 文件名（待创建）                                     | 交付                                                                                         |
| ---- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | `2026-08-04-central-lexicon-schema-and-contracts.md` | Prisma migration（7 表）、`packages/contracts/admin/lexicon.ts`、`packages/domain/lexicon/*` |
| 2    | `2026-08-04-central-lexicon-admin-api.md`            | `AdminLexiconModule`：search/detail/patch/by-form/batch-get/enrich（限流）、audit            |
| 3    | `2026-08-04-central-lexicon-admin-ui.md`             | `apps/admin` 词库列表/详情/发布；状态徽标                                                    |
| 4    | `2026-08-04-central-lexicon-pack-editor.md`          | LexiconWorkbench、story+vocabulary adapter、冲突 UI（追加/替换/跳过）                        |
| 5    | `2026-08-04-central-lexicon-ecdict-import.md`        | CLI/脚本：ECDICT → PG；`content_import_batches` 幂等                                         |
| 6    | `2026-08-04-central-lexicon-local-tts.md`            | pack-editor `POST /local-api/tts/synthesize` → LocalTTS；串行队列                            |

**依赖：** 1 → 2 → 3；4 依赖 2（API）；5 依赖 1；6 可与 4 并行（仅 pack-editor）。

## 6. 模块边界（实施必守）

```text
apps/api/src/admin/lexicon/     ← 新建，禁止改 admin/packs 业务逻辑
apps/admin/src/resources/lexicon/
packages/contracts/src/admin/lexicon.ts
packages/domain/src/lexicon/
tools/pack-editor/.../lexicon-workbench/
```

- pack-editor 调 Admin API：`VITE_LEXICON_API` 或复用 admin session（dev 文档定一种）。
- **禁止** `AdminPacksService` import lexicon repository。

## 7. 验收门禁（阶段完成）

- [ ] `pnpm check` 全绿（含新 migration 与集成测试）
- [ ] ECDICT 小样本导入可重复跑（skipped 不重复插）
- [ ] Admin 搜词：draft + published 可见；published 置顶 + 徽标
- [ ] pack-editor：扫 story 段内词 → 查库 → 追加 sidebar 字段；冲突可选
- [ ] enrich 限流生效；patch 写 audit_logs
- [ ] LocalTTS 生成 mp3 写入 source；`validatePackSource` 音频路径通过
- [ ] App 点词/学习 **零回归**（不部署 App 变更亦可）
- [ ] packs/orders 相关集成测试 **无改动或仍全绿**

## 8. Git 分支

```text
git checkout -b feat/central-lexicon main
```

## 9. 文档清单（新窗口读什么）

| 文档                                                           | 状态       | 用途                         |
| -------------------------------------------------------------- | ---------- | ---------------------------- |
| `docs/decisions/0013-central-content-lexicon-outline.md`       | ✅ 已写    | ADR 大纲 + 表结构 + 隔离规则 |
| `docs/superpowers/plans/2026-08-04-central-lexicon-kickoff.md` | ✅ 本文    | 起手与范围                   |
| `docs/decisions/0008-pack-protocol.md`                         | 已有       | pack 快照边界                |
| `docs/decisions/0012-card-type-registry.md`                    | 已有       | adapter 按 cardType          |
| `docs/runbooks/local-api-docker-dev.md`                        | 已有       | PG + API dev                 |
| `docs/runbooks/pack-editor-local.md`                           | 已有       | pack-editor 本地跑法         |
| 子计划 1–6（§5）                                               | ⏸ 实施前写 | executing-plans 逐步实施     |

**不必先写：** 独立 UI spec（Admin 词库页可随子计划 3 写）；完整 ECDICT 数据字典（随子计划 5）。

## 10. 新窗口起手 Prompt

```text
仓库 remember-app（产品名「记得」）。请实施「中心内容词库」。

## 必读（完整阅读后再写子计划）
- docs/superpowers/plans/2026-08-04-central-lexicon-kickoff.md
- docs/decisions/0013-central-content-lexicon-outline.md
- docs/decisions/0008-pack-protocol.md（pack 快照边界，勿改协议）
- docs/decisions/0012-card-type-registry.md
- docs/runbooks/local-api-docker-dev.md
- docs/runbooks/pack-editor-local.md

使用 $build-learning-app 与 writing-plans；分支 feat/central-lexicon。

## 硬规则（ADR 0013 §3.1）
- 新建 AdminLexiconModule + content_* 表；禁止改 packs/orders 业务逻辑
- pack-editor 仅增量：搜库补词 + LocalTTS；不改 build-pack 验签
- App 第一期零改动
- 搜索含 draft，published 优先排序 + UI 徽标
- 进包默认追加；包私有字段不回库
- 无 enrichment_runs；fragments 无 llm_model/prompt_version
- TTS：LocalTTS http://127.0.0.1:7860，pack-editor 串行队列

## 实施顺序
1. 写子计划 2026-08-04-central-lexicon-schema-and-contracts.md 并实施
2. admin API → admin UI → pack-editor Workbench
3. ECDICT 导入与 LocalTTS 可并行在后

先写子计划 1，再 executing-plans；每步 pnpm check。
```

## 11. 相关

- Admin 扩展 spec §8：`docs/superpowers/specs/2026-07-31-admin-dashboard-and-content-extensibility-design.md`
- LocalTTS：`D:\LocalTTS`（`POST /api/synthesize`，port 7860）
