"use server";

import { revalidatePath } from "next/cache";
import { createNote, updateNote, removeNote } from "@/lib/data";
import { str, strOrNull } from "@/lib/form";

function parseNote(fd: FormData) {
  return {
    title: str(fd.get("title")),
    category: str(fd.get("category")) || "General",
    content: strOrNull(fd.get("content")),
  };
}

export async function createNoteAction(fd: FormData) {
  const data = parseNote(fd);
  if (!data.title) return;
  await createNote(data);
  revalidatePath("/notas");
}

export async function updateNoteAction(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const data = parseNote(fd);
  if (!data.title) return;
  await updateNote(id, data);
  revalidatePath("/notas");
}

export async function deleteNoteAction(id: number) {
  if (id) await removeNote(id);
  revalidatePath("/notas");
}
