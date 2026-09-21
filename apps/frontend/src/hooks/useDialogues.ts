import { useCallback, useEffect, useState } from "react";
import { isOnceDialogueId } from "@happy-little-bug-town/utils";

import { useMainStore } from "../stores/main";
import { Dialogue } from "../types/dialogue";
import { GridEntity } from "../types/gridEntity";
import { useBoardStateDialogues } from "./useBoardStateDialogues";
import { useMarkDialogueVisitedMutation, useVisitedDialoguesQuery } from "./useVisitedDialogues";

export function useDialogues(
  allEntitiesLoaded: boolean,
  entities: GridEntity[],
  enabled = true,
  onDialogueClose?: (dialogue: Dialogue) => void,
) {
  const { data: visitedIds, isSuccess: visitedLoaded } = useVisitedDialoguesQuery(enabled);
  const markVisited = useMarkDialogueVisitedMutation();
  const setActiveDialogueId = useMainStore((state) => state.setActiveDialogueId);
  const [activeDialogue, setActiveDialogue] = useState<Dialogue | null>(null);

  useEffect(() => {
    return () => {
      setActiveDialogueId(null);
    };
  }, [setActiveDialogueId]);

  const closeDialogue = useCallback(() => {
    if (activeDialogue) {
      onDialogueClose?.(activeDialogue);
    }
    setActiveDialogue(null);
    setActiveDialogueId(null);
  }, [activeDialogue, onDialogueClose, setActiveDialogueId]);

  const showDialogue = useCallback(
    (dialogue: Dialogue) => {
      setActiveDialogue(dialogue);
      setActiveDialogueId(dialogue.id);
    },
    [setActiveDialogueId],
  );

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
