import { BugType } from "@happy-little-bug-town/utils";

export type DialogueId = "hole" | "dugFirstItem" | "fly";

export interface Dialogue {
  id: DialogueId;
  text: string;
  bugType?: BugType;
  cursorEntityId?: string;
}
