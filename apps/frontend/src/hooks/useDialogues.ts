import { useCallback, useEffect, useRef, useState } from "react";
import { isOnceDialogueId, OnceDialogueId } from "@happy-little-bug-town/utils";

import { isStartingBoardState } from "../components/helpers/isStartingBoardState";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import { welcomeDialogue } from "../utils/dialogue";
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
    if (!allEntitiesLoaded || !visitedLoaded) {
      return;
    }

    if (isStartingBoardState(entities) && !visitedIds?.includes("welcome")) {
      showDialogueIfNotVisited(welcomeDialogue(entities[0].id));
    }
  }, [allEntitiesLoaded, entities, showDialogueIfNotVisited, visitedIds, visitedLoaded]);

  return {
    activeDialogue,
    closeDialogue,
    showDialogue,
    showDialogueIfNotVisited,
  };
}
