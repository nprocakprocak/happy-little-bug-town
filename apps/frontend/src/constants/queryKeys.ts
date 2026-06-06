export const queryKeys = {
  user: (id: string) => ["users", id] as const,
  stacks: ["stacks"] as const,
  structures: ["structures"] as const,
  items: ["items"] as const,
  bugs: ["bugs"] as const,
  tools: ["tools"] as const,
};
