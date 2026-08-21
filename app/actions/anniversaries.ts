"use server";

import { revalidatePath } from "next/cache";
import {
  createAnniversary,
  updateAnniversary,
  removeAnniversary,
} from "@/lib/data";
import { dateToIso } from "@/lib/datetime";
import { str, strOrNull, numOrNull } from "@/lib/form";

function parseAnniversary(fd: FormData) {
  return {
    name: str(fd.get("name")),
    date: dateToIso(fd.get("date")),
    type: (strOrNull(fd.get("type")) ?? "birthday") as
      | "birthday"
      | "anniversary"
      | "other",
    reminderMin: numOrNull(fd.get("reminderMin")),
  };
}

export async function createAnniversaryAction(fd: FormData) {
  const data = parseAnniversary(fd);
  if (!data.name || !data.date) return;
  await createAnniversary(data);
  revalidatePath("/cumpleanos");
}

export async function updateAnniversaryAction(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const data = parseAnniversary(fd);
  if (!data.name || !data.date) return;
  await updateAnniversary(id, data);
  revalidatePath("/cumpleanos");
}

export async function deleteAnniversaryAction(id: number) {
  if (id) await removeAnniversary(id);
  revalidatePath("/cumpleanos");
}
