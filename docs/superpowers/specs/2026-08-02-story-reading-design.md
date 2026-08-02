# story_reading 卡片类型设计规范

日期：2026-08-02  
状态：**已确认**（2026-08-02 产品对齐）  
关联：ADR [0012](../decisions/0012-card-type-registry.md)、[0008](../decisions/0008-pack-protocol.md)；UI 规范 §8；计划 `2026-08-01-card-type-registry.md`（registry 已 merge，PR #7）

## 1. 背景与目标

第一期 `vocabulary` 卡片（A/B 闪卡 + SM-2 三按钮）已冻结并实现。产品需要第二种呈现：**童话/短文注释阅读**——插图、可播放音频、正文词级高亮与行内中文注释、本课词表与频次图例。

cardType registry（ADR 0012）已在 `main` 落地；本 spec 冻结 **`story_reading`** 的协议字段、校验规则与移动端 UI 行为，作为实施与 pack 制包的单一依据。

### 1.1 目标

| # | 目标 |
| --- | --- |
| G1 | 新增 `cardType: story_reading`，与 `vocabulary` 可在 **同一 pack、同一 App** 共存 |
| G2 | 移动端 **注释阅读 UI**：插图、播放按钮、行内注释、点词详情、「本课 N 词」入口、频次图例（运行时计数） |
| G3 | 学习完成方式为 **`lesson_complete`**：滚到底 →「我读完了」→ 记进度 → 下一课；**不进 SM-2 复习队列** |
| G4 | 复用现有 pack 管道（zip 验签、安装、同步、Admin 发版）；仅扩展 contracts 校验与 mobile Renderer |
| G5 | 正文用 **结构化 JSON runs**，不用 HTML 富文本；Zod `.strict()` 可校验 |

### 1.2 非目标（MVP defer）

- 扫码 QR 听音频（App 内播放按钮即可）
- 词下小字排版（MVP 用行内括号/小字；后续可加 `presentationVariant`）
- 宽屏左右双栏（MVP 竖屏：正文 + 点词/词表入口）
- 阅读后理解题 / 选择题（`reviewMode: interactive` 另 type）
- story 词写入 `lexicon_entries`、收藏本联动（MVP 只读 `sidebar`）
- pack-editor story 表单（随实施计划；可晚于 mobile 只读验证）
- Admin / API / 支付 / 同步表结构变更
- `protocolVersion` 递增（见 §6.4）

## 2. 产品决策摘要

| 决策 | 内容 |
| --- | --- |
| D1 完成方式 | `reviewMode: lesson_complete`；滚到底可点「我读完了」；不进 SM-2 |
| D2 注释样式 | 行内：`surface（glossZh）`，tier 决定背景色 |
| D3 窄屏词表 | 正文 `word` run 可点 → 底部弹层；顶栏/课头区「本课 N 词」→ 全词表页 |
| D4 音频 | `lesson.primaryAudio` 包内路径；课头播放按钮 |
| D5 频次图例 | App 固定「红:高频 / 蓝:中频 / 绿:低频」文案；**运行时**按本课 `tier` 计数 |
| D6 系列元数据 | 「40篇童话…」等 **只在 pack source `meta.json`**，不进 card content |
| D7 点词数据源 | **仅 `sidebar[]`**；MVP 不写 `lexicon_entries` |
| D8 一课一卡 | 一张阅读页 = sqlite `cards` 一行 |
| D9 进度 | 记住读到哪一课；下次从 **第一个未完成课** 继续（按 pack 内 `sortOrder`） |

## 3. 与现有架构的关系

```text
pack zip / 安装 / 验签 / 权益 / Admin / sync_outbox     ← 不变
cards 表（knowledgeId, cardType, sortOrder, content）  ← 多一种 cardType
        │
        ├─ vocabulary      → registry → VocabularyStudyPanel（SM-2）
        └─ story_reading   → registry → StoryReadingPanel（lesson_complete）
```

**PR #7 已交付（本 spec 的前置）：** `cardTypeRegistry`、`parsePackCardContent`、`validatePackCards` 分发、`study-screen` 按 `reviewMode` 控制底栏、`UnsupportedCardPanel`。

**本 spec 交付：** ADR 0012 附录、`storyReadingContentSchema`、verify 规则、`StoryReadingRenderer`、`lesson_complete` 完成路径、测试包样例。

## 4. 进度与 knowledgeId

### 4.1 knowledgeId 格式

```text
{packId}:story:{lessonSlug}
```

- `lessonSlug`：由 `lesson.code` 规范化（trim、小写、非 `[a-z0-9-]` 替换为 `-`）
- 示例：`en-fairy-tales-v1:story:c1`
- 包内唯一；与 vocabulary 的 `{packId}:en:word|phrase:{slug}` **命名空间隔离**

### 4.2 完成态语义

用户点「我读完了」后：

