# BMKG Weather Dashboard

Web dashboard untuk visualisasi data cuaca BMKG menggunakan React + Vite + TanStack Router + TanStack Query.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Library |
| Vite | 7 | Build tool & dev server |
| TanStack Router | 1.x | Type-safe file-based routing |
| TanStack Query | 5.x | Data fetching & caching |
| Tailwind CSS | 4 | Styling |
| TypeScript | 5.9 | Type safety |

## Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Type check
bun run check-types
```

## Project Structure

```
src/
├── routes/                         # Route definitions (THIN - hanya routing)
│   ├── __root.tsx                  # Root route (context, error, 404)
│   ├── _default.tsx                # Default layout route
│   ├── _default/                   # Pages dengan default layout
│   │   ├── index.tsx               # /
│   │   └── about.tsx               # /about
│   ├── _dashboard.tsx              # Dashboard layout route
│   └── _dashboard.dashboard/       # Pages dengan dashboard layout
│       ├── index.tsx               # /dashboard
│       ├── aws.tsx                 # /dashboard/aws
│       ├── public.tsx              # /dashboard/public
│       └── settings.tsx            # /dashboard/settings
│
├── features/                       # Feature modules (BUSINESS LOGIC)
│   ├── home/                       # Home feature
│   │   ├── home-page.tsx           # Page component
│   │   └── index.ts                # Public exports
│   ├── about/
│   ├── dashboard/
│   │   ├── components/             # Feature-specific components
│   │   │   └── stat-card.tsx
│   │   ├── overview-page.tsx
│   │   └── index.ts
│   ├── aws/
│   │   ├── api/                    # API queries
│   │   │   └── queries.ts
│   │   ├── components/
│   │   │   └── station-table.tsx
│   │   ├── types.ts                # TypeScript types
│   │   ├── aws-page.tsx
│   │   └── index.ts
│   ├── public-weather/
│   └── settings/
│
├── components/                     # Shared components
│   ├── shell/                      # Layout parts (navbar, footer, sidebar)
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── dashboard-header.tsx
│   │   └── index.ts
│   └── dev/                        # Development tools
│       ├── devtools.tsx
│       └── index.ts
│
├── layouts/                        # Page layouts
│   ├── default.tsx                 # Navbar + Footer
│   └── dashboard.tsx               # Sidebar + Header
│
├── lib/                            # Utilities
│   ├── api.ts                      # API client
│   └── utils.ts                    # Helper functions (cn, etc)
│
├── main.tsx                        # App entry point
├── index.css                       # Global styles + Tailwind
└── routeTree.gen.ts                # Auto-generated (DO NOT EDIT)
```

---

## Routing

### Konsep Dasar

TanStack Router menggunakan **file-based routing**. Struktur folder = URL structure.

| File | URL |
|------|-----|
| `routes/_default/index.tsx` | `/` |
| `routes/_default/about.tsx` | `/about` |
| `routes/_dashboard.dashboard/index.tsx` | `/dashboard` |
| `routes/_dashboard.dashboard/aws.tsx` | `/dashboard/aws` |

### Pathless Layout

Prefix `_` menandakan **pathless layout** - tidak muncul di URL, hanya untuk grouping layout.

```
_default.tsx          → Layout (tidak muncul di URL)
_default/index.tsx    → URL: / (bukan /_default/)
```

### Layout dengan Path

Format: `_[layoutName].[pathSegment]/`

```
_dashboard.tsx                → Layout definition
_dashboard.dashboard/         → Path segment "/dashboard"
_dashboard.dashboard/aws.tsx  → URL: /dashboard/aws
```

---

## Cara Menambah Route Baru

### 1. Route Sederhana (Default Layout)

**Contoh: Menambah halaman `/faq`**

```bash
# 1. Buat feature
mkdir -p src/features/faq
```

```tsx
// src/features/faq/faq-page.tsx
export function FAQPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">FAQ</h1>
      <div className="mt-8 space-y-4">
        <details className="rounded-lg border p-4">
          <summary className="font-medium cursor-pointer">
            Apa itu BMKG Weather Tools?
          </summary>
          <p className="mt-2 text-gray-600">
            Platform untuk mengakses data cuaca real-time dari BMKG.
          </p>
        </details>
      </div>
    </div>
  );
}
```

```ts
// src/features/faq/index.ts
export { FAQPage } from "./faq-page";
```

```tsx
// src/routes/_default/faq.tsx
import { createFileRoute } from "@tanstack/react-router";
import { FAQPage } from "@/features/faq";

