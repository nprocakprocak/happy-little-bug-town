import { BugType } from "@happy-little-bug-town/utils";

export interface Dialogue {
  text: string;
  bugType?: BugType;
  cursorEntityId?: string;
}