1. 写入/更新 `user.sqlite` `learning_states` 该 `knowledgeId` 一行
2. 使用 **完成哨兵**（实施计划定具体值）：使该卡 **不再** 出现在 SM-2 到期复习（`dueAt` 永不到期或等价语义）
3. 当前会话队列该项标记 `done`，进入下一项
4. 写入 `sync_outbox`（与 vocabulary 相同事务边界）

未点完成就退出：无 `learning_states` 行，下次仍作为 **new** 课入队（从该课重新开始）。

### 4.3 队列与混 pack

- `story_reading` 课 **永不** 因 SM-2 到期再入队
- 未学完的 story 课按 `cards.sortOrder` 与其他 **new** 卡一并受 `dailyNewCardQuota` 约束
- 与 `vocabulary` 混 pack 时：vocabulary 仍走现有 due/review 逻辑；story 仅 new + 一次 complete

## 5. pack 元数据（系列信息）

系列标题、册别、适用年级等放在 **`tools/pack-builder/source/<packId>/meta.json`**（现有 pack source 元数据），**不**重复写入每张 story card 的 `content`。

card `content.lesson` 只保留 **课级** 字段（课次、本课标题、封面、音频）。App 课头如需系列名，从已安装 pack 的目录/displayName 或后续扩展的 installed 元数据读取；**MVP 课头可不展示系列名**，仅展示 `lesson.code` + 中英标题。

## 6. 协议：content JSON Schema

### 6.1 顶层结构

`cards.content` 为 JSON 字符串，解析后为 **严格对象**，仅允许下列键：

```typescript
{
  lesson: StoryLesson;
  story: { paragraphs: StoryParagraph[] };
  sidebar: StorySidebarEntry[];
}
```

### 6.2 `lesson`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string min 1 | ✅ | 课次，如 `C1`；用于 knowledgeId slug |
| `titleEn` | string min 1 | ✅ | 英文标题 |
| `titleZh` | string min 1 | ✅ | 中文标题 |
| `coverImage` | string min 1 | ✅ | 包内相对路径，须在 manifest 资源清单 |
| `primaryAudio` | string min 1 | ✅ | 本课朗读音频，包内相对路径 |

**故意省略：** `wordCount`（App 可由 sidebar/runs 统计）、系列名、QR URL。

### 6.3 `story.paragraphs[].runs[]`

联合类型，由 `kind` 判别：

**`kind: "text"`**

| 字段 | 必填 |
| --- | --- |
| `kind: "text"` | ✅ |
| `text` | ✅ 非空字符串 |

**`kind: "word"`**（注释词）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `kind: "word"` | ✅ | |
| `surface` | ✅ | 英文词形（展示用） |
| `glossZh` | ✅ | 行内中文注释 |
| `tier` | ✅ | `high` \| `mid` \| `low` |
| `vocabId` | ✅ | 稳定 ID，与 sidebar 关联 |

渲染：`surface（glossZh）`，`surface` 按 `tier` 上色（红/蓝/绿 App 主题 token）。

### 6.4 `sidebar[]`

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `vocabId` | ✅ | 主键，包内本课唯一 |
| `headword` | ✅ | 词头 |
| `ipa` | ✅ | 音标字符串 |
| `pos` | ✅ | 词性，如 `n.` `adj.` |
| `definitionZh` | ✅ | 中文释义（弹层/词表用，可与 glossZh 相同） |
| `tier` | ✅ | `high` \| `mid` \| `low` |

### 6.5 校验规则（pack-builder / contracts）

1. Zod `.strict()` 拒绝未知键
2. 至少 1 个 `paragraph`，至少 1 个 run
3. 每个 `kind: "word"` 的 `vocabId` **必须** 存在于 `sidebar`（同 id 的 `tier` 必须一致）
4. `sidebar` 每条 `vocabId` **必须** 被至少一个 `word` run 引用（**不允许** 词表孤儿）
5. `coverImage`、`primaryAudio` 路径符合 ADR 0008 资源规则
6. `cardType === 'story_reading'` 时走本 schema；vocabulary  schema **不变**

### 6.6 protocolVersion

**保持 `protocolVersion: 1`。** 理由：zip 外壳、manifest、sqlite 三表、vocabulary schema 均未破坏性变更；新 cardType 由 ADR 0012 扩展。旧版 App 不支持 `story_reading` 时验包或运行时分发错误，由 **App 版本** 解决，不 bump 协议版本。

## 7. reviewMode：`lesson_complete`

在 ADR 0012 `reviewMode` 枚举中 **新增** `lesson_complete`（实施时同步 `types.ts` 与 ADR 附录）。

| reviewMode | 底栏 | 适用 |
| --- | --- | --- |
| `sm2` | 忘记/模糊/记得 | vocabulary |
| `lesson_complete` | 「我读完了」（滚到底后 enabled） | story_reading |
| `none` | 无 | 预留 |
| `interactive` | 交互提交 | 预留 |

**study-screen 行为：**

