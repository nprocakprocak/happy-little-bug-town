import { BugType, ItemType, OnceDialogueId } from "@happy-little-bug-town/utils";

export type DialogueId = OnceDialogueId | "fly" | ItemType;

export interface Dialogue {
  id: DialogueId;
  text: string;
  bugType?: BugType;
  cursorEntityId?: string;
}
