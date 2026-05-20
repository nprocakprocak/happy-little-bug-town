import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser, updateUser } from "../api/users";
import { queryKeys } from "../lib/queryKeys";

export function useUserQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => fetchUser(id),
    enabled: Boolean(id),
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user(user.id), user);
    },
  });
}
