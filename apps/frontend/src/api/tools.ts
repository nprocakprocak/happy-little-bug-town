import { Position } from "@happy-little-park/utils";

import { Tool } from "../types/tool";
import { apiFetch } from "./client";

export function fetchTools(): Promise<Tool[]> {
  return apiFetch<Tool[]>("/api/tools");
}

export function createTool(data: Pick<Tool, "toolType"> & Position): Promise<Tool> {
  return apiFetch<Tool>("/api/tools/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateToolPosition(toolId: string, position: Position): Promise<Tool> {
  return apiFetch<Tool>(`/api/tools/${toolId}`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}
