# story_reading 卡片类型设计规范

日期：2026-08-02  
状态：**已确认**（2026-08-02 产品对齐）  
关联：ADR [0012](../decisions/0012-card-type-registry.md)、[0008](../decisions/0008-pack-protocol.md)；UI 规范 §8；计划 `2026-08-01-card-type-registry.md`（registry 已 merge，PR #7）

## 1. 背景与目标

第一期 `vocabulary` 卡片（A/B 闪卡 + SM-2 三按钮）已冻结并实现。产品需要第二种呈现：**童话/短文注释阅读**——插图、可播放音频、正文词级高亮与行内中文注释、本课词表与频次图例。

cardType registry（ADR 0012）已在 `main` 落地；本 spec 冻结 **`story_reading`** 的协议字段、校验规则与移动端 UI 行为，作为实施与 pack 制包的单一依据。

### 1.1 目标

| #   | 目标                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------- |
| G1  | 新增 `cardType: story_reading`，与 `vocabulary` 可在 **同一 pack、同一 App** 共存                             |
| G2  | 移动端 **阅读器 UI**：Hero 封面、段级跟读、底栏播放器、点词弹层、顶栏「本课 N 词」Tab、频次图例（运行时计数） |
| G3  | 阅读进度由 **`story_reading_bookmarks`**（`knowledgeId` + `positionMs`）记录；**不进 SM-2**、无「我读完了」   |
| G4  | 复用现有 pack 管道（zip 验签、安装、同步、Admin 发版）；仅扩展 contracts 校验与 mobile Renderer               |
| G5  | 正文用 **结构化 JSON runs**，不用 HTML 富文本；Zod `.strict()` 可校验                                         |

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

| 决策          | 内容                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------- |
| D1 完成方式   | `reviewMode: none`；无「我读完了」；**书签**记录阅读位置；不进 SM-2                         |
| D2 词注样式   | **无行内 gloss**；word run 用 tier **字色** + **点击弹层**（sidebar）                       |
| D2b 段下翻译  | optional `paragraphs[].translationZh`；「显示翻译」开关；不用 gloss 拼接                    |
| D3 窄屏词表   | 正文 `word` run 可点 → 底部弹层；顶栏/课头区「本课 N 词」→ 全词表页                         |
| D4 音频       | `lesson.primaryAudio` 包内路径；课头播放按钮                                                |
| D5 频次图例   | App 固定「红:高频 / 蓝:中频 / 绿:低频」文案；**运行时**按本课 `tier` 计数                   |
| D6 系列元数据 | 「40篇童话…」等 **只在 pack source `meta.json`**，不进 card content                         |
| D7 点词数据源 | **仅 `sidebar[]`**；MVP 不写 `lexicon_entries`                                              |
| D8 一课一卡   | 一张阅读页 = sqlite `cards` 一行                                                            |
| D9 进度       | `user.sqlite` **story_reading_bookmarks**（`knowledgeId` + `positionMs`）；书库「继续阅读」 |

## 3. 与现有架构的关系

```text
pack zip / 安装 / 验签 / 权益 / Admin / sync_outbox     ← 不变
cards 表（knowledgeId, cardType, sortOrder, content）  ← 多一种 cardType
        │
        ├─ vocabulary      → registry → VocabularyStudyPanel（SM-2）
        └─ story_reading   → registry → StoryLessonShell（reviewMode: none, libraryPresentation: reader）
```

**PR #7 已交付（本 spec 的前置）：** `cardTypeRegistry`、`parsePackCardContent`、`validatePackCards` 分发、`study-screen` 按 `reviewMode` 控制底栏、`UnsupportedCardPanel`。

**本 spec 交付：** ADR 0012 附录、`storyReadingContentSchema`、verify 规则、`StoryLessonShell`（reader v2）、书签进度、测试包样例。

## 4. 进度与 knowledgeId

### 4.1 knowledgeId 格式

```text
{packId}:story:{lessonSlug}
```

- `lessonSlug`：由 `lesson.code` 规范化（trim、小写、非 `[a-z0-9-]` 替换为 `-`）
- 示例：`en-fairy-tales-v1:story:c1`
- 包内唯一；与 vocabulary 的 `{packId}:en:word|phrase:{slug}` **命名空间隔离**

### 4.2 阅读进度（书签）

`story_reading` **不写入** `learning_states`，**不进入** SM-2 学习会话队列。

| 存储                                    | 字段                                                     | 说明                                   |
| --------------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `user.sqlite` `story_reading_bookmarks` | `packId`（PK）、`knowledgeId`、`positionMs`、`updatedAt` | 每包一条；记录上次读到哪一课、音频进度 |

行为：

