import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerUser } from "../api/users";
import { queryKeys } from "../constants/queryKeys";

export function useRegisterUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user(user.id), user);
    },
  });
}
