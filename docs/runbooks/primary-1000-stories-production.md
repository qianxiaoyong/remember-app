# primary-1000-stories 制作 Runbook

**包 ID：** `primary-1000-stories`（40 课童话 `story_reading`，C1–C40）

本文是 **story 包制作与音频对齐** 的操作手册。新开的 AI 对话可直接读本文并按步骤执行；人工操作也按同一流程。

相关文档：

- Pack Editor 通用说明：[`pack-editor-local.md`](./pack-editor-local.md)
- Pack Builder 总览：[`tools/pack-builder/README.md`](../../tools/pack-builder/README.md)
- Story 产品设计：[`docs/superpowers/specs/2026-08-02-story-reading-design.md`](../superpowers/specs/2026-08-02-story-reading-design.md)

---

## 1. 这套东西分几层

| 层级         | 做什么                             | 用什么                                 |
| ------------ | ---------------------------------- | -------------------------------------- |
| **正文源稿** | 每课英文分段 canonical（对齐锚点） | `canonical/C*.paragraphs.json`         |
| **卡片内容** | 分段 runs、中文翻译、词表、时间轴  | `cards.json` + pack-editor             |
| **音频资产** | 官方 mp3 导入、ffmpeg 修复         | `copy-primary-1000-audio.py`           |
| **自动对齐** | Whisper 转写 + 段落时间轴          | `align-primary-1000-audio.py`          |
| **人工验收** | 试听、改起点、查规则               | pack-editor（5174）                    |
| **打包发布** | 验包、出 zip、Admin 上传           | pack-builder CLI / pack-editor「打包」 |

**重要：** Whisper 识别与对齐 **只在 Python 脚本里跑**；pack-editor **不会**自动识别，只读写 `audioStartMs` / `audioEndMs`。

---

## 2. 目录结构（都在仓库内）

```text
tools/pack-builder/source/primary-1000-stories/
  meta.json                 # packId / packVersion / keyId
  cards.json                # 40 张 story_reading 卡片（含时间轴）
  lexicon.json              # story 包占位（空数组即可）
  canonical/
    C1.paragraphs.json      # 每课英文分段（对齐脚本文本源）
    …
    C40.paragraphs.json
  assets/
    audio/c1.mp3 … c40.mp3  # 包内主音频（修复后）
    images/c1.png … c40.png

imports/40篇童话故事记完小学1000核心词汇音频/
  01.mp3 … 40.mp3           # 官方原始 mp3（不进 zip）

tools/pack-builder/cache/story-audio-align/
  C1.whisper.json           # Whisper 词级缓存
  C1.16k.wav                # 转写用 16k wav 缓存
  …

tools/pack-builder/scripts/
  copy-primary-1000-audio.py
  align-primary-1000-audio.py
  story_audio_transcribe.py
  story_audio_align.py
  story_audio_repair.py
  story_audio_paths.py
```

---

## 3. 一次性环境（Windows）

### 3.1 必需

| 组件                 | 用途                            | 安装                                                                |
| -------------------- | ------------------------------- | ------------------------------------------------------------------- |
| **Node + pnpm**      | pack-editor、pack-builder、测试 | 项目常规开发环境                                                    |
| **ffmpeg / ffprobe** | mp3 修复、时长、转 wav          | `winget install Gyan.FFmpeg`（或设 `FFMPEG_PATH` / `FFPROBE_PATH`） |
| **Python 3.12**      | faster-whisper 对齐             | 建议独立目录，勿用易冲突的旧 Python                                 |
| **faster-whisper**   | 语音转写                        | `pip install faster-whisper`                                        |

### 3.2 推荐本地布局（D 盘，不进 Git）

```text
D:\remember-audio\
  Python312\          # 独立 Python 3.12
  hf-cache\           # HuggingFace 模型缓存（设 HF_HOME）
  pip-cache\
  env.ps1             # 可选：一键设 PATH / HF_HOME / 别名
```

**`env.ps1` 示例（本地自建，按你的路径改）：**

```powershell
$env:HF_HOME = "D:\remember-audio\hf-cache"
$env:PIP_CACHE_DIR = "D:\remember-audio\pip-cache"
$script:Py = "D:\remember-audio\Python312\python.exe"

function remember-copy-audio {
  & $script:Py "D:\AIcoder\remember-app\tools\pack-builder\scripts\copy-primary-1000-audio.py" @args
}
function remember-align {
  & $script:Py "D:\AIcoder\remember-app\tools\pack-builder\scripts\align-primary-1000-audio.py" @args
}
```

每次开 PowerShell 做音频相关操作前：

```powershell
. D:\remember-audio\env.ps1
```

> **注意：** 不要用已知会崩的 Python 3.10 便携环境跑 ctranslate2；对齐统一用 3.12。

---

## 4. 标准制作流程

按顺序做；换音频或改 canonical 后，从对应步骤重做。

