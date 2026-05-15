import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";

interface NetworkNode {
  id: string;
  type: "user" | "project";
  name: string;
  role?: string;
  teamName?: string;
  taskCount: number;
}

interface NetworkLink {
  source: string;
  target: string;
  taskCount: number;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const [tasks, users, projects] = await Promise.all([
      Task.find().populate("assignees", "name role").populate("project", "name team").lean(),
      User.find().select("name role").lean(),
      Project.find().populate("team", "name").select("name team").lean(),
    ]);

    const userTaskCounts = new Map<string, number>();
    const projectTaskCounts = new Map<string, number>();
    const linkCounts = new Map<string, number>();

    for (const task of tasks) {
      const projectId = (task.project as any)?._id?.toString() ?? task.project?.toString();
      if (projectId) {
        projectTaskCounts.set(projectId, (projectTaskCounts.get(projectId) ?? 0) + 1);
      }

      const assignees = (task as any).assignees ?? [];
      for (const assignee of assignees) {
        const userId = assignee._id?.toString();
        if (!userId) continue;
        userTaskCounts.set(userId, (userTaskCounts.get(userId) ?? 0) + 1);

        if (projectId) {
          const key = `${userId}-${projectId}`;
          linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
        }
      }
    }

    const nodes: NetworkNode[] = [];

    for (const user of users) {
      const uid = (user as any)._id.toString();
      nodes.push({
        id: uid,
        type: "user",
        name: user.name,
        role: user.role,
        taskCount: userTaskCounts.get(uid) ?? 0,
      });
    }

    for (const project of projects) {
      const pid = (project as any)._id.toString();
      nodes.push({
        id: pid,
        type: "project",
        name: project.name,
        teamName: (project.team as any)?.name ?? "",
        taskCount: projectTaskCounts.get(pid) ?? 0,
      });
    }

    const links: NetworkLink[] = [];
    for (const [key, count] of linkCounts.entries()) {
      const [userId, projectId] = key.split("-");
      links.push({ source: userId, target: projectId, taskCount: count });
    }

    return NextResponse.json({ success: true, data: { nodes, links } });
  } catch (error) {
    console.error("Workload network error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
