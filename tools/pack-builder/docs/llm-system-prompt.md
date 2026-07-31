# 学习包内容生成 · LLM 系统 Prompt

> **你只需要发两样东西给大模型**（见下方「你要发什么」）。  
> 协议细节、JSON Schema 已内置在系统 Prompt 里，**不用**自己挑章节发给模型。

---

## 你要发什么（就两条）

| 发到哪里 | 发什么文件 | 说明 |
|----------|------------|------|
| **System / 项目说明 / 自定义指令**（只配一次） | [`system-prompt.txt`](system-prompt.txt) | **整文件复制粘贴**，原样发，不要改 |
| **User / 对话 / 每条任务** | 任务参数 + **书本正文** | 用 [`user-message-book-template.txt`](user-message-book-template.txt) 作模板 |

### 各产品怎么填

| 产品 | System 放哪 | User 放哪 |
|------|-------------|-----------|
| **ChatGPT** | 项目 → Instructions，或 Custom GPT → Instructions | 对话输入框 |
| **Claude** | Project → Custom Instructions | 对话输入框 |
| **没有 System 的界面** | 把 `system-prompt.txt` 贴在**第一条消息最前面**，空一行后再贴 User 内容 | 同一条或第二条 |

### 你的流程（一本书 → JSON）

```text
① 运营后台创建知识库，记下「知识库 ID」（= packId）
② 把 system-prompt.txt 配进 System（只做一次）
③ 每批 User 消息 = 模板 + 粘贴课文/词汇表（建议按 Unit 分批，别一次塞整本书）
④ 模型返回 3 个 JSON → 存成 meta.json / cards.json / lexicon.json
⑤ 多批时：cards/lexicon 合并；meta 只保留一份；sortOrder 连续
⑥ TTS 生成 mp3 → assets/audio/
⑦ pnpm --filter @remember/pack-builder build:pack → 后台上传 zip
```

**不要发给模型的：** 整份 `llm-system-prompt.md`（太长且含给人看的说明）、SQLite、zip、manifest。

---

## User 消息模板（从书抽词）

复制 [`user-message-book-template.txt`](user-message-book-template.txt)，改 packId，贴上正文即可。示例：

```text
【任务参数】
- packId: demo-primary-grade3
- packVersion: 1.0.0
- keyId: test-v1
- 本批范围: 七年级上册 Unit 1
- sortOrder 起始: 1

【教材正文】
Unit 1 My name's Gina.
Words: name, nice, meet, too, your, his, her, yes, she, he...
（此处粘贴 OCR 后的课文、单词表、课文对话全文）

请从正文识别单词和短语，按 system prompt 输出 meta.json、cards.json、lexicon.json 三个 JSON 代码块。
```

**整本书太大？** 按 Unit/Chapter 分 5～10 批；每批 User 里写 `sortOrder 起始: 上一批最后+1`；最后人工合并所有 `cards.json` 和 `lexicon.json`（lexicon 按 surfaceForm 去重）。

---

## 模型返回后你要做什么

| 模型输出 | 你保存为 |
|----------|----------|
| 第 1 个 JSON 对象 | `tools/pack-builder/source/<packId>/meta.json` |
| 第 2 个 JSON 数组 | `.../cards.json` |
| 第 3 个 JSON 数组 | `.../lexicon.json` |

然后：**审校** → **TTS 补 mp3** → **build:pack** → **后台上传**。

样例目录：`tools/pack-builder/source/remember-test-pack/`

---

## 文件索引

| 文件 | 用途 |
|------|------|
| [`system-prompt.txt`](system-prompt.txt) | **复制到 System**（含协议 + JSON Schema） |
| [`user-message-book-template.txt`](user-message-book-template.txt) | **每批任务** User 消息模板 |
| 本文「系统 Prompt（完整版）」 | 与 system-prompt.txt 同源，供查阅，**不必整篇发给模型** |

---

## 系统 Prompt（完整版 · 查阅用）

> 与 `system-prompt.txt` 内容一致；**日常只需复制 .txt 文件**。

```text
（见 system-prompt.txt）
```

---

## 构建后会发生什么（供人工复核）

| 源文件 | 构建器动作 |
|--------|------------|
| `cards.json` | 每行 → `pack.sqlite` 的 `cards` 表；自动算 `knowledgeId`；`cardType=vocabulary` |
| `lexicon.json` + 例句扫描 | → `lexicon_entries` 表 |
| `assets/**` | 原样打进 zip，路径写入 `packManifest.files[]` |
| — | 生成 `packManifest.json` + Ed25519 签名 → 输出 `.zip` |

---

## 常见问题

**Q：要让模型输出 knowledgeId 吗？**  
A：不要。构建器用 `buildKnowledgeId(packId, headword, kind)` 自动生成。

**Q：lexicon 可以留空数组吗？**  
A：可以 `[]`，但例句中的词会由构建器填入 `(auto) xxx` 占位释义，上线前必须人工补全。

**Q：packId 和后台什么关系？**  
A：packId = 运营后台「知识库 ID」= zip 内 `packManifest.packId`，三者必须一致。

**Q：如何升级内容版本？**  
A：修改 `meta.json` 的 `packVersion`（如 1.0.0 → 1.0.1），重新 build 后上传；同版本重复上传会被后台拒绝。
