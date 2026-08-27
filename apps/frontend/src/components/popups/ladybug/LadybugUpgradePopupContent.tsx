"use client";

import { useMemo, useState } from "react";
import {
  canStartStructureUpgradeToLevel,
  getUpgradeResourceCostsForType,
} from "@happy-little-bug-town/utils";

import { UPGRADE_OPTIONS } from "../../../constants/ladybugUpgrade";
import { Structure } from "../../../types/structure";
import { structureTypeToName } from "../../helpers/getStructureName";
import { structureTypeToImage } from "../../helpers/itemTypeToImage";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

interface LadybugUpgradePopupContentProps {
  structures: Structure[];
  onClose: () => void;
  onUpgrade: (structure: Structure) => void;
}

export function LadybugUpgradePopupContent({
  structures,
  onClose,
  onUpgrade,
}: LadybugUpgradePopupContentProps) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const carouselOptions = useMemo(
    () =>
      UPGRADE_OPTIONS.map((structure) => ({
        id: structure.id,
        imageSrc: structureTypeToImage(structure.structureType, structure.upgradeLevel),
        label: structureTypeToName(structure.structureType),
      })),
    [],
  );
  const selectedOption = UPGRADE_OPTIONS[selectedBuildingIndex];
  const existingStructure = structures.find(
    (structure) => structure.structureType === selectedOption.structureType,
  );
  const selectedResourceCosts = getUpgradeResourceCostsForType(
    selectedOption.structureType,
    selectedOption.upgradeLevel,
  );
  const canUpgrade = existingStructure
    ? canStartStructureUpgradeToLevel(existingStructure, selectedOption.upgradeLevel)
    : false;

  function handleUpgradeClick() {
    if (!existingStructure || !canUpgrade) {
      return;
    }
    onUpgrade(existingStructure);
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
      primaryLabel="Upgrade"
      onPrimaryClick={handleUpgradeClick}
      onClose={onClose}
      primaryDisabled={!canUpgrade}
    />
  );
}
