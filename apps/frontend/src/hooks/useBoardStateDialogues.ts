import { useEffect } from "react";

import { findAnthillOnBoard } from "../components/helpers/dialogues/findAnthillOnBoard";
import { findBrickOnBoard } from "../components/helpers/dialogues/findBrickOnBoard";
import { findBuiltAxeOnBoard } from "../components/helpers/dialogues/findBuiltAxeOnBoard";
import { findBuiltBeetleHouseOnBoard } from "../components/helpers/dialogues/findBuiltBeetleHouseOnBoard";
import { findBuiltComposterOnBoard } from "../components/helpers/dialogues/findBuiltComposterOnBoard";
import { findBuiltFarmOnBoard } from "../components/helpers/dialogues/findBuiltFarmOnBoard";
import { findBuiltKitchenOnBoard } from "../components/helpers/dialogues/findBuiltKitchenOnBoard";
import { findBuiltMushroomsFieldOnBoard } from "../components/helpers/dialogues/findBuiltMushroomsFieldOnBoard";
import { findBuiltTavernOnBoard } from "../components/helpers/dialogues/findBuiltTavernOnBoard";
import { findBuiltWoodcutterOnBoard } from "../components/helpers/dialogues/findBuiltWoodcutterOnBoard";
import { findBuiltWorkshopOnBoard } from "../components/helpers/dialogues/findBuiltWorkshopOnBoard";
import { findFedBeetleOnBoard } from "../components/helpers/dialogues/findFedBeetleOnBoard";
import { findLadybugOnBoard } from "../components/helpers/dialogues/findLadybugOnBoard";
import { findTermiteMoundOnBoard } from "../components/helpers/dialogues/findTermiteMoundOnBoard";
import { findUpgradedStonemasonOnBoard } from "../components/helpers/dialogues/findUpgradedStonemasonOnBoard";
import { findUpgradedWoodcutterOnBoard } from "../components/helpers/dialogues/findUpgradedWoodcutterOnBoard";
import { findUpgradedWorkshopOnBoard } from "../components/helpers/dialogues/findUpgradedWorkshopOnBoard";
import { findWoodOnBoard } from "../components/helpers/dialogues/findWoodOnBoard";
import { hasAntOnBoard } from "../components/helpers/dialogues/hasAntOnBoard";
import { hasClayOnBoard } from "../components/helpers/dialogues/hasClayOnBoard";
import { hasGravelOnBoard } from "../components/helpers/dialogues/hasGravelOnBoard";
import { hasGreenflyOnBoard } from "../components/helpers/dialogues/hasGreenflyOnBoard";
import { hasIronOreOnBoard } from "../components/helpers/dialogues/hasIronOreOnBoard";
import { hasLeafAndBeetleOnBoard } from "../components/helpers/dialogues/hasLeafAndBeetleOnBoard";
import { hasMushroomOnBoard } from "../components/helpers/dialogues/hasMushroomOnBoard";
import { hasRottenAppleOnBoard } from "../components/helpers/dialogues/hasRottenAppleOnBoard";
import { hasTermiteOnBoard } from "../components/helpers/dialogues/hasTermiteOnBoard";
import { isStartingBoardState } from "../components/helpers/dialogues/isStartingBoardState";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import {
  automateWithAntsDialogue,
  automateWithTermitesDialogue,
  buildBeetleHouseDialogue,
  buildFarmDialogue,
  buildKitchenDialogue,
  buildMushroomFieldDialogue,
  buildStonemasonDialogue,
  buildTavernDialogue,
  buildWoodcutterDialogue,
  buildWorkshopDialogue,
  composterDialogue,
  cookNettleSoupDialogue,
  craftAxeDialogue,
  digMoreResourcesDialogue,
  feedBeetleDialogue,
  firstAntDialogue,
  firstGreenflyDialogue,
  firstIronOreDialogue,
  firstLadybugDialogue,
  firstMushroomDialogue,
  firstRottenAppleDialogue,
  firstTermiteDialogue,
  mushroomFieldDialogue,
  stonemasonUpgradedDialogue,
  termiteMoundDialogue,
  welcomeDialogue,
  woodcutterUpgradedDialogue,
  woodProductionDialogue,
} from "../utils/dialogue";

interface UseBoardStateDialoguesArgs {
  allEntitiesLoaded: boolean;
  entities: GridEntity[];
  activeDialogue: Dialogue | null;
  showDialogueIfNotVisited: (dialogue: Dialogue) => boolean;
}

