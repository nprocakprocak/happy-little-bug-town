import { Bug } from "../types/bug";
import { DemolishStructureResult } from "../types/demolishStructureResult";
import { Item } from "../types/item";
import { Structure } from "../types/structure";
import { apiFetch } from "./client";

interface ExtractOccupantResult {
  extractedOccupant: Bug;
  structure: Structure;
  generated: boolean;
}

interface CraftOperationalResourceResult {
  item?: Item;
  bug?: Bug;
  structure: Structure;
}

export function fetchStructures(): Promise<Structure[]> {
  return apiFetch<Structure[]>("/api/structures");
}

export function createFirstStructure(): Promise<Structure> {
  return apiFetch<Structure>("/api/structures/bootstrap", {
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

export function updateStructure(
  structureId: string,
  data: Partial<Pick<Structure, "x" | "y" | "upgradeLevel">>,
): Promise<Structure> {
  return apiFetch<Structure>(`/api/structures/${structureId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function dig(structureId: string): Promise<Item | Bug> {
  return apiFetch<Item | Bug>(`/api/structures/${structureId}/dig`, {
    method: "POST",
  });
}

export function extractOccupant(structureId: string): Promise<ExtractOccupantResult> {
  return apiFetch<ExtractOccupantResult>(`/api/structures/${structureId}/extract-occupant`, {
    method: "POST",
  });
}

export function craftOperationalResource(
  structureId: string,
): Promise<CraftOperationalResourceResult> {
  return apiFetch<CraftOperationalResourceResult>(`/api/structures/${structureId}/craft`, {
    method: "POST",
  });
}

export function evolveStructure(structureId: string): Promise<Structure> {
  return apiFetch<Structure>(`/api/structures/${structureId}/evolve`, {
    method: "POST",
  });
}

export function demolishStructure(structureId: string): Promise<DemolishStructureResult> {
  return apiFetch<DemolishStructureResult>(`/api/structures/${structureId}/demolish`, {
    method: "POST",
  });
}