1. 书库「继续阅读」→ `/study?packId=`，App 读书签恢复 `knowledgeId` + `positionMs`
2. 播放中 debounce 更新 `positionMs`；返回书库时写入
3. 篇间「上一篇/下一篇」→ 新课从 `positionMs = 0` 开始（见 v2 plan R4）
4. **无**「完成课」概念；用户可随时退出，下次从书签续读

### 4.3 队列与混 pack

- 纯 `story_reading` 包：`libraryPresentation: reader`，书库 **不展示** SM-2 进度条
- `story_reading` **永不** 进入 `resumeOrStartStudySession` 队列
- 混 pack（story + vocabulary）：MVP 若含 story 则整包 fallback 为 `reader` 呈现（vocabulary SM-2 Defer，见 v2 plan R11）

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

| 字段           | 类型         | 必填 | 说明                                 |
| -------------- | ------------ | ---- | ------------------------------------ |
| `code`         | string min 1 | ✅   | 课次，如 `C1`；用于 knowledgeId slug |
| `titleEn`      | string min 1 | ✅   | 英文标题                             |
| `titleZh`      | string min 1 | ✅   | 中文标题                             |
| `coverImage`   | string min 1 | ✅   | 包内相对路径，须在 manifest 资源清单 |
| `primaryAudio` | string min 1 | ✅   | 本课朗读音频，包内相对路径           |

**故意省略：** `wordCount`（App 可由 sidebar/runs 统计）、系列名、QR URL。

### 6.3 `story.paragraphs[].runs[]`

联合类型，由 `kind` 判别：

**`kind: "text"`**

| 字段           | 必填          |
| -------------- | ------------- |
| `kind: "text"` | ✅            |
| `text`         | ✅ 非空字符串 |

**`kind: "word"`**（注释词）

| 字段           | 必填 | 说明                                                               |
| -------------- | ---- | ------------------------------------------------------------------ |
| `kind: "word"` | ✅   |                                                                    |
| `surface`      | ✅   | 英文词形（展示用）                                                 |
| `glossZh`      | ✅   | 词义（pack 校验用；UI 不 inline 展示，见 sidebar / translationZh） |
| `tier`         | ✅   | `high` \| `mid` \| `low`                                           |
| `vocabId`      | ✅   | 稳定 ID，与 sidebar 关联                                           |

渲染：`surface` 按 `tier` **字色**区分；跟读时 **整段** 变色高亮；点词弹层读 `sidebar`。

**`paragraphs[].translationZh`（optional）：** 段下中文整段翻译；「显示翻译」开关控制；须全段都有或全无（同时间轴规则）。

**段级时间轴（optional）：** 每段可含 `audioStartMs` / `audioEndMs`（整数 ms，须成对出现）；用于播放器段级跟读与自动滚动。无时间轴的旧包仍可安装，跟读降级为纯播放。

### 6.4 `sidebar[]`

| 字段           | 必填 | 说明                                       |
| -------------- | ---- | ------------------------------------------ |
| `vocabId`      | ✅   | 主键，包内本课唯一                         |
| `headword`     | ✅   | 词头                                       |
| `ipa`          | ✅   | 音标字符串                                 |
| `pos`          | ✅   | 词性，如 `n.` `adj.`                       |
| `definitionZh` | ✅   | 中文释义（弹层/词表用，可与 glossZh 相同） |
| `tier`         | ✅   | `high` \| `mid` \| `low`                   |

### 6.5 校验规则（pack-builder / contracts）

1. Zod `.strict()` 拒绝未知键
2. 至少 1 个 `paragraph`，至少 1 个 run
3. 每个 `kind: "word"` 的 `vocabId` **必须** 存在于 `sidebar`（同 id 的 `tier` 必须一致）
4. `sidebar` 每条 `vocabId` **必须** 被至少一个 `word` run 引用（**不允许** 词表孤儿）
5. `coverImage`、`primaryAudio` 路径符合 ADR 0008 资源规则
6. 若任一段含时间轴字段，则 **全部段** 必须有，且单调递增、无重叠；最后一段 `audioEndMs` ≤ 音频时长（verify 可选传入时长）
7. `cardType === 'story_reading'` 时走本 schema；vocabulary schema **不变**

### 6.6 protocolVersion

**保持 `protocolVersion: 1`。** 理由：zip 外壳、manifest、sqlite 三表、vocabulary schema 均未破坏性变更；新 cardType 由 ADR 0012 扩展。旧版 App 不支持 `story_reading` 时验包或运行时分发错误，由 **App 版本** 解决，不 bump 协议版本。

## 7. reviewMode 与 libraryPresentation

| reviewMode        | 底栏                                       | 适用                |
| ----------------- | ------------------------------------------ | ------------------- |
| `sm2`             | 忘记/模糊/记得                             | `vocabulary`        |
| `none`            | 无 SM-2 / 无完成底栏                       | **`story_reading`** |
| `lesson_complete` | 「我读完了」（预留，当前无 cardType 使用） | 预留                |
| `interactive`     | 交互提交                                   | 预留                |

