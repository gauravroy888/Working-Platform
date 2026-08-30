---
name: obsidian_sync
description: Workflows for synchronizing code documentation, dev logs, architecture overviews, and feature specs from the CODE Message test project into Obsidian via the Obsidian MCP server.
---

# Obsidian Project Sync Skill for CODE Message Test

This skill enables seamless synchronization between the `CODE Message test` workspace (`Admin Portal` & `Student portal`) and your Obsidian Vault.

## Workflows

### 1. Dev Log Creation
When asked to create a dev log or log progress:
1. Summarize the changes made in `Admin Portal` or `Student portal`.
2. Format as an Obsidian note titled `Dev Log - YYYY-MM-DD`.
3. Include frontmatter:
   ```yaml
   ---
   project: CODE Message Test
   type: dev-log
   date: YYYY-MM-DD
   tags:
     - code-message-test
     - dev-log
   ---
   ```
4. Save note in `CODE Message Test/Dev Logs/` in Obsidian via MCP.

### 2. Architecture & Component Documentation
When asked to document a component or API:
1. Extract component structure, inputs/outputs, and data flow.
2. Link related sub-components using `[[WikiLink]]` syntax.
3. Save note in `CODE Message Test/Admin Portal/` or `CODE Message Test/Student Portal/`.

### 3. Architecture Decision Records (ADRs)
When recording a persistent architecture decision (e.g. React shell + HTML standalone embed, Aria bot singleton):
1. Format as an ADR note titled `ADR - [Decision Title]`.
2. Include: Status (Approved), Context, Decision, Consequences, and Invariants.
3. Sync to `EdTech Island/Architecture/` in Obsidian via MCP.
