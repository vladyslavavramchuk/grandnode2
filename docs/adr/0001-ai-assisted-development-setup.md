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
