# 记得

“记得”是一个本地优先的卡片学习应用。本仓库目前处于工程基础搭建阶段，尚未实现产品业务功能。

## 开发环境

- Node.js 22.23.1
- pnpm 10.33.2

安装依赖：

```powershell
pnpm install
```

运行统一质量检查：

```powershell
pnpm check
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

## 项目文档

- [MVP架构设计](docs/superpowers/specs/2026-07-26-learning-app-mvp-architecture-design.md)
- [AI编码规范](docs/ai-rules/core-rules.md)
- [第一阶段实施计划](docs/superpowers/plans/2026-07-26-project-foundation.md)
