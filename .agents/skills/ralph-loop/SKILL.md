---
name: ralph-loop
description: Run long-running autonomous development loops. Automates complex multi-step software development by recursively picking single tasks from PRDs/task queues, executing with fresh context, committing, and repeating until completion.
---

# Ralph Loop — Autonomous Task Runner

The Ralph Loop pattern handles unattended, multi-step engineering tasks by isolating work into single-task cycles. Context and memory are persisted on disk (via git history and task files) rather than relying on bloated chat history.

## 4-Step Ralph Execution Loop

1. **Task Selection**: Read `.agent/tasks.json` or `prd.json`. Identify the next unfinished task with all prerequisites met.
2. **Implementation**: Execute that single task. Search existing code before creating new files. Keep modules under 300 lines.
3. **Verification**: Run unit/lint/type tests. Smoke test functionality.
4. **Commit & Exit**: Commit using conventional commit format (`feat:`, `fix:`, `refactor:`). Mark the task completed in the task file.