export const Route = createFileRoute("/_default/faq")({
  component: FAQPage,
});
```

**Hasil:** URL `/faq` dengan default layout (navbar + footer)

### 2. Route di Dashboard Layout

**Contoh: Menambah halaman `/dashboard/map`**

```bash
mkdir -p src/features/map
```

```tsx
// src/features/map/map-page.tsx
export function MapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Weather Map</h1>
      <div className="mt-8 h-96 rounded-lg border bg-gray-100">
        {/* Map component here */}
      </div>
    </div>
  );
}
```

```ts
// src/features/map/index.ts
export { MapPage } from "./map-page";
```

```tsx
// src/routes/_dashboard.dashboard/map.tsx
import { createFileRoute } from "@tanstack/react-router";
import { MapPage } from "@/features/map";

export const Route = createFileRoute("/_dashboard/dashboard/map")({
  component: MapPage,
});
```

**Hasil:** URL `/dashboard/map` dengan dashboard layout (sidebar + header)

### 3. Route dengan Data Fetching

**Contoh: Halaman dengan loader**

```tsx
// src/features/station/api/queries.ts
import { queryOptions } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export const stationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["station", id],
    queryFn: () => fetchAPI(`/aws/station/${id}`),
    staleTime: 1000 * 60 * 10,
  });
```

```tsx
// src/routes/_dashboard.dashboard/station.$id.tsx
import { createFileRoute } from "@tanstack/react-router";
import { StationDetailPage } from "@/features/station";
import { stationQueryOptions } from "@/features/station/api/queries";

export const Route = createFileRoute("/_dashboard/dashboard/station/$id")({
  loader: ({ context: { queryClient }, params: { id } }) => {
    return queryClient.ensureQueryData(stationQueryOptions(id));
  },
  component: StationDetailPage,
});
```

**Hasil:** URL `/dashboard/station/STA1234` dengan data pre-fetched

### 4. Route dengan Search Params

**Contoh: Filter dengan query string**

```tsx
// src/routes/_dashboard.dashboard/stations.tsx
import { createFileRoute } from "@tanstack/react-router";
import { StationsPage } from "@/features/stations";

type StationsSearch = {
  province?: string;
  type?: string;
  page?: number;
};

export const Route = createFileRoute("/_dashboard/dashboard/stations")({
  validateSearch: (search: Record<string, unknown>): StationsSearch => ({
    province: search.province as string | undefined,
    type: search.type as string | undefined,
    page: Number(search.page) || 1,
  }),
  component: StationsPage,
});
```

```tsx
// src/features/stations/stations-page.tsx
import { Route } from "@/routes/_dashboard.dashboard/stations";

export function StationsPage() {
  const { province, type, page } = Route.useSearch();
  
  return (
    <div>
      <p>Province: {province}</p>
      <p>Type: {type}</p>
      <p>Page: {page}</p>
    </div>
  );
}
```

**Hasil:** URL `/dashboard/stations?province=PR013&type=aws&page=2`

---

## Cara Menambah Layout Baru

### Contoh: Auth Layout (untuk login/register)

```bash
# 1. Buat layout component
```

```tsx
// src/layouts/auth.tsx
import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <Outlet />
      </div>
    </div>
  );
}
```

```tsx
// src/routes/_auth.tsx
import { createFileRoute } from "@tanstack/react-router";
import AuthLayout from "@/layouts/auth";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});
```

```tsx
// src/routes/_auth.login.tsx (single page, no folder needed)
import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});
```

```tsx
// src/routes/_auth.register.tsx
import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth";

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});
```

**Hasil:**
- `/login` → Auth layout
- `/register` → Auth layout

---

## Features Module

### Struktur Feature

```
features/
└── [feature-name]/
    ├── api/                    # API calls & query options
    │   └── queries.ts
    ├── components/             # Feature-specific components
    │   └── *.tsx
    ├── hooks/                  # Custom hooks
    │   └── use-*.ts
    ├── types.ts                # TypeScript types
    ├── [feature]-page.tsx      # Main page component
    └── index.ts                # Public exports
