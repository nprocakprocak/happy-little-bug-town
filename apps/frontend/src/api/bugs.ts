import { Position } from "@happy-little-bug-town/utils";

import { Bug } from "../types/bug";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { apiFetch } from "./client";

export function fetchBugs(): Promise<Bug[]> {
  return apiFetch<Bug[]>("/api/bugs");
}

export function updateBugPosition(bugId: string, position: Position): Promise<Bug> {
  return apiFetch<Bug>(`/api/bugs/${bugId}`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}

export function addBeetleToStructure(bugId: string, structureId: string): Promise<Structure> {
  return apiFetch<Structure>(`/api/bugs/${bugId}`, {
    method: "PUT",
    body: JSON.stringify({ structureId }),
  });
}

export function addBugToStack(bugId: string, stackId: string): Promise<Stack> {
  return apiFetch<Stack>(`/api/bugs/${bugId}`, {
    method: "PUT",
    body: JSON.stringify({ stackId }),
  });
}
