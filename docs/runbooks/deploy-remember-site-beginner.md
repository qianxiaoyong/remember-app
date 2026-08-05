# 记得介绍站部署指南（零基础逐步版）

日期：2026-08-05  
适用对象：第一次部署网站、使用腾讯云轻量 + OrcaTerm 的维护者  
正式 URL：`https://remember.wehub.top/`  
源码目录：`apps/site/`（纯静态 HTML，**服务器上不需要 Node.js**）

> 精简版入口见 [deploy-remember-site.md](./deploy-remember-site.md)。  
> 介绍站上线后的下一阶段见 [production-deploy.md](./production-deploy.md)（Admin、seed）；Staging API 逐步版见 [deploy-staging-api-beginner.md](./deploy-staging-api-beginner.md)。

---

## 1. 这套流程在做什么？

```text
  你的电脑                         腾讯云轻量服务器
  ─────────                        ──────────────────
  apps/site/                       /srv/remember-site/
  ├ index.html          上传       ├ index.html
  ├ privacy.html        ──────►    ├ privacy.html
  ├ styles.css                     ├ styles.css
  └ assets/icon.png                └ assets/icon.png
                                            ▲
                                            │ 读取文件
  用户浏览器                                │
  https://remember.wehub.top/  ◄───  Caddy（Web 服务器 + 自动 HTTPS）
```

| 角色           | 是什么                                           | 类比                          |
| -------------- | ------------------------------------------------ | ----------------------------- |
| **DNS**        | 把域名 `remember.wehub.top` 解析到服务器 IP      | 通讯录：名字 → 地址           |
| **Caddy**      | 监听 80/443 端口，提供 HTTPS，把请求映射到文件夹 | 前台 + 保安 + 自动办 SSL 证书 |
| **静态文件**   | `index.html` 等，浏览器直接下载展示              | 一本已经印好的宣传册          |
| **ICP 备案号** | 页脚展示 `闽ICP备2026029361号-1`，链到工信部     | 大陆合规要求                  |

介绍站**没有**数据库、**没有**后端 API，改 HTML 后重新上传即可，一般**不用重启** Caddy。

---

## 2. 部署前准备清单

| 项           | 说明                            | 本项目示例                          |
| ------------ | ------------------------------- | ----------------------------------- |
| 域名管理权限 | 能添加 DNS 记录                 | `wehub.top` @ 腾讯云 DNSPod         |
| ICP 备案     | 大陆服务器提供 HTTPS 的前置条件 | 网站备案号：`闽ICP备2026029361号-1` |
| 云服务器     | 公网 IP、SSH/OrcaTerm 可登录    | 腾讯云轻量 `124.222.186.13`         |
| 防火墙       | 放行 **80**、**443**            | 轻量控制台 → 防火墙                 |
| 本地源码     | 已改好并 commit                 | `apps/site/`                        |

---

## 3. 分阶段部署（与实际操作顺序一致）

### 阶段 A：本地改代码并提交

**目的：** 在上线前确认页脚备案号、文案、隐私政策无误。

```powershell
cd d:\AIcoder\remember-app\apps\site
pnpm preview
```

浏览器打开 `http://localhost:4173`，检查首页与 `/privacy.html`。

提交（仅 site 相关文件）：

```powershell
git add apps/site/index.html apps/site/privacy.html
git commit -m "feat(site): add ICP filing number to footer"
```

**页脚应包含：**

- 文案：`闽ICP备2026029361号-1`
- 链接：`https://beian.miit.gov.cn/`（`target="_blank" rel="noopener noreferrer"`）

---

### 阶段 B：配置 DNS

**目的：** 让全世界访问 `remember.wehub.top` 时，能找到你的服务器 IP。

在 **腾讯云 DNSPod → 权威解析 → wehub.top** 添加：

| 字段     | 值                                   |
| -------- | ------------------------------------ |
| 主机记录 | `remember`                           |
| 记录类型 | `A`                                  |
| 记录值   | 服务器公网 IP（如 `124.222.186.13`） |
| TTL      | 默认 `600` 即可                      |

**验证（在你电脑 PowerShell）：**

```powershell
nslookup remember.wehub.top
```

应返回上述 IP。生效通常 **5～30 分钟**，偶尔更长。

| 术语                | 中文解释                          |
| ------------------- | --------------------------------- |
| A 记录              | 域名 → IPv4 地址的映射            |
| 主机记录 `remember` | 与根域名拼成 `remember.wehub.top` |
| TTL                 | DNS 缓存时间，越小变更生效越快    |

---

### 阶段 C：登录服务器

**目的：** 在远程 Linux 机器上安装软件、放文件。

推荐：**腾讯云控制台 → 轻量应用服务器 → 登录 → OrcaTerm**

| 项       | 建议值                      |
| -------- | --------------------------- |
| 连接协议 | 免密连接（TAT）             |
| 用户名   | `ubuntu`（Ubuntu 镜像默认） |

登录成功后提示符类似：

