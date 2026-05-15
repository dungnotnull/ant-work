import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Task from "@/models/Task";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

const PROVIDERS = [
  {
    name: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
  },
  {
    name: "openrouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
    model: "google/gemini-2.0-flash-001",
  },
];

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "change_task_status",
      description: "Change the status of a task on the kanban board",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The task ID" },
          new_status: {
            type: "string",
            enum: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
          },
        },
        required: ["task_id", "new_status"],
      },
    },
  },
];

const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

function buildSystemPrompt(
  projectName: string,
  tasks: Array<{ _id: string; title: string; status: string; assignees: Array<{ name: string }> }>
): string {
  const taskList = tasks
    .map((t) => `${t._id} | ${t.title} | ${t.status} | ${t.assignees.map((a) => a.name).join(", ")}`)
    .join("\n");

  return `You are AntAgent, a kanban board assistant for DYM AntWork. You help users change task statuses.

STRICT RULES:
- You can ONLY change task statuses. No other actions.
- Valid statuses: Backlog, To Do, In Progress, In Review, Done
- You MUST use the change_task_status tool to change any status
- If a user asks you to do anything else (create tasks, delete tasks, modify other fields), politely refuse
- Respond in the same language the user writes in (English or Vietnamese)

BOARD CONTEXT:
Project: ${projectName}
Tasks:
${taskList}

When a user asks to change a status, find the matching task by title or ID and call the tool.`;
}

async function callLLM(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
) {
  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  for (const provider of PROVIDERS) {
    if (!provider.key) continue;
    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: fullMessages,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) {
        console.warn(`Provider ${provider.name} failed: ${res.status}`);
        continue;
      }

      return await res.json();
    } catch (err) {
      console.warn(`Provider ${provider.name} error:`, err);
      continue;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(session.userId)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const { message, projectId } = await request.json();
    if (!message || !projectId) {
      return NextResponse.json(
        { success: false, error: "Message and projectId required" },
        { status: 400 }
      );
    }

    await connectDB();

    const tasks = await Task.find({ project: projectId })
      .populate("assignees", "name")
      .select("_id title status assignees")
      .lean();

    const systemPrompt = buildSystemPrompt(
      projectId,
      tasks.map((t) => ({
        _id: t._id.toString(),
        title: t.title,
        status: t.status,
        assignees: (t.assignees as Array<{ name: string }>).map((a) => ({ name: a.name })),
      }))
    );

    const llmResponse = await callLLM(
      [{ role: "user", content: message }],
      systemPrompt
    );

    if (!llmResponse) {
      return NextResponse.json({
        success: true,
        reply: "Sorry, I'm unable to process your request right now. Please try again.",
      });
    }

    const choice = llmResponse.choices?.[0];
    if (!choice) {
      return NextResponse.json({
        success: true,
        reply: "I couldn't understand your request. Could you rephrase?",
      });
    }

    const toolCalls = choice.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      if (toolCall.function.name === "change_task_status") {
        const args = JSON.parse(toolCall.function.arguments);
        const { task_id, new_status } = args as { task_id: string; new_status: string };

        if (!TASK_STATUSES.includes(new_status as TaskStatus)) {
          return NextResponse.json({
            success: true,
            reply: `Invalid status "${new_status}". Valid statuses: ${TASK_STATUSES.join(", ")}`,
          });
        }

        const task = await Task.findOne({ _id: task_id, project: projectId });
        if (!task) {
          return NextResponse.json({
            success: true,
            reply: "Task not found in this project. Please check the task name or ID.",
          });
        }

        const oldStatus = task.status;
        if (oldStatus === new_status) {
          return NextResponse.json({
            success: true,
            reply: `Task "${task.title}" is already in ${new_status} status.`,
          });
        }

        task.status = new_status as TaskStatus;
        await task.save();

        return NextResponse.json({
          success: true,
          reply: `Moved "${task.title}" from ${oldStatus} to ${new_status}.`,
          action: {
            taskId: task._id.toString(),
            taskTitle: task.title,
            oldStatus,
            newStatus: new_status,
          },
        });
      }
    }

    const reply = choice.message?.content || "I'm not sure how to help with that.";
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("AntAgent error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
