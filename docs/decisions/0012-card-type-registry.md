# 0012 cardType 轻量 Registry（呈现分发）

日期：2026-08-02  
状态：**已确认**（随 `2026-08-01-card-type-registry.md` 实施）  
关联：ADR [0008](./0008-pack-protocol.md)（zip 外壳与 vocabulary schema）；计划 `docs/superpowers/plans/2026-08-01-card-type-registry.md`

## 背景

第一期 pack 协议（ADR 0008）冻结了 `vocabulary` 一种 `cardType` 与 zip/SQLite 外壳。后续将引入 `story_reading`、`dialogue_scenario` 等新呈现，需要在 **不改变 vocabulary 学习行为** 的前提下，为 study 屏、content parse、pack verify 建立按 `cardType` 分发的轻量 registry，避免在 study 壳层硬编码类型分支。

## 决策

### 1. CardType 命名

`cards.cardType` 与 registry 键使用 **小写 snake_case 字符串**，与 SQLite、`constants.ts`、`SUPPORTED_CARD_TYPES` 一致：

| 值                  | 状态                                           |
| ------------------- | ---------------------------------------------- |
| `vocabulary`        | 第一期已冻结（ADR 0008）                       |
| `story_reading`     | **已实现**（2026-08-02，`feat/story-reading`） |
| `dialogue_scenario` | 预留，**本 ADR 不实现**                        |

扩展新 type 时须同步更新 `SUPPORTED_CARD_TYPES`、parse 分支、validate 注册、mobile Renderer 注册；不得半套落地。

### 2. reviewMode

每种 cardType 在 mobile registry 声明 `reviewMode`，study 壳层据此决定是否展示 SM-2 三按钮底栏：

| 值                | 含义                         | 本计划             |
| ----------------- | ---------------------------- | ------------------ |
| `sm2`             | 揭示后展示间隔复习按钮       | ✅ `vocabulary`    |
| `none`            | 无 SM-2 底栏（阅读/浏览类）  | ✅ `story_reading` |
| `lesson_complete` | 滚到底后「我读完了」（预留） | 预留               |
| `interactive`     | 交互式作答后再评分           | 预留               |

### 2.1 libraryPresentation

registry 可选声明 `libraryPresentation`，书库 UI 据此分支（**不由 pack 固定 enum 决定**）：

| 值       | 书库行为                    | 本计划             |
| -------- | --------------------------- | ------------------ |
| `study`  | SM-2 进度条 + 继续/开始学习 | ✅ `vocabulary`    |
| `reader` | 「上次读到」+ 继续/开始阅读 | ✅ `story_reading` |

### 3. 三层分发（静态编译期，非运行时插件）

```text
packages/contracts     parsePackCardContent(cardType, contentJson)
        ↓
pack-builder verify    validatePackCards → validateVocabularyCard / validate-*-card
        ↓
apps/mobile            cardTypeRegistry[type].Renderer
```

- **contracts**：`parsePackCardContent` 为统一入口；`parseCardContentJson` 保留为 vocabulary 别名，避免外部引用一次性断裂。
- **pack-builder**：经 `@remember/contracts` 校验；未知 `cardType` 抛 `PACK_UNSUPPORTED_CARD_TYPE`。
- **mobile**：`cardTypeRegistry` 映射 `Renderer` + `reviewMode` + `libraryPresentation`；会话/SM-2 逻辑保留在 `study-screen` 壳层，Renderer 只负责卡片区呈现。

**明确不做：** 运行时插件、远程加载 Renderer、HTML 富文本进 pack、App 直连 LLM。

### 4. 与 ADR 0008 的分工

| 域                                                                                                      | ADR      |
| ------------------------------------------------------------------------------------------------------- | -------- |
| zip 结构、manifest、Ed25519、SQLite 三表、knowledgeId、lexicon、vocabulary JSON schema、`PACK_*` 验包链 | **0008** |
| `cardType` 扩展时的 parse / validate / Renderer 注册约定、`reviewMode`、新增 type checklist             | **0012** |

0008 仍管「包能不能装」；0012 管「装进去以后各 cardType 怎么 parse、怎么验、怎么学」。

### 5. 未知 cardType 行为

