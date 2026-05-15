# PROJECT-DETAIL.md

## Project Overview

**Name:** DYM Task & Log Work System
**Purpose:** Internal project management and work logging tool for DYM Vietnam
**Start Date:** 2026-05-14
**Status:** Planning

## Problem Statement

Teams at DYM Vietnam need a lightweight tool to track project tasks, log daily work, and measure performance. Full Jira is overkill -- this project delivers the essential features: hierarchy-based task management, Kanban visualization, daily report templates, and performance metrics.

## Scope

### In Scope

1. **User Management** -- Registration (restricted to @dymvietnam.net), login, roles (Admin / Team Lead / Member)
2. **Team Management** -- Create teams, assign members, designate team leads
3. **Project Management** -- CRUD projects scoped to teams
4. **Work Item Hierarchy** -- Epic -> Story -> Task -> Sub-task with story points
5. **Kanban Board** -- Drag-and-drop board per project with 5 columns
6. **Multi-Assignee** -- Tasks assignable to multiple people
7. **Work Logging** -- Log hours and descriptions against tasks
8. **Daily Report** -- Auto-generated copy-paste template from work logs
9. **Team Summary** -- Admin/team lead view of all daily reports
10. **Performance Metrics** -- Velocity, completion rate, on-time rate, individual score

### Out of Scope

- File attachments on tasks
- Comments / activity feed
- Notifications (email, push)
- Time tracking timer (start/stop)
- Sprint management
- Custom workflows
- Integrations with external tools
- Mobile app
- Multi-language support

## User Roles

| Role | Capabilities |
|------|-------------|
| Admin | Manage all teams, users, roles. View all reports and performance. |
| Team Lead | Manage own team's projects. View team summary and performance. |
| Member | Log work, update own tasks, view own daily report and performance. |

## Kanban Columns

1. Backlog
2. To Do
3. In Progress
4. In Review
5. Done

## Performance Metrics

| Metric | Description |
|--------|-------------|
| Velocity | Story points completed per week/month |
| Completion Rate | Completed tasks / total assigned tasks |
| On-time Rate | Tasks done by due date / completed tasks |
| SP Accuracy | Estimated vs actual story points |
| Individual Score | Composite: 50% completion + 30% on-time + 20% velocity consistency |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui |
| Data Fetching | TanStack React Query v5 |
| Backend | Next.js API Routes (monolithic) |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs (custom, no library) |
| Validation | Zod |
| Drag & Drop | @dnd-kit/core |
| Charts | recharts |
| Data Utils | lodash, date-fns |

## Key Design Decisions

1. **Monolithic architecture** -- no separate backend, API routes handle everything
2. **Project-centric model** -- projects contain all work, scoped to teams
3. **JWT in httpOnly cookies** -- secure, no localStorage
4. **React Query for data fetching** -- caching, deduplication, mutations with optimistic updates
5. **Story point rollup** -- epic/Story points auto-calculated from children
6. **Simple role system** -- 3 roles, no custom permissions
7. **Copy-paste daily report** -- no file export, template generated for clipboard

## Milestones

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Auth, Users, Teams | Planning |
| Phase 2 | Projects, Work Items, Hierarchy | Planning |
| Phase 3 | Kanban Board, Drag & Drop | Planning |
| Phase 4 | Work Logging, Daily Reports | Planning |
| Phase 5 | Performance Metrics, Charts | Planning |
| Phase 6 | Polish, Testing, Deploy | Planning |