```

### Contoh Feature Lengkap: AWS

```
features/aws/
├── api/
│   └── queries.ts              # TanStack Query options
├── components/
│   └── station-table.tsx       # Table component
├── types.ts                    # AWSStation, AWSResponse types
├── aws-page.tsx                # Main page
└── index.ts                    # Exports
```

**api/queries.ts:**
```tsx
import { queryOptions } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import type { AWSResponse } from "../types";

interface AWSQueryParams {
  province?: string;
  city?: string;
  type?: string;
}

export const awsQueryOptions = (params?: AWSQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.province) searchParams.append("province", params.province);
  if (params?.city) searchParams.append("city", params.city);
  if (params?.type) searchParams.append("type", params.type);

  const query = searchParams.toString();

  return queryOptions({
    queryKey: ["aws", params],
    queryFn: () => fetchAPI<AWSResponse>(`/aws${query ? `?${query}` : ""}`),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

**types.ts:**
```tsx
export interface AWSStation {
  stationId: string;
  stationName: string;
  city: string;
  province: string;
  provinceCode: string;
  lat: string;
  lng: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface AWSResponse {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  stations: AWSStation[];
}
```

**aws-page.tsx:**
```tsx
import { useQuery } from "@tanstack/react-query";
import { awsQueryOptions } from "./api/queries";
import { StationTable } from "./components/station-table";

export function AWSPage() {
  const { data, isLoading, error } = useQuery(awsQueryOptions());

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">AWS Stations</h1>
      <StationTable stations={data?.stations ?? []} />
    </div>
  );
}
```

**index.ts:**
```tsx
export { AWSPage } from "./aws-page";
export { awsQueryOptions } from "./api/queries";
export { StationTable } from "./components/station-table";
export type { AWSStation, AWSResponse } from "./types";
```

---

## TanStack Query

### Setup (sudah dikonfigurasi)

```tsx
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 5,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Basic Query

```tsx
import { useQuery } from "@tanstack/react-query";

function MyComponent() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-data"],
    queryFn: () => fetch("/api/data").then((r) => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### Query dengan Parameters

```tsx
function useStationData(province: string) {
  return useQuery({
    queryKey: ["stations", province],
    queryFn: () => fetchAPI(`/aws?province=${province}`),
    enabled: !!province, // Only fetch when province exists
  });
}
```

### Query Options Factory (Recommended)

```tsx
// features/aws/api/queries.ts
import { queryOptions } from "@tanstack/react-query";

export const awsQueryOptions = (province?: string) =>
  queryOptions({
    queryKey: ["aws", province],
    queryFn: () => fetchAPI(`/aws?province=${province}`),
    staleTime: 1000 * 60 * 10,
  });

// Usage in component
const { data } = useQuery(awsQueryOptions("PR013"));

// Usage in route loader
loader: ({ context: { queryClient } }) => {
  return queryClient.ensureQueryData(awsQueryOptions("PR013"));
}
```

### Mutation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newData: CreateData) =>
      fetchAPI("/api/create", {
        method: "POST",
        body: JSON.stringify(newData),
      }),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["aws"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ name: "New Station" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

### Prefetching

```tsx
// Prefetch on hover
<Link to="/dashboard/aws" preload="intent">
  AWS Stations
</Link>

// Manual prefetch
const queryClient = useQueryClient();
queryClient.prefetchQuery(awsQueryOptions("PR013"));
```

---

## Navigation

### Link Component

```tsx
import { Link } from "@tanstack/react-router";

// Basic link
<Link to="/about">About</Link>

// With params
<Link to="/dashboard/station/$id" params={{ id: "STA1234" }}>
  Station Detail
</Link>

// With search params
<Link to="/dashboard/stations" search={{ province: "PR013", type: "aws" }}>
  Filtered Stations
</Link>

// Active styling (automatic)
<Link
  to="/dashboard"
  className="text-gray-600 [&.active]:text-blue-600 [&.active]:font-bold"
>
  Dashboard
</Link>

// Preload on hover
<Link to="/dashboard/aws" preload="intent">
  AWS (preload on hover)
</Link>
```

### Programmatic Navigation

```tsx
import { useNavigate } from "@tanstack/react-router";

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Basic navigation
    navigate({ to: "/dashboard" });

    // With params
    navigate({
      to: "/dashboard/station/$id",
      params: { id: "STA1234" },
    });

    // With search params
    navigate({
      to: "/dashboard/stations",
      search: { province: "PR013" },
    });

    // Replace history (no back button)
    navigate({ to: "/dashboard", replace: true });
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### Get Current Route Info

```tsx
import { useParams, useSearch, useLocation } from "@tanstack/react-router";

function MyComponent() {
  // Get URL params (/station/:id → { id: "STA1234" })
  const { id } = useParams({ from: "/_dashboard/dashboard/station/$id" });

  // Get search params (?province=PR013)
  const { province } = useSearch({ from: "/_dashboard/dashboard/stations" });

  // Get full location
  const location = useLocation();
  console.log(location.pathname); // "/dashboard/stations"
  console.log(location.search);   // { province: "PR013" }
}
```

---

## Layouts

### Default Layout

```tsx
// src/layouts/default.tsx
import { Outlet } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/shell";
import { Devtools } from "@/components/dev";

export default function DefaultLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Devtools />
    </div>
  );
}
```

### Dashboard Layout

```tsx
// src/layouts/dashboard.tsx
import { Outlet } from "@tanstack/react-router";
import { Sidebar, DashboardHeader } from "@/components/shell";
import { Devtools } from "@/components/dev";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <Devtools />
    </div>
  );
}
```

### Menambah Item ke Sidebar

```tsx
// src/components/shell/sidebar.tsx
const navItems = [
  { to: "/dashboard" as const, label: "Overview", icon: "📊" },
  { to: "/dashboard/aws" as const, label: "AWS Stations", icon: "🌤️" },
  { to: "/dashboard/public" as const, label: "Public Weather", icon: "☁️" },
  { to: "/dashboard/map" as const, label: "Weather Map", icon: "🗺️" },  // NEW
  { to: "/dashboard/settings" as const, label: "Settings", icon: "⚙️" },
];
```

---

## API Client

### Konfigurasi

```tsx
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new APIError(res.status, data.error || `HTTP ${res.status}`);
  }

  return data;
}
```

### Usage

```tsx
import { fetchAPI } from "@/lib/api";

