import { Bug } from "../types/bug";
import { Position } from "../types/position";
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
