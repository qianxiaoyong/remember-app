# 0013 中心内容词库（大纲）

日期：2026-08-04  
状态：**草案（大纲）** — 产品对齐用；实现前需单独 kickoff + migration 子计划  
关联：ADR 0008（pack 内 lexicon 快照）、`2026-07-31-admin-dashboard-and-content-extensibility-design.md` §8

## 1. 背景与问题

- 学习包主体由 **外部订阅 AI** 生成，经 `pack-builder/source/` → zip；**大部分包可直接使用**。
- AI 包在 **点词维度、词形、例句/发音** 上可能遗漏或不完整；制包时需 **查库补洞、补维度**。
- 手机 App **离线学习**，点词读 **pack 内快照**（`lexicon_entries` / story `sidebar[]`），不运行时查整库（ADR 0008 不变）。
- 中心词库长期价值：质量提升后，可对 **运营制包** 与 **未来用户侧能力** 提供统一数据源；本期不承诺 C 端在线查整库。

## 2. 决策摘要

| 项        | 决定                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 存储      | 服务端 **PostgreSQL** 新表族 `content_*`；**不**把整库放进 pack.zip                                                                                                |
| 角色      | **维度补全 + 漏词补洞**；非替代 AI 制包主流程                                                                                                                      |
| 制包查词  | pack-editor / Admin **优先查中心库**；缺词提示补库或 AI 新建                                                                                                       |
| 进包策略  | 默认 **追加**；与包内已有冲突时 **人工选** 替换/跳过                                                                                                               |
| 回库边界  | **包私有字段不回写**（如 story `tier`、`vocabId` 命名）                                                                                                            |
| 词条状态  | `draft` / `published` / `archived`；搜索 **含 draft**，**published 排序优先** + UI 徽标                                                                            |
| 导入      | ECDICT 批次导入；格式校验 + `lemma_key` 唯一 + 幂等；**不做全库语义清洗**                                                                                          |
| AI 洗数据 | Admin API 调 LLM，**限流并发**（约 5 路）；**不**建 `enrichment_runs`；片段表 **不**存 `llm_model` / `llm_prompt_version`                                          |
| TTS       | **制包机本地** [LocalTTS](https://github.com/qianxiaoyong/LocalTTS)（`D:\LocalTTS`，`127.0.0.1:7860`）；pack-editor **串行队列**；App **不**内置 TTS，只播包内 mp3 |
| 手机收藏  | 扩展 `user.sqlite.saved_lexicon_items` 为 **点词快照 JSON**（非 PG 表）                                                                                            |

## 3. 架构边界

```text
ECDICT / 人工 / AI enrich
        ↓
PostgreSQL content_*（中心词库）
        ↓ 制包时 LexiconWorkbench + PackLexiconAdapter
pack-builder source → signed zip → App 只读 pack.sqlite
```

- **Admin**：词库 CRUD、搜索、发布、ECDICT 导入、AI enrich API。
- **pack-editor**：共用 Workbench；查库 → 映射字段 → 写入 source；TTS 调 LocalTTS HTTP。
- **App**：不变；收藏本存用户侧快照，**不云同步**（沿用架构 §5）。

### 3.1 与旧业务隔离（硬规则）

中心词库是 **独立 Admin 子域**；除 pack-editor「搜库补词」外，**不修改**既有交易/发版/学习链路。

| 隔离项      | 要求                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| 数据库      | 新增 `content_*` 表族；**不**改 `packs` / `orders` / `pack_access` / `users` 等现有表                            |
| API 模块    | `AdminLexiconModule`（新目录）与 `AdminPacksModule` 等 **并列**；禁止在发版/upload/订单 service 内查 `content_*` |
| Admin UI    | 新菜单「中心词库」；不动现有五类运营页逻辑                                                                       |
| pack-editor | **仅增量**：搜库 / 带入 / TTS；**不**改 `build-pack` 验签与 ADR 0008 协议                                        |
| App         | 第一期 **零改动**；仍只读 pack 快照                                                                              |
| 鉴权/审计   | **复用** `AdminAuthGuard`、`audit_logs`（append）；不新造登录体系                                                |

**唯一交叉点：** pack-editor 经 HTTP 调 Admin lexicon API（或 dev 直连同一 PG 只读层，仍走 repository 端口，不嵌入 packs 代码）。

**禁止：** Packs/Orders/Refunds 模块 import `content_*` repository；pack 上传校验 **不得** 依赖中心库是否有词条。

## 4. 数据表（7 张）

### 4.1 `content_lemmas`（词条主表）

| 字段                                    | 说明                                  |
| --------------------------------------- | ------------------------------------- |
| `id`                                    | 主键 UUID                             |
| `lemma_key`                             | 规范键，唯一（小写 strip，如 `go`）   |
| `headword`                              | 展示词形                              |
| `ipa`                                   | 音标                                  |
| `pos`                                   | 主词性摘要                            |
| `status`                                | `draft` / `published` / `archived`    |
| `source`                                | `ecdict` / `manual` / `ai` / `merged` |
| `difficulty_level`                      | 内部难度 1–10（**非**小学年级字段）   |
| `cefr_level`                            | 可选 A1–C2                            |
| `frequency_bnc`, `frequency_frq`        | ECDICT 词频序                         |
| `collins_star`, `oxford_core`           | ECDICT 标注                           |
| `import_batch_id`                       | 导入批次 FK，可空                     |
| `published_at`, `published_by_admin_id` | 发布审计                              |
| `created_at`, `updated_at`              | 时间戳                                |

### 4.2 `content_lemma_fragments`（片段，一对多）

| 字段                       | 说明                                        |
| -------------------------- | ------------------------------------------- |
| `id`, `lemma_id`           | 主键、外键                                  |
| `fragment_type`            | 见 §5                                       |
| `content`                  | JSONB                                       |
| `sort_order`               | 同类型排序                                  |
| `source`                   | `ecdict` / `manual` / `llm`（不记模型版本） |
| `created_at`, `updated_at` | 时间戳                                      |

### 4.3 `content_lemma_forms`（词形映射）

| 字段           | 说明                            |
| -------------- | ------------------------------- |
| `form_key`     | 变体规范键，唯一（如 `went`）   |
| `lemma_id`     | 原形 FK                         |
| `form_type`    | `past` / `plural` / `gerund` 等 |
| `display_form` | 展示形                          |
| `source`       | `ecdict` / `manual` / …         |
| `created_at`   | 创建时间                        |

### 4.4 `content_tags` + `content_lemma_tag_links`

- 标签字典：`tag_key`（如 `primary-school`、`story`）、`label_zh`。
- 多对多：`lemma_id` ↔ `tag_id`；用于市场/场景，**不用** `grade_band` 等小学专用列。

### 4.5 `content_import_batches`

| 字段                                             | 说明                               |
| ------------------------------------------------ | ---------------------------------- |
| `source_name`, `file_version`, `file_sha256`     | 来源与幂等                         |
| `status`                                         | `running` / `completed` / `failed` |
| `inserted_count`, `skipped_count`, `error_count` | 统计                               |
| `started_at`, `finished_at`, `error_message`     | 批次生命周期                       |

### 4.6 `content_lemma_assets`（发音等资源）

| 字段                                                | 说明                                   |
| --------------------------------------------------- | -------------------------------------- |
| `lemma_id`, `asset_kind`                            | 如 `pronunciation_us`、`example_audio` |
| `storage_kind`                                      | 第一期 `pack_relative`；后期 `cos`     |
| `path_or_key`, `sha256`, `duration_ms`, `mime_type` | 文件元数据                             |
| `voice_id`, `tts_text`                              | LocalTTS 溯源（可选，轻量）            |
| `created_at`                                        | 创建时间                               |

**刻意不建：** `content_enrichment_runs`；片段行不存 LLM 模型/prompt 版本。

## 5. 第一期 `fragment_type`

| 类型            | `content` 要点                            |
| --------------- | ----------------------------------------- |
| `definition_zh` | `{ text, pos? }`                          |
| `definition_en` | `{ text }`                                |
| `example`       | `{ en, zh, note? }`                       |
| `mnemonic`      | `{ text }`                                |
| `morphology`    | `{ root?, prefix?, suffix?, breakdown? }` |
| `note`          | `{ text }`（运营备注）                    |

缺类型 **下期再加**；不提前抽象插件框架。

## 6. API 与工具（轮廓）

| 能力            | 路径/位置                                                                              |
| --------------- | -------------------------------------------------------------------------------------- |
| 搜索            | `GET /api/v1/admin/lexicon/search?q=&status=` — published 优先排序，含 draft           |
| 详情            | `GET /api/v1/admin/lexicon/:lemmaKey` — 全量 lemma + fragments + forms + assets + tags |
| 变体反查        | `GET /api/v1/admin/lexicon/by-form/:formKey`                                           |
| 批量读          | `POST /api/v1/admin/lexicon/batch-get`                                                 |
| 写入            | `PATCH /api/v1/admin/lexicon` — `LemmaPatch[]` + `audit_logs`                          |
| AI enrich       | `POST /api/v1/admin/lexicon/enrich` — 限流；产出片段草稿，确认后 patch                 |
| pack-editor TTS | `POST /local-api/tts/synthesize` → 代理 `LocalTTS POST /api/synthesize`，**serial=1**  |
| 共用 UI         | `LexiconWorkbench` + `PackLexiconAdapter`（story / vocabulary 各一）                   |

契约落盘：`packages/contracts/src/admin/lexicon.ts`（待建）。

## 7. 非目标（本期）

- App 运行时联网查中心整库。
- 服务端跑 TTS 或把 TTS 引擎打进 APK。
- 全量 ECDICT 语义清洗、enrichment 逐条审计表。
- 收藏本云同步。
- 混合包 / 新 cardType 的 adapter（随 cardType 增量添加）。

## 8. 验收方向（实现阶段）

- [ ] ECDICT 导入幂等；`lemma_key` 唯一。
- [ ] Admin 搜词：published 置顶 + 状态徽标；draft 可搜可进包。
- [ ] pack-editor 扫词 → 查库 → 追加进 source；冲突 UI 可选替换/跳过。
- [ ] AI enrich 限流；写片段 `source=llm`，无模型版本字段。
- [ ] LocalTTS 串行生成 mp3 → `assets/audio/`；validate 通过。
- [ ] App 学习/点词 **零回归**（仍只读 pack）。

## 9. 后续文档

- Kickoff：**`docs/superpowers/plans/2026-08-04-central-lexicon-kickoff.md`**（新窗口起手）
- 实施前子计划（kickoff §5 列出；实施时再写细节）：
  - migration + contracts + domain
  - Admin lexicon API + UI
  - pack-editor Workbench + adapter + LocalTTS
  - ECDICT 导入 CLI
- 冻结后：本文件状态改为 **已冻结**

## 10. 相关

- ADR 0008 — pack 内 `lexicon_entries` / 点词规则
- ADR 0012 — cardType registry（adapter 按 cardType 扩展）
- Admin 扩展 §8 — AI 内容生产（本期仅 enrich API，无 `content_jobs` 表）
