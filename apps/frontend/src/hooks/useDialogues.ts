import { useCallback, useEffect, useRef, useState } from "react";

import { hasDugItemHintItem } from "../components/helpers/dugItemHint";
import { isStartingBoardState } from "../components/helpers/isStartingBoardState";
import { Dialogue, DialogueId } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import { holeDialogue } from "../utils/dialogue";

export function useDialogues(
  allEntitiesLoaded: boolean,
  entities: GridEntity[]
) {
  const [activeDialogue, setActiveDialogue] = useState<Dialogue | null>(null);
  const visitedRef = useRef<Partial<Record<DialogueId, boolean>>>({});
  const hydratedRef = useRef(false);

  const closeDialogue = useCallback(() => {
    setActiveDialogue(null);
  }, []);

  const showDialogue = useCallback((dialogue: Dialogue) => {
    visitedRef.current[dialogue.id] = true;
    setActiveDialogue(dialogue);
  }, []);

  const showDialogueIfNotVisited = useCallback(
    (dialogue: Dialogue) => {
      if (visitedRef.current[dialogue.id]) {
        return;
      }
      showDialogue(dialogue);
    },
    [showDialogue],
  );

  const markVisited = useCallback((id: DialogueId) => {
    visitedRef.current[id] = true;
  }, []);

  useEffect(() => {
    if (!allEntitiesLoaded) {
      return;
    }

    if (isStartingBoardState(entities)) {
      hydratedRef.current = true;
      showDialogueIfNotVisited(holeDialogue(entities[0].id));
      return;
    }

    markVisited("hole");
    if (!hydratedRef.current && hasDugItemHintItem(entities)) {
      markVisited("dugFirstItem");
    }
    hydratedRef.current = true;
  }, [allEntitiesLoaded, entities, markVisited]);

  return {
    activeDialogue,
    closeDialogue,
    showDialogue,
    showDialogueIfNotVisited,
  };
}
