# 项目术语

代码优先使用简单、准确的英文，不使用拼音。下表是固定词汇；不要为同一概念创造第二种名称。

| 中文           | 代码名称       | 避免使用                        |
| -------------- | -------------- | ------------------------------- |
| 学习包         | `pack`         | `packageData`、`materialBundle` |
| 学习包清单     | `packManifest` | `packageMetadataConfig`         |
| 学习包版本     | `packVersion`  | `materialRevision`              |
| 卡片           | `card`         | `learningContentItem`           |
| 单词           | `word`         | `vocabularyItem`                |
| 短句           | `sentence`     | `phraseContentData`             |
| 学习           | `study`        | `learningOperation`             |
| 复习           | `review`       | `revisionOperation`             |
| 学习进度       | `progress`     | `learningStateSnapshot`         |
| 学习状态       | `studyState`   | `learningStatusData`            |
| 学习任务       | `studySession` | `dailyLearningTaskContext`      |
| 队列           | `queue`        | `orderedProcessingCollection`   |
| 待同步记录     | `syncItem`     | `pendingSynchronizationRecord`  |
| 购买权限       | `packAccess`   | `entitlement`                   |
| 订单           | `order`        | `purchaseOrderEntity`           |
| 支付           | `payment`      | `paymentTransactionProcess`     |
| 退款           | `refund`       | `paymentReversalOperation`      |
| 同步           | `sync`         | `dataSynchronization`           |
| 主设备         | `mainDevice`   | `primaryAuthorizedDevice`       |
| 设备           | `device`       | `clientTerminal`                |
| 会话           | `session`      | `authenticationSessionContext`  |
| 验证码         | `smsCode`      | `verificationCodeValue`         |
| 知识ID         | `knowledgeId`  | `learningContentIdentifier`     |
| 到期时间       | `dueAt`        | `nextScheduledReviewTimestamp`  |
| 学习包构建工具 | `packBuilder`  | `contentPackageCompilerSystem`  |

名称必须通俗但不能含糊。若简单名称在当前作用域中产生歧义，增加一个准确的常用限定词，而不是使用生僻术语。
