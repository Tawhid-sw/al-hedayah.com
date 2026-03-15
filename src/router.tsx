import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
// FIX: Use the correct exported member name
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: Infinity, // Data stays "fresh" to avoid background re-fetches
      },
    },
  });

  if (typeof window !== "undefined") {
    // Corrected function name here
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
    });

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      maxAge: 1000 * 60 * 60 * 24,
    });
  }

  const router = createTanStackRouter({
    context: {
      queryClient,
    },
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });

  return router;
}
