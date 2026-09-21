import { useMemo } from "react";

import { useAuth } from "../context/AuthContext";
import { useMainStore } from "../stores/main";
import { getActiveQuestText } from "../utils/quests";
import { useItemsQuery } from "./useItems";
import { useStacksQuery } from "./useStacks";
import { useStructuresQuery } from "./useStructures";
import { useVisitedDialoguesQuery } from "./useVisitedDialogues";

export function useActiveQuest(): string | null {
  const { anonymousId } = useAuth();
  const enabled = Boolean(anonymousId);
  const { data: visitedDialogueIds = [] } = useVisitedDialoguesQuery(enabled);
  const { data: structures = [] } = useStructuresQuery(enabled);
  const { data: items = [] } = useItemsQuery(enabled);
  const { data: stacks = [] } = useStacksQuery(enabled);
  const activeDialogueId = useMainStore((state) => state.activeDialogueId);

  return useMemo(
    () =>
      getActiveQuestText({
        visitedDialogueIds,
        activeDialogueId,
        structures,
        items,
        stacks,
      }),
    [visitedDialogueIds, activeDialogueId, structures, items, stacks],
  );
}
