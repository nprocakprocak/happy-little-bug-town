import { Position } from "@happy-little-park/utils";

import { Bug } from "../types/bug";
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
