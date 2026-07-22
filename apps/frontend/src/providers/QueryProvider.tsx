"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginRequiredError } from "../utils/loginRequiredError";

interface QueryProviderProps {
  children: React.ReactNode;
}

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof LoginRequiredError) {
    return false;
  }
  return failureCount < 3;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: shouldRetry,
          },
          mutations: {
            retry: shouldRetry,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
