# 0009 主设备顶号与会话 revoke 策略

日期：2026-07-30  
状态：已确认（1a + 2a）  
关联：kickoff Q3:A、Q2:A；`docs/runbooks/account-sync-maintenance.md`

## 背景

双机验收暴露：`switchMainDevice` 撤销全部 session（P1-1）导致被顶设备 A 收到 401 并像「退出登录」；B 登录后快照恢复在后台 silent 失败或 UI 未刷新。

## 决策

### 1. 跨设备顶号（1a）：不 revoke 旧设备 session

| 场景 | 服务端 | 旧设备 API | 旧设备 UX |
| --- | --- | --- | --- |
| B 登录顶 A | 仅更新 `users.main_device_id`；**不** revoke A 的 session 行 | **403** `NOT_MAIN_DEVICE` | 保留缓存用户 + Banner；本地可学；**不可**上传 |
| 同 deviceId 再次登录 | revoke **该 deviceId** 上未撤销 session → create 新 session | 旧 token **401** `SESSION_INVALID` | 需重新登录 |

非主设备读写云端均拒绝（Q3:A）；「不能写云」由 `mainDeviceId` 判定，**不依赖** revoke 跨设备 session。

### 2. 快照合并（2a）

登录后 `restoreLearningStatesFromSnapshot` 按 **Q2:A**：每条 `knowledgeId` 仅当云端 `clientVersion` **高于** 本地才写入。本地无该行时等同全量接收该条。

### 3. 登录后恢复管线

`verifySmsLogin` **await** 快照恢复后再返回；成功后 `markLibraryNeedsRefresh()`；恢复失败向用户报错，禁止 silent catch。outbox 上传可在恢复后继续后台重试。

## 后果

- 集成测试：跨设备 A token 期望 **403**；同 deviceId 旧 token 期望 **401**；双机 snapshot 链路必须有 A 上传 → B 拉取用例。
- 客户端：`403 NOT_MAIN_DEVICE` = 被顶本地模式，不得清 `cachedSessionUser`。
- 维护手册与 PR 改 auth/sync 时必须跑双机 checklist。
