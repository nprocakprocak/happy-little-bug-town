import { BugType, ItemType } from "@happy-little-bug-town/utils";

export type DialogueId = "hole" | "dugFirstItem" | "dugFirstBeetle" | "fly" | ItemType;

export interface Dialogue {
  id: DialogueId;
  text: string;
  bugType?: BugType;
  cursorEntityId?: string;
}
