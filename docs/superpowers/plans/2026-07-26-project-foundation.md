# 记得项目基础 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在空的`remember-app`根目录建立可重复安装、可统一检查、能启动NestJS健康接口并能导出Expo Android bundle的最小pnpm Monorepo。

**Architecture:** 第一阶段只创建已有真实职责的移动端、API、健康检查契约和共享工程配置，不创建后台、领域包、学习包构建器或部署空壳。根命令通过pnpm递归调用各workspace脚本；依赖边界、敏感信息、格式、类型、测试和构建均具有真实失败条件。

**Tech Stack:** Node.js 22.23.1、pnpm 10.33.2、TypeScript 5.9、Expo SDK 57、React Native 0.86、NestJS 11、Zod、Vitest、ESLint 10 flat config、Prettier 3.9、dependency-cruiser、Secretlint、GitHub Actions。

## Global Constraints

- App展示名称固定为“记得”，项目根目录和Git仓库名为`remember-app`。
- Android最低支持版本为Android 8；本阶段只验证Android JavaScript bundle，Android release实机构建属于下一阶段。
- Node.js固定为22.23.1；Expo SDK 57要求Node.js至少22.13.x。
- pnpm固定为10.33.2，只保留根目录`pnpm-lock.yaml`；禁止`npm install`、Yarn和手工编辑锁文件。
- 所有依赖保存精确版本；模板生成后立即用锁文件固定实际解析结果。
- TypeScript源码统一使用`import/export`，禁止新增`require()`、`any`和无编号的`TODO`/`FIXME`/`HACK`。
- 网络请求使用原生`fetch`；本阶段不安装Axios、Moment.js、jQuery、Lodash、状态管理、ORM或数据库依赖。
- `packages/contracts`只包含实际被API健康检查消费的Zod契约；不创建空的`packages/domain`。
- 不创建`apps/admin`、`tools/pack-builder`或`infra`空目录，它们在首次承担真实功能时再建立。
- `.env`、密钥、证书、生成物、缓存和原生构建目录不得提交。
- 允许修改范围：项目根配置、`apps/mobile`、`apps/api`、`packages/contracts`、`packages/config`、`tools/checks`、`.github/workflows`和本计划勾选状态。
- 每个任务提交前先运行该任务列出的验证；只有执行整份计划已获用户批准时，任务中的Git提交步骤才获得授权。

## Official Baselines

