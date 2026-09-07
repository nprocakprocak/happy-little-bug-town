import { OnceDialogueId } from "@happy-little-bug-town/utils";

import { apiFetch } from "./client";

export function fetchVisitedDialogues(): Promise<OnceDialogueId[]> {
  return apiFetch<OnceDialogueId[]>("/api/dialogues");
}

export function markDialogueVisited(dialogueId: OnceDialogueId): Promise<OnceDialogueId[]> {
  return apiFetch<OnceDialogueId[]>("/api/dialogues", {
    method: "POST",
    body: JSON.stringify({ dialogueId }),
  });
}
