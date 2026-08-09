# 人教版（及同级）单词卡 vocabulary 包制作 Runbook

**用途：** 新开的 Cursor 对话 **直接 @ 本文**（或整篇粘贴），AI 即应按本文流程制作 **vocabulary** 类型学习包，无需重复口述规则。

**适用：** 小学/初中各年级 **教材单词表** 包（一期 cardType 固定 `vocabulary`）。  
**人教版（PEP）** 与 **闽教版（`-mj`）** 均走统一 Python 管线；闽教版金标准见 §10.2（`en-grade3-v2-mj`）。  
**不适用：** 童话阅读包 `story_reading` → 见 [`primary-1000-stories-production.md`](./primary-1000-stories-production.md)。

相关文档：

- Pack 协议（workspace rule）：`.cursor/rules/pack-protocol-alignment.mdc`
- LLM 直出 JSON 方案：[`tools/pack-builder/docs/llm-system-prompt.md`](../../tools/pack-builder/docs/llm-system-prompt.md)
- Pack Editor 改错/打包：[`pack-editor-local.md`](./pack-editor-local.md)
- 本地 Admin 发布：[`local-api-docker-dev.md`](./local-api-docker-dev.md)

---

## 1. 交付物是什么

| 项            | 说明                                                                |
| ------------- | ------------------------------------------------------------------- |
| **源目录**    | `tools/pack-builder/source/<packId>/`                               |
| **三份 JSON** | `meta.json`、`cards.json`、`lexicon.json`                           |
| **音频**      | `assets/audio/*.mp3`、`assets/audio/examples/*.mp3`                 |
| **zip**       | `tools/pack-builder/output/<packId>-<version>.zip`（`verify` 通过） |
| **后台**      | Admin 新建/配置 packId → 上传 zip → catalog 上架                    |

zip 根目录固定：`packManifest.json` + `pack.sqlite` + `assets/…`。

---

## 2. packId 与命名约定

### 2.1 packId 格式

```text
en-grade{N}-{vol}-rj
```

| 段         | 含义       | 示例                     |
| ---------- | ---------- | ------------------------ |
| `en`       | 英语       | 固定                     |
| `grade{N}` | 年级       | `grade3` = 三年级        |
| `{vol}`    | 册次       | `v1` = 上册，`v2` = 下册 |
| `rj`       | 人教版 PEP | 其他版本换后缀，如 `mj`（闽教版）、`ox` |

闽教版 packId 后缀为 **`mj`**，解析格式为 `vocab_format='minjiao_unit'`（见 `pep_vocab_common.py`）。

**已交付参考（闽教版，金标准：`en-grade3-v2-mj`）：**

| packId            | catalog 标题建议       | 词条数 | 版本  | 管线           |
| ----------------- | ---------------------- | ------ | ----- | -------------- |
| `en-grade3-v1-mj` | 三年级上册闽教版单词表 | 178    | 1.0.3 | 统一管线       |
| `en-grade3-v2-mj` | 三年级下册闽教版单词表 | 135    | 1.0.2 | 统一管线（**金标准**） |
| `en-grade4-v1-mj` | 四年级上册闽教版单词表 | 111    | 1.0.1 | 统一管线       |
| `en-grade4-v2-mj` | 四年级下册闽教版单词表 | 99     | 1.0.1 | 统一管线       |
| `en-grade5-v1-mj` | 五年级上册闽教版单词表 | 95     | 1.0.1 | 统一管线       |
| `en-grade5-v2-mj` | 五年级下册闽教版单词表 | 106    | 1.0.1 | 统一管线       |
| `en-grade6-v1-mj` | 六年级上册闽教版单词表 | 100    | 1.0.1 | 统一管线       |
| `en-grade6-v2-mj` | 六年级下册闽教版单词表 | 71     | 1.0.1 | 统一管线       |

**已交付参考（人教版）：**

| packId            | catalog 标题建议       | 词条数 | 版本  | 管线                         |
| ----------------- | ---------------------- | ------ | ----- | ---------------------------- |
| `en-grade3-v1-rj` | 三年级上册人教版单词表 | 上册   | —     | 早期 JS 手工词表             |
| `en-grade3-v2-rj` | 三年级下册人教版单词表 | 114    | 1.0.4 | grade3 四件套脚本            |
| `en-grade4-v1-rj` | 四年级上册人教版单词表 | 104    | 1.0.3 | 统一管线                     |
| `en-grade4-v2-rj` | 四年级下册人教版单词表 | 104    | 1.0.1 | 统一管线                     |
| `en-grade5-v1-rj` | 五年级上册人教版单词表 | 97     | 1.0.1 | 统一管线 + OCR               |
| `en-grade5-v2-rj` | 五年级下册人教版单词表 | 149    | 1.0.3 | 统一管线                     |
| `en-grade6-v1-rj` | 六年级上册人教版单词表 | 142    | 1.0.1 | 统一管线 + OCR + vocab_fixes |
| `en-grade6-v2-rj` | 六年级下册人教版单词表 | 88     | 1.0.1 | 统一管线（4 单元）           |

> **注意：** 六年级**下册**教材附录只有 **Unit 1–4**，不是 6 单元；词条数 88 为正常完整覆盖。

### 2.2 版本号

- 首版：`1.0.0`
- 内容修正（释义/例句/助记/音频）：patch +1，如 `1.0.4`
- **同版本不可重复上传 Admin**；改内容必须 bump `meta.json` 的 `packVersion`

### 2.3 其他固定字段

```json
{
  "packId": "en-grade3-v2-rj",
  "packVersion": "1.0.4",
  "keyId": "test-v1"
}
```

