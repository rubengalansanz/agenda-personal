"use server";

import { revalidatePath } from "next/cache";
import {
  createProject,
  updateProject,
  removeProject,
  createPlannerItem,
  updatePlannerItem,
  removePlannerItem,
} from "@/lib/data";
import { dateToIso } from "@/lib/datetime";
import { str, strOrNull, numOrNull } from "@/lib/form";

function parseProject(fd: FormData) {
  return {
    name: str(fd.get("name")),
    description: strOrNull(fd.get("description")),
    startDate: dateToIso(fd.get("startDate")),
    targetDate: dateToIso(fd.get("targetDate")),
    status: (strOrNull(fd.get("status")) ?? "active") as
      | "planning"
      | "active"
      | "done"
      | "archived",
    color: strOrNull(fd.get("color")) ?? "#3b82f6",
  };
}

function parseItem(fd: FormData) {
  const projectId = Number(fd.get("projectId"));
  return {
    projectId,
    title: str(fd.get("title")),
    startDate: dateToIso(fd.get("startDate")),
    dueDate: dateToIso(fd.get("dueDate")),
    status: (strOrNull(fd.get("status")) ?? "todo") as
      | "todo"
      | "in_progress"
      | "done",
    progress: numOrNull(fd.get("progress")) ?? 0,
    priority: numOrNull(fd.get("priority")) ?? 2,
    notes: strOrNull(fd.get("notes")),
  };
}

export async function createProjectAction(fd: FormData) {
  const data = parseProject(fd);
  if (!data.name) return;
  await createProject(data);
  revalidatePath("/planner");
}

export async function updateProjectAction(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const data = parseProject(fd);
  if (!data.name) return;
  await updateProject(id, data);
  revalidatePath("/planner");
}

export async function deleteProjectAction(id: number) {
  if (id) await removeProject(id);
  revalidatePath("/planner");
}

export async function createPlannerItemAction(fd: FormData) {
  const data = parseItem(fd);
  if (!data.title || !data.projectId) return;
  await createPlannerItem(data);
  revalidatePath("/planner");
}

export async function updatePlannerItemAction(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const data = parseItem(fd);
  if (!data.title) return;
  await updatePlannerItem(id, data);
  revalidatePath("/planner");
}

export async function deletePlannerItemAction(id: number) {
  if (id) await removePlannerItem(id);
  revalidatePath("/planner");
}
