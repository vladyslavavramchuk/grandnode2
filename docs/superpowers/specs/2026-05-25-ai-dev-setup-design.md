# AI-Assisted Development Setup — Design Spec

**Date:** 2026-05-25  
**Status:** Approved  
**Author:** Claude Code (Superpowers)

---

## Problem

The repository lacks the scaffolding needed for consistent, reproducible AI-assisted development. There are no shared permissions, no automated guardrails, no structured documentation path for decisions and feature specs, and no universal AI entry point for non-Claude tools.

## Goal

Initialize the repository with the minimum set of artifacts that enable:
1. Claude Code (primary) and other AI assistants (secondary) to operate effectively from a cold start
2. Automated build check before every commit
3. A durable, versioned record of architectural decisions
4. A consistent landing place for AI-generated feature specs

## Out of Scope

- Development guides (plugin authoring, testing strategy, MongoDB schema docs)
- CI/CD changes
- Any source code changes

---

## Artifacts

### 1. `.claude/settings.json`
Project-level Claude Code configuration committed to the repo (shared by all contributors).

**Permissions** — silently allow all commands needed for normal development:
- `Bash(dotnet:*)` — build, test, publish, run
- `Bash(npm:*)` — frontend build
- `Bash(git:*)` — all git operations
- `Bash(docker:*)` — MongoDB and container management
- `Bash(gh:*)` — pull request creation

**Pre-commit hook** — before every `git commit`, run:
```
dotnet build GrandNode.sln --configuration Release --no-restore
```
If the build fails, the commit is blocked and the error is shown. This catches broken code before it lands in the branch.

---

### 2. `AGENTS.md`
Universal AI entry point, readable by any AI assistant (Copilot, Cursor, Gemini, etc.).

Contents:
- One-paragraph project summary
- Key commands (build, test, run, frontend)
- Pointer to `CLAUDE.md` for Claude Code users (full architecture detail lives there)
- Pointer to `docs/adr/` for architectural decisions
- Pointer to `docs/superpowers/specs/` for feature specs
- Note on branch/PR convention (`ai-test/develop` base branch on `vladyslavavramchuk/grandnode2`)

---

### 3. `docs/adr/`
Architecture Decision Records — lightweight, numbered Markdown files that capture *why* things were built a certain way.

**`docs/adr/README.md`** — index file explaining the ADR convention and linking to each record.

**`docs/adr/template.md`** — standard ADR template:
- Title, Date, Status
- Context (what problem are we solving?)
- Decision (what did we choose?)
- Consequences (what does this mean going forward?)

**`docs/adr/0001-ai-assisted-development-setup.md`** — first ADR, documenting:
- Why Claude Code + Superpowers was chosen as the AI workflow
- Why `AGENTS.md` was added for tool-agnostic access
- Why the pre-commit build hook was chosen over a CI-only check

---

### 4. `docs/superpowers/specs/README.md`
Index for AI-generated feature specs. The Superpowers brainstorming skill auto-saves designs here as `YYYY-MM-DD-<topic>-design.md`. This README explains the convention so future sessions know what they're looking at.

---

### 5. `CLAUDE.md` updates
Two additions to the existing file:
- **AI Workflow section** — brief description of the brainstorm → plan → TDD → PR cycle
- **Docs section** — points to `docs/adr/` and `docs/superpowers/specs/`

---

### 6. `.gitignore` updates
Add one entry:
```
.claude/settings.local.json
```
Personal local overrides (model preferences, personal hooks) stay off the repo. The shared `settings.json` remains committed.

---

## File Dependency Order

1. Create `docs/` tree (no dependencies)
2. Create `.claude/settings.json` (no dependencies)
3. Create `AGENTS.md` (references docs paths — docs must exist first)
4. Update `CLAUDE.md` (references docs paths)
5. Update `.gitignore`
6. Commit everything in one atomic commit on a new branch → PR to `ai-test/develop`

---

## Success Criteria

- `git commit` while the solution is broken → commit is blocked with build error output
- A new AI assistant opening the repo sees `AGENTS.md` within seconds and knows where everything is
- A new feature brainstorm produces a spec that lands in `docs/superpowers/specs/` automatically
- Every significant architectural decision gets an ADR entry