| libraryPresentation | 书库 UI                | 适用                |
| ------------------- | ---------------------- | ------------------- |
| `study`             | SM-2 进度条 + 继续学习 | `vocabulary`        |
| `reader`            | 「上次读到」+ 继续阅读 | **`story_reading`** |

**study-screen 行为（reader）：**

- `reviewMode: none` → 不显示 `StudyRatingBar`，无「我读完了」
- 经 `?knowledgeId=` 或书签进入 **reader 模式**，不调用 `resumeOrStartStudySession`
- 播放器与 Tab 由 `StoryLessonShell` 自管；进度写 `story_reading_bookmarks`

## 8. 移动端 UI

遵循 UI 规范 §8 骨架：隐藏底部胶囊、轻量顶栏、右上角更多菜单。**不**使用 vocabulary 的两阶段 prompt/reveal。

### 8.1 布局（reader v2）

```text
┌─────────────────────────────┐
│ ←                    更多 ⋮ │
│      原文 | 本课词 32        │  ← Tab 行（顶栏居中）
├─────────────────────────────┤
│ [Hero 封面 + 标题叠字]        │  ← 固定
│ 图例 chip    [显示翻译]       │
├─────────────────────────────┤
│ （仅正文 ScrollView，Serif）  │  ← 段级跟读变色 + auto-scroll
│ …                           │
├─────────────────────────────┤
│ 进度条 + 播放/暂停 + 段/篇导航 │  ← 仅「原文」Tab；固定底栏
└─────────────────────────────┘
```

本课词 Tab：词表浏览，无底栏播放器。

### 8.2 交互

| 操作          | 行为                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| 播放          | 播 `lesson.primaryAudio`；复用 pack 内音频播放链                                     |
| 点 `word` run | 底部 sheet：headword、ipa、pos、definitionZh、tier 色条                              |
| 「本课 N 词」 | 进入词表页（列表同 sidebar 顺序；项可点开展开详情）                                  |
| 段级跟读      | 播放时当前段变色；自动滚入视区；可拖进度、跳段/跳篇                                  |
| 更多菜单      | 与 vocabulary 相同（搜索/切换包/设置）；搜索是否索引 story 正文 **defer** 至实施计划 |

### 8.3 视觉 token（频次）

| tier   | 含义 | 默认色（对齐教材习惯） |
| ------ | ---- | ---------------------- |
| `high` | 高频 | 红系 **字色**          |
| `mid`  | 中频 | 蓝系 **字色**          |
| `low`  | 低频 | 绿系 **字色**          |

图例文案 App 写死；括号内数字由本课 content 统计。

### 8.4 与 vocabulary 差异

|      | vocabulary               | story_reading           |
| ---- | ------------------------ | ----------------------- |
| 阶段 | prompt → reveal          | 单屏阅读                |
| 底栏 | SM-2 三按钮              | 音频播放器（无 SM-2）   |
| 进度 | learning_states + 队列   | story_reading_bookmarks |
| 点词 | lexicon_entries          | sidebar                 |
| 图片 | prompt.primaryImage 可选 | lesson.coverImage 必填  |

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

1. **ADR 0012 附录**：schema、`reviewMode: none`、`libraryPresentation: reader`、knowledgeId 规则
2. **`packages/contracts`**：`story-reading-content.ts`（含 optional `translationZh`、时间轴）、validate
3. **pack-builder verify**：story 校验 + 测试包
4. **`apps/mobile`**：`StoryLessonShell`、书签 v3 表、reader 路由、registry
5. **测试包**：至少 1 课 story_reading fixture zip（C1 公主与豌豆）
6. **（可选）** pack-editor story 表单

## 11. 验收要点

- [ ] 含 story_reading 的 zip 通过 `pack-builder verify`
- [ ] 故意缺少 sidebar 对应项的 pack **被拒绝**
- [ ] App 安装后可播放音频、Hero 封面、正文 tier 字色与段级跟读
- [ ] 点词弹层与「本课 N 词」Tab 数据一致
- [ ] 频次图例数字与本课 tier 统计一致
- [ ] 「显示翻译」展示 `translationZh`；默认关闭
- [ ] 书库继续阅读恢复书签；篇间导航从 0 播
- [ ] 杀进程再进，从书签 positionMs 续播
- [ ] 同 pack 内 vocabulary 学习行为 **零回归**
- [ ] `protocolVersion` 仍为 1 的 pack 可正常构建

## 12. 修订记录

| 日期       | 说明                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 2026-08-02 | 首版确认：产品决策、schema、UI、进度、protocolVersion                                            |
| 2026-08-03 | reader v2：reviewMode none、书签进度、translationZh、合并播放器；废弃 lesson_complete / 我读完了 |