- 不显示 `StudyRatingBar`
- `lesson_complete` 时 footer 显示「我读完了」；默认 disabled，Renderer 报告「已滚到底」后 enabled
- 点击 → 调用 `confirmLessonComplete`（新 use-case，不写 SM-2 间隔）→ 下一卡

## 8. 移动端 UI

遵循 UI 规范 §8 骨架：隐藏底部胶囊、轻量顶栏、右上角更多菜单。**不**使用 vocabulary 的两阶段 prompt/reveal。

### 8.1 布局（竖屏 MVP）

```text
┌─────────────────────────────┐
│ ←  进度          更多 ⋮     │
├─────────────────────────────┤
│ [封面图]                     │
│ C1  The Princess… / 公主…   │
│ 🔊 播放    [本课 17 词 ›]    │
│ 红:高频(17) 蓝:中频(7) 绿:低频(7)  ← 运行时计数
├─────────────────────────────┤
│ （ScrollView 正文）          │
│ Once upon a time, real（真的）…│
│ …                           │
├─────────────────────────────┤
│      [ 我读完了 ]            │  ← 滚到底后可用
└─────────────────────────────┘
```

### 8.2 交互

| 操作 | 行为 |
| --- | --- |
| 播放 | 播 `lesson.primaryAudio`；复用 pack 内音频播放链 |
| 点 `word` run | 底部 sheet：headword、ipa、pos、definitionZh、tier 色条 |
| 「本课 N 词」 | 进入词表页（列表同 sidebar 顺序；项可点开展开详情） |
| 滚到底 | 启用「我读完了」 |
| 更多菜单 | 与 vocabulary 相同（搜索/切换包/设置）；搜索是否索引 story 正文 **defer** 至实施计划 |

### 8.3 视觉 token（频次）

| tier | 含义 | 默认色（对齐教材习惯） |
| --- | --- | --- |
| `high` | 高频 | 红系背景 |
| `mid` | 中频 | 蓝系背景 |
| `low` | 低频 | 绿系背景 |

图例文案 App 写死；括号内数字由本课 content 统计。

### 8.4 与 vocabulary 差异

| | vocabulary | story_reading |
| --- | --- | --- |
| 阶段 | prompt → reveal | 单屏阅读 |
| 底栏 | SM-2 三按钮 | 我读完了 |
| 点词 | lexicon_entries | sidebar |
| 图片 | prompt.primaryImage 可选 | lesson.coverImage 必填 |

## 9. 示例 content（节选）

```json
{
  "lesson": {
    "code": "C1",
    "titleEn": "The Princess and the Pea",
    "titleZh": "公主与豌豆",
    "coverImage": "assets/images/c1.png",
    "primaryAudio": "assets/audio/c1.mp3"
  },
  "story": {
    "paragraphs": [
      {
        "runs": [
          { "kind": "text", "text": "The prince is " },
          {
            "kind": "word",
            "surface": "not",
            "glossZh": "不",
            "tier": "mid",
            "vocabId": "not"
          },
          { "kind": "text", "text": " happy." }
        ]
      }
    ]
  },
  "sidebar": [
    {
      "vocabId": "not",
      "headword": "not",
      "ipa": "/nɒt/",
      "pos": "adv.",
      "definitionZh": "不",
      "tier": "mid"
    }
  ]
}
```

## 10. 实施清单（ADR 0012 附录顺序）

1. **ADR 0012 附录**：冻结本 spec 的 schema、`reviewMode: lesson_complete`、knowledgeId 规则
2. **`packages/contracts`**：`story-reading-content.ts`、`parsePackCardContent` 分支、`SUPPORTED_CARD_TYPES` 追加、`validate-story-reading-card.ts`
3. **pack-builder verify**：注册 story 校验 + 一致性规则测试
4. **`apps/mobile`**：`story-reading/` Renderer、词表页、点词 sheet、`confirmLessonComplete`、registry 注册、`reviewMode: lesson_complete` 底栏
5. **测试包**：至少 1 课 story_reading fixture zip
6. **（可选）** pack-editor story 表单

## 11. 验收要点

- [ ] 含 story_reading 的 zip 通过 `pack-builder verify`
- [ ] 故意缺少 sidebar 对应项的 pack **被拒绝**
- [ ] App 安装后可播放音频、显示封面、正文行内注释与 tier 色
- [ ] 点词弹层与「本课 N 词」数据一致
- [ ] 频次图例数字与本课 tier 统计一致
- [ ] 滚到底前「我读完了」disabled；完成后进入下一课且 **不再** SM-2 复习
- [ ] 杀进程再进，从未完成的课继续；已完成课不重复强制
- [ ] 同 pack 内 vocabulary 学习行为 **零回归**
- [ ] `protocolVersion` 仍为 1 的 pack 可正常构建

## 12. 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-08-02 | 首版确认：产品决策、schema、UI、进度、protocolVersion |
