# Pack 更新与 App 版本 RC Runbook

日期：2026-08-05  
范围：阶段 8 子计划 1 — Admin 发新版 pack、App 侧更新、APK 最低版本检查  
依赖：[production-deploy.md](./production-deploy.md)、[android-release-build-windows.md](./android-release-build-windows.md)

---

## 1. 链路概览

```text
Admin 上传 zip → 发布 currentVersion
       ↓
Catalog API 返回 currentPackVersion
       ↓
App 详情页比对 installed.packVersion → 「更新」
       ↓
pack-download 授权 → 下载 → installPackFromZipBytes（原子替换）
```

**APK 更新（并行）：** `GET /api/v1/app/release` 返回 `minAndroidVersion` / `latestApkUrl` / `forceUpdateBelow`（需服务器配置 `APP_RELEASE_*` env）。

---

## 2. Admin 发布新 pack 版本

1. 登录 Admin → 知识库 → 选择 pack → **上传新版本** zip（经 `verifyPackZipBuffer`）。
2. 确认 draft 版本信息（`packVersion` semver、`protocolVersion`）。
3. 点击 **发布** → 更新 `packs.currentVersionId`。
4. 验收 Catalog：

```bash
curl -s https://api.staging.remember.wehub.top/api/v1/catalog/packs/remember-test-pack | jq .currentPackVersion
```

应返回新版本号（如 `1.0.1`）。

---

## 3. App 侧更新验证（真机 / RC）

> 可与阶段 8 统一真机验收一并执行。

### 前提

- staging API 可访问；`EXPO_PUBLIC_API_BASE_URL` 指向 staging
- 用户已兑换/购买目标 pack；旧版已安装

### 步骤

1. 确认 Catalog 中 `currentPackVersion` **高于** 本机 `installed.packVersion`（库页或详情）。
2. 打开 pack **详情页** → 主按钮应显示 **「更新」**（非「开始学习」）。
3. 点击更新 → 等待下载安装 → 提示「更新成功」。
4. 进入学习 → 确认内容为新版本（如 card 数、样例词变化）。
5. **不降级：** 若 Admin 回退 `currentVersion` 到更低 semver，App 仍显示「开始学习」，不会主动降级（bundled 包启动时同样不降级）。

### protocolVersion 不兼容

- 安装 protocol 高于 App 支持的 zip → 提示 **「该学习包需要新版 App，请先升级应用」**（`PACK_PROTOCOL_UNSUPPORTED` 等人话映射）。
- 不应静默失败或英文技术栈。

---

## 4. APK 发布检查（可选 RC 行）

1. 在服务器 `.env` 配置：

```text
APP_RELEASE_MIN_ANDROID_VERSION=1.0.0
APP_RELEASE_LATEST_APK_URL=https://remember.wehub.top/download/app-release.apk
APP_RELEASE_FORCE_UPDATE_BELOW=0.9.0
```

2. 验收：

```bash
curl -s https://api.staging.remember.wehub.top/api/v1/app/release
```

3. App 启动或设置页（若已接 consume）比对 `minAndroidVersion`；低于 `forceUpdateBelow` 时引导下载 `latestApkUrl`。

**MVP 说明：** 第一期可先仅文档化 API；App UI 强制升级可 defer，但 endpoint 与 env 已就绪。

---

## 5. 故障排查

| 现象               | 检查                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 详情页无「更新」   | Catalog 是否含 `currentPackVersion`；已安装版本是否已是最新                |
| 下载 403           | `pack_access` 权益；mock/COS 下载配置                                      |
| 安装失败英文错误   | 应已映射为中文；查 `map-pack-install-error.ts`                             |
| `/app/release` 404 | `APP_RELEASE_MIN_ANDROID_VERSION` 与 `APP_RELEASE_LATEST_APK_URL` 是否配置 |

---

## 6. 相关代码

| 项                           | 路径                                                      |
| ---------------------------- | --------------------------------------------------------- |
| Catalog `currentPackVersion` | `packages/contracts/src/catalog/pack-summary.ts`          |
| semver 比较                  | `packages/domain/src/compare-pack-version.ts`             |
| 详情页 action                | `apps/mobile/src/use-cases/resolve-pack-detail-action.ts` |
| 原子安装                     | `apps/mobile/src/data/pack/install-pack-from-zip.ts`      |
| App release API              | `apps/api/src/app-release/app-release.controller.ts`      |
