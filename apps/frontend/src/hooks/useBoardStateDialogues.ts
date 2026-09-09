import { useEffect } from "react";

import { findBrickOnBoard } from "../components/helpers/dialogues/findBrickOnBoard";
import { findBuiltAxeOnBoard } from "../components/helpers/dialogues/findBuiltAxeOnBoard";
import { findBuiltBeetleHouseOnBoard } from "../components/helpers/dialogues/findBuiltBeetleHouseOnBoard";
import { findBuiltWoodcutterOnBoard } from "../components/helpers/dialogues/findBuiltWoodcutterOnBoard";
import { findBuiltWorkshopOnBoard } from "../components/helpers/dialogues/findBuiltWorkshopOnBoard";
import { findFedBeetleOnBoard } from "../components/helpers/dialogues/findFedBeetleOnBoard";
import { findWoodOnBoard } from "../components/helpers/dialogues/findWoodOnBoard";
import { hasLeafAndBeetleOnBoard } from "../components/helpers/dialogues/hasLeafAndBeetleOnBoard";
import { isStartingBoardState } from "../components/helpers/dialogues/isStartingBoardState";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import {
  buildBeetleHouseDialogue,
  buildKitchenDialogue,
  buildStonemasonDialogue,
  buildWoodcutterDialogue,
  buildWorkshopDialogue,
  craftAxeDialogue,
  feedBeetleDialogue,
  welcomeDialogue,
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
  }, [allEntitiesLoaded, entities, showDialogueIfNotVisited, activeDialogue]);
}
