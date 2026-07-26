# 0003 PostgreSQL支付通知幂等与备份恢复验证

日期：2026-07-26
状态：本地隔离技术验证通过

## 范围与结论

本Spike验证了最小支付记录模型的事务幂等、冲突重放拒绝、custom-format备份和独立空库恢复。它不创建正式迁移、Prisma模型、支付Controller或生产数据库配置。

结论为通过：同一通知连续执行两次均成功，第二次不产生重复业务效果；相同`notification_id`搭配不同`transaction_id`或不同`order_id`均以固定标识`PAYMENT_NOTIFICATION_CONFLICT`失败，且异常前的临时订单修改随事务回滚。恢复库在`pg_restore`前没有业务表，恢复后重复通过相同验收。

## 环境与隔离边界

- Docker Desktop：4.83.0。
- Docker Engine：29.6.2，Linux amd64。
- Docker Compose：v5.3.1。
- PostgreSQL：18.4（Debian 18.4-1.pgdg12+1）。
- 镜像：`postgres:18.4-bookworm`。
- Compose项目：`remember-technical-spikes-postgres`。
- 服务：`source-db`与`restore-db`；不暴露主机端口。
- 数据卷：由该Compose项目分别创建并标记的`source-data`与`restore-data`。

脚本把带有`com.docker.compose.project=remember-technical-spikes-postgres`标签的资源，与本Spike精确预期名称的资源取并集，逐一复核项目标签完全匹配后，才执行该项目的`down --volumes --remove-orphans`。核验覆盖容器、卷和Compose网络，因此同名但标签缺失或错误的资源会令脚本停止。禁止使用全局container、volume或system prune。最终完整运行安全清理了上次留下的2个容器、2个卷和1个网络；未删除其他项目资源。

数据库密码只允许通过当前进程环境或Git忽略的`.env`提供；没有默认值，日志和ADR均不记录密码。

## 信任边界与事务行为

`process_spike_payment_notification`只有四个参数：`notification_id`、`transaction_id`、`order_id`和`processed_at`。函数不接收`user_id`或`pack_id`。

首次通知先按`order_id`读取并以`FOR UPDATE`锁定订单，再从该订单取得权威`user_id`与`pack_id`。只有成功插入新事件的事务才能更新订单并发放`pack_access`。因此通知调用方无法指定或替换权益主体。

既有通知先锁定事件并比较交易和订单；完全一致时返回`false`且成功结束，任一字段不同则主动抛出`PAYMENT_NOTIFICATION_CONFLICT`。首次处理的并发竞争使用`ON CONFLICT (notification_id) DO NOTHING`，未插入者重新锁定事件并执行同一一致性检查，不用唯一约束异常冒充正常幂等结果。验收严格断言源库首次调用返回`true`、第二次返回`false`；恢复库已有该事件，两次重放都返回`false`。每次`false`重放前后的三张业务表完整快照哈希必须一致。

冲突测试先在显式事务内把已支付订单临时改为`PENDING`，再触发函数异常。测试结束后重新连接，确认订单仍为`PAID`且时间戳未变，原支付事件未变，事件与权益仍各一行，证明整个事务已回滚。

## 重复运行证据

第二次完整执行结果：

- 安全清理：2个本项目容器、2个本项目卷、1个本项目网络。
- 恢复前业务表数：0。
- dump格式：`pg_dump -Fc`。
- dump大小：9413字节。
- dump SHA-256：`ca04ce450c7723da4b2858a190ec616e815ab7064dfb5a32d34dae9d15a541e1`。
- 备份耗时：533毫秒。
- 恢复命令：`pg_restore --exit-on-error`。
- 恢复耗时：288毫秒。
- 源库正常重放退出码：`0,0`。
- 源库两类冲突退出码：`3,3`。
- 源库`orders/payment_events/pack_access`计数：`2/1/1`。
- 恢复库正常重放退出码：`0,0`。
- 恢复库两类冲突退出码：`3,3`。
- 恢复库`orders/payment_events/pack_access`计数：`2/1/1`。

custom-format dump包含运行时元数据，因此不同运行的二进制哈希不要求固定；每次执行都重新记录当前产物的大小和SHA-256。产物位于Git忽略的`infra/technical-spikes/postgres/artifacts/`。

独立只读审查最初发现两项P2：重放测试没有断言函数返回值/业务快照，以及安全清理只按正确标签筛选导致标签复核形成循环论证。当前实现已分别加入严格返回值与完整快照断言，并按项目标签和精确预期资源名的并集核验容器、卷与网络。复审确认两项均已关闭，未发现其他P0至P2。

## 恢复后验证

恢复后验证三张业务表的数据、两个外键、`payment_events.notification_id`、`payment_events.transaction_id`与`pack_access(user_id, pack_id)`三个唯一约束，以及四参数通知函数。随后在恢复库重新执行两次正常重放和两类冲突回滚测试，结果与源库一致。

## 未覆盖的生产边界

- 未验证生产连接池、网络故障重试、隔离级别调优、长期归档或跨区域恢复。
- 未建立正式订单状态机、金额/币种核对、退款事件或微信平台证书校验。
- Spike中的固定标识和表结构不能直接当作生产迁移；正式模型仍需按架构与数据规范单独设计和审查。
