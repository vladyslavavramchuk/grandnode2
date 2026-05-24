# AI-Assisted Development Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create all artifacts needed to fully initialize this repository for Claude Code + Superpowers-driven development, with an AGENTS.md universal entry point, docs/adr/ + docs/superpowers/specs/ structure, shared Claude Code permissions, and a pre-commit build guard.

**Architecture:** All artifacts are pure configuration and documentation — no source code changes. Files are created in dependency order: shared docs structure first, then Claude Code config, then universal entry point, then update existing files (CLAUDE.md, .gitignore). Everything lands in one branch and one PR.

**Tech Stack:** Claude Code settings.json (JSON), Python 3 (hook script), Markdown (all docs), Git

**Spec:** `docs/superpowers/specs/2026-05-25-ai-dev-setup-design.md`

---

### Task 1: Create `.claude/` directory and pre-commit hook script

**Files:**
- Create: `.claude/hooks/pre-commit-build.py`

The hook reads tool input from stdin as JSON. If the Bash command contains `git commit`, it runs `dotnet build`. Non-zero exit blocks the commit.

- [ ] **Step 1: Create the hooks directory**

```bash
mkdir -p .claude/hooks
```

- [ ] **Step 2: Write the hook script**

Create `.claude/hooks/pre-commit-build.py` with this exact content:

```python
#!/usr/bin/env python3
"""
Claude Code PreToolUse hook.
Blocks 'git commit' if dotnet build fails.
Receives Bash tool input on stdin as JSON: {"command": "..."}
Exit 0 = allow, non-zero = block.
"""
import sys
import json
import subprocess

data = json.load(sys.stdin)
command = data.get("command", "")

if "git commit" not in command:
    sys.exit(0)

print("Running pre-commit build check...")
result = subprocess.run(
    ["dotnet", "build", "GrandNode.sln", "-c", "Release", "--no-restore"],
    capture_output=False
)
sys.exit(result.returncode)
```

- [ ] **Step 3: Verify the script parses valid JSON without error**