### 步骤 A — 准备 canonical 英文（对齐锚点）

1. 编辑 `canonical/Cn.paragraphs.json`：
   - `lessonCode`：如 `C3`
   - `paragraphs[]`：与 PDF/官方短文 **分段一致** 的英文（纯文本字符串数组）
2. **段数必须与** `cards.json` 里该课 `story.paragraphs` **相同**。
3. 这是 Whisper 对齐的文本源；`cards.json` 里 runs 的英文应与 canonical **一致**（测试会查）。

### 步骤 B — 编辑 cards.json（内容与 UI）

1. 启动 pack-editor：

   ```powershell
   pnpm --filter @remember/pack-builder build
   pnpm dev:pack-editor
   ```

   打开 http://127.0.0.1:5174 ，选 `primary-1000-stories`。

2. 逐课检查：标题、封面、分段 runs、段译、sidebar 词表。
3. **时间轴可留空或旧值**——下一步脚本会写 `audioStartMs` / `audioEndMs`。
4. 顶栏 **检查规则** → 修到无 error。

也可用手工/AI patch 脚本改 `cards.json`，但最终仍建议 pack-editor 过一遍。

### 步骤 C — 导入并修复官方 mp3

官方源：`imports/40篇童话故事记完小学1000核心词汇音频/NN.mp3`  
包内目标：`assets/audio/cN.mp3`

```powershell
# 全量 1–40，默认 ffmpeg 重编码（推荐）
python tools/pack-builder/scripts/copy-primary-1000-audio.py --from 1 --to 40

# 仅某一课
python tools/pack-builder/scripts/copy-primary-1000-audio.py --from 3 --to 3

# 预览不写文件
python tools/pack-builder/scripts/copy-primary-1000-audio.py --from 1 --to 40 --dry-run
```

- **默认会重编码**（修坏帧、去 Xing 头），Windows / 浏览器 / ffprobe 时长一致。
- **`--copy-only`**：仅字节复制，旧行为，**不推荐**。
- 重编码后会 **清该课 Whisper/wav 缓存**；下一步对齐需加 `--refresh-transcript`（至少对该课）。

### 步骤 D — Whisper 转写 + 段落对齐（写 cards.json）

```powershell
# 1) 先试跑，看报告，不写文件
python tools/pack-builder/scripts/align-primary-1000-audio.py --lesson 3 --dry-run

# 2) 满意后写入
python tools/pack-builder/scripts/align-primary-1000-audio.py --lesson 3 --write

# 3) 批量
python tools/pack-builder/scripts/align-primary-1000-audio.py --from 1 --to 40 --write

# 4) 换 mp3 或怀疑转写脏了
python tools/pack-builder/scripts/align-primary-1000-audio.py --from 1 --to 40 --refresh-transcript --write
```

**脚本行为摘要：**

- mp3 → 16 kHz wav → faster-whisper（模型默认 `base`，`--model` 可改）
- 跳过片头（标题+介绍）：锚定 **第 1 段 canonical** 找 `story_start`
- 逐段匹配词时间戳 → 写入每段 `audioStartMs`；段终点 = 下一段起点（末段 = 音频总长）
- 转写缓存：`tools/pack-builder/cache/story-audio-align/Cn.whisper.json`
- 报告里 **WARN** / **conf < 1** 的段要人工试听

**其它参数：**

| 参数                   | 说明                                |
| ---------------------- | ----------------------------------- |
| `--dry-run`            | 只打印报告                          |
| `--write`              | 写入 `cards.json`（缺省拒绝改文件） |
| `--refresh-transcript` | 忽略 whisper 缓存重转写             |
| `--no-fallback`        | 匹配失败即报错（调试用）            |
| `--probe-only`         | 只打 mp3 时长，不跑 Whisper         |

### 步骤 E — pack-editor 人工验收（必做）

1. **硬刷新** pack-editor（改 mp3 后若时长不对，需 **重启** `pnpm dev:pack-editor`）。
2. 逐课检查：
   - 顶栏总时长 ≈ ffprobe / 资源管理器
   - 每段 **时长** 不应出现 0.0 秒（除非该段确实极短且 intentional）
   - **试听本段** 与高亮边界
3. 偏差大时：**设为起点** 手动改段起点（pack-editor 会重算终点）。
4. 再次 **检查规则** → **保存**。

### 步骤 F — 自动化测试

在仓库根目录：

```powershell
pnpm --filter @remember/pack-editor exec vitest run `
  src/server/validate-primary-1000-stories.test.ts `
  src/server/story-canonical-text.test.ts
```

- 前者：C1–C40 schema、资源、时间轴单调不重叠
- 后者：cards 英文与 canonical 一致

### 步骤 G — 打包与发布

