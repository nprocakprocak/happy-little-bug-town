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