export function useBoardStateDialogues({
  allEntitiesLoaded,
  entities,
  activeDialogue,
  showDialogueIfNotVisited,
}: UseBoardStateDialoguesArgs) {
  useEffect(() => {
    if (!allEntitiesLoaded || activeDialogue) {
      return;
    }

    if (
      isStartingBoardState(entities) &&
      showDialogueIfNotVisited(welcomeDialogue(entities[0].id))
    ) {
      return;
    }

    if (hasLeafAndBeetleOnBoard(entities) && showDialogueIfNotVisited(feedBeetleDialogue())) {
      return;
    }

    const fedBeetle = findFedBeetleOnBoard(entities);
    if (fedBeetle && showDialogueIfNotVisited(buildBeetleHouseDialogue(fedBeetle.id))) {
      return;
    }

    const beetleHouse = findBuiltBeetleHouseOnBoard(entities);
    if (beetleHouse && fedBeetle && showDialogueIfNotVisited(buildWorkshopDialogue(fedBeetle.id))) {
      return;
    }

    const workshop = findBuiltWorkshopOnBoard(entities);
    if (workshop && showDialogueIfNotVisited(craftAxeDialogue(workshop.id))) {
      return;
    }

    const axe = findBuiltAxeOnBoard(entities);
    if (axe && showDialogueIfNotVisited(buildWoodcutterDialogue(fedBeetle?.id))) {
      return;
    }

    const woodcutter = findBuiltWoodcutterOnBoard(entities);
    if (woodcutter && showDialogueIfNotVisited(woodProductionDialogue())) {
      return;
    }

    const wood = findWoodOnBoard(entities);
    if (wood && showDialogueIfNotVisited(buildStonemasonDialogue(fedBeetle?.id))) {
      return;
    }

    const brick = findBrickOnBoard(entities);
    if (brick && showDialogueIfNotVisited(buildKitchenDialogue())) {
      return;
    }

    const kitchen = findBuiltKitchenOnBoard(entities);
    if (kitchen && showDialogueIfNotVisited(buildTavernDialogue())) {
      return;
    }

    const tavern = findBuiltTavernOnBoard(entities);
    if (tavern && showDialogueIfNotVisited(cookNettleSoupDialogue())) {
      return;
    }

    if (hasAntOnBoard(entities) && showDialogueIfNotVisited(firstAntDialogue())) {
      return;
    }

    const anthill = findAnthillOnBoard(entities);
    if (anthill && showDialogueIfNotVisited(digMoreResourcesDialogue(anthill.id))) {
      return;
    }

    if (hasGreenflyOnBoard(entities) && showDialogueIfNotVisited(firstGreenflyDialogue())) {
      return;
    }

    if (hasClayOnBoard(entities) && showDialogueIfNotVisited(automateWithAntsDialogue())) {
      return;
    }

    if (hasIronOreOnBoard(entities) && showDialogueIfNotVisited(firstIronOreDialogue())) {
      return;
    }

    const ladybug = findLadybugOnBoard(entities);
    if (ladybug && showDialogueIfNotVisited(firstLadybugDialogue(ladybug.id))) {
      return;
    }

    const upgradedWorkshop = findUpgradedWorkshopOnBoard(entities);
    if (upgradedWorkshop && showDialogueIfNotVisited(buildFarmDialogue())) {
      return;
    }

    const upgradedStonemason = findUpgradedStonemasonOnBoard(entities);
    if (upgradedStonemason && showDialogueIfNotVisited(stonemasonUpgradedDialogue())) {
      return;
    }

    const upgradedWoodcutter = findUpgradedWoodcutterOnBoard(entities);
    if (upgradedWoodcutter && showDialogueIfNotVisited(woodcutterUpgradedDialogue())) {
      return;
    }

    const farm = findBuiltFarmOnBoard(entities);
    if (farm && showDialogueIfNotVisited(buildMushroomFieldDialogue(farm.id))) {
      return;
    }

    const mushroomsField = findBuiltMushroomsFieldOnBoard(entities);
    if (mushroomsField && showDialogueIfNotVisited(mushroomFieldDialogue())) {
      return;
    }

    if (hasMushroomOnBoard(entities) && showDialogueIfNotVisited(firstMushroomDialogue())) {
      return;
    }

    if (hasTermiteOnBoard(entities) && showDialogueIfNotVisited(firstTermiteDialogue())) {
      return;
    }

    const termiteMound = findTermiteMoundOnBoard(entities);
    if (termiteMound && showDialogueIfNotVisited(termiteMoundDialogue(termiteMound.id))) {
      return;
    }

    if (hasGravelOnBoard(entities) && showDialogueIfNotVisited(automateWithTermitesDialogue())) {
      return;
    }

    if (hasRottenAppleOnBoard(entities) && showDialogueIfNotVisited(firstRottenAppleDialogue())) {
      return;
    }

    const composter = findBuiltComposterOnBoard(entities);
    if (composter && showDialogueIfNotVisited(composterDialogue())) {
      return;
    }
  }, [allEntitiesLoaded, entities, showDialogueIfNotVisited, activeDialogue]);
}
