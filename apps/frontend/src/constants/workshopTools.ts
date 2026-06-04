import { ToolType } from "@happy-little-park/utils";

export interface WorkshopToolOption {
  id: string;
  toolType: ToolType;
}

const WORKSHOP_TOOL_SLOT_COUNT = 5;

export const WORKSHOP_TOOL_OPTIONS: WorkshopToolOption[] = Array.from(
  { length: WORKSHOP_TOOL_SLOT_COUNT },
  (_, index) => ({
    id: `workshop-tool-option-${index}`,
    toolType: "leaf_rake",
  }),
);
