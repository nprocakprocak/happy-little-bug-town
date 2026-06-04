import { ToolType } from "@happy-little-park/utils";

export interface WorkshopToolOption {
  id: string;
  toolType: ToolType;
}

const WORKSHOP_TOOL_TYPES: ToolType[] = ["leaf_rake", "shovel"];

export const WORKSHOP_TOOL_OPTIONS: WorkshopToolOption[] = WORKSHOP_TOOL_TYPES.map((toolType) => ({
  id: `workshop-tool-option-${toolType}`,
  toolType,
}));