- Expo SDK 57对应React Native 0.86、React 19.2.3，最低Node.js 22.13.x：[Expo SDK reference](https://docs.expo.dev/versions/latest/)。
- Expo官方pnpm Monorepo默认可使用`nodeLinker: hoisted`：[create-expo-app](https://docs.expo.dev/more/create-expo/)。
- NestJS 11要求Node.js 20或以上：[NestJS first steps](https://docs.nestjs.com/first-steps)。
- Node.js 22目前处于LTS，适合生产应用：[Node.js release schedule](https://nodejs.org/en/about/previous-releases)。
- Vite和ESLint 10均支持Node.js 22.13以上；后台尚无真实职责，因此本阶段不安装Vite或React-admin。

---

### Task 1: 初始化Git、运行时约束和Workspace根文件

**Files:**

- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `.node-version`
- Create: `.npmrc`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `README.md`
- Preserve: `AGENTS.md`
- Preserve: `docs/**`
- Preserve: `skills/**`

**Interfaces:**

- Consumes: 已落盘的架构、AI规则和总开发顺序。
- Produces: Node.js 22.23.1、pnpm 10.33.2、workspace路径和根级脚本命名约定。

- [ ] **Step 1: 检查根目录并初始化Git**

Run:

```powershell
Get-ChildItem -Force
git init -b main
git status --short
```

Expected: Git初始化成功；未跟踪内容仅为当前正式文档、Skill和随后新建的工程文件。

- [ ] **Step 2: 创建编辑器、运行时和忽略规则**

`.node-version`必须为：

```text
22.23.1
```

`.npmrc`必须为：

```ini
save-exact=true
prefer-frozen-lockfile=true
```

`.editorconfig`必须为：

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

`.gitignore`至少包含：

```gitignore
node_modules/
.pnpm-store/
.env
.env.*
!.env.example
coverage/
dist/
.expo/
android/
ios/
*.jks
*.keystore
*.p12
*.pem
*.key
*.crt
*.log
```

- [ ] **Step 3: 创建根package和workspace配置**

`package.json`初始内容：

```json
{
  "name": "remember-app",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.33.2",
  "engines": {
    "node": ">=22.13 <23",
    "pnpm": "10.33.2"
  },
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "build:packages": "pnpm --filter @remember/contracts build",
    "typecheck": "pnpm build:packages && pnpm -r --if-present typecheck",
    "test": "pnpm build:packages && pnpm -r --if-present test",
    "test:contract": "pnpm --filter @remember/contracts test",
    "test:integration": "pnpm build:packages && pnpm -r --if-present test:integration",
    "check:deps": "depcruise --config dependency-cruiser.cjs apps packages tools",
    "check:secrets": "secretlint \"**/*\"",
    "check:source": "node tools/checks/check-source.mjs",
    "build": "pnpm -r --if-present build",
    "check": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm test:contract && pnpm check:deps && pnpm check:secrets && pnpm check:source && pnpm build"
  }
}
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
  - tools/*

nodeLinker: hoisted
```

`tsconfig.json`：

```json
{
  "extends": "./packages/config/typescript/base.json",
  "files": []
}
```

- [ ] **Step 4: 创建仅描述当前真实命令的README**

`README.md`必须包含产品名、Node/pnpm版本、`pnpm install`、`pnpm check`、API启动命令、Expo启动/导出命令以及架构和规则文件链接；不得写尚未实现的功能完成情况。

- [ ] **Step 5: 验证运行时，不安装依赖**

Run:

```powershell
node --version
pnpm --version
git status --short
```

Expected: Node输出`v22.23.1`；pnpm输出`10.33.2`。若本机版本不同，停止任务并切换版本，不能忽略`engines`继续安装。

- [ ] **Step 6: 提交根基线**

```powershell
git add .gitignore .editorconfig .node-version .npmrc package.json pnpm-workspace.yaml tsconfig.json README.md AGENTS.md docs skills
git commit -m "chore: 建立记得项目文档与运行时基线"
```

Expected: 一个只包含文档和根配置的提交。

---

### Task 2: 建立共享TypeScript、ESLint和Prettier配置

**Files:**

- Create: `packages/config/package.json`
- Create: `packages/config/typescript/base.json`
- Create: `packages/config/typescript/node.json`
- Create: `packages/config/typescript/react.json`
- Create: `packages/config/eslint/base.mjs`
- Create: `packages/config/eslint/node.mjs`
- Create: `packages/config/eslint/react.mjs`
- Create: `eslint.config.mjs`
- Create: `prettier.config.mjs`
- Create: `.prettierignore`
- Modify: `package.json`
- Generate: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: 根目录Node/pnpm约束和workspace路径。
- Produces: `@remember/config`公开的TypeScript与ESLint配置；后续workspace只继承，不复制规则。

- [ ] **Step 1: 安装根工程依赖并生成唯一锁文件**

Run:

```powershell
pnpm add -Dw typescript@5.9 eslint@10 @eslint/js typescript-eslint prettier@3.9.0 globals vitest @vitest/eslint-plugin dependency-cruiser secretlint @secretlint/secretlint-rule-preset-recommend @types/node
```

Expected: 只生成`pnpm-lock.yaml`，不存在`package-lock.json`或`yarn.lock`；`package.json`中的依赖均为精确版本。

- [ ] **Step 2: 创建共享配置package**

`packages/config/package.json`：

```json
{
  "name": "@remember/config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./eslint/base": "./eslint/base.mjs",
    "./eslint/node": "./eslint/node.mjs",
    "./eslint/react": "./eslint/react.mjs",
    "./typescript/base": "./typescript/base.json",
    "./typescript/node": "./typescript/node.json",
    "./typescript/react": "./typescript/react.json"
  }
}
```

- [ ] **Step 3: 创建严格TypeScript配置**

`packages/config/typescript/base.json`必须包含：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

`node.json`继承`base.json`，设置`target: ES2022`、`module: NodeNext`、`moduleResolution: NodeNext`和`types: ["node"]`。`react.json`继承`base.json`，设置`jsx: react-jsx`、`module: ESNext`、`moduleResolution: Bundler`和`noEmit: true`。

- [ ] **Step 4: 创建ESLint flat config**

`base.mjs`必须导出数组，并组合`@eslint/js` recommended、`typescript-eslint` strict type-checked规则及以下项目规则：

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'max-params': ['error', 3],
      'max-depth': ['error', 3],
    },
  },
);
```

`node.mjs`：

```js
import globals from 'globals';

export default {
  files: [
    'apps/api/**/*.{js,mjs,cjs,ts}',
    'packages/**/*.{js,mjs,cjs,ts}',
    'tools/**/*.{js,mjs,cjs,ts}',
  ],
  languageOptions: { globals: globals.node },
};
```

`react.mjs`：

```js
import globals from 'globals';

export default {
  files: ['apps/mobile/**/*.{ts,tsx}', 'apps/admin/**/*.{ts,tsx}'],
  languageOptions: { globals: globals.browser },
};
```

根`eslint.config.mjs`：

```js
import base from './packages/config/eslint/base.mjs';
import node from './packages/config/eslint/node.mjs';
import react from './packages/config/eslint/react.mjs';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '.expo/**',
      'android/**',
      'ios/**',
    ],
  },
  ...base,
  node,
  react,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
];
```

- [ ] **Step 5: 创建统一Prettier配置**

`prettier.config.mjs`：

```js
export default {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
};
```

`.prettierignore`忽略`node_modules`、`pnpm-lock.yaml`、`dist`、`coverage`、`.expo`、`android`和`ios`。

- [ ] **Step 6: 验证共享配置能被解析**

Run:

```powershell
pnpm exec tsc --showConfig -p packages/config/typescript/node.json
pnpm exec eslint packages/config/eslint --no-error-on-unmatched-pattern
pnpm exec prettier --check package.json pnpm-workspace.yaml packages/config
```

Expected: 三条命令退出码均为0。

- [ ] **Step 7: 提交共享配置**

```powershell
git add package.json pnpm-lock.yaml packages/config eslint.config.mjs prettier.config.mjs .prettierignore
git commit -m "chore: 建立共享代码质量配置"
```

---

### Task 3: 创建健康检查契约package

**Files:**

- Create: `packages/contracts/package.json`
- Create: `packages/contracts/tsconfig.json`
- Create: `packages/contracts/tsconfig.build.json`
- Create: `packages/contracts/src/api/health.ts`
- Create: `packages/contracts/src/api/health.test.ts`
- Create: `packages/contracts/src/index.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: `@remember/config/typescript/node`。
- Produces: `healthResponseSchema`及其推导类型`HealthResponse`，结构固定为`{ status: 'ok' }`。

