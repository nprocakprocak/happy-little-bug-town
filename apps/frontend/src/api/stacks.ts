import { Position } from "@happy-little-bug-town/utils";

import { ExtractFromStackResult } from "../types/extractFromStackResult";
import { Stack } from "../types/stack";
import { apiFetch } from "./client";

export function fetchStacks(): Promise<Stack[]> {
  return apiFetch<Stack[]>("/api/stacks");
}

export interface CreateStackInput {
  position: Position;
  itemIds: string[];
}

export function createStack(input: CreateStackInput): Promise<Stack> {
  return apiFetch<Stack>("/api/stacks", {
    method: "POST",
    body: JSON.stringify({
      x: input.position.x,
      y: input.position.y,
      itemIds: input.itemIds,
    }),
  });
}

export function updateStack(stackId: string, position: Position): Promise<Stack> {
  return apiFetch<Stack>(`/api/stacks/${stackId}`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}

export function extractItemFromStack(stackId: string): Promise<ExtractFromStackResult> {
  return apiFetch<ExtractFromStackResult>(`/api/stacks/${stackId}/extract`, {
    method: "POST",
  });
}

export function mergeStacks(sourceStackId: string, targetStackId: string): Promise<Stack> {
  return apiFetch<Stack>(`/api/stacks/${sourceStackId}/merge`, {
    method: "POST",
    body: JSON.stringify({ targetStackId }),
  });
}
