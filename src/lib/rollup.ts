import Story from "@/models/Story";
import Task from "@/models/Task";
import SubTask from "@/models/SubTask";
import Epic from "@/models/Epic";
import { sumBy } from "lodash";

export async function rollupTask(taskId: string): Promise<number> {
  const subtasks = await SubTask.find({ task: taskId }).lean();
  const total = sumBy(subtasks, "storyPoints");
  await Task.findByIdAndUpdate(taskId, { storyPoints: total });
  return total;
}

export async function rollupStory(storyId: string): Promise<number> {
  const tasks = await Task.find({ story: storyId }).lean();
  const total = sumBy(tasks, "storyPoints");
  await Story.findByIdAndUpdate(storyId, { storyPoints: total });
  return total;
}

export async function rollupEpic(epicId: string): Promise<number> {
  const stories = await Story.find({ epic: epicId }).lean();
  const total = sumBy(stories, "storyPoints");
  await Epic.findByIdAndUpdate(epicId, { storyPoints: total });
  return total;
}

export async function rollupFromTask(taskId: string): Promise<void> {
  const task = await Task.findById(taskId).lean();
  if (!task) return;
  await rollupTask(taskId);
  await rollupStory(task.story.toString());
  const story = await Story.findById(task.story).lean();
  if (story) {
    await rollupEpic(story.epic.toString());
  }
}

export async function rollupFromStory(storyId: string): Promise<void> {
  await rollupStory(storyId);
  const story = await Story.findById(storyId).lean();
  if (story) {
    await rollupEpic(story.epic.toString());
  }
}
