# Pack Editor 本地使用

单人本地工具，读写 `tools/pack-builder/source/<packId>/` 下的 JSON，编辑 vocabulary 与 story_reading 卡片，校验后触发 `build:pack`。**不**修改已发布 zip、**不**接 Admin/API/LLM。

## 启动

**一键（Windows）：** 双击 [`tools/pack-editor/start.bat`](../../tools/pack-editor/start.bat)（会自动编译 pack-builder、启动服务并打开浏览器）。

或手动：

```powershell
pnpm --filter @remember/pack-builder build
pnpm dev:pack-editor
```

默认地址：**http://127.0.0.1:5174**（与 Admin 5173 错开）。

## 工作流

1. AI 或手工产出 JSON → 放入 `tools/pack-builder/source/<packId>/`
2. 用 **pack-editor** 浏览、搜索、逐条改错（例句、释义、音频路径等）
3. 顶栏 **校验** → 修复 schema / 资源路径 / story 交叉规则问题
4. **打包** → 确认 bump 后的 `packVersion` → 生成 zip 到 `tools/pack-builder/output/<packId>-<version>.zip`
5. 到 **Admin** 手动上传发布

## 限制（MVP）

| 项           | 说明                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| cardType     | `vocabulary`（`kind`: `word` \| `phrase`）与 `story_reading`                                                                                       |
| lexicon.json | vocabulary 包：**不自动重算**；改例句后若点词异常，需手动维护 lexicon 或重新跑 pack-builder 管线。story 包：**不维护** lexicon，词表仅 `sidebar[]` |
| zip          | 不可变；编辑 source 后必须 bump 版本再 build                                                                                                       |
| 上传         | 无内置上传；build 产物自行 Admin 发布                                                                                                              |
| story 资源   | 无上传 UI；音频/图片路径字符串 + 存在性校验；文件手工放入 `assets/`                                                                                |
| story 时间轴 | 播放主音频、段色块轨道、设为起/终点、段内试听；关闭「启用时间轴」会清除所有 `audio*Ms` 字段                                                        |

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

路径仅允许 `tools/pack-builder/source/*` 下合法 `packId`；含 `..` 等逃逸请求返回 403。

## 相关命令

```powershell
pnpm --filter @remember/pack-editor test
pnpm --filter @remember/pack-editor typecheck
pnpm --filter @remember/pack-builder build:pack
```
