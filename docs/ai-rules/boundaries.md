# 依赖边界

## 单向依赖

```text
页面或Controller
       ↓
应用用例
       ↓
纯领域逻辑
       ↑
SQLite、Prisma、HTTP、文件系统适配器
```

页面或Controller调用应用用例；用例依赖领域规则和数据端口；基础设施实现端口。领域逻辑不知道React、NestJS、Expo、Prisma和具体数据库。

## Monorepo依赖

```text
apps/mobile ─┐
apps/api ────┼──→ packages/contracts
apps/admin ──┤──→ packages/domain
pack-builder ┘

packages/contracts → packages/domain（仅在确有必要时）
packages/domain → 不依赖任何项目内部包
```

- App可以依赖共享契约和纯领域逻辑。
- `tools/pack-builder`可以依赖契约与纯领域逻辑。
- `packages/contracts`和 `packages/domain`不得依赖任何App。
- 共享包不得引用具体应用环境变量、页面或数据库客户端。

## 模块公开入口

- 跨模块只通过该模块公开入口调用。
- 禁止导入另一个模块的 `internal`、仓库实现或私有文件。
- `index.ts`只公开稳定入口，不执行初始化和业务逻辑。
- 模块公开的内容越少越好；仅暴露真实消费者需要的能力。

## FORBIDDEN

- 循环依赖。
- 一个App导入另一个App源码。
- 页面、React组件或Controller直接操作SQLite、Prisma或文件系统。
- 管理后台绕过API访问数据库。
- 跨模块深层路径导入内部文件。
- 支付、同步、学习调度等模块互相访问内部实现。
- `packages/domain`依赖React、NestJS、Prisma、Expo或网络客户端。
- 为复用几行代码建立反向依赖。

循环与越层依赖由 `pnpm check:deps`自动检查。发现边界不适用时先修改架构决策，不在代码中临时穿透。
