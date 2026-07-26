# Build Learning App Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one tool-neutral AI coding standard, expose it through a validated Codex Skill, install the Skill into the personal Codex skill directory, and verify the repository and installed copies agree.

**Architecture:** The canonical rules live under `docs/ai-rules/`. The repository Skill is a concise router that locates the project root and loads only the rule files relevant to the current task. A PowerShell sync script copies the repository Skill into the personal Codex skill directory and supports a non-mutating consistency check. Cursor adapters are explicitly out of scope for this plan.

**Tech Stack:** Markdown, Codex Skill format, YAML, PowerShell, bundled Skill Creator Python utilities.

## Global Constraints

- Keep `docs/ai-rules/` as the only full rule source; do not duplicate full rules in `SKILL.md`.
- Use `FORBIDDEN`, `REQUIRED`, and `RECOMMENDED` with the approved promotion criteria.
- Put “minimum correct implementation” first in the review order.
- Use simple English identifiers and concise Chinese explanations.
- Do not create Cursor `.mdc` files in this plan.
- Do not create README, installation guide, changelog, icons, or unrelated files.
- The current workspace is not a valid Git repository, so do not add commit steps or claim commits were created.

---

## File Map

- `docs/ai-rules/core-rules.md`: rule levels, priority, minimum implementation, task workflow, dependencies, environment, and Git.
- `docs/ai-rules/code-shape.md`: file, function, naming, comments, React, state, async, and concurrency rules.
- `docs/ai-rules/boundaries.md`: Monorepo and within-module dependency directions.
- `docs/ai-rules/data-and-security.md`: contracts, databases, authentication, payment, pack validation, secrets, and logging.
- `docs/ai-rules/testing-and-review.md`: tests, AI review severity, forbidden promotion, and automated gates.
- `docs/ai-rules/words.md`: Chinese-to-simple-English project glossary.
- `skills/build-learning-app/SKILL.md`: Codex workflow and conditional rule routing.
- `skills/build-learning-app/agents/openai.yaml`: Codex UI metadata and implicit invocation policy.
- `tools/sync-codex-skill.ps1`: install and `-Check` consistency mode.
- `AGENTS.md`: short repository-level instruction pointing to architecture and AI rules.
- `docs/superpowers/specs/2026-07-26-ai-coding-skill-design.md`: corrected tool-neutral source and deferred Cursor scope.

### Task 1: Correct the approved design and write canonical rules

**Files:**

- Modify: `docs/superpowers/specs/2026-07-26-ai-coding-skill-design.md`
- Create: `docs/ai-rules/core-rules.md`
- Create: `docs/ai-rules/code-shape.md`
- Create: `docs/ai-rules/boundaries.md`
- Create: `docs/ai-rules/data-and-security.md`
- Create: `docs/ai-rules/testing-and-review.md`
- Create: `docs/ai-rules/words.md`

**Interfaces:**

- Consumes: approved design sections 1 through 27.
- Produces: six stable Markdown rule sources referenced by Codex and future Cursor adapters.

- [ ] **Step 1: Update the design source-of-truth section**

Replace the statement that `skills/build-learning-app/` owns the rules with the exact rule that `docs/ai-rules/` is canonical. State that Codex is implemented now and Cursor adapters are deferred.

- [ ] **Step 2: Write `core-rules.md`**

Include the trigger scope, precedence, three rule levels, minimum correct implementation, pnpm/ESM/dependency policy, environment policy, AI task sequence, parallel-edit restrictions, and Git policy.

- [ ] **Step 3: Write `code-shape.md`**

Include the approved 250/400 file thresholds, 40/80 function thresholds, 120-line React component threshold, three-parameter and three-depth limits, simple-English naming, comment rules, React separation, explicit states, timeout/cancel/retry rules, and bounded concurrency.

- [ ] **Step 4: Write `boundaries.md`**

Define the exact allowed dependency graph and the forbidden cross-app, direct-database, deep-import, circular, and framework-to-domain dependencies.

- [ ] **Step 5: Write `data-and-security.md`**

Include Zod as the contract source, Prisma/SQLite access boundaries, migration and deletion policy, transactions, server-authoritative authentication/payment/pack access, pack verification, secret handling, and error/log redaction.

- [ ] **Step 6: Write `testing-and-review.md`**

Include risk-based tests, real PostgreSQL integration tests, forbidden test shortcuts, P0-P3 findings, required review evidence, forbidden promotion criteria, and the root check commands.

- [ ] **Step 7: Write `words.md`**

Define at least these canonical terms: 学习包=`pack`, 卡片=`card`, 学习=`study`, 复习=`review`, 学习进度=`progress`, 学习任务=`study session`, 队列=`queue`, 购买权限=`pack access`, 订单=`order`, 支付=`payment`, 退款=`refund`, 同步=`sync`, 主设备=`main device`, 学习包清单=`pack manifest`, 知识ID=`knowledge id`.

- [ ] **Step 8: Verify canonical rule coverage**

Run:

```powershell
rg -n "最小正确实现|FORBIDDEN|pnpm|250|400|pack access|P0|Zod|主设备" docs/ai-rules
```

Expected: every search concept appears in the appropriate rule file, with no missing file.

### Task 2: Initialize and implement the Codex Skill

**Files:**

