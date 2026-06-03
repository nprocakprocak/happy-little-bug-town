import { Position } from "@happy-little-park/utils";

import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Structure } from "../types/structure";
import { apiFetch } from "./client";

export function fetchStructures(): Promise<Structure[]> {
  return apiFetch<Structure[]>("/api/structures");
}

export function createFirstStructure(): Promise<Structure> {
  return apiFetch<Structure>("/api/structures/create", {
    method: "POST",
  });
}

export function createStructure(
  data: Pick<Structure, "structureType" | "x" | "y">,
): Promise<Structure> {
  return apiFetch<Structure>("/api/structures", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStructurePosition(
  structureId: string,
  position: Position,
): Promise<Structure> {
  return apiFetch<Structure>(`/api/structures/${structureId}`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}

export function dig(): Promise<Item | Bug> {
  return apiFetch<Item | Bug>("/api/structures/dig", {
    method: "POST",
  });
}
