import { OnceDialogueId } from "@happy-little-bug-town/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchVisitedDialogues, markDialogueVisited } from "../api/dialogues";
import { queryKeys } from "../constants/queryKeys";

export function updateVisitedDialoguesCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (ids: OnceDialogueId[]) => OnceDialogueId[],
) {
  queryClient.setQueryData<OnceDialogueId[]>(queryKeys.dialogues, (old) => updater(old ?? []));
}

export function useVisitedDialoguesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.dialogues,
    queryFn: fetchVisitedDialogues,
    enabled,
  });
}

export function useMarkDialogueVisitedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markDialogueVisited,
    onSuccess: (dialogueIds) => {
      queryClient.setQueryData(queryKeys.dialogues, dialogueIds);
    },
  });
}
