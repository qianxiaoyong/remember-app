# 0011 资料页三层分类 Taxonomy

日期：2026-07-31  
状态：**已确认**（随 `2026-07-31-catalog-taxonomy-and-pack-metadata.md` P0 实施）  
关联：UI 规范 §6；ADR [0010](./0010-catalog-preview-redemption-and-media.md)；计划 `docs/superpowers/plans/2026-07-31-catalog-taxonomy-and-pack-metadata.md`

## 背景

手机资料页有三层筛选：一级顶栏 Tab、二级左侧栏、三级版本下拉。原先选项写死在 App（`CATALOG_PRIMARY_OPTIONS`、`listSecondaryCategories`、`CATALOG_VERSION_OPTIONS`），包上仅用 enum + 自由文本，运营无法增删分类且易与 App 选项不一致。

## 决策

### 1. 全局 Taxonomy 三表

| 表                        | 含义                   | 父子关系               |
| ------------------------- | ---------------------- | ---------------------- |
| `catalog_primary_nodes`   | 一级（如「小学英语」） | 根                     |
| `catalog_secondary_nodes` | 二级（如「三年级」）   | FK → primary           |
| `catalog_version_nodes`   | 版本（如「人教版」）   | 全局列表，不挂 primary |

每节点：`id`（UUID）、`slug`（稳定键）、`label`（展示文案）、`sort_order`、`status`（`active` \| `archived`）。

### 2. Pack 挂载

`packs` 表增加三个 FK（权威来源）：

- `primary_node_id` → `catalog_primary_nodes`
- `secondary_node_id` → `catalog_secondary_nodes`（必须属于所选 primary）
- `version_node_id` → `catalog_version_nodes`

**过渡期**保留 `primary_category`、`secondary_category`、`version_label` 字符串列作为冗余/兼容；新写入以 FK 为准，API 下发 `label` 供手机展示。

### 3. 「全部」不入库

- 一级「全部」、二级「全部」、版本「全部版本」仅 **手机筛选 UI** 使用，不是 taxonomy 节点。

### 4. API

- 公开：`GET /api/v1/catalog/taxonomy` — 仅 `active` 节点，无需登录。
- Admin：taxonomy CRUD + 排序；删除/归档时若仍有 pack 引用 → **409**。

### 5. 与 pack.zip 边界

Taxonomy 与 pack 运营元数据均在 **`packs` 表**；**不**修改 `packManifest` / zip 协议（同 ADR 0010 §5）。

## 后果

- Mobile 资料页从 API 读 taxonomy，移除对 `catalog-seed.ts` 分类常量的依赖（offline 可缓存上次 taxonomy）。
- Admin 新增「分类管理」；包编辑页三级级联选择。
- 需一次性 seed + 迁移脚本，将现有 pack 映射到默认节点。

## 未决

- 归档节点是否在公开 API 隐藏（当前：是，仅 `active`）。
- 二级 slug 是否全局唯一（当前：仅 `(primary_id, slug)` 唯一）。
