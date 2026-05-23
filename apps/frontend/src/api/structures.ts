import { Position } from "../types/position";
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

export function updateStructurePosition(
  structureId: string,
  position: Position,
): Promise<Structure> {
  return apiFetch<Structure>(`/api/structures/${structureId}`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}
