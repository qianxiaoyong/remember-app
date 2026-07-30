# 阶段 4 完成摘要（本地学习完整闭环）

日期：2026-07-29  
基线：`main` @ `17df09b`（阶段 3 已收口）  
收口分支：`feat/local-study-loop`

## 交付物

| 子计划                                        | 核心交付                                                       | 状态 |
| --------------------------------------------- | -------------------------------------------------------------- | ---- |
| 1 `2026-07-28-pack-install-and-library.md`    | `user.sqlite` 五表 + 迁移；bundled 验签安装；`installed_packs` | ✅   |
| 2 `2026-07-28-study-scheduler-and-session.md` | SM-2 纯函数 + 测试；任务继承；作答同事务 + `sync_outbox`       | ✅   |
| 3 `2026-07-28-word-lookup-and-search.md`      | 点词直查；收藏本；包内搜索；重新加入复习                       | ✅   |
| 4 `2026-07-28-mvp-mobile-ui.md`               | 首页/资料/详情/学习/抽屉/胶囊 smoke + 实机绑定                 | ✅   |

主要代码路径：

- 移动端：`apps/mobile/src/`（数据层、用例、UI）
- 领域：`packages/domain/src/review-scheduler.ts`、`build-study-queue.ts`
- 测试包：`tools/pack-builder/source/remember-test-pack/` → `apps/mobile/assets/packs/remember-test-pack.zip`

## 退出门禁（§4.8）

断网 release 实机已验收：

- 安装 bundled 测试包 → SM-2 三按钮学习 → 杀进程进度不丢
- 跨天任务继承（不堆积缺席新任务）
- 点词、包内搜索、重新加入复习
- **卸载包 → 重装 → 进度仍在**（包详情「卸载此知识库」）
- 全程不登录、不付费

固定测试包 `remember-test-pack` 当前 **2 张卡**（非清单示例中的 3 张；验收以实包为准）。

## 自动化验证（收口时）

```powershell
pnpm check   # 2026-07-29 全绿
```

分项：`domain` 10 测、`mobile` 13 测、`contracts` 15 测、`pack-builder` 6 测；`format:check` / `lint` / `typecheck` / `check:source` 均通过。

## 阶段 4 范围外（defer，见验收清单 §4.2 / §4.5 注释）

| 项                            | 说明                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| 网络下载安装 UI + 单任务队列  | 阶段 4 仅 bundled / 详情页「安装」；`installPackFromZipBytes` 已就绪 |
| 安装失败旧包回滚负例          | 无 UI 负例路径；构建器与 App 共用验包链                              |
| 点词远程 `audioUrl` 缓存      | 测试包 lexicon 无 `audioUrl`；代码路径已实现                         |
| 市场目录 / 购买 / 登录 / 同步 | 阶段 5–6                                                             |

## Mock 与 UI 偏差

| 项                            | 阶段 4 处理                                        |
| ----------------------------- | -------------------------------------------------- |
| 市场 catalog / 价格           | 本地 seed + mock 购买弹窗                          |
| 胶囊 Tab 文案                 | 「首页 \| + \| 资料」（已写入 UI 规范 §3.2）       |
| 抽屉常用功能 + 列表菜单       | 阶段 4 重构布局（已写入 UI 规范 §9）               |
| 资料页中间「+」               | 与胶囊中间上传一致，占位「功能开发中……」           |
| bundled 测试包多 catalog 别名 | 共用内容，首页可多行；进度按 contentPackId 汇总    |
| 包详情主按钮                  | 已安装时固定「开始学习」（首页行可为「继续学习」） |

## 收口变更（相对阶段 3）

- 别名包 session / 进度分裂修复（`resolve-content-pack-id`、content 级 session）
- 包详情卸载、首页资料包进详情、知识库内搜索 UI 与其他搜索页统一
- 拆分 `shell-icons.tsx` 以满足 `check:source` 400 行上限
- eslint / Prettier 全仓库收口

## 下一阶段

阶段 5：账号、session、主设备、`sync_outbox` 上传、云端快照恢复（见 `development-order` §8）。
