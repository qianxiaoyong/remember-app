# 0008 学习包协议（第一期冻结）

日期：2026-07-28  
状态：已冻结（阶段 3 落盘）  
对齐原件：`.cursor/rules/pack-protocol-alignment.mdc`

## 范围

定义学习包 zip 交付物、`packManifest.json`、`pack.sqlite` 三表结构、vocabulary 卡片 JSON、`lexicon_entries` 点词、Ed25519 验签顺序、稳定 `knowledgeId` 与 `PACK_*` 错误码。第一期仅 `vocabulary` 一种 `cardType`；`lexicon_forms` 表保留、0 行、不参与查询。

契约唯一来源：`packages/contracts/src/pack/`。构建与独立校验：`tools/pack-builder/`。

## 交付物

单文件 `.zip`（非 APK），根目录固定三样：

```text
packManifest.json
pack.sqlite
assets/…
```

| 字段              | 必填 | 说明                          |
| ----------------- | ---- | ----------------------------- |
| `manifestVersion` | ✅   | manifest 格式版本；第一期 `1` |
| `protocolVersion` | ✅   | 内容协议版本；第一期 `1`      |
| `packId`          | ✅   | 商品 ID，稳定不变             |
| `packVersion`     | ✅   | 内容版本，如 `1.0.0`          |
| `keyId`           | ✅   | 验签公钥 ID（支持轮换）       |
| `files`           | ✅   | 受保护文件清单                |
| `signature`       | ✅   | Ed25519，Base64               |
| `sections`        | ❌   | 可选分段元数据                |

`files[]` 每项：`path`（相对路径）、`sha256`（hex 小写）、`sizeBytes`。必须含 `pack.sqlite` 及 SQLite 引用的全部 `assets/` 文件；不含 lexicon 远程 `audioUrl`。路径只允许 `pack.sqlite` 或 `assets/` 前缀；禁止 `..`、绝对路径。单 zip 上限 **200MB**；UTF-8。

## 验签与完整性顺序

App 与 `pack-builder verify` 一致，失败即停：

1. 解压到临时目录
2. 解析 `packManifest.json`（Zod）
3. 检查 `protocolVersion` 受支持
4. 校验 `files[]` 路径白名单与单文件大小
5. 逐文件 sha256 / size
6. Ed25519 验签（见下）
7. 只读打开 `pack.sqlite` 结构自检
8. Zod 校验 `cards.content` 与 `lexicon_entries.definitions`

**签名消息：** 自 manifest 去掉 `signature` 键后，对剩余对象做 **递归键排序 canonical JSON**（UTF-8 字节）。不拼接文件内容；文件完整性由 `files[]` 哈希负责。

**破坏性变更：** 必须递增 `protocolVersion` 或 `manifestVersion`；不得静默兼容未知字段（Zod `.strict()`）。

## knowledgeId

- 格式：`{packId}:en:{word|phrase}:{slug}`
- `slug`：`prompt.headword` 经 trim、小写、空格→`-`、仅保留 `[a-z0-9-]`
- 包内唯一；跨包不合并进度；headword 规范化变更则新 ID
- 与架构「跨包共享」差异：「同一知识内容」= **某 pack 内的一条 card**（本 pack 内 ID 稳定即可）

## vocabulary 卡片

表列：`knowledgeId`、`cardType`（`vocabulary`）、`sortOrder`、`content`（JSON 字符串）。

**content 仅两键：** `prompt`（阶段 A）、`reveal`（阶段 B）。可选字段 **省略键**，不用 `null`。

### prompt（阶段 A）

| 字段               | 必填                                       |
| ------------------ | ------------------------------------------ |
| `headword`         | ✅                                         |
| `primaryAudio`     | ✅（包内相对路径，须在 manifest 资源清单） |
| `phonetic.ipa`     | 有 phonetic 则 ✅                          |
| `phonetic.dialect` | ❌（`us` \| `uk`，缺省 App 当 `us`）       |
| `primaryImage`     | ❌                                         |

交互（不进 JSON）：点顶栏/喇叭只播 `primaryAudio`；点中间空白进入阶段 B；进入页不自动播。

### reveal（阶段 B）

必填：`definitions[]`（≥1，`text` 必填 `pos` 可选）、`examples[]`（1～5，`en`/`zh` 必填，`audio` 可选）。  
可选：`mnemonic`（MVP 仅 `kind: association`）、`inflectionNote`。

## lexicon 与点词

**点词规则：点的是什么查什么**——直查 `lexicon_entries.surfaceForm`（normalize 后）；`lexicon_forms` 第一期 **0 行、不查询**。

| 列                              | 说明                                          |
| ------------------------------- | --------------------------------------------- |
| `surfaceForm`                   | PK，标准化点击形                              |
| `displayForm`                   | 展示形                                        |
| `definitions`                   | JSON 数组，同 vocabulary                      |
| `ipa` / `formNote` / `audioUrl` | 可选；`audioUrl` 为 HTTPS 远程，不进 manifest |

**normalize：** 小写、去首尾标点；token 匹配 `[a-zA-Z']+`。构建器从 `examples[].en` 扫描 token 写入包内 `lexicon_entries` 子集。

**点词收藏（阶段 4 落地）：** `user.sqlite` 存 `packId + surfaceForm`；入口：抽屉「学习」→「生词本」。MVP 不做学习卡 `knowledgeId` 收藏。

## pack.sqlite 物理 schema

