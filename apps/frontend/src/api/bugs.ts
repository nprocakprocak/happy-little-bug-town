import { Position } from "@happy-little-park/utils";

import { Bug } from "../types/bug";
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
