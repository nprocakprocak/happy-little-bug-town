import { useCallback, useState } from "react";
import { isOnceDialogueId } from "@happy-little-bug-town/utils";

import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import { useBoardStateDialogues } from "./useBoardStateDialogues";
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
    (dialogue: Dialogue): boolean => {
      if (!isOnceDialogueId(dialogue.id)) {
        showDialogue(dialogue);
        return true;
      }

      if (!visitedLoaded || visitedIds?.includes(dialogue.id)) {
        return false;
      }

      markVisited.mutate(dialogue.id);
      showDialogue(dialogue);
      return true;
    },
    [markVisited, showDialogue, visitedIds, visitedLoaded],
  );

  useBoardStateDialogues({
    allEntitiesLoaded,
    entities,
    activeDialogue,
    showDialogueIfNotVisited,
  });

  return {
    activeDialogue,
    closeDialogue,
    showDialogue,
    showDialogueIfNotVisited,
  };
}
