# 0010 目录预览、兑换码与介绍媒体分层

日期：2026-07-30  
状态：**已确认**（2026-07-30 kickoff §11）  
关联：`2026-07-30-phase6-catalog-payment-kickoff.md`；架构 §2、§5、§8.5；UI 规范 §7

## 背景

阶段 6 需落地：服务端目录、购买与下载；详情页 **免费内容示例** 与 **付费全量包** 边界；用户要求 **兑换码** 纳入 MVP；未来目录可能增加 **介绍图/视频**。  
架构 §2 原写「不做优惠券」；UI §29 同步。需区分 **满减促销** 与 **兑换开通权益**，避免与 MVP 目标冲突。

## 决策

### 1. 三层媒体与内容（数据归属）

| 层级 | 内容 | 未登录 | 未购买 | 存储 |
| --- | --- | --- | --- | --- |
| **A. 目录营销媒体** | 封面、summary、`introMedia`（介绍图/视频） | ✅ 可看 | ✅ 可看 | COS/CDN **公开只读** 前缀（或 CDN 防盗链）；**不进** pack.zip |
| **B. 免费示例** | `samplePreviews`（词、例句、试听）；轻量 **预览页** | ✅ 可看 | ✅ 可看 | 同上，**单独小文件**（mp3/图） |
| **C. 全量学习包** | signed pack.zip（cards、lexicon、包内音视频） | ❌ | ❌ 需 `pack_access` | COS **私有**；购买/兑换后短链或授权下载 |

**禁止：** 从未授权用户下发完整 pack.zip 或等价 sqlite；示例不得通过「拆 zip 片段」绕过权益检查。

**与架构 §5 对齐：** 学习包内容权威来源仍是 **已安装 signed 包**；A/B 层仅为 **目录运营元数据**，不写入用户 `learning_states`。

### 2. 介绍视频与 introMedia（未购可看、不登录可看）

- 详情页 **`introMedia[]`**：可选 `{ type: image \| video, url, posterUrl?, sortOrder }`。
- **阶段 6 MVP：** 契约与 `packs` 表预留；可只填封面 URL，**可不填视频**。
- **访问：** `GET /api/v1/catalog/...` **不要求登录**；App 直接用 URL 渲染（视频用系统播放器/WebView，不扩展新内容体系）。
- **以后加视频：** 仅后台/upload + 填 `introMedia` + 详情页渲染；**不改** 下载/支付链。

### 3. 免费示例与预览页

- 目录 API 下发 **`samplePreviews[]`**（与现 `PackSamplePreview` 对齐并 Zod 冻结）。
- 点击示例 → **轻量预览页**（词头、中文、例句、试听）；**不做** SM-2、不记进度、不进入正式学习队列。
- 示例音频/图：**公开小文件 URL**（方案 B），不走 `pack_access` 下载链。

### 4. 兑换码（纳入阶段 6 MVP）

| 项 | 决策 |
| --- | --- |
| 范围 | **纳入 MVP**；不属于「满减优惠券」 |
| 一码多人 | ✅ 同一码可被 **多个账号** 兑换，直至 **`maxRedemptions`** 或过期 |
| 兑换后 | 写 **`pack_access`**，走与微信支付 **相同** 下载 → 验签 → 安装链 |
| 支付 | **不走** 微信；可选写 **`orders` amount=0**、`channel=redemption` 留痕 |
| 表 | `redemption_codes`（码哈希、packId、上限、过期、状态）；`redemption_events`（审计，不可删） |
| 入口 | 抽屉「兑换码」→ 轻量全屏；**需登录**（与购买一致，便于绑定 userId） |
| 安全 | 码只存哈希；频控；日志无明文码 |

**修订架构表述：** MVP **不做** 满减券/促销叠加；**做** 受控兑换码开通 `pack_access`。

### 5. 目录 extensibility（以后加图/视频）

- 运营字段挂在 **`packs`**（可改）；**`pack_versions`** 只挂不可变 zip 元数据。
- 新增媒体类型 = 扩展 `introMedia.type` enum + 客户端忽略未知 type；**不**改 pack 协议。
- 介绍内容 **默认与 pack 版本解耦**（一个包一条介绍）；若将来要「按版本不同介绍」，再增 `packVersionId` 可选字段。

## 后果

- 阶段 6 契约：`packages/contracts/src/catalog/` 含 cover、samplePreviews、introMedia（可选）。
- 集成测试：未登录可拉 catalog；无 `pack_access` 时下载 API **403**；兑换后下载 **200**。
- 阶段 7 后台：兑换码批次生成、intro 媒体上传；阶段 6 可用 seed/脚本。
- UI：详情页在「概览」与「示例」之间可插入 introMedia 区块（有则渲染）。

## 未决（审核时可改）

- 兑换码默认 **`maxRedemptions`** 与单用户是否允许多次兑同一 pack（建议：同 user+pack 幂等「已拥有」）。
- intro 视频最大体积/格式（建议 MP4 H.264，单条 ≤50MB，运营规范写 runbook）。
