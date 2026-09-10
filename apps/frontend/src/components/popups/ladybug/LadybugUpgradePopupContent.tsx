"use client";

import { useMemo, useState } from "react";
import {
  canStartStructureUpgradeToLevel,
  getCompletedUpgradeLevel,
  getStructureUpgradeLevels,
  getUpgradeResourceCostsForType,
  UPGRADABLE_STRUCTURE_TYPES,
} from "@happy-little-bug-town/utils";

import { Structure } from "../../../types/structure";
import { structureTypeToImage } from "../../helpers/structureImages";
import { structureTypeToName } from "../../helpers/structureName";
import { CarouselSlider } from "../../ui/CarouselSlider";
import { SelectionPopupContent } from "../shared/SelectionPopupContent";

const UPGRADE_LEVELS = Array.from(
  new Set(UPGRADABLE_STRUCTURE_TYPES.flatMap(getStructureUpgradeLevels)),
).sort((left, right) => left - right);

const WORKSHOP_UPGRADE_LEVELS = getStructureUpgradeLevels("workshop");
const WORKSHOP_HIGHEST_UPGRADE_LEVEL = WORKSHOP_UPGRADE_LEVELS[WORKSHOP_UPGRADE_LEVELS.length - 1];

const UPGRADE_OPTIONS_BY_LEVEL = UPGRADE_LEVELS.flatMap((upgradeLevel) =>
  UPGRADABLE_STRUCTURE_TYPES.filter((structureType) =>
    getStructureUpgradeLevels(structureType).includes(upgradeLevel),
  ).map((structureType) => ({
    id: `upgrade-option-${structureType}-${upgradeLevel}`,
    structureType,
    upgradeLevel,
  })),
);

const UPGRADE_OPTIONS = [
  ...UPGRADE_OPTIONS_BY_LEVEL.filter(
    (option) =>
      option.structureType !== "workshop" || option.upgradeLevel !== WORKSHOP_HIGHEST_UPGRADE_LEVEL,
  ),
  ...UPGRADE_OPTIONS_BY_LEVEL.filter(
    (option) =>
      option.structureType === "workshop" && option.upgradeLevel === WORKSHOP_HIGHEST_UPGRADE_LEVEL,
  ),
];

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
  const isAlreadyUpgraded = existingStructure
    ? getCompletedUpgradeLevel(existingStructure) >= selectedOption.upgradeLevel
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
      primaryLabel={isAlreadyUpgraded ? "Already upgraded" : "Upgrade"}
      onPrimaryClick={handleUpgradeClick}
      onClose={onClose}
      primaryDisabled={!canUpgrade}
    />
  );
}
