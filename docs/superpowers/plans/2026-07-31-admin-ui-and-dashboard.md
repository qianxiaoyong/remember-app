# Admin UI and Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 交付 `apps/admin` React-admin 最小运营后台：Bearer 登录、自定义 dataProvider/authProvider、驾驶舱 A（Recharts）、五类运营 Resource 页。

**Architecture:** Vite SPA → Vite proxy `/api` → NestJS admin API；token 存 `localStorage`；契约校验复用 `@remember/contracts`。

**Tech Stack:** React 19、Vite 6、react-admin 5.14、MUI 6、Recharts、TypeScript

**依赖：** 子计划 1–2（admin API 已就绪）

## Global Constraints

- 开源 react-admin 核心；不用 Enterprise
- 原生 `fetch` dataProvider；不接 Axios
- dev：`pnpm --filter @remember/admin dev` @ `http://127.0.0.1:5173`
- API：`pnpm --filter @remember/api dev` @ `3000`；Vite 代理避免 CORS
- 菜单中文；简洁运营风

## 验收

- [x] 登录/登出可用
- [x] 驾驶舱 KPI + 折线/柱图 + 告警
- [x] 知识库/订单/权益/退款/兑换码/审计/App 用户 Resource
- [x] `pnpm --filter @remember/admin typecheck` + `build`
