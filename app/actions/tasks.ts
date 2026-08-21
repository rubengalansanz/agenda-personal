"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTask, removeTask } from "@/lib/data";
import { dateToIso } from "@/lib/datetime";
import { str, strOrNull, numOrNull } from "@/lib/form";

function parseTask(fd: FormData) {
  const title = str(fd.get("title"));
  return {
    title,
    notes: strOrNull(fd.get("notes")),
    startDate: dateToIso(fd.get("startDate")),
    dueDate: dateToIso(fd.get("dueDate")),
    priority: numOrNull(fd.get("priority")) ?? 2,
    status: (strOrNull(fd.get("status")) ?? "pending") as "pending" | "done",
    category: str(fd.get("category")) || "General",
  };
}

export async function createTaskAction(fd: FormData) {
  const data = parseTask(fd);
  if (!data.title) return;
  await createTask(data);
  revalidatePath("/tareas");
}

export async function updateTaskAction(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const data = parseTask(fd);
  if (!data.title) return;
  await updateTask(id, data);
  revalidatePath("/tareas");
}

export async function deleteTaskAction(id: number) {
  if (id) await removeTask(id);
  revalidatePath("/tareas");
}