```text
ubuntu@VM-0-4-ubuntu:~$
```

- `ubuntu`：当前用户名
- `~`：当前在家目录 `/home/ubuntu`
- `$`：普通用户（需要管理员权限时在命令前加 `sudo`）

---

### 阶段 D：安装 Caddy

**目的：** Caddy 负责 HTTPS + 把网站文件提供给访客。

**检查是否已安装：**

```bash
caddy version
```

若显示 `command not found`，按顺序执行：

```bash
sudo apt update
```

```bash
sudo apt install -y caddy
```

```bash
caddy version
```

期望输出如 `v2.6.2`。

| 命令                   | 中文解释                                   |
| ---------------------- | ------------------------------------------ |
| `sudo`                 | 以管理员身份执行（改系统软件必须）         |
| `apt update`           | 刷新软件包列表（类似「更新应用商店目录」） |
| `apt install -y caddy` | 安装 Caddy；`-y` 表示默认同意              |
| `caddy version`        | 查看已安装的 Caddy 版本                    |

> 安装过程中若出现 `docker.list Permission denied` 警告，一般可忽略，不影响 Caddy 安装。

安装后 Caddy 会注册为系统服务（`caddy.service`），开机自启。

---

### 阶段 E：创建网站目录

**目的：** 规定服务器上放网站文件的固定位置。

```bash
sudo mkdir -p /srv/remember-site/assets
```

```bash
sudo chown -R ubuntu:ubuntu /srv/remember-site
```

| 命令                     | 中文解释                                          |
| ------------------------ | ------------------------------------------------- |
| `mkdir -p`               | 创建目录；`-p` 表示父目录不存在则一并创建         |
| `/srv/remember-site`     | 惯例上的「服务数据」路径，本项目中存放介绍站      |
| `chown -R ubuntu:ubuntu` | 把目录所有者改成 `ubuntu`，便于 OrcaTerm 上传文件 |

**验证：**

```bash
ls -la /srv/remember-site
```

此时可能为空或仅有 `assets/`，属正常。

---

### 阶段 F：上传网站文件

**目的：** 把本地 `apps/site/` 中的静态资源复制到服务器。

**需要上传的文件（4 项，不要传 `node_modules`、`package.json`）：**

```text
index.html
privacy.html
styles.css
assets/          （整个文件夹，含 icon.png）
```

**推荐方式：OrcaTerm 左侧「文件管理」**

1. 路径栏输入 `/srv/remember-site` 回车
2. 点击「上传」，从本机选择上述文件
3. 终端验证：

```bash
ls -la /srv/remember-site
```

应看到四个条目，且所有者为 `ubuntu`。

**备选：** 本机 PowerShell + `scp`（需 SSH 密码或密钥，免密 TAT 网页终端通常不能用于本机 scp）。

---

### 阶段 G：配置 Caddy

**目的：** 告诉 Caddy：访问 `remember.wehub.top` 时，去 `/srv/remember-site` 找文件，并自动申请 HTTPS 证书。

编辑配置文件：

```bash
sudo nano /etc/caddy/Caddyfile
```

在**文件最末尾**追加（保留原有 `:80` 注释块即可，不必删除）：

```caddy
remember.wehub.top {
	root * /srv/remember-site
	encode gzip
	file_server
}
```

| 配置行                       | 中文解释                              |
| ---------------------------- | ------------------------------------- |
| `remember.wehub.top { ... }` | 此域名块的规则                        |
| `root * /srv/remember-site`  | 网站根目录                            |
| `encode gzip`                | 压缩文本资源，加快加载                |
| `file_server`                | 静态文件模式：按 URL 路径返回对应文件 |

**nano 操作：**

| 按键                | 作用              |
| ------------------- | ----------------- |
| `Ctrl + O`          | 保存（Write Out） |
| `Enter`             | 确认文件名        |
| `[ Wrote N lines ]` | 保存成功          |
| `Ctrl + X`          | 退出编辑器        |

保存后**不会自动回到 shell**，需再按 `Ctrl + X` 退出 nano。

---

### 阶段 H：重载 Caddy 并验收

**目的：** 让新配置生效，并确认服务健康。

```bash
sudo systemctl reload caddy
```

```bash
sudo systemctl status caddy
```

期望：`Active: active (running)`（绿色）。

| 命令                     | 中文解释                      |
| ------------------------ | ----------------------------- |
| `systemctl reload caddy` | 重新加载配置，不中断已有连接  |
| `systemctl status caddy` | 查看服务状态与最近日志        |
| `q`                      | 在 status 分页界面按 `q` 退出 |

**关于 `level":"warn"` 日志：** 首次申请 HTTPS 证书时，TLS 相关 warn 较常见；若浏览器能正常打开 HTTPS 站点，通常可忽略。

**浏览器验收：**

- https://remember.wehub.top/
- https://remember.wehub.top/privacy.html

检查项：

