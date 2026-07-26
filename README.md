# 记得

“记得”是一个本地优先的卡片学习应用。当前仓库已经建立第一阶段工程基线，尚未实现学习、登录、购买或同步等产品业务。

## 当前工程能力

- NestJS API 提供 `GET /api/v1/health`，并有单元测试和真实 HTTP 集成测试。
- Expo SDK 57 移动端可以导出 Android JavaScript bundle。
- 根级质量门禁覆盖格式、Lint、类型、测试、依赖边界、密钥、源码规则和构建。
- Java 和 Android SDK 尚未配置，因此没有验证 Android 原生 release 构建。

## 开发环境

- Node.js 22.23.1
- pnpm 10.33.2

安装依赖：

```powershell
pnpm install
```

运行日常完整检查：

```powershell
pnpm check
```

运行真实 HTTP 集成测试：

```powershell
pnpm test:integration
```

启动 API 开发服务：

```powershell
pnpm --filter @remember/api dev
```

启动 Expo 开发服务：

```powershell
pnpm --filter @remember/mobile dev
```

导出 Android JavaScript bundle：

```powershell
pnpm --filter @remember/mobile build
```

## 下一阶段

下一步先完成 Expo 多 SQLite、学习包验签、微信 OpenSDK、微信 APIv3 密码学和备份恢复五项高风险技术验证，不直接开发业务页面。

## 项目文档

- [MVP架构设计](docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md)
- [AI编码规范](docs/ai-rules/core-rules.md)
- [第一阶段实施计划](docs/superpowers/plans/2026-07-26-project-foundation.md)
