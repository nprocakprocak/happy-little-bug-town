"use client";

import { useMemo, useState } from "react";
import { canCreateToolType, getToolCraftCosts, ToolType } from "@happy-little-park/utils";

import { WORKSHOP_TOOL_OPTIONS } from "../constants/workshopTools";
import { Tool } from "../types/tool";
import { CarouselSlider } from "./CarouselSlider";
import { toolTypeToName } from "./helpers/getToolName";
import { toolTypeToImage } from "./helpers/toolTypeToImage";
import { SelectionPopupContent } from "./SelectionPopupContent";

interface WorkshopToolsPopupContentProps {
  onClose: () => void;
  onCreateTool: (toolType: ToolType) => void;
  tools: Tool[];
  isCreating?: boolean;
}

export function WorkshopToolsPopupContent({
  onClose,
  onCreateTool,
  tools,
  isCreating,
}: WorkshopToolsPopupContentProps) {
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const carouselOptions = useMemo(
    () =>
      WORKSHOP_TOOL_OPTIONS.map((tool) => ({
        id: tool.id,
        imageSrc: toolTypeToImage(tool.toolType),
        label: toolTypeToName(tool.toolType),
      })),
    [],
  );
  const selectedTool = WORKSHOP_TOOL_OPTIONS[selectedToolIndex];
  const selectedResourceCosts = getToolCraftCosts(selectedTool.toolType);
  const canCreate = canCreateToolType(tools, selectedTool.toolType);

  function handleCreateClick() {
    if (!canCreate) {
      return;
    }
    onCreateTool(selectedTool.toolType);
  }

  return (
    <SelectionPopupContent
      slider={
        <CarouselSlider
          options={carouselOptions}
          selectedIndex={selectedToolIndex}
          onSelectedIndexChange={setSelectedToolIndex}
          previousAriaLabel="Previous tool"
          nextAriaLabel="Next tool"
          selectAriaLabelPrefix="Select tool"
        />
      }
      resourceCosts={selectedResourceCosts}
      primaryLabel="Create"
      onPrimaryClick={handleCreateClick}
      onClose={onClose}
      primaryDisabled={isCreating || !canCreate}
    />
  );
}
