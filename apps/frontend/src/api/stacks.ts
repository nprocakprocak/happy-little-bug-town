import { Item } from "../types/item";
import { Position } from "../types/position";
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
  return apiFetch<Stack>("/api/stacks/create", {
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

export function extractItemFromStack(stackId: string): Promise<Item> {
  return apiFetch<Item>(`/api/stacks/${stackId}/extract`, {
    method: "POST",
  });
}

export function mergeStacks(sourceStackId: string, targetStackId: string): Promise<Stack> {
  return apiFetch<Stack>(`/api/stacks/${sourceStackId}/merge`, {
    method: "POST",
    body: JSON.stringify({ targetStackId }),
  });
}
