import { Mine } from "../types/mine";
import { apiFetch } from "./client";

export function fetchMines(): Promise<Mine[]> {
  return apiFetch<Mine[]>("/api/mines");
}

export function createFirstMine(): Promise<Mine> {
  return apiFetch<Mine>("/api/mines/create", {
    method: "POST",
  });
}