本地/测试签名用 `test-v1`；生产另配 `REMEMBER_PACK_SIGNING_PRIVATE_KEY_HEX`。

---

## 3. 选哪条制作路线

| 路线                                        | 何时用                       | 产出方式                                                  |
| ------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| **A. 统一 Python 管线（推荐，四～六年级）** | 有人教版 PDF + 附录词汇表    | `pep_vocab_pipeline.py`：parse → generate → TTS → build   |
| **A′. grade3 四件套脚本**                   | 三年级下册及同结构旧包       | 独立 `parse_*` / `generate_*` 脚本（见 §5 末）            |
| **B. LLM 直出 JSON**                        | 无 PDF、其他教材、小批量试做 | 大模型按 `system-prompt.txt` 输出三 JSON → 人工审校 → TTS |
| **C. 混合**                                 | PDF 有词表但例句需人工补     | A 解析词表 + B/手工写例句                                 |

**新年级人教版（四～六年级）：优先复制 A 统一管线**（在 `pep_vocab_common.py` 注册 `PackConfig`，编写三件套 Python 模块）。

---

## 3.1 职责分工：Cursor 写什么 vs 脚本做什么

制作一包时，**不要把例句/助记交给 PDF 自动抽取**；也不要让 Cursor 手工拼 `cards.json`。分工如下：

| 环节                            | 谁负责               | 产出物                                                                                     |
| ------------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| **PDF → 词表 headword 列表**    | **脚本** `parse`     | `cache/<pack>-vocab.json`（unit、headword、ipa 初值、definition_zh 初值、page、kind）      |
| **漏词 / OCR 噪声 / 短语拆分**  | **Cursor**（必要时） | `grade{N}_vol{V}_vocab_fixes.py`：`RENAME` / `REMOVE` / `ADD` + `apply_vocab_fixes()`      |
| **释义 / 音标 / 词性修正**      | **Cursor**           | `grade{N}_vol{V}_mnemonics.py` 内 `DEFINITION_OVERRIDES`、`IPA_OVERRIDES`、`POS_OVERRIDES` |
| **例句（2～3 条/词）**          | **Cursor**           | `grade{N}_vol{V}_examples_data.py` 内 `EXAMPLES` 字典                                      |
| **助记 + 词形说明**             | **Cursor**           | 同文件：`SOUND/ROOT/IMAGE/SEMANTIC`、`INFLECTION_NOTES`、`mnemonic_for()`                  |
| **cards / lexicon / meta JSON** | **脚本** `generate`  | `source/<packId>/` 三份 JSON + `content-stats.json`                                        |
| **TTS 批量 mp3**                | **脚本**             | `generate_pep_vocab_audio.py`（读 cards.json 路径清单）                                    |
| **zip 打包 + verify**           | **脚本** `build`     | `output/<packId>-<version>.zip`                                                            |
| **例句 token 预检**             | **脚本** `check-examples` / `generate` / `build` 内置 | 扫 `*_examples_data.py` 或 `cards.json`（见 §4.5.1）                          |
| **PackConfig / 管线注册**       | **Cursor**           | `pep_vocab_common.py` 的 `PACK_CONFIGS`；`pep_vocab_pipeline.py` 三处模块映射              |
| **Admin 上传 / git commit**     | **用户明确要求时**   | Cursor 默认不做                                                                            |

### Cursor 三件套最低交付标准

每个 headword（与 cache 最终列表一致）必须：

1. `EXAMPLES` 中有 2～3 条 `(en, zh)`
2. `DEFINITION_OVERRIDES` 中有干净中文释义（覆盖 PDF/OCR 乱码）
3. `IPA_OVERRIDES` 中有标准英式 IPA（短语可写整短语 IPA；超长专有名词可 `''` 省略 phonetic）
4. 至少一种非模板助记（禁止批量写「在课文对话里反复出现」）
5. 不规则变形 / 比较级写入 `INFLECTION_NOTES`（如有）

### 脚本自动完成、Cursor 不必重复做的

- `knowledgeId` 格式 `{packId}:en:{word|phrase}:{slug}`
- `sortOrder` 按 unit + page + headword 排序
- `primaryAudio` / `examples[].audio` 路径 slug（空格→`-`）
- `lexicon_entries` 从例句 token 扫描 + 词表主词
- PUA 私有区 IPA 初转换（见 §5.4；**仍须** `IPA_OVERRIDES` 做最终校对）
- 去重、phrase/word `kind` 推断

---

## 3.2 课本词表匹配机制（已增强，2026-08）

四～六年级统一走 `tools/pack-builder/scripts/pep_vocab_common.py`，相对早期 grade3 单册脚本，解析与生成能力已增强：

| 能力                | 说明                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **双通道解析**      | 可提取文本的 PDF → `parse_appendix_text()`；扫描版 / 无文本层 → `use_ocr=True` + Tesseract → `parse_appendix_ocr_text()`  |
| **PUA IPA 字体**    | PEP PDF 常用 Unicode 私有区 U+F0xx 嵌入音标；`normalize_pep_pua_ipa()` 映射为标准 IPA 字符（解决 App 方框乱码）           |
| **短语无音标行**    | 支持 `headword 中文释义`（无 `/ipa/`）的短语行                                                                            |
| **PUA 斜杠**        | 识别 `\uf02f` 作为 IPA 分隔符（与 `/` 等价）                                                                              |
| **多行释义**        | headword 与中文分多行时合并                                                                                               |
| **Appendix 3 截断** | OCR 文本遇 `Appendix 3` 自动停止，避免二级词表污染单元词表                                                                |
| **页码自动探测**    | `vocab_page_indices=None` 时可 `detect_vocab_page_indices()`；**仍建议**人工确认后写死页码                                |
| **词表后处理**      | `grade*_vol*_vocab_fixes.py`：`RENAME`/`REMOVE`/`ADD`，`ADD` 优先于 OCR 重复项                                            |
| **生成期 override** | `DEFINITION_OVERRIDES` / `IPA_OVERRIDES` / `POS_OVERRIDES` 在 `build_cards()` 应用；空字符串 IPA override = 省略 phonetic |