- [ ] **Step 1: 创建package并安装唯一运行时依赖**

`packages/contracts/package.json`必须包含：

```json
{
  "name": "@remember/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "tsc -p tsconfig.build.json"
  },
  "devDependencies": {
    "@remember/config": "workspace:*"
  }
}
```

Run:

```powershell
pnpm --filter @remember/contracts add zod
```

Expected: Zod只安装到contracts workspace，并以精确版本记录。

- [ ] **Step 2: 先写失败的契约测试**

`packages/contracts/src/api/health.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './health.js';

describe('healthResponseSchema', () => {
  it('接受唯一健康状态', () => {
    expect(healthResponseSchema.parse({ status: 'ok' })).toEqual({ status: 'ok' });
  });

  it('拒绝未知状态和多余字段', () => {
    expect(() => healthResponseSchema.parse({ status: 'down' })).toThrow();
    expect(() => healthResponseSchema.parse({ status: 'ok', detail: 'x' })).toThrow();
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```powershell
pnpm --filter @remember/contracts test
```

Expected: FAIL，原因是`./health.js`不存在。

- [ ] **Step 4: 实现最小健康契约**

`packages/contracts/src/api/health.ts`：

```ts
import { z } from 'zod';

export const healthResponseSchema = z.object({ status: z.literal('ok') }).strict();

export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

`packages/contracts/src/index.ts`只包含：

```ts
export { healthResponseSchema, type HealthResponse } from './api/health.js';
```

`tsconfig.json`继承`@remember/config/typescript/node`并包含`src`。`tsconfig.build.json`继承前者，设置`rootDir: src`、`outDir: dist`、`declaration: true`、`sourceMap: true`，并排除`*.test.ts`。