- Create: `skills/build-learning-app/SKILL.md`
- Create: `skills/build-learning-app/agents/openai.yaml`

**Interfaces:**

- Consumes: `docs/ai-rules/*.md` and the MVP architecture spec.
- Produces: `$build-learning-app`, implicitly triggered for implementation, review, testing, database, contract, dependency, and configuration work in this project.

- [ ] **Step 1: Initialize with Skill Creator**

Run:

```powershell
python C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\init_skill.py build-learning-app --path skills --interface 'display_name=Build Learning App' --interface 'short_description=用最少正确代码构建并审查本地学习应用' --interface 'default_prompt=Use $build-learning-app to implement and review this learning-app task with the project rules.'
```

Expected: the skill directory contains `SKILL.md` and `agents/openai.yaml` without optional resource directories.

- [ ] **Step 2: Replace the generated `SKILL.md`**

Use frontmatter with only:

```yaml
---
name: build-learning-app
description: Apply this project's AI coding rules when planning, implementing, modifying, testing, debugging, reviewing, or changing dependencies, configuration, database migrations, API contracts, learning-pack contracts, mobile code, API code, or admin code for the local learning application.
---
```

The body must instruct the agent to locate the repository root, read the architecture spec and `core-rules.md`, route to other rule files by touched path/risk, state the allowed paths and acceptance criteria, implement the minimum correct change, run available checks, inspect the diff, and report verification honestly.

- [ ] **Step 3: Verify `openai.yaml`**

Ensure quoted strings, a default prompt containing `$build-learning-app`, and:

```yaml
policy:
  allow_implicit_invocation: true
```

- [ ] **Step 4: Validate the repository Skill**

Run:

```powershell
python C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\quick_validate.py skills\build-learning-app
```

Expected: validation succeeds with exit code 0.

### Task 3: Add the repository entry and deterministic installer

**Files:**

- Create: `AGENTS.md`
- Create: `tools/sync-codex-skill.ps1`

**Interfaces:**

- Consumes: repository Skill at `skills/build-learning-app`.
- Produces: a short repository entry point and a command that installs or checks the personal copy.

- [ ] **Step 1: Write `AGENTS.md`**

Keep it short. Require `$build-learning-app` for code-related work, point to the architecture spec and `docs/ai-rules/`, forbid silent conflicts, and state that later nested `AGENTS.md` files may add but not weaken root rules.

- [ ] **Step 2: Write `sync-codex-skill.ps1`**

Define:

```powershell
param([switch]$Check)
```

Resolve the source relative to the script, resolve the destination from `$env:CODEX_HOME` or the user's `.codex\skills`, reject an empty/broad destination, and copy only `SKILL.md` and `agents/openai.yaml`. In `-Check` mode, compare SHA-256 hashes and exit nonzero on missing or different files without writing.

- [ ] **Step 3: Exercise the script against a workspace-local temporary destination**

Temporarily set `CODEX_HOME` to a directory under the workspace, run install, run `-Check`, modify a copied byte, and confirm `-Check` fails. Remove only that verified temporary directory afterward.

Expected: install succeeds, identical check succeeds, changed-copy check fails.

### Task 4: Install and verify the Codex Skill

**Files:**

- Install outside repository: personal Codex skills directory.

**Interfaces:**

- Consumes: validated repository Skill and sync script.
- Produces: an installed personal `$build-learning-app` Skill matching the repository copy.

- [ ] **Step 1: Install with explicit filesystem approval**

Run the sync script without `-Check`. Because this writes outside the workspace, request approval for the exact operation.

- [ ] **Step 2: Check installed-copy consistency**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\sync-codex-skill.ps1 -Check
```

Expected: exit code 0 and a message stating the installed copy matches.

- [ ] **Step 3: Validate the installed Skill**

Run the Skill Creator validator against the resolved installed directory.

Expected: validation succeeds with exit code 0.

- [ ] **Step 4: Perform static trigger review**

Confirm the description covers implementation, modification, testing, debugging, review, dependencies, configuration, migrations, API/pack contracts, mobile, API, and admin tasks. Confirm it excludes pure product/UI exploration.

- [ ] **Step 5: Report the reload boundary**

State that the files are installed and validated. If the current Codex task does not refresh its skill catalog dynamically, instruct the user to open a new task before relying on implicit invocation.

### Task 5: Final self-review

**Files:**

- Inspect all files created or modified by Tasks 1 through 4.

**Interfaces:**

- Consumes: completed artifacts.
- Produces: evidence that the Codex path is complete and Cursor remains untouched.

- [ ] **Step 1: Scan for placeholders and stale ownership text**

Run:

```powershell
rg -n "TBD|implement later|skills/build-learning-app.*唯一.*原件|\.cursor/rules" docs/ai-rules skills/build-learning-app AGENTS.md docs/superpowers/specs/2026-07-26-ai-coding-skill-design.md
```

Expected: no placeholder or stale ownership statement; Cursor may appear only as explicitly deferred scope.

- [ ] **Step 2: List final artifacts**

Run:

```powershell
rg --files docs/ai-rules skills/build-learning-app tools AGENTS.md
```

Expected: only the planned files plus pre-existing workspace files.

- [ ] **Step 3: Re-run both validators**

Run repository and installed Skill validation plus sync `-Check`.

Expected: all exit code 0.
