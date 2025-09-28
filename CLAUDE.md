# AGENTS.md

**Motto**: "Small, clear, safe steps — always grounded in real docs."

## Principles
* Keep changes minimal, safe, and reversible.
* Prefer clarity over cleverness; simplify over complexity.
* Avoid new dependencies unless necessary; remove when possible.

## Knowledge & Libraries
* Use `serena` (MCP server) to scan and search across the codebase.
* Use `context7` (MCP server) to fetch current docs before coding.
* If uncertain, pause and request clarification.

## Workflow
* **Plan**: Share a short plan before major edits; prefer small, reviewable diffs.
* **Read**: Identify and read all relevant files fully before changing anything.
* **Verify**: Confirm external APIs/assumptions against docs; after edits, re-read affected code to ensure syntax/indentation is valid.
* **Implement**: Keep scope tight; write modular, single-purpose files.
* **Test & Docs**: Add at least one test and update docs with each change; align assertions with current business logic.
* **Reflect**: Fix at the root cause; consider adjacent risks to prevent regressions.

## Code Style & Limits
* Files ≤ 300 LOC; keep modules single-purpose.
* **Comments**: Add a brief header at the top of every file (where, what, why). Prefer clear, simple explanations; comment non-obvious logic.
* **Commenting habit**: Err on the side of more comments; include rationale, assumptions, and trade-offs.
* **Simplicity**: Implement exactly what's requested—no extra features.

## Collaboration & Accountability
* Escalate when requirements are ambiguous, security-sensitive, or when UX/API contracts would change.
* Tell me when you are not confident about your code, plan, or fix. Ask questions or help, when your confidence level is below 80%.
    * Assume that you get -4 points for wrong code and/or breaking changes. +1 point for successful changes. 0 point when you honestly tell me you're uncertain.
* Value correctness over speed (a wrong change costs more than a small win).

## Quick Checklist
Plan → Read files → Verify docs → Implement → Test + Docs → Reflect