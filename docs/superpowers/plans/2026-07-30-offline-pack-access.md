# 子计划 3：下载授权、离线许可与网络安装

**Goal：** 有 `pack_access` 的用户可获取短时下载链 → 下载 zip → 验签安装；dev mock 用 fixtures 测试包；签发 30 天离线许可。

**依赖：** 子计划 1–2（`pack_access`、catalog、`pack_versions`）

## 交付

| 层 | 内容 |
|---|---|
| contracts | `packDownloadAuthorizationResponseSchema` |
| API | `POST /packs/:packId/download-authorization`、`GET /packs/:packId/download?token=` |
| dev | `PACK_DOWNLOAD_MOCK_ENABLED`、fixtures zip、`devContentPackId` 别名安装 |
| mobile | `installPackFromNetwork`、详情页「安装」接真 |
| seed | `pnpm seed:dev-pack-versions` |

## 未纳入

- 生产 COS presign
- 下载进度 UI / 下载管理队列（仅单任务锁）
- 离线许可过期阻塞学习（仅存储 expiry）
