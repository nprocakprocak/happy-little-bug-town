import { useEffect } from "react";
import { OnceDialogueId } from "@happy-little-bug-town/utils";

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
  visitedIds: OnceDialogueId[] | undefined;
  visitedLoaded: boolean;
  showDialogueIfNotVisited: (dialogue: Dialogue) => void;
}

export function useBoardStateDialogues({
  allEntitiesLoaded,
  entities,
  activeDialogue,
  visitedIds,
  visitedLoaded,
  showDialogueIfNotVisited,
}: UseBoardStateDialoguesArgs) {
  useEffect(() => {
    if (!allEntitiesLoaded || !visitedLoaded || activeDialogue) {
      return;
    }

    if (isStartingBoardState(entities) && !visitedIds?.includes("welcome")) {
      showDialogueIfNotVisited(welcomeDialogue(entities[0].id));
      return;
    }

    if (hasLeafAndBeetleOnBoard(entities) && !visitedIds?.includes("feedBeetle")) {
      showDialogueIfNotVisited(feedBeetleDialogue());
      return;
    }

    if (!visitedIds?.includes("fedFirstBeetle")) {
      const fedBeetle = findFedBeetleOnBoard(entities);
      if (fedBeetle) {
        showDialogueIfNotVisited(fedFirstBeetleDialogue(fedBeetle.id));
        return;
      }
    }

    if (!visitedIds?.includes("builtBeetleHouse")) {
      const beetleHouse = findBuiltBeetleHouseOnBoard(entities);
      const fedBeetle = findFedBeetleOnBoard(entities);
      if (beetleHouse && fedBeetle) {
        showDialogueIfNotVisited(builtBeetleHouseDialogue(fedBeetle.id));
        return;
      }
    }
  }, [
    allEntitiesLoaded,
    entities,
    showDialogueIfNotVisited,
    visitedIds,
    visitedLoaded,
    activeDialogue,
  ]);
}
