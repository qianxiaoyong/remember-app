# 阶段 8 RC 验收清单（Release Candidate Checklist）

日期：2026-08-05  
范围：邀请内测前 **人工勾选**；可打印或复制到 GitHub Issue  
状态：**清单就绪**（P0 真机项待统一验收时填写）

相关文档：

- [生产部署](./production-deploy.md)
- [Pack 更新 RC](./pack-update-rc.md)
- [PostgreSQL 备份恢复](./postgres-backup-restore.md)
- [Android Release 构建](./android-release-build-windows.md)
- [账号同步维护](./account-sync-maintenance.md)
- Kickoff：[2026-08-04-phase8-release-kickoff.md](../superpowers/plans/2026-08-04-phase8-release-kickoff.md) §8

---

## 如何使用

1. **验收前**：填写 §1 环境表（staging URL、APK 版本、git SHA）。
2. **按顺序勾选** P0；P1 与 Pause 项可标注 N/A 或 defer。
3. **失败项**：记录现象 + 截图/日志；修完重跑该行，不必整表重来。
4. **全部 P0 通过后**：填写 §9 签字表，方可批准上 prod。

图例：**P0** = 内测必过 · **P1** = 建议 · **Pause** = 已知 defer，不挡 RC

---

## 0. 无真机预检（开发机 / CI）

| #   | 项               | 级别 | ☐   | 命令 / 说明                                                        |
| --- | ---------------- | ---- | --- | ------------------------------------------------------------------ |
| 0.1 | 仓库门禁         | P0   | ☐   | `pnpm check` 全绿                                                  |
| 0.2 | 生产 env 校验    | P0   | ☐   | `node tools/scripts/validate-prod-env.mjs infra/prod/.env.staging` |
| 0.3 | staging API 健康 | P0   | ☐   | `GET /api/v1/health` → `{ "status": "ok" }`                        |
| 0.4 | `X-Request-Id`   | P0   | ☐   | 响应头含 UUID                                                      |
| 0.5 | 密钥未进 Git     | P0   | ☐   | `pnpm check:secrets`；`.env` 仅服务器本地                          |
| 0.6 | DB 备份脚本      | P0   | ☐   | `infra/prod/backup-db.ps1` 可产出 dump（Task 9 已演练）            |
| 0.7 | API 集成测试     | P1   | ☐   | `pnpm --filter @remember/api test:integration`                     |

---

## 1. 环境准备（填写后再测真机）

| 项                                  | 值                                                             |
| ----------------------------------- | -------------------------------------------------------------- |
| 验收日期                            |                                                                |
| 验收人                              |                                                                |
| Git 分支 / tag                      | `feat/phase8-release` /                                        |
| Git commit SHA                      |                                                                |
| API 镜像 digest                     |                                                                |
| **Staging API**                     | `https://api.staging.remember.wehub.top` 或 `http://<IP>:3000` |
| **Staging Admin**                   | `https://admin.staging.remember.wehub.top`                     |
| APK 版本名 / versionCode            |                                                                |
| APK 构建 `EXPO_PUBLIC_API_BASE_URL` | 与上表 API 一致                                                |
| 测试手机号 A                        |                                                                |
| 测试手机号 B（换机）                |                                                                |
| Mock 验证码                         | `000000`（staging mock SMS）                                   |
| 兑换码 1                            | `TEST-REDEEM-001` → `remember-test-pack`                       |
| 兑换码 2                            | `TEST-REDEEM-GRADE3` → `demo-primary-grade3`                   |
| Admin bootstrap                     | `infra/prod/.env.staging` 中 `ADMIN_BOOTSTRAP_*`               |

**真机要求：** Android **8+**；至少一台 **320dp 宽** 小屏（或模拟器）用于 §7。

---

## 2. 安装与登录（P0）

| #   | 步骤                    | ☐   | 预期                           |
| --- | ----------------------- | --- | ------------------------------ |
| 2.1 | 安装 RC APK（非 debug） | ☐   | 安装成功，桌面可见「记得」     |
| 2.2 | 首次打开 → 手机号登录   | ☐   | 输入测试号 + `000000` 登录成功 |
| 2.3 | 杀进程 → 再打开         | ☐   | 仍保持登录，无需重新输码       |
| 2.4 | 抽屉 / 首页可进入       | ☐   | 无白屏、无持续 loading         |

