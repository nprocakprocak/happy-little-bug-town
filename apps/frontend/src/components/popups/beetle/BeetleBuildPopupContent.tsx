"use client";

import { useMemo, useState } from "react";
import {
  BuildableStructureType,
  getBuildResourceCostsForType,
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