```sql
CREATE TABLE cards (
  knowledgeId TEXT NOT NULL PRIMARY KEY,
  cardType TEXT NOT NULL,
  sortOrder INTEGER NOT NULL UNIQUE,
  content TEXT NOT NULL
);
CREATE INDEX idx_cards_sort_order ON cards (sortOrder);

CREATE TABLE lexicon_entries (
  surfaceForm TEXT NOT NULL PRIMARY KEY,
  displayForm TEXT NOT NULL,
  definitions TEXT NOT NULL,
  ipa TEXT,
  formNote TEXT,
  audioUrl TEXT
);

CREATE TABLE lexicon_forms (
  aliasForm TEXT NOT NULL PRIMARY KEY,
  surfaceForm TEXT NOT NULL,
  FOREIGN KEY (surfaceForm) REFERENCES lexicon_entries (surfaceForm)
);
```

结构自检：恰好 3 表、列清单匹配、`cards` ≥1 行、`lexicon_entries` ≥1 行、`lexicon_forms` 允许 0 行。

## 安装错误码

| 错误码                      | 何时                                   |
| --------------------------- | -------------------------------------- |
| `PACK_ARCHIVE_INVALID`      | zip 损坏、缺根文件                     |
| `PACK_MANIFEST_INVALID`     | manifest 非法、缺字段、路径非法        |
| `PACK_PROTOCOL_UNSUPPORTED` | `protocolVersion` 不支持               |
| `PACK_INTEGRITY_FAILED`     | sha256 或 size 不符                    |
| `PACK_SIGNATURE_INVALID`    | Ed25519 验签失败                       |
| `PACK_KEY_UNKNOWN`          | `keyId` 无内置公钥                     |
| `PACK_SIZE_EXCEEDED`        | 超限                                   |
| `PACK_SCHEMA_INVALID`       | SQLite 缺表/缺列/0 行 cards 或 entries |
| `PACK_CONTENT_INVALID`      | card/lexicon JSON Zod 失败             |

UI 展示人话，不直接展示码。不在验包链上的码：`PACK_NOT_FOUND`、`PACK_ACCESS_DENIED`、`DOWNLOAD_FAILED`。

## 扩展预留（第一期可不填）

1. `cardType` 枚举可扩展；App 按白名单渲染器注册。
2. 同行级 `cardType`，包内可混排（靠 `sortOrder`）。
3. `manifest.sections` 可选，用于 UI 分段。

## 测试密钥与固定样例

- 开发/CI 使用 RFC 8032 测试 seed 私钥；公钥由 `@noble/ed25519` 推导（`test-v1`）。公钥内置 App 与 contracts；私钥仅 pack-builder 本地签名（`REMEMBER_PACK_SIGNING_PRIVATE_KEY_HEX` 或 secrets 目录），**不进 Git**。
- 固定测试包：`tools/pack-builder/fixtures/remember-test-pack.zip`；源内容于 `tools/pack-builder/source/remember-test-pack/`。

## 与既有 ADR 关系

- 验签配置： [0006 Ed25519 Android 验签](./0006-ed25519-android-verification.md)
- 只读安装/SQLite 替换： [0005 Expo 多 SQLite](./0005-expo-multi-sqlite.md)（阶段 4 完整安装流程）

## 验收

```powershell
pnpm check
pnpm --filter @remember/contracts test
pnpm --filter @remember/pack-builder test
pnpm --filter @remember/pack-builder verify -- fixtures/remember-test-pack.zip
```

阶段 3 退出门禁：固定测试包 **构建 → 独立校验 → release 实机只读打开**；篡改任一受保护字节必须失败。

## 附录：审查记录（pack 验签链）

日期：2026-07-28  
范围：`packages/contracts/src/pack/*`、`apps/mobile/src/pack/verify-bundled-pack.ts`  
方式：独立上下文审查（未依赖本对话内实现记忆）

**结论：无 P0/P1；可进入阶段 4。**

| 项       | 结论                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 验签顺序 | `verifyPackArchive` 固定为：体积 → manifest 解析 → 协议版本 → 路径/大小 → 逐文件 sha256 → Ed25519 → SQLite 结构 → 内容 Zod；失败即停，未见 bypass。 |
| 签名消息 | 仅对去掉 `signature` 的 canonical JSON 验签；文件完整性靠 `files[]` 哈希，未混淆。                                                                  |
| 公钥来源 | `PACK_TRUSTED_PUBLIC_KEYS` 白名单 `keyId`；未知 key 拒装（`PACK_KEY_UNKNOWN`）。私钥不在 App。                                                      |
| 路径安全 | manifest 路径白名单 + zip `normalizeZipEntryPath` 拒 `..`；移动端已与 builder 共用 contracts helper。                                               |
| 内容校验 | `cardType` 非 `vocabulary` 拒；`surfaceForm` 须已规范化；资产路径须在 manifest 清单内。                                                             |
| 错误处理 | 统一 `PackVerificationError` + 稳定 `PACK_*` 码；移动端/ builder 不吞异常。                                                                         |

**残余风险（阶段 4 跟踪，非阻塞）：**

- 完整「下载 → 临时目录 → 验包 → 原子安装」链路与安装时篡改拒装尚未落地（阶段 4）。
- 生产 `keyId` 轮换策略与多公钥发布流程待运营密钥就绪后补充 runbook。
- `verify-bundled-pack.ts` 仍含测试向量密钥验签路径，仅供开发/复测；正式安装应复用同一 `verifyPackArchive` 入口。
