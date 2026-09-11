import { ReactNode } from "react";
import { BugType, ItemType, OnceDialogueId } from "@happy-little-bug-town/utils";

export type DialogueId =
  | OnceDialogueId
  | BugType
  | ItemType
  | "cannotBuild"
  | "cannotPlace"
  | "bricksProduction"
  | "cookingList"
  | "tavernList"
  | "smelter"
  | "flowersField";

export type CannotBuildReason = "noSpace";

export interface Dialogue {
  id: DialogueId;
  text: string;
  bugType?: BugType;
  cursorEntityId?: string;
  infographic?: ReactNode;
}