**典型漏词原因与对策：**

| 现象                  | 原因                                           | 处理                                                          |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| 词条数明显偏少        | 页码配错（如 6 下误扫歌曲页）                  | 修正 `vocab_page_indices` 或 `ocr_page_indices`，重跑 `parse` |
| OCR 噪声 / 重复       | Appendix 2+3 混排、识别错 headword             | `vocab_fixes.py` 的 `REMOVE`/`RENAME`                         |
| 附录有、cache 无      | 短语被拆成单词（如 `count` 而非 `count down`） | `RENAME` 或 `ADD`                                             |
| 音标方框 / `%` / 数字 | PUA 或 OCR 残留                                | 全量 `IPA_OVERRIDES`                                          |
| 释义乱码              | OCR 或 PUA 混入中文                            | 全量 `DEFINITION_OVERRIDES`                                   |

**验收：** `parse` 后核对 cache 词条数与 PDF 附录 Unit 数；`generate` 后跑覆盖检查（EXAMPLES / DEFINITION_OVERRIDES / IPA_OVERRIDES 与最终 headword 列表 1:1）。

---

## 4. 内容质量规则（必遵守）

以下规则来自 `en-grade3-v2-rj` 验收经验；**每条卡都要满足**。

### 4.1 卡片结构（vocabulary）

```json
{
  "kind": "word",
  "sortOrder": 1,
  "content": {
    "prompt": {
      "headword": "where",
      "primaryAudio": "assets/audio/where.mp3",
      "phonetic": { "ipa": "/weə(r)/", "dialect": "uk" }
    },
    "reveal": {
      "definitions": [{ "text": "在哪里；到哪里", "pos": "adv." }],
      "examples": [
        {
          "en": "Where are you from?",
          "zh": "你来自哪里？",
          "audio": "assets/audio/examples/where-1.mp3"
        }
      ],
      "mnemonic": { "kind": "association", "text": "语义联想：…" },
      "inflectionNote": "复数 teachers"
    }
  }
}
```

- `kind`：`word`（单词）或 `phrase`（短语，headword 保留空格，如 `in class`）
- `prompt`：**不得**含释义/例句/助记
- `reveal.definitions`：≥1 条；**尽量写 `pos`**（`n.` `v.` `adj.` `prep.` 等）
- `reveal.examples`：1～3 条（教材包通常 2～3）；**优先课文原句或轻微改写**
- 可选键 **省略不写**，禁止 `null`

### 4.2 音标与发音

- 人教版 PEP 附录 IPA 为 **英式** → `phonetic.dialect` 固定 **`uk`**
- TTS 音色固定：**`en-GB-LibbyNeural`**（见 `tools/pack-builder/scripts/pack_tts_config.py`）
- 换音色后须 `generate_*_audio.py --force` 全量重生成

### 4.3 助记（mnemonic）规则 — 严禁硬凑

优先级与类型：

1. **谐音联想**：仅当 headword 与中文读音 **确有相似** 时才写（如 `see`→「西/si」、`he`→「嘿/hi」）。**宁可不写，不可硬凑**（反例：`from` 硬凑「从」）。
2. **拆词联想**：复合词/固定搭配（如 `classmate` = class + mate）
3. **形象联想**：可画面化的具体名词
4. **语义联想**：用课文例句解释含义（默认兜底）

格式：`{类型}联想：{一句中文}`；可有第二条（换行 `\n` 分隔），第二条用不同类型。

实现参考：`tools/pack-builder/scripts/grade3_vol2_mnemonics.py` 的 `mnemonic_for()`。

### 4.4 词形说明（inflectionNote）

- 教材词汇表中的 **名词复数、动词第三人称/过去式、不规则变化** 应写入 `reveal.inflectionNote`
- 例：`woman` → `复数 women`；`has` → `第三人称单数 have`
- 实现参考：`grade3_vol2_mnemonics.py` 的 `INFLECTION_NOTES`

### 4.5 例句

- **维护者：Cursor**（`grade{N}_vol{V}_examples_data.py`），**不是** PDF 自动抽取
- 来源：对应 Unit 课文对话/句子（参考同册已交付 `*_examples_data.py`）
- 每条例句必须有 `en`、`zh`；`audio` 路径由 generate 写入 `assets/audio/examples/{slug(headword)}-{n}.mp3`
- 难度与年级一致；禁止超纲复杂从句

#### 4.5.1 例句 token 规则（Admin 同款，写例句时就要满足）

Admin / `verify` 要求：每条英文例句必须包含 headword 的**精确 token**（不做词形变化匹配）。

- **禁止**为过审把复数改单数、动词变形硬改原形等——应**重写句子**，兼顾语法自然 + token 匹配
- 反例：headword=`apple`，例句 `I like apples.` ❌
- 正例：headword=`apple`，例句 `I have an apple.` ✅
- 复合词：headword=`ball` 时句中须有 `ball`，不能只有 `football` ❌
- 若课文语境自然要用复数，应确认 headword 是否为复数形，而不是改例句词形

