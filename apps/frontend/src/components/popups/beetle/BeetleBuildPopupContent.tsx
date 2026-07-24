"use client";

import { useMemo, useState } from "react";
import {
  BuildableStructureType,
  getBuildResourceCostsForType,
  getBuildToolCostsForType,
  hasStructureType,
} from "@happy-little-bug-town/utils";

import { BUILDING_OPTIONS } from "../../../constants/beetleBuild";
import { Structure } from "../../../types/structure";
import { getStructureName } from "../../helpers/getStructureName";
import { structureTypeToImage } from "../../helpers/itemTypeToImage";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

interface BeetleBuildPopupContentProps {
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetleBuildPopupContent({
  structures,
  onClose,
  onBuild,
}: BeetleBuildPopupContentProps) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const carouselOptions = useMemo(
    () =>
      BUILDING_OPTIONS.map((structure) => ({
        id: structure.id,
        imageSrc: structureTypeToImage(structure.structureType),
        label: getStructureName(structure),
      })),
    [],
  );
  const selectedStructure = BUILDING_OPTIONS[selectedBuildingIndex];
  const selectedResourceCosts = getBuildResourceCostsForType(
    selectedStructure.structureType as BuildableStructureType,
  );
  const selectedToolCosts = getBuildToolCostsForType(
    selectedStructure.structureType as BuildableStructureType,
  );
  const canBuild = !hasStructureType(structures, selectedStructure.structureType);

  function handleBuildClick() {
    if (!canBuild) {
      return;
    }
    onBuild(selectedStructure);
  }

  return (
    <SelectionPopupContent
      slider={
        <CarouselSlider
          options={carouselOptions}
          selectedIndex={selectedBuildingIndex}
          onSelectedIndexChange={setSelectedBuildingIndex}
          previousAriaLabel="Previous building"
          nextAriaLabel="Next building"
          selectAriaLabelPrefix="Select building"
        />
      }
      itemCosts={selectedResourceCosts}
      toolCosts={selectedToolCosts}
      primaryLabel="Build"
      onPrimaryClick={handleBuildClick}
      onClose={onClose}
      primaryDisabled={!canBuild}
    />
  );
}
