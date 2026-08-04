# Pack Editor 本地使用

单人本地工具，读写 `tools/pack-builder/source/<packId>/` 下的 JSON，编辑 vocabulary 与 story_reading 卡片，校验后触发 `build:pack`。**不**修改已发布 zip。

**中心词库补词（子计划 4）：** 需本地 API（`3000`）与 Admin 鉴权；pack-editor 经 Vite local-api 代理查询，**不**直连浏览器跨域。

## 启动

**一键（Windows）：** 双击 [`tools/pack-editor/start.bat`](../../tools/pack-editor/start.bat)（会自动编译 pack-builder、启动服务并打开浏览器）。

或手动：

```powershell
pnpm --filter @remember/pack-builder build
pnpm dev:db
pnpm --filter @remember/api dev
pnpm dev:pack-editor
```

默认地址：**http://127.0.0.1:5174**（与 Admin 5173 错开）。

### 中心词库鉴权（补词功能）

启动 pack-editor 前设置 **其一**：

| 方式         | 环境变量                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Bearer token | `LEXICON_ADMIN_TOKEN`（Admin 登录后复制）                                                                       |
| 自动登录     | `LEXICON_ADMIN_PASSWORD`（可与 `apps/api/.env` 的 `ADMIN_BOOTSTRAP_PASSWORD` 一致）；可选 `LEXICON_ADMIN_LOGIN` |

可选：`LEXICON_API_BASE_URL`（默认 `http://127.0.0.1:3000`）

PowerShell 示例：

```powershell
$env:LEXICON_ADMIN_PASSWORD = 'dev-only-admin-password'
pnpm dev:pack-editor
```

## 工作流

1. AI 或手工产出 JSON → 放入 `tools/pack-builder/source/<packId>/`
2. 用 **pack-editor** 浏览、搜索、逐条改错（例句、释义、音频路径等）
3. 顶栏 **校验** → 修复 schema / 资源路径 / story 交叉规则问题
4. **打包** → 确认 bump 后的 `packVersion` → 生成 zip 到 `tools/pack-builder/output/<packId>-<version>.zip`
5. 到 **Admin** 手动上传发布

## 限制（MVP）

| 项           | 说明                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| cardType     | `vocabulary`（`kind`: `word` \| `phrase`）与 `story_reading`                                                  |
| lexicon.json | vocabulary 包：可用 **中心词库补词** 写入；亦可持续手工维护。story 包：**不维护** lexicon，词表仅 `sidebar[]` |
| zip          | 不可变；编辑 source 后必须 bump 版本再 build                                                                  |
| 上传         | 无内置上传；build 产物自行 Admin 发布                                                                         |
| story 资源   | 无上传 UI；音频/图片路径字符串 + 存在性校验；文件手工放入 `assets/`                                           |
| story 时间轴 | 播放主音频、段色块轨道、设为起/终点、段内试听；关闭「启用时间轴」会清除所有 `audio*Ms` 字段                   |

## 本地 API（Vite 中间件）

| 方法   | 路径                                        | 说明                                                                               |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/local-api/packs`                          | 列出 source 下所有包                                                               |
| GET    | `/local-api/packs/:packId/source`           | 完整 PackSource                                                                    |
| PUT    | `/local-api/packs/:packId/cards/:sortOrder` | 保存单卡（vocabulary / story_reading）                                             |
| POST   | `/local-api/packs/:packId/cards`            | 新增单词或一课（body: `{ kind }` 或 `{ cardType: 'story_reading', lessonCode? }`） |
| DELETE | `/local-api/packs/:packId/cards/:sortOrder` | 删除卡片                                                                           |
| POST   | `/local-api/packs/:packId/validate`         | Zod + 资源路径 + story 交叉规则检查                                                |
| POST   | `/local-api/packs/:packId/build`            | 可选 bump 版本并 spawn pack-builder CLI                                            |
| GET    | `/local-api/packs/:packId/assets/*`         | 只读流式返回包内 assets 文件                                                       |
| GET    | `/local-api/packs/:packId/audio-meta?path=` | 返回 mp3 时长 `{ durationMs }`                                                     |
| GET    | `/local-api/packs/:packId/lexicon`          | 读取 vocabulary 包 `lexicon.json`                                                  |
| PUT    | `/local-api/packs/:packId/lexicon`          | 保存 vocabulary 包 `lexicon.json`                                                  |
| GET    | `/local-api/lexicon/search?q=`              | 代理 Admin 中心词库搜索                                                            |
| GET    | `/local-api/lexicon/by-form/:formKey`       | 代理 Admin 变体反查                                                                |
| POST   | `/local-api/lexicon/batch-get`              | 代理 Admin 批量读取                                                                |
| POST   | `/local-api/tts/synthesize`                 | 串行队列代理 LocalTTS，写入 pack `assets/audio/`                                   |
| GET    | `/local-api/tts/status`                     | TTS 队列状态（pending / running / 最近任务）                                       |

路径仅允许 `tools/pack-builder/source/*` 下合法 `packId`；含 `..` 等逃逸请求返回 403。

## LocalTTS（子计划 6）

制包机本地 [LocalTTS](https://github.com/qianxiaoyong/LocalTTS) 默认 **`http://127.0.0.1:7860`**。pack-editor **不**内置 TTS，经 local-api 代理 **`POST /api/synthesize`**，进程内 **serial=1** 串行队列。

| 环境变量               | 默认                    | 说明                 |
| ---------------------- | ----------------------- | -------------------- |
| `LOCAL_TTS_BASE_URL`   | `http://127.0.0.1:7860` | LocalTTS 服务地址    |
| `LOCAL_TTS_VOICE`      | （空）                  | 可选默认音色         |
| `LOCAL_TTS_FORMAT`     | `mp3`                   | `mp3` 或 `wav`       |
| `LOCAL_TTS_TIMEOUT_MS` | `120000`                | 单次合成超时（毫秒） |

**UI：** vocabulary 卡片「主音频 / 例句音频」、story 课「主音频」旁 **TTS** 按钮；合成成功后自动填入 `assets/audio/…` 路径并写入 source 目录。

PowerShell 示例：

```powershell
# 先在本机启动 LocalTTS（默认 7860）
pnpm dev:pack-editor
```

LocalTTS 未启动时按钮会显示连接失败提示；队列中其他任务仍按顺序执行。

## 相关命令

```powershell
pnpm --filter @remember/pack-editor test
pnpm --filter @remember/pack-editor typecheck
pnpm --filter @remember/pack-builder build:pack
```