**写例句时随时自检：**

```powershell
python tools/pack-builder/scripts/pep_vocab_pipeline.py <packId> check-examples
```

`generate` 开始前也会自动扫描 `*_examples_data.py`；`build` 前会再扫 `cards.json` 兜底。

### 4.6 lexicon（点词）

- **点什么查什么**：`went` 与 `go` 是不同 `surfaceForm`，例句出现就要各写一行
- `surfaceForm`：小写、无空格（**短语 headword 不进 lexicon 作整词**）
- 覆盖：词表主词 + 例句 token 变形 + 常用功能词（见生成器 `LEXICON_EXTRAS`）
- 每条至少 `surfaceForm`、`displayForm`、`definitions[]`；有则写 `ipa`、`formNote`、`pos`
- **禁止依赖构建器 `(auto) xxx` 占位** — 上线前必须补全

### 4.7 sortOrder

- 从 1 递增，**按教材词汇表 / Unit 顺序**，包内唯一
- 短语与单词混排时仍按词汇表顺序，不单独成段

### 4.8 音频路径 slug

```text
headword 小写 → 空格改 - → 去掉 ' ? .
例：piggy bank → piggy-bank.mp3
```

---

## 5. 路线 A：四～六年级统一管线

**金标准参考包：** `en-grade5-v2-rj`（释义/音标/助记质量）、`en-grade6-v1-rj`（OCR + vocab_fixes 范例）。

### 5.1 目录与脚本

```text
imports/
  最新【人教版】N年级英语课本•{上|下}册.pdf

tools/pack-builder/
  cache/
    grade{N}-vol{V}-vocab.json          # parse 缓存
    grade{N}-vol{V}-vocab-ocr.txt       # OCR 原文（use_ocr 时）
  scripts/
    pep_vocab_common.py                 # PackConfig、PDF 解析、cards/lexicon 生成
    pep_vocab_pipeline.py               # CLI：parse | generate | build | all
    generate_pep_vocab_audio.py         # 统一 TTS（读 PACK_CONFIGS）
    pack_tts_config.py                  # en-GB-LibbyNeural / uk
    grade{N}_vol{V}_examples_data.py    # ② Cursor：例句
    grade{N}_vol{V}_mnemonics.py        # ③ Cursor：助记 + overrides
    grade{N}_vol{V}_vocab_fixes.py      # 可选：漏词/OCR 清洗
  source/<packId>/                      # generate 产出
  output/<packId>-<version>.zip         # build 产出
```

**新年级（四～六年级）Cursor 必做：**

1. PDF 放入 `imports/`
2. 在 `pep_vocab_common.py` 的 `PACK_CONFIGS` 注册 `PackConfig`（packId、版本、PDF 路径、cache 名、页码或 OCR 页）
3. 确认附录页码：纯文本 PDF 用 `vocab_page_indices`（**0-based**）；扫描版设 `use_ocr=True` + `ocr_page_indices`
4. 跑 `parse`，核对 cache 词条数与 PDF **附录 2「单元词汇表」**一致
5. 编写三件套（examples / mnemonics / 必要时 vocab_fixes）
6. 在 `pep_vocab_pipeline.py` 注册 `HAND_EXAMPLES_MODULES`、`HAND_MNEMONICS_MODULES`、（可选）`VOCAB_FIXES_MODULES`
7. bump `pack_version` → 跑 `generate` → TTS → `build`

### 5.2 执行命令（Windows PowerShell）

```powershell
# 工作目录：仓库根 remember-app

# ① 从 PDF 解析词表 → cache
python tools/pack-builder/scripts/pep_vocab_pipeline.py en-grade5-v2-rj parse

# ② 读 cache + 三件套 → source/<packId>/
python tools/pack-builder/scripts/pep_vocab_pipeline.py en-grade5-v2-rj generate

# ②′ 写例句过程中随时自检（扫 *_examples_data.py，见 §4.5.1）
python tools/pack-builder/scripts/pep_vocab_pipeline.py en-grade5-v2-rj check-examples

# ③ TTS（首次或换音色：加 --force；中断后续跑不加 --force 即断点续传）
python tools/pack-builder/scripts/generate_pep_vocab_audio.py en-grade5-v2-rj
python tools/pack-builder/scripts/generate_pep_vocab_audio.py en-grade5-v2-rj --force

# ④ 打包 + 验包（pipeline build 会自动 verify）
python tools/pack-builder/scripts/pep_vocab_pipeline.py en-grade5-v2-rj build

# 一条龙（parse + generate + TTS + build；适合网络稳定时）
python tools/pack-builder/scripts/pep_vocab_pipeline.py en-grade5-v2-rj all
```

将 `en-grade5-v2-rj` 换成目标 `packId`（须在 `PACK_CONFIGS` 已注册）。

### 5.3 PackConfig 字段说明

```python
PackConfig(
    pack_id='en-grade6-v1-rj',
    pack_version='1.0.1',
    pdf_rel='imports/最新【人教版】6年级英语课本•上册.pdf',
    cache_name='grade6-vol1-vocab.json',
    vocab_page_indices=[84, 85, 86],   # 可提取文本时：0-based 页索引
    use_ocr=True,                        # 扫描版 PDF
    ocr_page_indices=[86, 87, 88, 89, 90, 91, 92, 93, 94],
)
```

- 纯文本 PDF：**只填** `vocab_page_indices`（附录 2 单元词汇表所在页，含 Unit 1 开头到 Appendix 2 结束，**不含** Appendix 3）
- 扫描 PDF：`use_ocr=True`，填 `ocr_page_indices`；解析结果另存 `-ocr.txt` 便于人工核对
- 若 `use_ocr=False` 且 PDF 无文本层，管线会自动 fallback OCR（需本机 Tesseract）

