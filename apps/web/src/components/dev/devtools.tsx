import { lazy, Suspense } from "react";

// Lazy load Router Devtools (only in development, not bundled in production)
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      }))
    )
  : () => null;

export function Devtools() {
  return (
    <Suspense fallback={null}>
      <TanStackRouterDevtools position="bottom-right" />
    </Suspense>
  );
}
