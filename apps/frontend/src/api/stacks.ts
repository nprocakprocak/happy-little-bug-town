import { Position } from "@happy-little-bug-town/utils";

import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { apiFetch } from "./client";

interface ExtractFromStackResult {
  extractedItem: Item;
  stackDissolved: boolean;
  releasedBugs: Bug[];
}

interface MergeStacksResult {
  stack: Stack;
  releasedBugs: Bug[];
}

export function fetchStacks(): Promise<Stack[]> {
  return apiFetch<Stack[]>("/api/stacks");
}

interface CreateStackInput {
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

export function mergeStacks(
  sourceStackId: string,
  targetStackId: string,
): Promise<MergeStacksResult> {
  return apiFetch<MergeStacksResult>(`/api/stacks/${sourceStackId}/merge`, {
    method: "POST",
    body: JSON.stringify({ targetStackId }),
  });
}
