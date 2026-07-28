# 记得介绍站部署指南（remember.wehub.top）

日期：2026-07-28  
源码：`apps/site/`（纯静态 HTML，零构建）

---

## 1. 用途

- 微信开放平台移动应用审核所需的 **应用官网**
- 用户可访问的产品介绍与 **隐私政策**
- 正式 URL：`https://remember.wehub.top/`

---

## 2. 上线前置

| 步骤     | 说明                                                          |
| -------- | ------------------------------------------------------------- |
| ICP 备案 | `wehub.top` 在大陆服务器提供 HTTPS 前需完成备案（约 1–3 周）  |
| DNS      | 在域名控制台添加 `remember` **A 记录**，指向轻量服务器公网 IP |
| 邮箱     | 联系邮箱：`549414062@qq.com`（需可正常收信）                  |

备案完成前可在本机预览，但**不能**作为微信审核用的正式官网。

---

## 3. 本地预览

```powershell
cd apps/site
pnpm preview
```

浏览器打开 `http://localhost:4173`。  
静态资源路径以 `/` 为根，请通过本地 HTTP 服务访问，不要直接用 `file://` 打开。

---

## 4. 部署到腾讯云轻量 + Caddy

### 4.1 上传文件

将 `apps/site/` 目录内容（含 `index.html`、`privacy.html`、`styles.css`、`assets/`）同步到服务器，例如：

```text
/srv/remember-site/
  index.html
  privacy.html
  styles.css
  assets/icon.png
```

可用 `scp`、`rsync` 或 SFTP；**不要**上传 `node_modules` 或 `package.json`（服务器不需要 Node）。

### 4.2 Caddy 配置

参考 `apps/site/Caddyfile.example`，在主 `Caddyfile` 中加入：

```caddy
remember.wehub.top {
	root * /srv/remember-site
	encode gzip
	file_server
}
```

重载 Caddy 后，Caddy 会自动为 `remember.wehub.top` 申请并续期 Let's Encrypt 证书。

### 4.3 验收

```bash
curl -I https://remember.wehub.top/
curl -I https://remember.wehub.top/privacy.html
```

确认：

- 返回 `200`，证书有效
- 首页可看到应用名「记得」、功能说明与图标
- 隐私政策页可打开
- 联系邮箱链接正确

---

## 5. 微信开放平台填写

| 字段           | 建议值                                                               |
| -------------- | -------------------------------------------------------------------- |
| 应用官网       | `https://remember.wehub.top/`                                        |
| 应用名称       | 记得                                                                 |
| 应用简介       | 与首页首段一致或精简版                                               |
| Android 包名   | `com.remember.app`                                                   |
| 应用签名 SHA-1 | 见 [ADR 0004](../decisions/0004-android-app-identity-and-signing.md) |

---

## 6. 更新流程

1. 修改 `apps/site/` 下 HTML/CSS/资源
2. 本地 `pnpm preview` 确认
3. 同步到服务器 `/srv/remember-site/`
4. 静态站点无需重启服务；若改了 Caddy 配置才需 reload

---

## 7. 相关文档

- [ADR 0004：Android 身份与签名](../decisions/0004-android-app-identity-and-signing.md)
- [Android Release 构建指南（Windows）](./android-release-build-windows.md)
