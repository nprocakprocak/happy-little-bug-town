"use client";

import { useMemo, useState } from "react";
import {
  BUILDABLE_STRUCTURE_TYPES,
  BuildableStructureType,
  getBuildResourceCostsForType,
  hasStructureType,
} from "@happy-little-bug-town/utils";

import { Structure } from "../../../types/structure";
import { structureTypeToImage } from "../../helpers/structureImages";
import { getStructureName } from "../../helpers/structureName";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

const BUILDING_OPTIONS: Structure[] = BUILDABLE_STRUCTURE_TYPES.map<Structure>((structureType) => ({
  id: `build-option-${structureType}`,
  x: 0,
  y: 0,
  structureType,
  upgradeLevel: 0,
  items: [],
  bugs: [],
}));

interface BeetleBuildPopupContentProps {
  structures: Structure[];
  buildingOptions?: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetleBuildPopupContent({
  structures,
  buildingOptions = BUILDING_OPTIONS,
  onClose,
  onBuild,
}: BeetleBuildPopupContentProps) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const carouselOptions = useMemo(
    () =>
      buildingOptions.map((structure) => ({
        id: structure.id,
        imageSrc: structureTypeToImage(structure.structureType),
        label: getStructureName(structure),
      })),
    [buildingOptions],
  );
  const selectedStructure = buildingOptions[selectedBuildingIndex];
  const selectedResourceCosts = getBuildResourceCostsForType(
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
      primaryLabel="Build"
      onPrimaryClick={handleBuildClick}
      onClose={onClose}
      primaryDisabled={!canBuild}
    />
  );
}
