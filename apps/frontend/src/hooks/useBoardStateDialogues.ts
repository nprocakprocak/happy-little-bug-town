import { useEffect } from "react";
import { OnceDialogueId } from "@happy-little-bug-town/utils";

import { findFedBeetleOnBoard } from "../components/helpers/dialogues/findFedBeetleOnBoard";
import { hasLeafAndBeetleOnBoard } from "../components/helpers/dialogues/hasLeafAndBeetleOnBoard";
import { isStartingBoardState } from "../components/helpers/dialogues/isStartingBoardState";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import { fedFirstBeetleDialogue, feedBeetleDialogue, welcomeDialogue } from "../utils/dialogue";

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
    } else if (hasLeafAndBeetleOnBoard(entities) && !visitedIds?.includes("feedBeetle")) {
      showDialogueIfNotVisited(feedBeetleDialogue());
    } else if (!visitedIds?.includes("fedFirstBeetle")) {
      const fedBeetle = findFedBeetleOnBoard(entities);
      if (fedBeetle) {
        showDialogueIfNotVisited(fedFirstBeetleDialogue(fedBeetle.id));
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
