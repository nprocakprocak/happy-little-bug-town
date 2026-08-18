"use client";

import { useMemo, useState } from "react";
import { getUpgradeResourceCostsForType, hasStructureType } from "@happy-little-bug-town/utils";

import { UPGRADE_OPTIONS } from "../../../constants/ladybugUpgrade";
import { Structure } from "../../../types/structure";
import { structureTypeToName } from "../../helpers/getStructureName";
import { structureTypeToImage } from "../../helpers/itemTypeToImage";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

interface LadybugUpgradePopupContentProps {
  structures: Structure[];
  onClose: () => void;
}

export function LadybugUpgradePopupContent({
  structures,
  onClose,
}: LadybugUpgradePopupContentProps) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const carouselOptions = useMemo(
    () =>
      UPGRADE_OPTIONS.map((structure) => ({
        id: structure.id,
        imageSrc: structureTypeToImage(structure.structureType, true),
        label: structureTypeToName(structure.structureType),
      })),
    [],
  );
  const selectedStructure = UPGRADE_OPTIONS[selectedBuildingIndex];
  const selectedResourceCosts = getUpgradeResourceCostsForType(selectedStructure.structureType);
  const canUpgrade = hasStructureType(structures, selectedStructure.structureType);

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
      primaryLabel="Upgrade"
      onPrimaryClick={() => undefined}
      onClose={onClose}
      primaryDisabled={!canUpgrade}
    />
  );
}
