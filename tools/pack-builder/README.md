# Pack Builder

构建与独立校验学习包 zip（见 ADR 0008）。

## 命令

```powershell
pnpm --filter @remember/pack-builder build
pnpm --filter @remember/pack-builder build:pack
pnpm --filter @remember/pack-builder verify:fixture
pnpm --filter @remember/pack-builder test
```

## 固定测试包

- 源内容：`source/remember-test-pack/`
- 产物：`fixtures/remember-test-pack.zip`
- 复制到移动端：`apps/mobile/assets/packs/remember-test-pack.zip`（构建后同步）

## AI 生成内容

| 你要复制哪个                                                                            | 发到哪里                               |
| --------------------------------------------------------------------------------------- | -------------------------------------- |
| [`docs/system-prompt.txt`](docs/system-prompt.txt)                                      | 大模型 **System**（只配一次）          |
| [`docs/user-message-book-template.txt`](docs/user-message-book-template.txt) + 书本正文 | 大模型 **User**（每批任务）            |
| [`docs/llm-system-prompt.md`](docs/llm-system-prompt.md)                                | 给人看的使用说明，**不要整篇发给模型** |

工作流：AI 输出 JSON → 放入 `source/<packId>/` → 补音频 → **pack-editor 改错** → bump 版本 → `build:pack` → Admin 上传

## Pack Editor（本地改内容）

```powershell
pnpm --filter @remember/pack-builder build
pnpm dev:pack-editor
```

浏览器打开 http://127.0.0.1:5174 。详见 [`docs/runbooks/pack-editor-local.md`](../../docs/runbooks/pack-editor-local.md)。


## 签名私钥

测试包默认使用 RFC 8032 测试向量私钥。生产签名设置环境变量 `REMEMBER_PACK_SIGNING_PRIVATE_KEY_HEX`（不进 Git）。