### 5.4 解析 PDF 注意点

- 目标范围：**附录 2「单元词汇表 / Words in each unit」**，星号 `*` 二级词仍收录；**默认不做** Appendix 3 二级总词汇（OCR 路径会自动截断）
- 行格式（文本 PDF）：`*headword /ipa/ 中文释义` + 独立行 `p. N`；PUA 字体 IPA 由脚本初转
- 短语：`in class`、`piggy bank`、`count down` → `kind: phrase`；可能无 ipa 行
- **音标与释义以 Cursor 的 overrides 为准**；cache 内 ipa/definition_zh 只是初值
- 解析结果写入 `cache/*.json`；**generate 读 cache + fixes + overrides**，不每次扫 PDF

### 5.5 三件套模块结构

**`grade{N}_vol{V}_examples_data.py`**

```python
EXAMPLES: dict[str, list[tuple[str, str]]] = {
    "headword": [
        ("English sentence.", "中文翻译。"),
        ("Another example.", "另一条中文。"),
    ],
}
```

**`grade{N}_vol{V}_mnemonics.py`**（须含以下全部字典 + `mnemonic_for()`）

| 字典 / 函数                                                 | 用途                               |
| ----------------------------------------------------------- | ---------------------------------- |
| `SOUND_MNEMONICS`                                           | 真实谐音（可选，不硬凑）           |
| `ROOT_MNEMONICS` / `IMAGE_MNEMONICS` / `SEMANTIC_MNEMONICS` | 拆词 / 形象 / 语义                 |
| `INFLECTION_NOTES`                                          | 词形说明 → `reveal.inflectionNote` |
| `DEFINITION_OVERRIDES`                                      | 干净中文释义                       |
| `IPA_OVERRIDES`                                             | 英式 IPA；`''` = 不写 phonetic     |
| `POS_OVERRIDES`                                             | 词性修正                           |
| `mnemonic_for(headword, definition_zh, *, kind)`            | 组装助记文本                       |

**`grade{N}_vol{V}_vocab_fixes.py`**（OCR 包或 parse 缺词时使用）

```python
RENAME: dict[str, str] = { 'ocr_typo': 'correct headword' }
REMOVE: set[str] = { 'garbage_entry' }
ADD: list[dict] = [{ 'unit': 1, 'headword': '...', 'ipa': '...', 'definition_zh': '...', 'page': 4, 'kind': 'word' }]

def apply_vocab_fixes(rows: list[dict]) -> list[dict]: ...
```

### 5.6 路线 A′：三年级下册四件套（历史模板）

三年级下册仍保留独立脚本，结构可供 **助记/例句写法**参考，但**新年级不应再复制为独立 parse/generate**：

```text
tools/pack-builder/scripts/
  parse_grade3_vol2_vocab.py
  grade3_vol2_examples_data.py
  grade3_vol2_mnemonics.py
  generate_grade3_vol2_pack.py
  generate_grade3_vol2_audio.py
```

```powershell
python tools/pack-builder/scripts/parse_grade3_vol2_vocab.py
python tools/pack-builder/scripts/generate_grade3_vol2_pack.py
python tools/pack-builder/scripts/generate_grade3_vol2_audio.py
node tools/pack-builder/dist/cli.js build --source tools/pack-builder/source/en-grade3-v2-rj --output tools/pack-builder/output/en-grade3-v2-rj-1.0.4.zip
node tools/pack-builder/dist/cli.js verify -- tools/pack-builder/output/en-grade3-v2-rj-1.0.4.zip
```

---

## 6. 路线 B：LLM 直出 JSON

当无 PDF 或快速试做时使用。

1. System：整文件复制 [`tools/pack-builder/docs/system-prompt.txt`](../../tools/pack-builder/docs/system-prompt.txt)
2. User：[`user-message-book-template.txt`](../../tools/pack-builder/docs/user-message-book-template.txt) + 词汇表/课文（**按 Unit 分批**，每批 20～40 词）
3. 保存到 `tools/pack-builder/source/<packId>/`
4. **必须人工审校**：pos、助记、例句、lexicon 变形词
5. 仍须跑 TTS + build + verify

LLM 产出后 **同样遵守第 4 节质量规则**；可用 pack-editor（5174）逐条改错。

---

## 7. TTS 与音频

