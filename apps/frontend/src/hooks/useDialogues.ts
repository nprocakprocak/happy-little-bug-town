import { useCallback, useEffect, useState } from "react";
import { isOnceDialogueId } from "@happy-little-bug-town/utils";

import { hasLeafAndBeetleOnBoard } from "../components/helpers/hasLeafAndBeetleOnBoard";
import { isStartingBoardState } from "../components/helpers/isStartingBoardState";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import { feedBeetleDialogue, welcomeDialogue } from "../utils/dialogue";
import { useMarkDialogueVisitedMutation, useVisitedDialoguesQuery } from "./useVisitedDialogues";

export function useDialogues(allEntitiesLoaded: boolean, entities: GridEntity[], enabled = true) {
  const { data: visitedIds, isSuccess: visitedLoaded } = useVisitedDialoguesQuery(enabled);
  const markVisited = useMarkDialogueVisitedMutation();
  const [activeDialogue, setActiveDialogue] = useState<Dialogue | null>(null);

  const closeDialogue = useCallback(() => {
    setActiveDialogue(null);
  }, []);

  const showDialogue = useCallback((dialogue: Dialogue) => {
    setActiveDialogue(dialogue);
  }, []);

  const showDialogueIfNotVisited = useCallback(
    (dialogue: Dialogue) => {
      if (!isOnceDialogueId(dialogue.id)) {
        showDialogue(dialogue);
        return;
      }

      if (!visitedLoaded || visitedIds?.includes(dialogue.id)) {
        return;
      }

      markVisited.mutate(dialogue.id);
      showDialogue(dialogue);
    },
    [markVisited, showDialogue, visitedIds, visitedLoaded],
  );

  useEffect(() => {
    if (!allEntitiesLoaded || !visitedLoaded || activeDialogue) {
      return;
    }

    if (isStartingBoardState(entities) && !visitedIds?.includes("welcome")) {
      showDialogueIfNotVisited(welcomeDialogue(entities[0].id));
    }

    if (hasLeafAndBeetleOnBoard(entities) && !visitedIds?.includes("feedBeetle")) {
      showDialogueIfNotVisited(feedBeetleDialogue());
    }
  }, [allEntitiesLoaded, entities, showDialogueIfNotVisited, visitedIds, visitedLoaded, activeDialogue]);

  return {
    activeDialogue,
    closeDialogue,
    showDialogue,
    showDialogueIfNotVisited,
  };
}