---

## 3. 商业与获权（P0）

| #   | 步骤                                   | ☐         | 预期                                                       |
| --- | -------------------------------------- | --------- | ---------------------------------------------------------- |
| 3.1 | 抽屉 → 兑换码 → 输入 `TEST-REDEEM-001` | ☐         | 成功；库中出现对应 pack                                    |
| 3.2 | 重复兑换同一码                         | ☐         | 友好错误，不崩溃                                           |
| 3.3 | 未购 pack 详情页                       | ☐         | 显示「立即购买」或 mock 购（见 3.4）                       |
| 3.4 | Mock 支付购包（若启用）                | ☐         | `EXPO_PUBLIC_MOCK_PAYMENT_ENABLED=true` 时可模拟支付后安装 |
| 3.5 | 真实微信支付                           | **Pause** | Pause C/D；RC 标 N/A                                       |

---

## 4. 下载、安装与学习（P0）

| #   | 步骤                             | ☐   | 预期                       |
| --- | -------------------------------- | --- | -------------------------- |
| 4.1 | 详情页 → **安装** 网络 pack      | ☐   | 下载完成 →「安装成功」     |
| 4.2 | **开始学习** → 词汇卡            | ☐   | 顶栏 headword、发音可播    |
| 4.3 | 点击空白 → 展开 reveal           | ☐   | 释义/例句显示              |
| 4.4 | 例句 **点词**                    | ☐   | 弹窗释义；未收录词友好提示 |
| 4.5 | vocabulary：**加入复习 / 已加复习 / 暂不** | ☐   | 未在池可入池；已在池显示已加复习；更新复习确认后档位清零 |
| 4.6 | 杀进程 → 再进同一 pack           | ☐   | 浏览书签保留，可继续学     |
| 4.7 | **断网** 继续学习（已安装 pack） | P1  | 可浏览/复习；无崩溃        |
| 4.8 | 搜索 → 加入/更新复习             | P1  | 与 Task 9 同一双态 UX      |

---

## 4b. 统一复习 Tab（P0，ADR 0013）

| #    | 步骤                                   | ☐   | 预期                                       |
| ---- | -------------------------------------- | --- | ------------------------------------------ |
| 4b.1 | 底栏 **复习** Tab → 到期 session       | ☐   | 仅 due 词；来源包名可见                    |
| 4b.2 | **记住了** / **还不熟**                | ☐   | Leitner 升/降档；还不熟 → 明日             |
| 4b.3 | 修改 **每日复习上限**                  | ☐   | session 条数 = min(到期, 限额−今日已完成) |
| 4b.4 | 底栏角标                               | ☐   | = 总到期数（非限额）                       |
| 4b.5 | 同词两 pack：**更新复习**              | ☐   | 复习 Tab 来源包改为当前包                  |
| 4b.6 | 设置 **打开位置**（书签/从头）         | P1  | 进入 pack 落点正确                         |
| 4b.7 | V3→V4 迁移库（若有 SM-2 数据）         | P1  | `inReviewPool` / `boxLevel` 合理           |
| 4b.8 | 双机 sync：入池 + 复习升档             | P1  | `boxLevel` 取低、`dueAt` 取早，不重复     |

---

## 5. Pack 更新（P0）

> 细则见 [pack-update-rc.md](./pack-update-rc.md)

| #   | 步骤                             | ☐   | 预期                                |
| --- | -------------------------------- | --- | ----------------------------------- |
| 5.1 | Admin 上传 zip 新版本并 **发布** | ☐   | Catalog `currentPackVersion` 升高   |
| 5.2 | App 详情页（旧版已装）           | ☐   | 主按钮 **「更新」**                 |
| 5.3 | 点击更新                         | ☐   | 下载安装成功                        |
| 5.4 | 学习新内容                       | ☐   | 与新版本一致                        |
| 5.5 | bundled 包启动静默升级           | P1  | APK 内置版本更高时自动升级且不降级  |
| 5.6 | COS presign 下载（mock 关闭时）  | P1  | 授权 URL 为 HTTPS presign；真机可装 |

