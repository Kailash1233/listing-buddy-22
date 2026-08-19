import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Skeleton } from "./components/ui/skeleton";

/** Lightweight route-transition skeleton so navigation feels intentional. */
function RoutePending() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 10_000,
    defaultPendingMs: 150,
    defaultPendingMinMs: 200,
    defaultPendingComponent: RoutePending,
  });

  return router;
};