- [ ] **Step 5: 运行契约检查**

Run:

```powershell
pnpm --filter @remember/contracts test
pnpm --filter @remember/contracts typecheck
pnpm --filter @remember/contracts build
```

Expected: 2个测试通过，类型检查退出码为0，`dist/index.js`和`dist/index.d.ts`生成但不提交。

- [ ] **Step 6: 提交健康契约**

```powershell
git add packages/contracts package.json pnpm-lock.yaml tsconfig.json
git commit -m "feat(contracts): 定义API健康检查契约"
```

---

### Task 4: 创建NestJS API和契约化健康接口

**Files:**

- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/health/health.controller.test.ts`
- Create: `apps/api/src/config/read-port.ts`
- Create: `apps/api/src/config/read-port.test.ts`
- Create: `apps/api/test/health.e2e.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: `healthResponseSchema`和`HealthResponse`。
- Produces: `GET /api/v1/health -> 200 { "status": "ok" }`。

- [ ] **Step 1: 使用NestJS 11官方CLI生成严格项目但不保留示例业务**

Run:

```powershell
pnpm dlx @nestjs/cli@11 new apps/api --package-manager pnpm --skip-git --strict --skip-install
pnpm install
```

Expected: 生成NestJS 11项目并由根workspace统一安装；禁止产生子目录锁文件。

- [ ] **Step 2: 删除CLI示例并接入workspace契约**

删除`app.controller.ts`、`app.controller.spec.ts`和`app.service.ts`。将`apps/api/package.json`的name改为`@remember/api`并设置`"type": "module"`，保留Nest官方运行依赖，加入：

```json
{
  "dependencies": {
    "@remember/contracts": "workspace:*"
  },
  "scripts": {
    "dev": "pnpm --filter @remember/contracts build && nest start --watch",
    "start": "node dist/main.js",
    "typecheck": "tsc --noEmit",
    "pretest": "pnpm --filter @remember/contracts build",
    "test": "vitest run src",
    "test:integration": "vitest run test",
    "prebuild": "pnpm --filter @remember/contracts build",
    "build": "nest build"
  }
}
```

把CLI默认Jest依赖和配置移除，安装API测试依赖：

```powershell
pnpm --filter @remember/api add -D vitest supertest @types/supertest
pnpm --filter @remember/api add -D typescript@5.9
```

`apps/api/tsconfig.json`继承`@remember/config/typescript/node`，并设置`experimentalDecorators: true`、`emitDecoratorMetadata: true`和`outDir: dist`；源码和生成文件都不得出现`require()`。

- [ ] **Step 3: 先写失败的Controller测试**

`health.controller.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('返回契约规定的健康状态', () => {
    expect(new HealthController().getHealth()).toEqual({ status: 'ok' });
  });
});
```

Run:

```powershell
pnpm --filter @remember/api test
```

Expected: FAIL，原因是`HealthController`不存在。

- [ ] **Step 4: 实现最小Controller、Module和启动入口**

`health.controller.ts`：

```ts
import { Controller, Get } from '@nestjs/common';
import { healthResponseSchema, type HealthResponse } from '@remember/contracts';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({ status: 'ok' });
  }
}
```

`read-port.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { readPort } from './read-port.js';

describe('readPort', () => {
  it('未配置时使用本地端口3000', () => {
    expect(readPort(undefined)).toBe(3000);
  });

  it.each(['', 'abc', '0', '65536', '1.5'])('拒绝非法端口 %s', (value) => {
    expect(() => readPort(value)).toThrow('PORT必须是1至65535之间的整数');
  });
});
```

`read-port.ts`：

```ts
export function readPort(value: string | undefined): number {
  if (value === undefined) return 3000;
  if (!/^\d+$/.test(value)) throw new Error('PORT必须是1至65535之间的整数');
  const port = Number(value);
  if (port < 1 || port > 65_535) throw new Error('PORT必须是1至65535之间的整数');
  return port;
}
```

`app.module.ts`：

```ts
import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';

@Module({ controllers: [HealthController] })
export class AppModule {}
```

`main.ts`：

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { readPort } from './config/read-port.js';

