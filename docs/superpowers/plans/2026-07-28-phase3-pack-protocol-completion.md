# 阶段 3 完成摘要（学习包协议）

日期：2026-07-28  
基线：`main` @ `16d62ca`  
收口分支：`chore/phase3-closeout`

## 交付物

| 产出                   | 路径                                                 |
| ---------------------- | ---------------------------------------------------- |
| ADR                    | `docs/decisions/0008-pack-protocol.md`               |
| Zod 契约 + 验包        | `packages/contracts/src/pack/`                       |
| 构建/校验 CLI          | `tools/pack-builder/`                                |
| 固定测试包             | `tools/pack-builder/fixtures/remember-test-pack.zip` |
| 移动端验包模块（保留） | `apps/mobile/src/pack/verify-bundled-pack.ts`        |

## 退出门禁

- 构建：`pnpm --filter @remember/pack-builder build:pack`
- 校验：`pnpm --filter @remember/pack-builder verify:fixture`
- 负例：`pnpm --filter @remember/pack-builder test`（5 类）
- 实机：release APK，`packId=remember-test-pack`，cards=2，lexicon=13，forms=0，**pass**

## 收口变更

- 删除临时 UI：`pack-spike.tsx`、`pack-spike-screen.tsx`、首页验收按钮
- 验收清单 §3.1–3.5 已勾选；§4.5 点词改为直查 `lexicon_entries.surfaceForm`
- pack 验签链安全审查见 ADR 0008 附录「审查记录」

## 验证命令（收口时）

```powershell
pnpm check
pnpm --filter @remember/contracts test
pnpm --filter @remember/pack-builder test
pnpm --filter @remember/mobile typecheck
```

## 下一阶段

阶段 4：user.sqlite、包安装流程、SM-2 与学习闭环（**不在本收口范围**）。