// GET
const data = await fetchAPI<AWSResponse>("/aws?province=PR013");

// POST
const result = await fetchAPI<CreateResponse>("/api/create", {
  method: "POST",
  body: JSON.stringify({ name: "New Item" }),
});
```

### Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

```tsx
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Error Handling

### Global Error Boundary

```tsx
// src/routes/__root.tsx
function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Error</h1>
        <p className="mt-4 text-gray-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: ErrorComponent,
  notFoundComponent: NotFound,
});
```

### Per-Route Error Handling

```tsx
// src/routes/_dashboard.dashboard/aws.tsx
export const Route = createFileRoute("/_dashboard/dashboard/aws")({
  component: AWSPage,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-50 rounded-lg">
      <h2 className="font-bold text-red-700">Failed to load AWS data</h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  ),
});
```

### Query Error Handling

```tsx
function AWSPage() {
  const { data, error, isError } = useQuery(awsQueryOptions());

  if (isError) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return <div>{/* content */}</div>;
}
```

---

## Loading States

### Route Pending Component

```tsx
export const Route = createFileRoute("/_dashboard/dashboard/aws")({
  component: AWSPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  ),
});
```

### Query Loading

```tsx
function AWSPage() {
  const { data, isLoading } = useQuery(awsQueryOptions());

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return <div>{/* content */}</div>;
}
```

