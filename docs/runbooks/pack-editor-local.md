# Pack Editor 本地使用

单人本地工具，读写 `tools/pack-builder/source/<packId>/` 下的 JSON，编辑 vocabulary 卡片，校验后触发 `build:pack`。**不**修改已发布 zip、**不**接 Admin/API/LLM。

## 启动

```powershell
pnpm --filter @remember/pack-builder build
pnpm dev:pack-editor
```

默认地址：**http://127.0.0.1:5174**（与 Admin 5173 错开）。

## 工作流

1. AI 或手工产出 JSON → 放入 `tools/pack-builder/source/<packId>/`
2. 用 **pack-editor** 浏览、搜索、逐条改错（例句、释义、音频路径等）
3. 顶栏 **校验** → 修复 schema / 资源路径问题
4. **打包** → 确认 bump 后的 `packVersion` → 生成 zip 到 `tools/pack-builder/output/<packId>-<version>.zip`
5. 到 **Admin** 手动上传发布

## 限制（MVP）

| 项 | 说明 |
| --- | --- |
| cardType | 仅 `vocabulary`（`kind`: `word` \| `phrase`） |
| lexicon.json | **不自动重算**；改例句后若点词异常，需手动维护 lexicon 或重新跑 pack-builder 管线（Phase 2） |
| zip | 不可变；编辑 source 后必须 bump 版本再 build |
| 上传 | 无内置上传；build 产物自行 Admin 发布 |

## 本地 API（Vite 中间件）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/local-api/packs` | 列出 source 下所有包 |
| GET | `/local-api/packs/:packId/source` | 完整 PackSource |
| PUT | `/local-api/packs/:packId/cards/:sortOrder` | 保存单卡 |
| POST | `/local-api/packs/:packId/validate` | Zod + 资源路径检查 |
| POST | `/local-api/packs/:packId/build` | 可选 bump 版本并 spawn pack-builder CLI |

路径仅允许 `tools/pack-builder/source/*` 下合法 `packId`；含 `..` 等逃逸请求返回 403。

## 相关命令

```powershell
pnpm --filter @remember/pack-editor test
pnpm --filter @remember/pack-editor typecheck
pnpm --filter @remember/pack-builder build:pack
```
