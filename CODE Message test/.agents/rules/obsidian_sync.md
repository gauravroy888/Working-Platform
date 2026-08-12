# Obsidian Project Sync Guidelines for CODE Message Test

This rule governs how Antigravity synchronizes codebase knowledge, dev logs, architecture docs, and release notes from **CODE Message Test** (including `Admin Portal` and `Student portal`) directly into your Obsidian Vault via the **Obsidian MCP Server**.

## Key Principles
1. **Obsidian Formatting**:
   - Use Obsidian WikiLinks (`[[Note Name]]`) for internal cross-linking between notes and components.
   - Always include standard YAML frontmatter in generated notes:
     ```yaml
     ---
     project: CODE Message Test
     subproject: Admin Portal | Student portal | Shared
     date: YYYY-MM-DD
     tags:
       - code-message-test
       - dev-log
     status: active
     ---
     ```

2. **Tagging Structure**:
   - Primary project tag: `#code-message-test`
   - Sub-project tags: `#admin-portal`, `#student-portal`
   - Topic tags: `#architecture`, `#api-docs`, `#dev-log`, `#bug-fix`, `#feature-notes`

3. **Vault Folder Organization**:
   - Place project notes under `CODE Message Test/` root in Obsidian.
   - Store subproject details in `CODE Message Test/Admin Portal/` and `CODE Message Test/Student Portal/`.
   - Keep daily dev logs in `CODE Message Test/Dev Logs/`.

4. **Automatic Actions**:
   - Whenever asked to "document this feature", "log updates in Obsidian", "sync architecture", or "create dev notes", Antigravity will interact directly with your running Obsidian Vault using the `obsidian` MCP server.