- [ ] 页面正常，显示「记得」
- [ ] 页脚 **闽ICP备2026029361号-1** 可点击跳转工信部
- [ ] 地址栏 HTTPS 小锁有效
- [ ] 隐私政策页可打开

**命令行验收（可选，在服务器上）：**

```bash
curl -I https://remember.wehub.top/
curl -I https://remember.wehub.top/privacy.html
```

期望：`HTTP/2 200` 或 `HTTP/1.1 200`。

---

## 4. 命令速查表

| 命令                                             | 在哪里执行   | 一句话解释                |
| ------------------------------------------------ | ------------ | ------------------------- |
| `pnpm preview`                                   | 本机         | 本地预览静态站            |
| `nslookup remember.wehub.top`                    | 本机         | 检查 DNS 是否指向服务器   |
| `caddy version`                                  | 服务器       | 检查 Caddy 是否安装       |
| `sudo apt update`                                | 服务器       | 更新软件源索引            |
| `sudo apt install -y caddy`                      | 服务器       | 安装 Caddy                |
| `sudo mkdir -p /srv/remember-site/assets`        | 服务器       | 创建网站目录              |
| `sudo chown -R ubuntu:ubuntu /srv/remember-site` | 服务器       | 赋予上传权限              |
| `ls -la /srv/remember-site`                      | 服务器       | 列出网站文件              |
| `sudo nano /etc/caddy/Caddyfile`                 | 服务器       | 编辑 Caddy 配置           |
| `sudo systemctl reload caddy`                    | 服务器       | 应用新配置                |
| `sudo systemctl status caddy`                    | 服务器       | 查看 Caddy 运行状态       |
| `sudo journalctl -u caddy -n 50 --no-pager`      | 服务器       | 查看 Caddy 最近 50 行日志 |
| `curl -I https://remember.wehub.top/`            | 服务器或本机 | 检查 HTTP 状态码          |

---

## 5. 以后如何更新网站？

改完 `apps/site/` 后：

1. 本机 `pnpm preview` 确认
2. `git commit` 记录变更
3. OrcaTerm 文件管理 → `/srv/remember-site` → **覆盖上传**改动的文件
4. 浏览器 **Ctrl+F5** 强刷

**仅改 HTML/CSS：** 不用 `systemctl reload caddy`。  
**改了 Caddyfile（域名、路径等）：** 需 `sudo systemctl reload caddy`。

---

## 6. 常见问题

| 现象                       | 可能原因                       | 处理                    |
| -------------------------- | ------------------------------ | ----------------------- |
| `nslookup` 无正确 IP       | DNS 未生效                     | 等待或检查 A 记录       |
| HTTPS 证书失败             | 80/443 未放行或 DNS 未指向本机 | 查防火墙 + DNS          |
| 404 Not Found              | 文件未上传或 `root` 路径错误   | `ls /srv/remember-site` |
| 页脚无备案号               | 上传了旧版 `index.html`        | 重新上传最新文件        |
| `command not found: caddy` | 未安装                         | 阶段 D                  |
| nano 保存后仍在编辑器      | 正常                           | `Ctrl+X` 退出           |

---

## 7. 微信开放平台（介绍站用途之一）

| 字段           | 值                                                                   |
| -------------- | -------------------------------------------------------------------- |
| 应用官网       | `https://remember.wehub.top/`                                        |
| 应用名称       | 记得                                                                 |
| Android 包名   | `com.remember.app`                                                   |
| 应用签名 SHA-1 | 见 [ADR 0004](../decisions/0004-android-app-identity-and-signing.md) |

---

## 8. 部署完成后：建议下一步

介绍站只是 **阶段 8 的第一块**。按优先级：

| 顺序 | 做什么                                         | 文档                                                               |
| ---- | ---------------------------------------------- | ------------------------------------------------------------------ |
| 1    | **公安联网备案**（ICP 上线后 30 天内）         | 各地公安备案入口 / 服务商指引                                      |
| 2    | **Staging API + Admin** 部署（Docker Compose） | [production-deploy.md](./production-deploy.md) §5–§8               |
| 3    | 手机 APK 指向 staging，走 **RC 验收清单**      | [release-candidate-checklist.md](./release-candidate-checklist.md) |
| 4    | Staging 全绿后上 **Production**                | [production-deploy.md](./production-deploy.md) §9                  |
| 5    | 微信开放平台填官网、准备应用审核               | 本文 §7                                                            |

**Staging 第一步预览：** 在 DNS 增加 `api.staging`、`admin.staging` 等 A 记录 → 复制 `infra/prod/.env.example` 为 `.env.staging` → 按 runbook 起 Compose。

---

## 9. 相关文档

- [deploy-remember-site.md](./deploy-remember-site.md) — 精简版
- [production-deploy.md](./production-deploy.md) — API / Admin / 数据库部署
- [release-candidate-checklist.md](./release-candidate-checklist.md) — 真机 RC 清单
- [2026-08-04-phase8-release-kickoff.md](../superpowers/plans/2026-08-04-phase8-release-kickoff.md) — 阶段 8 总览
