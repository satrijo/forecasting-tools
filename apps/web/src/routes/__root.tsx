import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
  queryClient: QueryClient;
}

// Root hanya render Outlet, layout ditentukan oleh child routes
function RootComponent() {
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Error</h1>
        <p className="mt-4 text-gray-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