### Global Loading Indicator

```tsx
// src/layouts/dashboard.tsx
import { useIsFetching } from "@tanstack/react-query";

export default function DashboardLayout() {
  const isFetching = useIsFetching();

  return (
    <div className="flex h-screen">
      {isFetching > 0 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse" />
      )}
      {/* rest of layout */}
    </div>
  );
}
```

---

## Devtools

### Router Devtools

Muncul otomatis di pojok kanan bawah saat development.

**Fitur:**
- View route tree
- Inspect params & search
- Debug navigation history

### Query Devtools

Muncul otomatis di pojok kiri bawah saat development.

**Fitur:**
- View all queries & status
- Inspect cache data
- Trigger refetch/invalidate
- Debug loading/error states

### Disable di Production

Devtools otomatis tidak di-bundle di production build karena menggunakan lazy loading dengan `import.meta.env.DEV` check.

---

## Best Practices

### 1. Route Files = Thin

```tsx
// ✅ Good: Route file minimal
import { createFileRoute } from "@tanstack/react-router";
import { AWSPage } from "@/features/aws";

export const Route = createFileRoute("/_dashboard/dashboard/aws")({
  component: AWSPage,
});

// ❌ Bad: Logic di route file
export const Route = createFileRoute("/_dashboard/dashboard/aws")({
  component: () => {
    const [data, setData] = useState();
    // 100+ lines of code...
  },
});
```

### 2. Colocation

```
// ✅ Good: Related files together
features/aws/
├── api/queries.ts      # API calls
├── components/         # AWS-specific components
├── types.ts            # AWS types
└── aws-page.tsx        # Main page

// ❌ Bad: Scattered files
src/
├── api/aws.ts
├── components/aws/
├── types/aws.ts
└── pages/aws.tsx
```

### 3. Query Keys

```tsx
// ✅ Good: Hierarchical & consistent
queryKey: ["aws", province, type]
queryKey: ["aws", "station", stationId]
queryKey: ["public", "weather", province]

// ❌ Bad: Inconsistent
queryKey: ["getAWSData"]
queryKey: [province, "aws"]
```

### 4. Type Safety

```tsx
// ✅ Good: Type everything
interface AWSStation {
  stationId: string;
  // ...
}

const { data } = useQuery<AWSResponse>(awsQueryOptions());

// ❌ Bad: any everywhere
const { data } = useQuery({ queryFn: () => fetch(...) });
```

### 5. Error Boundaries

```tsx
// ✅ Good: Handle errors at appropriate level
- Global: __root.tsx errorComponent
- Feature: Route errorComponent
- Component: Query error state
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run check-types` | TypeScript type check |
| `bun run lint` | Run ESLint |

---

## Troubleshooting

### Route tidak muncul

1. Pastikan file ada di folder `routes/`
2. Jalankan `bun run dev` untuk regenerate `routeTree.gen.ts`
3. Check path di `createFileRoute()` match dengan struktur folder

### Import error `@/`

Pastikan `tsconfig.app.json` punya:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Query tidak fetch

1. Check `enabled` option (default: true)
2. Check `queryKey` unique
3. Check network tab di browser devtools
4. Check Query Devtools untuk status

### Tailwind tidak jalan

1. Pastikan `index.css` di-import di `main.tsx`
2. Check `@import "tailwindcss"` di `index.css`
3. Pastikan `@tailwindcss/vite` plugin ada di `vite.config.ts`