| 层                  | 行为                                                        |
| ------------------- | ----------------------------------------------------------- |
| contracts parse     | `PackVerificationError` / `PACK_UNSUPPORTED_CARD_TYPE`      |
| pack-builder verify | 同上                                                        |
| mobile study        | `UnsupportedCardPanel`（文案 + 返回书库）；不展示 SM-2 底栏 |

## 后果

- `SUPPORTED_CARD_TYPES` 含 `vocabulary` 与 `story_reading`（2026-08-02 起）。
- 搜索/预览等路径须识别 `PackCardDetail.cardType`；非 vocabulary 预览不在本计划范围。
- 页面/用例继续经 repository / use-case 读 sqlite，不直连数据库。

## 附录：新增 cardType 检查清单

后续新 type **另开计划**，按序：

1. ADR 或 amend 0012：content schema 与 `reviewMode`
2. `packages/contracts`：schema + `parsePackCardContent` 分支 + `SUPPORTED_CARD_TYPES` 追加
3. `validate-*-card.ts` + `verify-content` 注册
4. `apps/mobile/learning/card-types/<type>/`：Renderer + parse
5. `registry.ts` 注册一行
6. pack-builder 测试包 + mobile 手工回归
7. （可选）pack-editor 表单

## 附录：story_reading（2026-08-02 冻结；2026-08-03 reader v2 修订）

关联 spec：`docs/superpowers/specs/2026-08-02-story-reading-design.md`；`protocolVersion` **保持 1**。

### content JSON（严格三键 + optional 段字段）

```typescript
{
  lesson: { code, titleEn, titleZh, coverImage, primaryAudio };
  story: {
    paragraphs: [{
      runs: TextRun | WordRun[];
      translationZh?: string;
      audioStartMs?: number;
      audioEndMs?: number;
    }];
  };
  sidebar: [{ vocabId, headword, ipa, pos, definitionZh, tier }];
}
```

- `TextRun`：`{ kind: 'text', text }`
- `WordRun`：`{ kind: 'word', surface, glossZh, tier, vocabId }`；`tier`: `high` | `mid` | `low`
- `glossZh`：pack 校验字段；UI **不** inline 展示（点词读 sidebar；段译读 `translationZh`）
- 可选字段省略键，不用 `null`；Zod `.strict()`

### knowledgeId

```text
{packId}:story:{lessonSlug}
```

`lessonSlug` 由 `lesson.code` 规范化（trim、小写、非 `[a-z0-9-]` → `-`）。与 vocabulary `{packId}:en:word|phrase:{slug}` 命名空间隔离。

### 校验（contracts / pack-builder）

1. 至少 1 个 `paragraph`、至少 1 个 run
2. 每个 `word` run 的 `vocabId` 须在 `sidebar` 存在，且 `tier` 一致
3. `sidebar` 每条 `vocabId` 须被至少一个 `word` run 引用（不允许孤儿）
4. `coverImage`、`primaryAudio` 须在 manifest 资源清单
5. MVP **不写** story 词到 `lexicon_entries`；点词读 `sidebar`

### reviewMode 与 libraryPresentation

```text
story_reading → reviewMode: none, libraryPresentation: reader
```

- study 壳层 **无** SM-2 底栏、**无**「我读完了」
- reader 模式经 `?knowledgeId=` 或书签进入，不建 SM-2 session 队列

### 阅读进度（bookmarks）

`user.sqlite` `story_reading_bookmarks`（v3 migration）：

| 字段          | 说明     |
| ------------- | -------- |
| `packId`      | PK       |
| `knowledgeId` | 当前课   |
| `positionMs`  | 音频进度 |
| `updatedAt`   | ISO 时间 |

**不写入** `learning_states`；**不使用** 完成哨兵。

### 与 vocabulary 差异

|      | vocabulary               | story_reading           |
| ---- | ------------------------ | ----------------------- |
| 阶段 | prompt → reveal          | 单屏阅读 + 播放器       |
| 底栏 | SM-2 三按钮              | 音频播放器              |
| 进度 | learning_states + 队列   | story_reading_bookmarks |
| 点词 | lexicon_entries          | sidebar                 |
| 主图 | prompt.primaryImage 可选 | lesson.coverImage 必填  |
