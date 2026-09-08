import { useEffect } from "react";

import { findBuiltBeetleHouseOnBoard } from "../components/helpers/dialogues/findBuiltBeetleHouseOnBoard";
import { findFedBeetleOnBoard } from "../components/helpers/dialogues/findFedBeetleOnBoard";
import { hasLeafAndBeetleOnBoard } from "../components/helpers/dialogues/hasLeafAndBeetleOnBoard";
import { isStartingBoardState } from "../components/helpers/dialogues/isStartingBoardState";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import {
  builtBeetleHouseDialogue,
  fedFirstBeetleDialogue,
  feedBeetleDialogue,
  welcomeDialogue,
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
    if (fedBeetle && showDialogueIfNotVisited(fedFirstBeetleDialogue(fedBeetle.id))) {
      return;
    }

    const beetleHouse = findBuiltBeetleHouseOnBoard(entities);
    if (
      beetleHouse &&
      fedBeetle &&
      showDialogueIfNotVisited(builtBeetleHouseDialogue(fedBeetle.id))
    ) {
      return;
    }
  }, [allEntitiesLoaded, entities, showDialogueIfNotVisited, activeDialogue]);
}