1. bump `meta.json` 的 `packVersion`（内容变更必须升版本）。
2. 打包（二选一）：
   - pack-editor 顶栏 **打包**，或
   - CLI：

     ```powershell
     pnpm --filter @remember/pack-builder build
     node tools/pack-builder/dist/cli.js build `
       --source tools/pack-builder/source/primary-1000-stories `
       --output tools/pack-builder/output/primary-1000-stories-1.0.2.zip
     ```

3. 验包：

   ```powershell
   node tools/pack-builder/dist/cli.js verify -- tools/pack-builder/output/primary-1000-stories-1.0.2.zip
   ```

4. Admin 后台上传 zip（见 [`pack-editor-local.md`](./pack-editor-local.md)）。

---

## 5. 常见场景速查

| 场景                        | 做什么                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| 只改了某课翻译/词表         | pack-editor 保存 → 检查规则 → bump 版本 → 打包                               |
| 改了 canonical 分段         | 同步改 cards 段数/英文 → 对齐 `--lesson N --write` → 验收 → 测试 → 打包      |
| 换了官方 mp3                | `copy-primary-1000-audio.py` → `align … --refresh-transcript --write` → 验收 |
| 批量重对齐（缓存可用）      | `align … --from 1 --to 40 --write`                                           |
| 某段 0 秒 / 音频进下一段    | 先看 align 报告 WARN；重跑对齐；仍不对则 pack-editor 手动设起点              |
| pack-editor 时长仍不对      | 确认 mp3 已 repair；**重启** dev server；硬刷新                              |
| Whisper 报 ffmpeg 找不到    | 装 ffmpeg 或设 `FFMPEG_PATH`                                                 |
| 转写明显缺词（如 C23 末尾） | 报告 conf=0 段在 editor 里手调；或换更大 `--model` 重转写                    |

---

## 6. 对齐质量怎么读报告

示例：

```text
C3: duration=133616ms story_start=11960ms …
  P08  77140- 85900ms conf=1.00 words=10/10 Their mother asks…
  WARN: C3 paragraph 9: partial align 7/10 word(s)
```

| 字段          | 含义                        |
| ------------- | --------------------------- |
| `story_start` | 正文起点（跳过片头）        |
| `conf`        | 匹配词数 / 期望词数         |
| `words=a/b`   | 实际匹配 b 个 token 里 a 个 |
| `WARN`        | 需人工试听；不一定失败      |

**发版前：** 所有课在 pack-editor 听过一遍；测试全绿；无 unexplained 0 秒段。

---

## 7. 给「新 AI 窗口」怎么说（复制粘贴）

新开对话时，把下面整段发给 AI（路径按你的机器改 `remember-app` 根目录）：

```text
请阅读并严格按文档操作：
docs/runbooks/primary-1000-stories-production.md

任务：<写你的具体任务，例如「重跑 C3–C10 音频对齐并验收」>

约束：
- 使用 build-learning-app skill
- 对齐只用 tools/pack-builder/scripts/ 下 Python 脚本，不要猜时间轴
- 改 cards.json 前先用 --dry-run；写入用 --write
- 改完跑 validate-primary-1000-stories 与 story-canonical-text 测试
- Python：D:\remember-audio\Python312\python.exe，先 . D:\remember-audio\env.ps1
- 不要 commit / 不要 bump packVersion，除非我明确要求
```

**示例任务表述：**

- 「按 runbook 步骤 C+D，对 C14 重新 import mp3 并对齐写入」
- 「批量 `--from 1 --to 40 --write`，检查是否还有 ≤500ms 的段，列出课号」
- 「pack-editor 里 C4 段 9 仍 0 秒，查 cards.json 和 align 报告并修复」

---

## 8. AI / 人工分工建议

| 适合脚本自动做                      | 适合 pack-editor 人工做    |
| ----------------------------------- | -------------------------- |
| 导入修复 mp3                        | 改中文翻译、词 gloss       |
| Whisper 转写与初版时间轴            | 某段试听不准时微调起点     |
| 批量写 `audioStartMs`               | 检查封面、标题、sidebar    |
| 跑 vitest 校验                      | 最终「这课能听」的听感验收 |
| bump 版本 + build zip（明确授权时） | Admin 上传发布             |

---

## 9. 脚本清单（便于 AI grep）

| 脚本                          | 作用                                         |
| ----------------------------- | -------------------------------------------- |
| `copy-primary-1000-audio.py`  | 官方 mp3 → 包内 `assets/audio/`，ffmpeg 修复 |
| `align-primary-1000-audio.py` | **入口**：Whisper + 对齐 → `cards.json`      |
| `story_audio_transcribe.py`   | 转写与缓存                                   |
| `story_audio_align.py`        | 段落匹配逻辑                                 |
| `story_audio_repair.py`       | ffmpeg 重编码参数                            |
| `story_audio_paths.py`        | 路径常量                                     |

**不要**在 pack-editor、移动端或 API 里重复实现 Whisper；有对齐逻辑变更 **只改上述脚本**，然后重跑对齐 + 测试。