| 项      | 值                                                                      |
| ------- | ----------------------------------------------------------------------- |
| 引擎    | [edge-tts](https://github.com/rany2/edge-tts)（`pip install edge-tts`） |
| 音色    | `en-GB-LibbyNeural`                                                     |
| dialect | `uk`                                                                    |
| 主词    | 只读 `headword`（短语读整句）                                           |
| 例句    | 读 `examples[].en` 全文                                                 |

脚本模式：从 `cards.json` 收集所有 `primaryAudio` 与 `examples[].audio` 路径，去重后合成。  
四～六年级用 `generate_pep_vocab_audio.py <packId>`；三下用 `generate_grade3_vol2_audio.py`。  
已存在且 >4KB 的 mp3 默认跳过；`--force` 覆盖。DNS 中断时**不加 `--force` 续跑**。

---

## 8. 打包、验包、发布

### 8.1 本地验包

```powershell
pnpm --filter @remember/pack-builder build
node tools/pack-builder/dist/cli.js verify -- tools/pack-builder/output/<packId>-<version>.zip
```

失败常见原因：`knowledgeId` 与 headword 不一致、资源路径缺失、lexicon JSON 非法、未知键。

### 8.2 Pack Editor（可选改错）

```powershell
pnpm --filter @remember/pack-builder build
pnpm dev:pack-editor
```

打开 http://127.0.0.1:5174 → 校验 → 打包（自动 bump 版本）。

### 8.3 Admin 上架

```powershell
# PostgreSQL（若未跑）
pnpm dev:db

# API（3000）+ Admin（5173）
pnpm --filter @remember/api dev
pnpm --filter @remember/admin dev
```

- 登录：http://127.0.0.1:5173/#/login（本地 staging：`admin` / `local-test-password`）
- 知识库 ID = **packId**（必须与 zip 内一致）
- 上传 zip；catalog 标题用中文年级描述

---

## 9. 新年级任务清单（复制给 AI）

制作 **{年级}{册}人教版单词表** 时，按序勾选：

**脚本 / 配置（Cursor 或人工）**

- [ ] 确认 PDF 路径与附录 2 词汇表页（0-based 页码）
- [ ] 定 packId：`en-grade{N}-v{V}-rj`；判断文本 PDF 还是 OCR
- [ ] `pep_vocab_common.py` 注册 `PackConfig`；`pep_vocab_pipeline.py` 注册三件套模块名
- [ ] `parse` 跑通；**词条数与 PDF 附录 Unit 数对齐**（见 §3.2 漏词表）
- [ ] 需要时编写 `*_vocab_fixes.py` 并注册

**Cursor 内容（必做）**

- [ ] `*_examples_data.py`：每个 headword 2～3 条例句
- [ ] `*_mnemonics.py`：`DEFINITION_OVERRIDES` + `IPA_OVERRIDES` 全覆盖；谐音不硬凑；`INFLECTION_NOTES`
- [ ] 自检：无模板助记「在课文对话里反复出现」

**脚本收尾**

- [ ] bump `pack_version` → `generate` → 核对 `content-stats.json` cardCount
- [ ] `generate_pep_vocab_audio.py` 产齐 mp3（DNS 失败则断点续传）
- [ ] `build` + `verify` 零错误
- [ ] （用户要求时）Admin 上传 + App 抽测

### 9.1 闽教版任务清单（复制给 AI）

制作 **{年级}{册}闽教版单词表** 时，按序勾选（**金标准：`en-grade3-v2-mj`**）：

**脚本 / 配置（Cursor 或人工）**

- [ ] 确认 PDF 路径与「Words and Expressions / 单元词汇表」页（0-based 页码）
- [ ] 定 packId：`en-grade{N}-v{V}-mj`；`PackConfig.vocab_format='minjiao_unit'`
- [ ] `pep_vocab_common.py` 注册 `PackConfig`；`pep_vocab_pipeline.py` 注册三件套模块名（文件名带 `_mj` 后缀）
- [ ] `parse` 跑通；**词条数与 PDF 单元词汇表对齐**
- [ ] 需要时编写 `grade{N}_vol{V}_mj_vocab_fixes.py` 并注册

**Cursor 内容（必做）**

- [ ] `grade{N}_vol{V}_mj_examples_data.py`：每个 headword 2～3 条例句；写的过程中跑 `check-examples`
- [ ] `grade{N}_vol{V}_mj_mnemonics.py`：`DEFINITION_OVERRIDES` + `IPA_OVERRIDES` + `POS_OVERRIDES` 全覆盖（闽教 PDF 无 IPA，全靠 override）
- [ ] 助记：谐音不硬凑；`INFLECTION_NOTES` 补词形
- [ ] 特殊 headword TTS（如 `a/an`）在 `pack_tts_config.py` 的 `HEADWORD_TTS_SEGMENTS` 配置

**脚本收尾**

- [ ] bump `pack_version` → **`generate`（不可跳过）** → 核对 `content-stats.json`
- [ ] `generate_pep_vocab_audio.py` 产齐 mp3
- [ ] `build` + `verify` 零错误；zip 内 `packManifest.packVersion` 与文件名版本一致
- [ ] （用户要求时）Admin 上传 + App 抽测

---

## 10. 给 Cursor 的任务模板（新窗口粘贴）

### 10.1 人教版（PEP）

```text
请按 docs/runbooks/vocabulary-pack-production.md 制作 vocabulary 学习包。

【任务】
- 年级册：五年级下册
- packId：en-grade5-v2-rj
- PDF：imports/最新【人教版】5年级英语课本•下册.pdf
- catalog 标题：五年级下册人教版单词表
- 参考包：en-grade5-v2-rj（质量）、en-grade6-v1-rj（OCR+fixes）

【分工】
- 脚本：parse / generate / TTS / build（pep_vocab_pipeline.py）
- Cursor 必写：grade5_vol2_examples_data.py、grade5_vol2_mnemonics.py（含 DEFINITION/IPA/POS overrides）
- OCR 或漏词时另写：grade5_vol2_vocab_fixes.py
- 不要手工编辑 cards.json；不要从 PDF 自动抽例句

【要求】
1. 先 parse 核对 cache 词条数；再写三件套覆盖全部 headword
2. 写例句过程中随时跑 check-examples；禁止为过审改词形硬凑 token
3. 助记：谐音不硬凑；definitions 带 pos；补充 inflectionNote
4. bump 版本后必须 generate → TTS → build（禁止只 bump 只 build）
5. TTS：en-GB-LibbyNeural，dialect uk
6. build + verify 通过后给出 zip 路径
7. 不要 commit，不要上传 Admin（除非我要求）
```

把 `{}` 内换成实际年级/PDF 即可。

### 10.2 闽教版（金标准：en-grade3-v2-mj）

新窗口 **@ 本文** + 粘贴：

```text
请按 docs/runbooks/vocabulary-pack-production.md 制作 vocabulary 学习包。
严格参考金标准包 en-grade3-v2-mj（三年级下册闽教版单词表）。

【必读】
@docs/runbooks/vocabulary-pack-production.md
@.cursor/rules/pack-protocol-alignment.mdc
@.cursor/skills/build-learning-app/SKILL.md

【任务】
- 年级册：{例如：四年级上册}
- packId：en-grade{N}-v{V}-mj
- PDF：imports/最新【闽教版】{N}年级英语课本•{上|下}册.pdf
- catalog 标题：{N}年级{上|下}册闽教版单词表
- 金标准参考包：en-grade3-v2-mj（流程、文件结构、内容质量一律对齐）

【金标准文件（照抄结构与写法，不要照抄内容）】
- 配置：tools/pack-builder/scripts/pep_vocab_common.py → en-grade3-v2-mj 的 PackConfig
  （vocab_format='minjiao_unit'，vocab_page_indices 为 PDF 0-based 页码）
- 例句：tools/pack-builder/scripts/grade3_vol2_mj_examples_data.py
- 助记/释义/音标：tools/pack-builder/scripts/grade3_vol2_mj_mnemonics.py
- 漏词修复（按需）：tools/pack-builder/scripts/grade3_vol2_mj_vocab_fixes.py
- 管线注册：tools/pack-builder/scripts/pep_vocab_pipeline.py
  （HAND_EXAMPLES_MODULES / HAND_MNEMONICS_MODULES / VOCAB_FIXES_MODULES）
- 已交付产物：tools/pack-builder/source/en-grade3-v2-mj/（135 卡，1.0.2）

【职责分工（必须遵守）】
- 脚本做：parse → generate → TTS → build → verify
- Cursor 必写三件套（不要手工编辑 cards.json，不要从 PDF 自动抽例句）：
  1. grade{N}_vol{V}_mj_examples_data.py   — 每词 2～3 条例句 (en, zh)
  2. grade{N}_vol{V}_mj_mnemonics.py       — DEFINITION_OVERRIDES + IPA_OVERRIDES + POS_OVERRIDES 全覆盖；mnemonic_for；INFLECTION_NOTES
  3. grade{N}_vol{V}_mj_vocab_fixes.py     — 仅 parse 漏词/OCR 噪声时需要
- 在 pep_vocab_common.py 注册 PackConfig；在 pep_vocab_pipeline.py 注册三件套模块名

【制作顺序（逐步执行，每步汇报结果）】

① parse — 从 PDF 抽词表
   python tools/pack-builder/scripts/pep_vocab_pipeline.py <packId> parse
   验收：cache 词条数与 PDF「Words and Expressions / 单元词汇表」一致；核对 unitStats

② 写三件套 — 覆盖 cache 全部 headword（1:1，不可漏词）
   写例句过程中随时自检：
   python tools/pack-builder/scripts/pep_vocab_pipeline.py <packId> check-examples

③ bump 版本 — 在 pep_vocab_common.py 把 pack_version +1（首版 1.0.0）

④ generate — 生成 source/<packId>/ 三份 JSON
   python tools/pack-builder/scripts/pep_vocab_pipeline.py <packId> generate
   （generate 开始前自动 check-examples；通过后才会写 cards.json）

⑤ TTS — 批量生成 mp3
   python tools/pack-builder/scripts/generate_pep_vocab_audio.py <packId>
   （换音色或改 TTS 规则后加 --force）
   音色固定：en-GB-LibbyNeural，dialect uk
   特殊 headword（如 a/an 含 /）须在 pack_tts_config.py 的 HEADWORD_TTS_SEGMENTS 配置后再生成

⑥ build — 打包 + 验包
   python tools/pack-builder/scripts/pep_vocab_pipeline.py <packId> build
   （build 前自动校验 meta.json 版本一致 + cards.json 例句 token）
   验收：verify 零错误；zip 内 manifest.packVersion 与文件名版本一致

或一条龙：python tools/pack-builder/scripts/pep_vocab_pipeline.py <packId> all

【例句 / 助记 / 音标】见本文 §4.5.1、§4.3、§4.2

【版本 / 上传】
- 改内容必须：bump pack_version → generate → TTS（若例句/headword 变了）→ build
- 禁止只 bump 版本只跑 build
- Admin 版本号须与 zip 内 packManifest.packVersion 一致
- 默认不要 git commit，不要上传 Admin（除非我明确要求）

【交付汇报】
1. packId、版本、cardCount、zip 路径
2. parse 词条数 vs PDF 对比
3. check-examples / build verify 结果
4. 若有 vocab_fixes / TTS 特殊配置，说明改了什么
5. 已知遗留或需人工试听抽查的词（如有）
```

### 10.3 修订已有闽教版包（非新年级）

```text
【本次是内容修订，不是新包】
- 基础包：{packId}（已有）
- 修订原因：{例：补例句 / 修 TTS / 修 IPA / 修 token 例句}
- 必须在 pep_vocab_common.py bump pack_version 后跑 generate → TTS（若需）→ build
- 参考已修复案例：en-grade3-v1-mj 1.0.3（a/an TTS 分段、例句 token 批量修复）
- 其余流程与 §10.2 相同
```

---

## 11. 常见问题

**Q：上册 `en-grade3-v1-rj` 为什么脚本不同？**  
A：上册早期用 `generate-grade3-v1-source.mjs` 手工词表；**三下及四～六年级**分别用 grade3 四件套或 **统一管线** `pep_vocab_pipeline.py`。新年级以 §5 统一管线为准。

**Q：四～六年级还要复制 `parse_grade3_vol2_vocab.py` 吗？**  
A：**不要。** 在 `PACK_CONFIGS` 注册后直接用 `pep_vocab_pipeline.py parse`。仅例句/助记写法可参考 `grade3_vol2_*`。

**Q：parse 出来的 ipa 能直接用吗？**  
A：**不能作为交付标准。** PUA/OCR 初值可能有方框、`%`、乱码；必须在 `IPA_OVERRIDES` 写标准英式 IPA（或使用空字符串省略 phonetic）。

**Q：例句能不能让脚本从 PDF 课文自动抽？**  
A：**不要。** 自动抽取质量差；例句由 Cursor 维护 `*_examples_data.py`（课文对齐、2～3 条、完整中文）。

**Q：六年级下册为什么只有 88 词、没有 Unit 5/6？**  
A：该册教材附录单元词汇表只有 **4 个 Unit**，88 词为完整覆盖，不是漏解析。

**Q：附录还有「常用表达」要收录吗？**  
A：默认只做 **附录 2 单元词汇表**；Appendix 3 二级总词汇不收录（OCR 路径会自动截断）。

**Q：TTS 中途 DNS 失败怎么办？**  
A：不加 `--force` 重新运行 `generate_pep_vocab_audio.py`，已存在且 >4KB 的 mp3 会跳过（断点续传）。

**Q：可以混用美式音标/TTS 吗？**  
A：人教版 PEP **不可以**；IPA 与 TTS 必须同为英式 uk。

**Q：lexicon 里为什么要写 `are`、`the` 这种词？**  
A：例句点词会点到；缺条目 App 弹窗显示「未收录」。由 generate 自动扫描，Cursor 不必手工维护。

**Q：verify 过了但 App 安装失败？**  
A：查 `protocolVersion`、签名 keyId、zip 大小；与 builder/App 版本是否一致。

**Q：Admin 提示 packVersion 已存在 / zip 文件名与 manifest 版本不一致？**  
A：只 bump 了 `pep_vocab_common.py` 但没跑 `generate`。`meta.json` 仅由 `generate` 写入；必须 **bump → generate → build**，且 Admin 填写的版本与 zip 内 manifest 一致。

**Q：例句 token 校验失败（example missing headword token）？**  
A：写例句时跑 `check-examples`（见 §4.5.1）。禁止为过审改词形；应重写句子使 headword 精确出现且语法自然。

**Q：TTS 把 a/an 读成怪音？**  
A：在 `pack_tts_config.py` 的 `HEADWORD_TTS_SEGMENTS` 配置分段读音（如 `a/an` → `['a', 'an']`），再 `--force` 重生成该包音频。

**Q：闽教版与人教版制作有何不同？**  
A：packId 后缀 `-mj`；`vocab_format='minjiao_unit'`；三件套文件名带 `_mj`；PDF 无 IPA，释义/音标全靠 `*_mnemonics.py` overrides。流程与校验规则相同，金标准见 `en-grade3-v2-mj`（§10.2）。

---

## 12. 文件索引

| 文件                                                          | 用途                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `docs/runbooks/vocabulary-pack-production.md`                 | **本文** — 新对话入口                                 |
| `.cursor/rules/pack-protocol-alignment.mdc`                   | pack 协议冻结稿                                       |
| `tools/pack-builder/scripts/pep_vocab_common.py`              | **统一** PackConfig、PDF/OCR 解析、cards/lexicon 生成 |
| `tools/pack-builder/scripts/pep_vocab_pipeline.py`            | **统一** CLI：parse / generate / build / all / **check-examples** |
| `tools/pack-builder/scripts/scan_example_tokens.py`           | 例句 headword token 扫描（check-examples / generate / build 内部调用） |
| `tools/pack-builder/scripts/generate_pep_vocab_audio.py`      | **统一** TTS                                          |
| `tools/pack-builder/scripts/grade{N}_vol{V}_examples_data.py` | Cursor：例句数据（人教版）                            |
| `tools/pack-builder/scripts/grade{N}_vol{V}_mnemonics.py`     | Cursor：助记 + overrides（人教版）                  |
| `tools/pack-builder/scripts/grade{N}_vol{V}_vocab_fixes.py`   | Cursor（可选）：漏词/OCR 清洗（人教版）               |
| `tools/pack-builder/scripts/grade{N}_vol{V}_mj_examples_data.py` | Cursor：例句数据（**闽教版**）                     |
| `tools/pack-builder/scripts/grade{N}_vol{V}_mj_mnemonics.py` | Cursor：助记 + overrides（**闽教版**）               |
| `tools/pack-builder/scripts/grade{N}_vol{V}_mj_vocab_fixes.py` | Cursor（可选）：漏词清洗（**闽教版**）             |
| `tools/pack-builder/scripts/grade3_vol2_mj_*.py`              | **闽教版金标准**三件套（三下，`en-grade3-v2-mj`）     |
| `tools/pack-builder/scripts/grade3_vol2_*.py`                 | 三下历史四件套（人教版例句/助记写法参考）             |
| `tools/pack-builder/scripts/pack_tts_config.py`               | 共享音色 + `HEADWORD_TTS_SEGMENTS`                    |
| `tools/pack-builder/docs/llm-system-prompt.md`                | LLM 路线说明                                          |
| `docs/runbooks/pack-editor-local.md`                          | 本地编辑/打包 UI                                      |