```bash
echo '{"command":"git commit -m test"}' | python3 .claude/hooks/pre-commit-build.py
```
Expected: starts dotnet build (will fail or pass depending on build state, that's fine — the point is no Python error)

- [ ] **Step 4: Verify the script exits 0 for non-commit commands**

```bash
echo '{"command":"git status"}' | python3 .claude/hooks/pre-commit-build.py
echo $?
```
Expected output: `0`

---

### Task 2: Create `.claude/settings.json`

**Files:**
- Create: `.claude/settings.json`

- [ ] **Step 1: Write the settings file**

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(dotnet:*)",
      "Bash(npm:*)",
      "Bash(git:*)",
      "Bash(docker:*)",
      "Bash(gh:*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/pre-commit-build.py"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Validate JSON syntax**

```bash
python3 -c "import json; json.load(open('.claude/settings.json')); print('JSON valid')"
```
Expected: `JSON valid`

- [ ] **Step 3: Commit**

```bash
git add .claude/settings.json .claude/hooks/pre-commit-build.py
git commit -m "Add Claude Code settings with permissions and pre-commit build hook"
```

---

### Task 3: Create `AGENTS.md`

**Files:**
- Create: `AGENTS.md`

Universal AI entry point — readable by Copilot, Cursor, Gemini, and any other AI tool.

- [ ] **Step 1: Write AGENTS.md**

Create `AGENTS.md` at the repo root:

```markdown
# AGENTS.md

GrandNode2 is an open-source e-commerce platform built on ASP.NET Core 10 and MongoDB. It supports B2B/B2C, Multi-Store, Multi-Vendor, Multi-Tenant, Multi-Language, and Multi-Currency out of the box.

## Key Commands

```bash
# Build
dotnet restore GrandNode.sln
dotnet build GrandNode.sln --configuration Release

# Test (run per project)
dotnet test src/Tests/Grand.Business.Catalog.Tests/Grand.Business.Catalog.Tests.csproj
dotnet test src/Tests/Grand.Business.Checkout.Tests/Grand.Business.Checkout.Tests.csproj

# Run single test
dotnet test src/Tests/Grand.Business.Catalog.Tests --filter "FullyQualifiedName~MyTestClass"

# Frontend
cd src/Web/Grand.Web && npm install && npm run build

# Start MongoDB (required for integration tests and local run)
docker run -d -p 127.0.0.1:27017:27017 --name mongodb mongo
```

## For Claude Code Users

See **CLAUDE.md** for the full architecture reference: layers, patterns, CQRS, repository, plugin system, and configuration.

## Docs

| Path | Contents |
|------|----------|
| `docs/adr/` | Architecture Decision Records — why things were built the way they were |
| `docs/superpowers/specs/` | AI-generated feature design specs (Superpowers brainstorming output) |
| `docs/superpowers/plans/` | AI-generated implementation plans (Superpowers writing-plans output) |

## Branch & PR Convention

- All PRs target `ai-test/develop` on `vladyslavavramchuk/grandnode2`
- Commit messages: short one-liner, imperative form (`Add X`, `Fix Y`, `Update Z`)
```

- [ ] **Step 2: Verify the file exists and is non-empty**

```bash
python3 -c "content=open('AGENTS.md').read(); assert len(content) > 100, 'File too short'; print('AGENTS.md OK')"
```
Expected: `AGENTS.md OK`

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "Add AGENTS.md as universal AI entry point"
```

---

### Task 4: Create `docs/adr/` structure

**Files:**
- Create: `docs/adr/README.md`
- Create: `docs/adr/template.md`
- Create: `docs/adr/0001-ai-assisted-development-setup.md`

- [ ] **Step 1: Write `docs/adr/README.md`**

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for GrandNode2.

An ADR captures a significant architectural choice: what was decided, why, and what it means going forward. They are numbered sequentially and never deleted — superseded records are marked as such.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](0001-ai-assisted-development-setup.md) | AI-Assisted Development Setup | Accepted |

## Writing a New ADR

Copy `template.md`, name it `NNNN-short-title.md` (next number in sequence), fill it in, add it to the index above, and commit.
```

- [ ] **Step 2: Write `docs/adr/template.md`**

```markdown
# NNNN: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by [NNNN](NNNN-title.md)

## Context

What is the problem or situation that led to this decision? What forces are at play?

## Decision

What did we decide? State it as a clear, active-voice statement.

## Consequences

What happens as a result of this decision? Include both positive outcomes and trade-offs or new constraints introduced.
```

- [ ] **Step 3: Write `docs/adr/0001-ai-assisted-development-setup.md`**

```markdown
# 0001: AI-Assisted Development Setup

**Date:** 2026-05-25
**Status:** Accepted

## Context

This repository needed a structured way to run AI-assisted development workflows. Key questions:
- Which AI tool should be the primary driver?
- How do other tools (Copilot, Gemini, Cursor) get oriented in the repo?
- How do we prevent broken commits without requiring CI feedback loops?
- Where do AI-generated specs and decisions live so they accumulate value over time?

## Decision

We adopt **Claude Code + Superpowers** as the primary AI development environment for this repository.

- `.claude/settings.json` is committed to the repo so all contributors share the same permissions and hooks
- A pre-commit hook runs `dotnet build` before every `git commit` to block broken code at the source
- `AGENTS.md` is the universal entry point for any AI tool — it contains key commands and pointers to deeper docs
- `CLAUDE.md` remains the authoritative Claude Code reference for full architecture detail
- `docs/adr/` holds architectural decisions; `docs/superpowers/specs/` holds AI-generated feature designs; `docs/superpowers/plans/` holds implementation plans

## Consequences

- All contributors (human and AI) benefit from the shared permission set — no repeated approval prompts for standard commands
- Broken builds cannot be committed accidentally; the cost is a slightly longer commit step
- New AI sessions onboard in seconds via `AGENTS.md` without needing to read the full codebase
- Architectural decisions and feature specs accumulate in `docs/`, building a knowledge base over time
- `.claude/settings.local.json` is gitignored so personal preferences stay off the repo
```

- [ ] **Step 4: Verify all three files exist**

```bash
python3 -c "
import os
files = ['docs/adr/README.md','docs/adr/template.md','docs/adr/0001-ai-assisted-development-setup.md']
for f in files:
    assert os.path.exists(f), f'Missing: {f}'
    assert os.path.getsize(f) > 50, f'Too small: {f}'
print('All ADR files OK')
"
```
Expected: `All ADR files OK`

- [ ] **Step 5: Commit**

```bash
git add docs/adr/
git commit -m "Add ADR structure with template and ADR-0001"
```

---

### Task 5: Create `docs/superpowers/specs/README.md`

**Files:**
- Create: `docs/superpowers/specs/README.md`

- [ ] **Step 1: Write the README**

```markdown
# Feature Specs

This directory contains AI-generated feature design documents produced by the Superpowers brainstorming skill.

## Convention

Files are named `YYYY-MM-DD-<topic>-design.md` and created automatically when the brainstorming skill completes a design session. Each spec is committed before implementation begins.

## Index

| Date | Topic | Spec |
|------|-------|------|
| 2026-05-25 | AI-assisted development setup | [spec](2026-05-25-ai-dev-setup-design.md) |

## Adding an Entry

When a new spec is committed, add a row to the index above.
```

- [ ] **Step 2: Verify**

```bash
python3 -c "content=open('docs/superpowers/specs/README.md').read(); assert 'YYYY-MM-DD' in content; print('Specs README OK')"
```
Expected: `Specs README OK`

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/README.md
git commit -m "Add specs README with index convention"
```

---

### Task 6: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

Add two sections at the end: **AI Workflow** and **Docs**.

- [ ] **Step 1: Append sections to CLAUDE.md**

Add the following to the end of `CLAUDE.md`:

```markdown

## AI Workflow

This repository uses **Claude Code + Superpowers** for AI-assisted feature development. The standard cycle for any new feature:

1. **Brainstorm** (`superpowers:brainstorming`) — clarify requirements, propose approaches, produce a design spec saved to `docs/superpowers/specs/`
2. **Plan** (`superpowers:writing-plans`) — generate a step-by-step implementation plan saved to `docs/superpowers/plans/`
3. **Implement** (`superpowers:subagent-driven-development` or `superpowers:executing-plans`) — execute the plan task-by-task using TDD
4. **Review** (`superpowers:requesting-code-review`) — verify the implementation before merging
5. **Finish** (`superpowers:finishing-a-development-branch`) — create the PR targeting `ai-test/develop`

All PRs target the `ai-test/develop` branch on `vladyslavavramchuk/grandnode2`.

## Docs

| Path | Contents |
|------|----------|
| `docs/adr/` | Architecture Decision Records |
| `docs/superpowers/specs/` | AI-generated feature design specs |
| `docs/superpowers/plans/` | AI-generated implementation plans |
```

- [ ] **Step 2: Verify both sections landed**

```bash
python3 -c "
content = open('CLAUDE.md').read()
assert '## AI Workflow' in content, 'Missing AI Workflow section'
assert '## Docs' in content, 'Missing Docs section'
assert 'docs/adr/' in content, 'Missing ADR reference'
print('CLAUDE.md OK')
"
```
Expected: `CLAUDE.md OK`

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Add AI workflow and docs sections to CLAUDE.md"
```

---

### Task 7: Update `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append the Claude Code local settings entry**

Add to the end of `.gitignore`:

```
# Claude Code local overrides (personal preferences, stay off the repo)
.claude/settings.local.json
```

- [ ] **Step 2: Verify the entry is present**

```bash
python3 -c "content=open('.gitignore').read(); assert '.claude/settings.local.json' in content; print('.gitignore OK')"
```
Expected: `.gitignore OK`

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "Ignore .claude/settings.local.json"
```

---

### Task 8: Push branch and create PR

- [ ] **Step 1: Push all commits**

```bash
git push origin ai-test/init
```

- [ ] **Step 2: Create PR**

```bash
gh pr create \
  --repo vladyslavavramchuk/grandnode2 \
  --base ai-test/develop \
  --head ai-test/init \
  --title "Initialize repo for AI-assisted development" \
  --body "Adds Claude Code settings, AGENTS.md, ADR structure, spec/plan directories, and pre-commit build hook. See docs/superpowers/specs/2026-05-25-ai-dev-setup-design.md for full design."
```

- [ ] **Step 3: Verify PR was created**

Open the URL returned by the previous command and confirm:
- Base branch: `ai-test/develop`
- All 6 commits are listed
- No merge conflicts shown