async function startApi(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(readPort(process.env.PORT));
}

await startApi();
```

- [ ] **Step 5: 写并运行真实HTTP集成测试**

`apps/api/test/health.e2e.test.ts`使用以下测试：

```ts
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import type { INestApplication } from '@nestjs/common';

describe('GET /api/v1/health', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('返回严格匹配契约的健康状态', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
```

Run:

```powershell
pnpm --filter @remember/api test
pnpm --filter @remember/api test:integration
pnpm --filter @remember/api typecheck
pnpm --filter @remember/api build
```

Expected: Controller、端口解析和HTTP集成测试全部通过；API构建生成`dist`，没有数据库或外部服务依赖。

- [ ] **Step 6: 手动验证健康接口**

Terminal 1:

```powershell
pnpm --filter @remember/api dev
```

Terminal 2:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/health
```

Expected: 输出对象的`status`为`ok`。停止开发进程后不得残留后台Node进程。

- [ ] **Step 7: 提交API基础**

```powershell
git add apps/api package.json pnpm-lock.yaml
git commit -m "feat(api): 建立契约化健康检查接口"
```

---

### Task 5: 创建Expo SDK 57移动端构建基线

**Files:**

- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/src/screens/start-screen.tsx`
- Preserve generated: `apps/mobile/assets/**`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Node.js、pnpm、Expo SDK和Android 8最低版本约束。
- Produces: `@remember/mobile`；开发入口和Android JavaScript bundle导出命令。

- [ ] **Step 1: 使用Expo官方稳定模板生成移动端**

Run:

```powershell
pnpm dlx create-expo-app@latest apps/mobile --template default@sdk-57 --no-install --no-agents-md
pnpm install
pnpm --filter @remember/mobile add -D typescript@5.9
```

Expected: `apps/mobile`使用Expo SDK 57；根目录只有一个`pnpm-lock.yaml`；模板没有生成第二份AGENTS规则。

- [ ] **Step 2: 收敛移动端package和脚本**

将package name改为`@remember/mobile`，脚本固定为：

```json
{
  "scripts": {
    "dev": "expo start --dev-client",
    "android": "expo run:android",
    "typecheck": "tsc --noEmit",
    "build": "expo export --platform android --output-dir dist"
  }
}
```

删除模板教程页面和不使用的演示依赖。保留Expo Router，因为已确认页面具有启动分流、两项主导航、详情和学习沉浸路由。

- [ ] **Step 3: 配置品牌和Android最低版本**

安装官方配置插件：

```powershell
pnpm --filter @remember/mobile exec expo install expo-build-properties
```

`app.json`设置：

```json
{
  "expo": {
    "name": "记得",
    "slug": "remember",
    "orientation": "portrait",
    "plugins": ["expo-router", ["expo-build-properties", { "android": { "minSdkVersion": 26 } }]]
  }
}
```

本阶段不填写`android.package`：它会参与微信开放平台校验，必须在下一阶段微信OpenSDK验证前由用户确认主体标识，一旦注册后不能随意改名。

- [ ] **Step 4: 创建真实的工程启动屏而非产品占位页**

`start-screen.tsx`只负责显示App名称“记得”和工程状态“开发环境”，明确它是开发构建入口；不伪造知识库、学习进度、登录或购买数据。`app/index.tsx`只导入并渲染`StartScreen`，`_layout.tsx`只建立根Stack且隐藏默认header。

- [ ] **Step 5: 运行Expo兼容、类型和Android bundle检查**

Run:

```powershell
pnpm --filter @remember/mobile exec expo-doctor
pnpm --filter @remember/mobile typecheck
pnpm --filter @remember/mobile build
pnpm list typescript react react-native -r
```

Expected: Expo Doctor无错误；类型检查通过；`apps/mobile/dist`生成Android平台bundle；所有workspace使用同一TypeScript 5.9解析版本，React与React Native不存在冲突版本。`dist`保持Git忽略。

- [ ] **Step 6: 记录下一阶段本机前置缺口**

Run:

```powershell
java -version
$env:ANDROID_HOME
```

Expected for当前电脑: Java命令目前不存在，`ANDROID_HOME`未配置。把这一事实写入`docs/decisions/0001-local-android-toolchain.md`，并明确“阶段2开始前安装JDK 17和Android SDK”；不得声称Android release构建已通过。

- [ ] **Step 7: 提交移动端基线**

```powershell
git add apps/mobile package.json pnpm-lock.yaml docs/decisions/0001-local-android-toolchain.md
git commit -m "feat(mobile): 建立Expo Android构建基线"
```

---

### Task 6: 实现自动化源码、依赖和密钥门禁

**Files:**

- Create: `tools/checks/check-source.mjs`
- Create: `tools/checks/check-source.test.mjs`
- Create: `dependency-cruiser.cjs`
- Create: `.secretlintrc.json`
- Create: `.secretlintignore`
- Modify: `eslint.config.mjs`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: 已存在的`apps`与`packages`目录结构。
- Produces: `pnpm check:source`、`pnpm check:deps`和`pnpm check:secrets`三个真实失败门禁。

- [ ] **Step 1: 先写源码门禁失败测试**

`check-source.test.mjs`使用以下完整测试结构：

```js
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { scanProject } from './check-source.mjs';

let rootPath;

before(async () => {
  rootPath = await mkdtemp(path.join(tmpdir(), 'remember-source-check-'));
  await mkdir(path.join(rootPath, 'src'));
});

after(async () => {
  await rm(rootPath, { recursive: true, force: true });
});

test('发现禁止的锁文件', async () => {
  await writeFile(path.join(rootPath, 'package-lock.json'), '{}');
  const issues = await scanProject(rootPath);
  assert.ok(issues.some((issue) => issue.rule === 'ONLY_PNPM_LOCK'));
  await rm(path.join(rootPath, 'package-lock.json'));
});

test('发现禁止的源码模式', async () => {
  const filePath = path.join(rootPath, 'src', 'bad.ts');
  const badSource = ['requ' + "ire('x');", 'TO' + 'DO', 'describe.' + "only('x', () => {});"].join(
    '\n',
  );
  await writeFile(filePath, badSource);
  const rules = (await scanProject(rootPath)).map((issue) => issue.rule);
  assert.deepEqual(new Set(rules), new Set(['COMMONJS_REQUIRE', 'UNTRACKED_NOTE', 'FOCUSED_TEST']));
  await rm(filePath);
});

test('发现超过400行的人工源码', async () => {
  const filePath = path.join(rootPath, 'src', 'large.ts');
  await writeFile(filePath, Array.from({ length: 401 }, () => 'export {};').join('\n'));
  const issues = await scanProject(rootPath);
  assert.ok(issues.some((issue) => issue.rule === 'SOURCE_TOO_LONG'));
  await rm(filePath);
});

test('忽略生成和依赖目录', async () => {
  const ignoredPath = path.join(rootPath, 'node_modules');
  await mkdir(ignoredPath);
  await writeFile(path.join(ignoredPath, 'bad.ts'), "require('x');");
  assert.deepEqual(await scanProject(rootPath), []);
});
```

Run:

```powershell
node --test tools/checks/check-source.test.mjs
```

Expected: FAIL，原因是`check-source.mjs`不存在。

- [ ] **Step 2: 实现最小源码扫描器**

`check-source.mjs`实现以下接口和规则；允许按相同职责拆成不超过80行的两个文件，但不得改变返回字段：

```js
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ignoredDirs = new Set([
  '.git',
  '.expo',
  'android',
  'coverage',
  'dist',
  'ios',
  'node_modules',
]);
const sourceExtensions = new Set(['.cjs', '.js', '.mjs', '.ts', '.tsx']);
const forbiddenLocks = new Set(['package-lock.json', 'yarn.lock']);
const patterns = [
  { rule: 'COMMONJS_REQUIRE', value: /\brequire\s*\(/g },
  {
    rule: 'UNTRACKED_NOTE',
    value: new RegExp('\\b(?:TO' + 'DO|FIX' + 'ME|HA' + 'CK)\\b(?!\\s*#\\d+)', 'g'),
  },
  { rule: 'FOCUSED_TEST', value: /\.(?:only|skip)\s*\(/g },
];

function findLine(text, index) {
  return text.slice(0, index).split('\n').length;
}

async function listFiles(rootPath, currentPath = rootPath) {
  const files = [];
  for (const entry of await readdir(currentPath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    const entryPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(rootPath, entryPath)));
    else files.push(entryPath);
  }
  return files;
}

export async function scanProject(rootPath) {
  const issues = [];
  for (const filePath of await listFiles(rootPath)) {
    const relativePath = path.relative(rootPath, filePath);
    if (forbiddenLocks.has(path.basename(filePath))) {
      issues.push({ path: relativePath, line: 1, rule: 'ONLY_PNPM_LOCK' });
      continue;
    }
    if (!sourceExtensions.has(path.extname(filePath)) || filePath.includes('.generated.')) continue;
    const text = await readFile(filePath, 'utf8');
    if (text.split('\n').length > 400) {
      issues.push({ path: relativePath, line: 401, rule: 'SOURCE_TOO_LONG' });
    }
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern.value)) {
        issues.push({ path: relativePath, line: findLine(text, match.index), rule: pattern.rule });
      }
    }
  }
  return issues;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const issues = await scanProject(process.cwd());
  for (const issue of issues) console.error(`${issue.path}:${issue.line} ${issue.rule}`);
  if (issues.length > 0) process.exitCode = 1;
}
```

- [ ] **Step 3: 运行源码门禁测试和真实扫描**

Run:

```powershell
node --test tools/checks/check-source.test.mjs
pnpm check:source
```

Expected: 测试全部通过；真实工程没有违规项。

- [ ] **Step 4: 配置dependency-cruiser边界**

`dependency-cruiser.cjs`必须采用以下最小规则：

- 禁止循环依赖。
- 禁止`apps/mobile`导入`apps/api`或未来`apps/admin`源码。
- 禁止`apps/api`导入其他App源码。
- 禁止`packages/contracts`导入任何`apps`内容。
  包的`exports`字段负责拒绝跨workspace深层导入。配置内容：

```js
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'mobile-does-not-read-other-apps',
      severity: 'error',
      from: { path: '^apps/mobile' },
      to: { path: '^apps/(api|admin)' },
    },
    {
      name: 'api-does-not-read-other-apps',
      severity: 'error',
      from: { path: '^apps/api' },
      to: { path: '^apps/(mobile|admin)' },
    },
    {
      name: 'packages-do-not-read-apps',
      severity: 'error',
      from: { path: '^packages' },
      to: { path: '^apps' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: '(^|/)(dist|coverage|node_modules|android|ios)/',
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
```

Run:

```powershell
pnpm check:deps
```

Expected: 当前依赖图通过。随后通过`apply_patch`临时创建`packages/contracts/src/bad-boundary.ts`，内容为`import '../../../apps/api/src/app.module.js';`，确认`pnpm check:deps`因`packages-do-not-read-apps`失败；再删除该临时文件并重新确认通过。

- [ ] **Step 5: 配置Secretlint**

`.secretlintrc.json`：

```json
{
  "rules": [{ "id": "@secretlint/secretlint-rule-preset-recommend" }]
}
```

`.secretlintignore`忽略`.git`、`node_modules`、`pnpm-lock.yaml`、`dist`、`coverage`、`.expo`、`android`和`ios`；不得忽略源码和`.env.example`。

Run:

```powershell
pnpm check:secrets
```

Expected: 当前仓库通过。随后通过`apply_patch`临时创建`secret-check.txt`，运行时拼接GitHub令牌前缀与无效测试字符，确认命令失败；删除后重新确认通过。测试串不得写入计划或提交。

- [ ] **Step 6: 收紧ESLint自动规则**

在测试文件配置中启用Vitest推荐规则，确保`.only`和`.skip`失败；加入文件级复杂度、参数和嵌套规则。React组件120行、普通函数80行的最终人工判定保留给审查，不写脆弱的正则推断函数边界。

- [ ] **Step 7: 提交自动门禁**

```powershell
git add tools/checks dependency-cruiser.cjs .secretlintrc.json .secretlintignore eslint.config.mjs package.json pnpm-lock.yaml
git commit -m "chore: 增加依赖源码与密钥门禁"
```

---

### Task 7: 建立根级检查、CI和可重复冷安装

**Files:**

- Create: `.github/workflows/check.yml`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: 所有workspace脚本和门禁命令。
- Produces: `pnpm check`作为本地和CI唯一快速质量入口。

- [ ] **Step 1: 校正根脚本执行顺序**

根`check`保持以下顺序：格式、Lint、类型、单元测试、契约测试、依赖边界、密钥、源码约束、构建。`test:integration`不放入日常快速`check`，但保留独立命令并在CI运行。

- [ ] **Step 2: 创建GitHub Actions检查流程**

`check.yml`必须：

1. 在`push`和`pull_request`触发。
2. 使用Windows或Ubuntu官方runner中的Ubuntu稳定环境。
3. checkout代码。
4. 安装Node.js 22.23.1并启用pnpm 10.33.2缓存。
5. 运行`pnpm install --frozen-lockfile`。
6. 运行`pnpm check`。
7. 运行`pnpm test:integration`。

不得使用`continue-on-error`，不得把失败步骤标记为允许失败。

- [ ] **Step 3: 执行本地完整门禁**

Run:

```powershell
pnpm format
pnpm check
pnpm test:integration
```

Expected: 所有命令退出码为0；集成测试实际执行API健康HTTP测试，不能因为“没有测试”而通过。

- [ ] **Step 4: 验证冷安装**

在仓库内只删除可恢复的`node_modules`，保留`pnpm-lock.yaml`，然后运行：

```powershell
pnpm install --frozen-lockfile
pnpm check
```

Expected: 冷安装和完整检查通过；不得删除或重建用户文档。执行删除前必须解析并确认目标严格等于`D:\AIcoder\remember-app\node_modules`及各workspace的`node_modules`。

- [ ] **Step 5: 更新README为真实状态**

README写明：

- 当前已实现API健康接口和Expo bundle基线。
- 当前尚未配置Java/Android SDK，未声称Android release构建成功。
- `pnpm check`和`pnpm test:integration`用途。
- 下一步是五项高风险技术验证，不是直接开发业务页面。

- [ ] **Step 6: 提交CI和完整门禁**

```powershell
git add .github/workflows/check.yml README.md package.json pnpm-lock.yaml
git commit -m "chore: 建立项目持续检查流程"
```

---

### Task 8: 第一阶段审查与交付门禁

**Files:**

- Modify only if findings require it: Task 1–7创建的文件
- Update: `docs/superpowers/plans/2026-07-26-project-foundation.md`

**Interfaces:**

- Consumes: 第一阶段全部提交。
- Produces: 可以进入五项技术验证阶段的工程基线，或一份明确阻塞清单。

- [ ] **Step 1: 检查工作区和提交历史**

Run:

```powershell
git status --short
git log --oneline --decorate -8
```

Expected: 工作区干净；每个提交只有一个目的，没有生成物、密钥或无关文件。

- [ ] **Step 2: 运行最终验证**

Run:

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm test:integration
pnpm --filter @remember/mobile exec expo-doctor
```

Expected: 四条命令退出码为0。不得把Java/Android原生构建列为已验证，因为本机工具链尚未安装。

- [ ] **Step 3: 审查最小代码和边界**

逐项确认：

- 没有`apps/admin`、`packages/domain`、`tools/pack-builder`或`infra`空壳。
- 没有Axios、状态管理、ORM、数据库、支付或云SDK依赖。
- 健康接口只返回契约定义内容，没有通用响应包装器、仓库层或数据库层。
- 移动端没有假知识库、假进度或假支付数据。
- contracts不依赖任何App；App之间互不导入。
- 所有文件和函数符合行数、命名、参数和注释规则。

- [ ] **Step 4: 独立上下文复审**

请求独立上下文AI按`docs/ai-rules/testing-and-review.md`检查：过度设计、依赖边界、门禁是否真失败、锁文件是否唯一、测试是否真实。发现P0/P1/P2必须修复并重新执行Step 2；P3修复或记录理由。

- [ ] **Step 5: 标记计划完成并提交文档状态**

只有前述命令真实通过后，勾选本计划已完成步骤并提交：

```powershell
git add docs/superpowers/plans/2026-07-26-project-foundation.md
git commit -m "docs: 记录项目基础阶段验收结果"
```

**阶段完成定义：** API健康接口可通过真实HTTP测试；Expo SDK 57 Android bundle可导出；根目录冷安装、完整检查和CI配置一致；已明确记录Java/Android SDK这一下一阶段前置缺口。
