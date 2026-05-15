import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Team from "@/models/Team";
import Project from "@/models/Project";
import Epic from "@/models/Epic";
import Story from "@/models/Story";
import Task from "@/models/Task";
import SubTask from "@/models/SubTask";
import WorkLog from "@/models/WorkLog";
import Comment from "@/models/Comment";
import TimeSession from "@/models/TimeSession";

export async function POST(request: Request) {
  try {
    await connectDB();

    // 1. Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Epic.deleteMany({}),
      Story.deleteMany({}),
      Task.deleteMany({}),
      SubTask.deleteMany({}),
      WorkLog.deleteMany({}),
      Comment.deleteMany({}),
      TimeSession.deleteMany({}),
    ]);

    const { Types } = await import("mongoose");
    const dummyLead = new Types.ObjectId();

    // 2. Create Teams
    const teamAlpha = await Team.create({ name: "Alpha Team", description: "Core product development", lead: dummyLead });
    const teamBeta = await Team.create({ name: "Beta Team", description: "Internal tools and platforms", lead: dummyLead });

    // 3. Create Users
    const password = await bcrypt.hash("password", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@dymvietnam.net",
      password,
      role: "Admin",
      team: teamAlpha._id,
    });

    const lead = await User.create({
      name: "Lead Engineer",
      email: "lead@dymvietnam.net",
      password,
      role: "Team Lead",
      team: teamAlpha._id,
    });

    const dev1 = await User.create({
      name: "John Developer",
      email: "john@dymvietnam.net",
      password,
      role: "Member",
      team: teamAlpha._id,
    });

    const dev2 = await User.create({
      name: "Jane Engineer",
      email: "jane@dymvietnam.net",
      password,
      role: "Member",
      team: teamBeta._id,
    });

    await Team.findByIdAndUpdate(teamAlpha._id, { lead: lead._id, members: [admin._id, lead._id, dev1._id] });
    await Team.findByIdAndUpdate(teamBeta._id, { lead: dev2._id, members: [dev2._id] });

    // 4. Create Projects
    const project1 = await Project.create({
      name: "Task & Log Work System",
      description: "Internal task management tool for DYM Vietnam",
      team: teamAlpha._id,
      createdBy: admin._id,
    });

    const project2 = await Project.create({
      name: "Mobile App v2",
      description: "Next-gen mobile application with React Native",
      team: teamAlpha._id,
      createdBy: lead._id,
    });

    const project3 = await Project.create({
      name: "DevOps Pipeline",
      description: "CI/CD infrastructure and monitoring dashboard",
      team: teamBeta._id,
      createdBy: admin._id,
    });

    // 5. Create Epics
    const epic1 = await Epic.create({
      title: "Phase 1: Authentication & Users",
      description: "Set up JWT auth, users, and teams.",
      status: "Done",
      priority: "High",
      project: project1._id,
      createdBy: lead._id,
    });

    const epic2 = await Epic.create({
      title: "Phase 2: Project Hierarchy",
      description: "Implement Projects, Epics, Stories, and Tasks.",
      status: "In Progress",
      priority: "High",
      project: project1._id,
      createdBy: lead._id,
    });

    const epic3 = await Epic.create({
      title: "Phase 3: Reporting & Analytics",
      description: "Daily reports, performance metrics, and charts.",
      status: "To Do",
      priority: "Medium",
      project: project1._id,
      createdBy: lead._id,
    });

    const epic4 = await Epic.create({
      title: "App Redesign",
      description: "Modern UI overhaul for mobile app.",
      status: "In Progress",
      priority: "High",
      project: project2._id,
      createdBy: lead._id,
    });

    // 6. Create Stories
    const story1 = await Story.create({
      title: "Implement JWT authentication",
      description: "Use jose for edge-compatible JWT.",
      status: "Done",
      epic: epic1._id,
      project: project1._id,
      createdBy: lead._id,
    });

    const story2 = await Story.create({
      title: "Build Kanban Board APIs",
      description: "Create endpoints for columns.",
      status: "In Progress",
      epic: epic2._id,
      project: project1._id,
      createdBy: lead._id,
    });

    const story3 = await Story.create({
      title: "Daily Report Generator",
      description: "Auto-generate standup report templates.",
      status: "To Do",
      epic: epic3._id,
      project: project1._id,
      createdBy: lead._id,
    });

    const story4 = await Story.create({
      title: "Mobile Navigation",
      description: "Bottom tab navigation with gestures.",
      status: "In Progress",
      epic: epic4._id,
      project: project2._id,
      createdBy: lead._id,
    });

    const story5 = await Story.create({
      title: "CI/CD Foundation",
      description: "Build and deployment pipeline setup.",
      status: "In Progress",
      epic: epic2._id,
      project: project3._id,
      createdBy: admin._id,
    });

    const story6 = await Story.create({
      title: "Monitoring & Alerts",
      description: "Service health monitoring and alerting.",
      status: "To Do",
      epic: epic3._id,
      project: project3._id,
      createdBy: admin._id,
    });

    // 7. Create Tasks with estimateHours, reviewer, notes
    const today = new Date();
    const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000);
    const daysFromNow = (n: number) => new Date(today.getTime() + n * 86400000);

    const task1 = await Task.create({
      title: "Set up Next.js Middleware",
      description: "Protect routes using middleware.",
      status: "Done",
      priority: "High",
      storyPoints: 5,
      assignees: [admin._id, lead._id],
      story: story1._id,
      project: project1._id,
      createdBy: lead._id,
      createdAt: daysAgo(25),
      startDate: daysAgo(20),
      dueDate: daysAgo(10),
      estimateHours: 8,
      reviewer: lead._id,
      notes: "Uses jose library for JWT verification. Cookie-based auth. Need to ensure edge runtime compatibility.",
    });

    const task2 = await Task.create({
      title: "Design Board Schema",
      description: "Design MongoDB aggregation for board.",
      status: "Done",
      priority: "Medium",
      storyPoints: 3,
      assignees: [admin._id, dev2._id],
      story: story2._id,
      project: project1._id,
      createdBy: lead._id,
      createdAt: daysAgo(18),
      startDate: daysAgo(14),
      dueDate: daysAgo(7),
      estimateHours: 4,
      reviewer: admin._id,
      notes: "Aggregation pipeline should group by status efficiently. Consider indexing status field.",
    });

    const task3 = await Task.create({
      title: "Implement Drag and Drop",
      description: "Use @dnd-kit for drag and drop.",
      status: "In Progress",
      priority: "High",
      storyPoints: 8,
      assignees: [admin._id, dev1._id],
      story: story2._id,
      project: project1._id,
      createdBy: lead._id,
      createdAt: daysAgo(5),
      startDate: daysAgo(3),
      dueDate: daysFromNow(3),
      estimateHours: 16,
      reviewer: lead._id,
      notes: "Use PointerSensor with 5px activation distance. SortableContext with vertical strategy per column.",
    });

    const task4 = await Task.create({
      title: "Report Template Engine",
      description: "Generate daily report from work logs.",
      status: "In Progress",
      priority: "Medium",
      storyPoints: 5,
      assignees: [admin._id],
      story: story3._id,
      project: project1._id,
      createdBy: lead._id,
      createdAt: daysAgo(8),
      startDate: daysAgo(5),
      dueDate: daysFromNow(5),
      estimateHours: 10,
      reviewer: lead._id,
      notes: "",
    });

    const task5 = await Task.create({
      title: "Performance Charts",
      description: "Implement velocity and completion charts.",
      status: "To Do",
      priority: "Medium",
      storyPoints: 8,
      assignees: [admin._id, dev2._id],
      story: story3._id,
      project: project1._id,
      createdBy: lead._id,
      createdAt: daysAgo(3),
      startDate: daysAgo(1),
      dueDate: daysFromNow(7),
      estimateHours: 12,
      reviewer: lead._id,
      notes: "Use Recharts for visualization. Need velocity line chart and completion donut.",
    });

    const task6 = await Task.create({
      title: "API Rate Limiting",
      description: "Add rate limiting middleware to API routes.",
      status: "Backlog",
      priority: "Low",
      storyPoints: 3,
      assignees: [lead._id],
      story: story2._id,
      project: project1._id,
      createdBy: admin._id,
      createdAt: daysAgo(15),
      startDate: daysAgo(10),
      estimateHours: 6,
      notes: "Consider using Redis for rate limit storage in production.",
    });

    const task7 = await Task.create({
      title: "Mobile Tab Navigation",
      description: "Build bottom tab navigator with animations.",
      status: "In Progress",
      priority: "High",
      storyPoints: 5,
      assignees: [admin._id, dev1._id],
      story: story4._id,
      project: project2._id,
      createdBy: lead._id,
      createdAt: daysAgo(10),
      startDate: daysAgo(7),
      dueDate: daysFromNow(2),
      estimateHours: 8,
      reviewer: lead._id,
      notes: "",
    });

    const task8 = await Task.create({
      title: "Gesture Handler",
      description: "Implement swipe gestures for navigation.",
      status: "To Do",
      priority: "Medium",
      storyPoints: 5,
      assignees: [dev1._id],
      story: story4._id,
      project: project2._id,
      createdBy: lead._id,
      createdAt: daysAgo(2),
      startDate: daysAgo(1),
      dueDate: daysFromNow(10),
      estimateHours: 6,
      reviewer: admin._id,
    });

    const task9 = await Task.create({
      title: "CI/CD Pipeline Setup",
      description: "Configure GitHub Actions for auto-deploy.",
      status: "Done",
      priority: "High",
      storyPoints: 8,
      assignees: [admin._id, dev2._id],
      story: story5._id,
      project: project3._id,
      createdBy: admin._id,
      createdAt: daysAgo(28),
      startDate: daysAgo(22),
      dueDate: daysAgo(14),
      estimateHours: 14,
      reviewer: admin._id,
      notes: "Multi-stage pipeline: lint -> test -> build -> deploy. Uses Docker containers.",
    });

    const task10 = await Task.create({
      title: "Monitoring Dashboard",
      description: "Set up Grafana dashboards for services.",
      status: "In Review",
      priority: "High",
      storyPoints: 13,
      assignees: [admin._id, dev2._id],
      story: story6._id,
      project: project3._id,
      createdBy: admin._id,
      createdAt: daysAgo(12),
      startDate: daysAgo(8),
      dueDate: daysFromNow(1),
      estimateHours: 16,
      reviewer: lead._id,
      notes: "Prometheus + Grafana stack. Alert rules for CPU, memory, and error rate thresholds.",
    });

    const task11 = await Task.create({
      title: "User Registration Flow",
      description: "Complete registration with email validation.",
      status: "Done",
      priority: "High",
      storyPoints: 5,
      assignees: [admin._id, lead._id],
      story: story1._id,
      project: project1._id,
      createdBy: admin._id,
      createdAt: daysAgo(30),
      startDate: daysAgo(25),
      dueDate: daysAgo(12),
      estimateHours: 6,
      reviewer: admin._id,
    });

    const task12 = await Task.create({
      title: "Database Backup Strategy",
      description: "Implement automated backup with retention policy.",
      status: "To Do",
      priority: "High",
      storyPoints: 5,
      assignees: [admin._id],
      story: story5._id,
      project: project3._id,
      createdBy: admin._id,
      createdAt: daysAgo(6),
      startDate: daysAgo(4),
      dueDate: daysFromNow(4),
      estimateHours: 8,
      reviewer: lead._id,
      notes: "Daily full backup + hourly incremental. 30-day retention policy.",
    });

    // 8. Create SubTasks
    await SubTask.create({ title: "Research libraries", status: "Done", storyPoints: 2, assignee: dev1._id, task: task3._id, project: project1._id, createdBy: lead._id });
    await SubTask.create({ title: "Create DragContext", status: "In Progress", storyPoints: 3, assignee: dev1._id, task: task3._id, project: project1._id, createdBy: lead._id });
    await SubTask.create({ title: "Droppable Columns", status: "To Do", storyPoints: 3, assignee: dev1._id, task: task3._id, project: project1._id, createdBy: lead._id });
    await SubTask.create({ title: "Design tab layout", status: "Done", storyPoints: 2, assignee: dev1._id, task: task7._id, project: project2._id, createdBy: lead._id });
    await SubTask.create({ title: "Implement transitions", status: "In Progress", storyPoints: 3, assignee: dev1._id, task: task7._id, project: project2._id, createdBy: lead._id });

    // 9. Create Comments
    const comments = [
      { task: task3._id, user: lead._id, content: "Looks good so far. Make sure to handle the edge case where a task is dragged to the same column.", createdAt: daysAgo(2) },
      { task: task3._id, user: dev1._id, content: "Working on the DragOverlay component. Should have a PR up by tomorrow.", createdAt: daysAgo(1) },
      { task: task10._id, user: dev2._id, content: "Grafana dashboards are configured. Need to add alert thresholds.", createdAt: daysAgo(3) },
      { task: task10._id, user: admin._id, content: "Great progress on the monitoring setup. Let's review the alert rules together.", createdAt: daysAgo(2) },
      { task: task10._id, user: lead._id, content: "Please ensure we have coverage for all critical services.", createdAt: daysAgo(1) },
      { task: task4._id, user: admin._id, content: "Template engine is taking shape. Should support both text and HTML output.", createdAt: daysAgo(4) },
      { task: task7._id, user: dev1._id, content: "Tab animations are smooth on iOS. Testing Android next.", createdAt: daysAgo(2) },
      { task: task1._id, user: lead._id, content: "Middleware is working well. Edge runtime compatible.", createdAt: daysAgo(11) },
      { task: task9._id, user: dev2._id, content: "Pipeline runs in under 5 minutes now. Nice improvement.", createdAt: daysAgo(15) },
      { task: task5._id, user: admin._id, content: "Will start on this after the report template is done.", createdAt: daysAgo(1) },
      { task: task12._id, user: admin._id, content: "Researching mongodump vs mongorestore approaches.", createdAt: daysAgo(0.5) },
      { task: task2._id, user: dev2._id, content: "Aggregation pipeline tested with 10k documents. Response time under 100ms.", createdAt: daysAgo(8) },
      { task: task8._id, user: dev1._id, content: "Looking at react-native-gesture-handler for this.", createdAt: daysAgo(3) },
      { task: task11._id, user: lead._id, content: "Registration flow tested end-to-end. All validations working.", createdAt: daysAgo(13) },
      { task: task6._id, user: lead._id, content: "Will prioritize this after current sprint items.", createdAt: daysAgo(5) },
      { task: task3._id, user: admin._id, content: "Optimistic updates are working. Added revert on failure.", createdAt: daysAgo(0.5) },
      { task: task7._id, user: lead._id, content: "Remember to test with RTL layouts.", createdAt: daysAgo(1) },
      { task: task4._id, user: lead._id, content: "Can we add support for custom report templates?", createdAt: daysAgo(1) },
      { task: task10._id, user: dev2._id, content: "Added Slack webhook integration for critical alerts.", createdAt: daysAgo(0.5) },
      { task: task12._id, user: lead._id, content: "Make sure backup encryption is enabled at rest.", createdAt: daysAgo(0.2) },
    ];
    await Comment.create(comments);

    // 10. Create TimeSessions (mix of stopped sessions with duration)
    const timeSessions = [
      { task: task3._id, user: admin._id, status: "stopped", startTime: daysAgo(0.1), endTime: daysAgo(0.05), durationMs: 1800000, totalPausedMs: 0 },
      { task: task3._id, user: dev1._id, status: "stopped", startTime: daysAgo(1.2), endTime: daysAgo(1), durationMs: 7200000, totalPausedMs: 600000 },
      { task: task10._id, user: dev2._id, status: "stopped", startTime: daysAgo(2.1), endTime: daysAgo(2), durationMs: 3600000, totalPausedMs: 0 },
      { task: task10._id, user: admin._id, status: "stopped", startTime: daysAgo(3.3), endTime: daysAgo(3), durationMs: 10800000, totalPausedMs: 1800000 },
      { task: task7._id, user: dev1._id, status: "stopped", startTime: daysAgo(4.2), endTime: daysAgo(4), durationMs: 5400000, totalPausedMs: 300000 },
      { task: task4._id, user: admin._id, status: "stopped", startTime: daysAgo(5.1), endTime: daysAgo(5), durationMs: 9000000, totalPausedMs: 1200000 },
      { task: task9._id, user: dev2._id, status: "stopped", startTime: daysAgo(7.2), endTime: daysAgo(7), durationMs: 7200000, totalPausedMs: 600000 },
      { task: task1._id, user: admin._id, status: "stopped", startTime: daysAgo(10.1), endTime: daysAgo(10), durationMs: 5400000, totalPausedMs: 0 },
      { task: task5._id, user: admin._id, status: "stopped", startTime: daysAgo(8.1), endTime: daysAgo(8), durationMs: 3600000, totalPausedMs: 0 },
      { task: task12._id, user: admin._id, status: "stopped", startTime: daysAgo(0.3), endTime: daysAgo(0.2), durationMs: 2400000, totalPausedMs: 300000 },
    ];
    await TimeSession.create(timeSessions);

    // 11. Create WorkLogs for activity heatmap data (past 90 days)
    const logEntries = [
      { task: task1._id, user: admin._id, project: project1._id, hours: 3, description: "Implemented middleware logic", date: daysAgo(1) },
      { task: task3._id, user: admin._id, project: project1._id, hours: 4, description: "Started drag and drop integration", date: daysAgo(1) },
      { task: task2._id, user: admin._id, project: project1._id, hours: 2, description: "Reviewed board schema", date: daysAgo(2) },
      { task: task7._id, user: admin._id, project: project2._id, hours: 3, description: "Tab navigation component", date: daysAgo(2) },
      { task: task4._id, user: admin._id, project: project1._id, hours: 5, description: "Report template logic", date: daysAgo(3) },
      { task: task10._id, user: admin._id, project: project3._id, hours: 4, description: "Grafana setup", date: daysAgo(4) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 2, description: "Middleware tests", date: daysAgo(5) },
      { task: task9._id, user: admin._id, project: project3._id, hours: 6, description: "Pipeline configuration", date: daysAgo(6) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 3, description: "Registration flow fixes", date: daysAgo(7) },
      { task: task3._id, user: admin._id, project: project1._id, hours: 4, description: "Drag and drop continued", date: daysAgo(8) },
      { task: task2._id, user: admin._id, project: project1._id, hours: 3, description: "Board schema optimization", date: daysAgo(10) },
      { task: task7._id, user: admin._id, project: project2._id, hours: 5, description: "Mobile nav design", date: daysAgo(12) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 4, description: "Middleware implementation", date: daysAgo(14) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 3, description: "Registration validation", date: daysAgo(16) },
      { task: task9._id, user: admin._id, project: project3._id, hours: 5, description: "GitHub Actions workflow", date: daysAgo(18) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 2, description: "Code review", date: daysAgo(20) },
      { task: task2._id, user: admin._id, project: project1._id, hours: 3, description: "Aggregation queries", date: daysAgo(22) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 4, description: "Email validation", date: daysAgo(25) },
      { task: task9._id, user: admin._id, project: project3._id, hours: 6, description: "Docker configuration", date: daysAgo(28) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 3, description: "Auth module setup", date: daysAgo(30) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 2, description: "Password hashing", date: daysAgo(33) },
      { task: task2._id, user: admin._id, project: project1._id, hours: 4, description: "Schema design review", date: daysAgo(36) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 5, description: "JWT integration", date: daysAgo(40) },
      { task: task9._id, user: admin._id, project: project3._id, hours: 3, description: "Pipeline testing", date: daysAgo(45) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 4, description: "Registration API", date: daysAgo(50) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 3, description: "Route protection", date: daysAgo(55) },
      { task: task2._id, user: admin._id, project: project1._id, hours: 2, description: "MongoDB queries", date: daysAgo(60) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 5, description: "User model creation", date: daysAgo(65) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 4, description: "Cookie handling", date: daysAgo(70) },
      { task: task9._id, user: admin._id, project: project3._id, hours: 6, description: "Deployment config", date: daysAgo(75) },
      { task: task1._id, user: admin._id, project: project1._id, hours: 3, description: "Auth middleware", date: daysAgo(80) },
      { task: task11._id, user: admin._id, project: project1._id, hours: 2, description: "Zod schemas", date: daysAgo(85) },
    ];

    const otherLogs = [
      { task: task3._id, user: dev1._id, project: project1._id, hours: 5, description: "DnD library integration", date: daysAgo(1) },
      { task: task3._id, user: dev1._id, project: project1._id, hours: 4, description: "Sortable context", date: daysAgo(3) },
      { task: task7._id, user: dev1._id, project: project2._id, hours: 3, description: "Tab animations", date: daysAgo(5) },
      { task: task3._id, user: dev1._id, project: project1._id, hours: 6, description: "Drag overlay", date: daysAgo(8) },
      { task: task7._id, user: dev1._id, project: project2._id, hours: 4, description: "Gesture support", date: daysAgo(12) },
      { task: task3._id, user: dev1._id, project: project1._id, hours: 3, description: "Drop target logic", date: daysAgo(15) },
      { task: task7._id, user: dev1._id, project: project2._id, hours: 5, description: "Navigation state", date: daysAgo(20) },
      { task: task3._id, user: dev1._id, project: project1._id, hours: 4, description: "Card component", date: daysAgo(25) },
      { task: task2._id, user: dev2._id, project: project1._id, hours: 3, description: "Aggregation pipeline", date: daysAgo(2) },
      { task: task10._id, user: dev2._id, project: project3._id, hours: 5, description: "Prometheus setup", date: daysAgo(4) },
      { task: task2._id, user: dev2._id, project: project1._id, hours: 4, description: "Board API endpoints", date: daysAgo(7) },
      { task: task10._id, user: dev2._id, project: project3._id, hours: 6, description: "Dashboard widgets", date: daysAgo(10) },
      { task: task9._id, user: dev2._id, project: project3._id, hours: 4, description: "YAML pipeline", date: daysAgo(15) },
      { task: task10._id, user: dev2._id, project: project3._id, hours: 3, description: "Alert rules", date: daysAgo(20) },
      { task: task2._id, user: dev2._id, project: project1._id, hours: 5, description: "Query optimization", date: daysAgo(30) },
      { task: task1._id, user: lead._id, project: project1._id, hours: 3, description: "Code review", date: daysAgo(3) },
      { task: task3._id, user: lead._id, project: project1._id, hours: 2, description: "Architecture review", date: daysAgo(6) },
      { task: task7._id, user: lead._id, project: project2._id, hours: 4, description: "PR review", date: daysAgo(10) },
      { task: task1._id, user: lead._id, project: project1._id, hours: 5, description: "Middleware review", date: daysAgo(15) },
      { task: task11._id, user: lead._id, project: project1._id, hours: 3, description: "Security review", date: daysAgo(20) },
      { task: task9._id, user: lead._id, project: project3._id, hours: 4, description: "Pipeline design", date: daysAgo(25) },
    ];

    await WorkLog.create([...logEntries, ...otherLogs]);

    // Trigger rollup
    const { rollupFromTask, rollupFromStory } = await import("@/lib/rollup");
    await rollupFromStory(story1._id.toString());
    await rollupFromStory(story2._id.toString());
    await rollupFromStory(story3._id.toString());
    await rollupFromStory(story4._id.toString());
    await rollupFromStory(story5._id.toString());
    await rollupFromStory(story6._id.toString());
    await rollupFromTask(task3._id.toString());
    await rollupFromTask(task7._id.toString());

    return NextResponse.json({
      success: true,
      message: "Database seeded with rich demo data including comments, time sessions, and efficiency data!",
      credentials: [
        { email: "admin@dymvietnam.net", password: "password", role: "Admin" },
        { email: "lead@dymvietnam.net", password: "password", role: "Team Lead" },
        { email: "john@dymvietnam.net", password: "password", role: "Member" },
        { email: "jane@dymvietnam.net", password: "password", role: "Member" },
      ],
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
