export const queryKeys = {
  user: (id: string) => ["users", id] as const,
  stacks: ["stacks"] as const,
  mines: ["mines"] as const,
};
