# 阶段 8 子计划 3：RC 验收清单

> **For agentic workers:** 本子计划以 **runbook 交付** 为主；真机勾选由人在统一验收时完成。

**Goal:** 提供可打印 / 可贴 Issue 的 RC 勾选表，覆盖 Kickoff §8.1 P0 真机项与常见回归项。

**Architecture:** 不建自动化平台；清单引用子计划 1/2 的 runbook 与 staging 环境。

**Tech Stack:** Markdown runbook；验收时配合 staging Compose + RC APK + Admin 静态站

**分支：** `feat/phase8-release`  
**Kickoff：** [2026-08-04-phase8-release-kickoff.md](./2026-08-04-phase8-release-kickoff.md) §11  
**交付物：** [release-candidate-checklist.md](../runbooks/release-candidate-checklist.md)

---

## Task 1: RC 清单 runbook

- [x] **Step 1:** 创建 `docs/runbooks/release-candidate-checklist.md`
  - §0 无真机预检
  - §1 环境表
  - §2–§8 学习 / 商业 / 更新 / Admin / 同步 / 回归
  - §9 Pause 矩阵
  - §10 发布签字
- [x] **Step 2:** 与 Kickoff §8.1 对照表
- [x] **Step 3:** `production-deploy.md` 增加链接

## Task 2: 统一真机验收（人工，非本 Task 代码）

- [ ] **Step 1:** 填 §1 环境表
- [ ] **Step 2:** 勾选 §2–§7 全部 P0
- [ ] **Step 3:** 填 §10 签字表
- [ ] **Step 4:** 更新 Kickoff §8.1 RC 项为 PASS

---

## 验收（本子计划 Done）

- [x] RC runbook 可独立使用（不依赖读本 plan）
- [ ] P0 真机项已在 Android 8+ 走通（统一验收时完成）
- [x] Pause C/D 项在清单中明确标 N/A

---

## 相关

- [production-deploy.md](../runbooks/production-deploy.md)
- [pack-update-rc.md](../runbooks/pack-update-rc.md)
- [postgres-backup-restore.md](../runbooks/postgres-backup-restore.md)
