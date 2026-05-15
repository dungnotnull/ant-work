# DEVELOPMENT-LOGS.md

Development tracking for DYM Task & Log Work System.

## 2026-05-14 -- Project Kickoff

### Completed

- [x] Requirements gathering with tech lead
- [x] Design spec created at `docs/superpowers/specs/2026-05-14-task-log-work-design.md`
- [x] Project structure defined
- [x] Tech stack confirmed: Next.js 15 + MongoDB + Tailwind + shadcn/ui
- [x] CLAUDE.md project instructions created
- [x] PROJECT-DETAIL.md project overview created

### Key Decisions

- **Architecture:** Project-centric monolith (Approach A) -- projects contain full hierarchy, scoped to teams
- **Auth:** Simple email/password with @dymvietnam.net domain restriction, JWT in httpOnly cookies
- **Kanban:** 5 columns (Backlog, To Do, In Progress, In Review, Done), drag-and-drop with @dnd-kit
- **Daily Reports:** Copy-paste template (no file export), team summary view for admins/team leads
- **Performance:** Velocity, completion rate, on-time rate, SP accuracy, individual composite score
- **UI:** Modern flat design -- slate neutrals, indigo accent, Inter font, shadcn/ui components

### Design Decisions Log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Project-centric over Team-centric | Matches Jira mental model, simpler queries for reports/performance | 2026-05-14 |
| 2 | No file export for daily reports | User preference -- copy-paste template is sufficient | 2026-05-14 |
| 3 | Multi-assignee on tasks | Standard in Jira/Kanban, supports pair work | 2026-05-14 |
| 4 | Custom JWT auth (no library) | Keep dependencies minimal, simple requirements | 2026-05-14 |
| 5 | Mongoose singleton pattern | Serverless/edge compatibility for Next.js API routes | 2026-05-14 |

### Next Steps

- [x] Phase 1: Setup & Auth (Models, Login, Registration)
- [x] Phase 2: Core Task Management (Projects, Epics, Stories, Tasks, Rollup)
- [x] Phase 3: Kanban Board (Drag and drop with dnd-kit)
- [x] Phase 4: Work Logging & Daily Reports (Template generation, Team Summary)
- [x] Phase 5: Performance Metrics (Velocity, Individual composite scores)
- [x] Phase 6: Polish & Admin Pages (Teams, Users, Dashboard real data)