---

## 6. Admin 发版链（P0，浏览器）

| #   | 步骤                         | ☐   | 预期                        |
| --- | ---------------------------- | --- | --------------------------- |
| 6.1 | 打开 Staging Admin 并登录    | ☐   | 驾驶舱加载                  |
| 6.2 | 知识库 → 上传 zip → 校验通过 | ☐   | 创建 draft 版本             |
| 6.3 | 发布版本                     | ☐   | `currentVersion` 更新       |
| 6.4 | App 端 catalog 刷新          | ☐   | 可见新 `currentPackVersion` |

---

## 7. 账号与同步（P0）

| #   | 步骤                                  | ☐   | 预期                                                            |
| --- | ------------------------------------- | --- | --------------------------------------------------------------- |
| 7.1 | **A 机**学习若干卡 → 账号页待上传归零 | ☐   | 同步成功                                                        |
| 7.2 | **B 机**同号登录                      | ☐   | 进度与 A 一致（快照恢复）                                       |
| 7.3 | 非主设备尝试上传                      | P1  | 403；outbox 保留                                                |
| 7.4 | 主设备切换后 outbox 清空              | P1  | 见 [account-sync-maintenance.md](./account-sync-maintenance.md) |

---

## 8. 回归与体验（P1）

| #   | 步骤                                    | ☐   | 预期                                      |
| --- | --------------------------------------- | --- | ----------------------------------------- |
| 8.1 | **弱网**（限速 3G）安装 pack            | ☐   | 可完成或明确失败提示                      |
| 8.2 | **320dp** 宽度布局                      | ☐   | 无遮挡、无横向溢出                        |
| 8.3 | 系统字体 **放大 1.3x**                  | ☐   | 核心按钮仍可操作                          |
| 8.4 | 卸载 pack → 再安装                      | ☐   | 进度仍在（user.sqlite 保留）              |
| 8.5 | `GET /api/v1/app/release`（若已配 env） | P1  | 返回 `minAndroidVersion` / `latestApkUrl` |

---

## 9. Pause / 明确不验收

| 项                  | 处理                      |
| ------------------- | ------------------------- |
| 微信真实付 + 退     | Pause C/D → RC 标 **N/A** |
| 腾讯云生产短信      | staging 用 mock → **N/A** |
| 中心词库 / ECDICT   | 不验收                    |
| Admin TOTP / 防暴力 | 阶段 7 defer → **N/A**    |
| K8s / 自动 CI 部署  | 阶段 8 不验收             |

---

## 10. 发布签字（P0 全绿后填写）

| 项                            | 值                        |
| ----------------------------- | ------------------------- |
| RC 结论                       | ☐ PASS · ☐ FAIL（见备注） |
| 批准人                        |                           |
| 批准日期                      |                           |
| Git tag（建议）               | `v0.8.0-rc1`              |
| API 镜像 digest               |                           |
| Admin 静态目录版本 / 部署时间 |                           |
| 已知风险 / defer 项           |                           |
| 是否批准上 **prod**           | ☐ 是 · ☐ 否               |

**备注 / 失败记录：**

```text
（粘贴 Issue 链接或简要现象）
```

---

## 11. 与 Kickoff §8.1 对照

| Kickoff P0                | 本清单章节    |
| ------------------------- | ------------- |
| `pnpm check`              | §0.1          |
| Compose + `/health`       | §0.2–0.3      |
| Admin 发版 → App 下载学习 | §4、§5、§6    |
| pg_dump 恢复              | §0.6          |
| RC P0 真机走通            | §2–§7 全部 P0 |
| validate-prod-env         | §0.2          |

---

## 12. 相关命令速查

```powershell
# 门禁
pnpm check

# staging 健康（本地）
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health

# Catalog 版本
Invoke-RestMethod http://127.0.0.1:3000/api/v1/catalog/packs/remember-test-pack

# 备份
cd infra\prod
powershell -File .\backup-db.ps1 -EnvFile .\.env.staging
```

APK 构建见 [android-release-build-windows.md](./android-release-build-windows.md)。
