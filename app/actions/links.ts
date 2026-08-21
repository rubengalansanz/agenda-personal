"use server";

import {
  getLinkedRecords,
  addLink,
  removeLink,
  searchRecords,
  type LinkedRecord,
} from "@/lib/data";
import type { RecordType } from "@/db/schema";

export async function listLinkedRecordsAction(
  sourceType: RecordType,
  sourceId: number,
): Promise<LinkedRecord[]> {
  return getLinkedRecords(sourceType, sourceId);
}

export async function searchRecordsAction(
  type: RecordType,
  query: string,
): Promise<{ id: number; title: string }[]> {
  return searchRecords(type, query);
}

export async function addLinkAction(input: {
  sourceType: RecordType;
  sourceId: number;
  targetType: RecordType;
  targetId: number;
  note?: string;
}): Promise<void> {
  if (input.sourceId === input.targetId && input.sourceType === input.targetType) {
    return;
  }
  await addLink(input);
}

export async function removeLinkAction(id: number): Promise<void> {
  await removeLink(id);
}
