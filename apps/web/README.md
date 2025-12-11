# BMKG Weather Dashboard

Web dashboard untuk visualisasi data cuaca BMKG menggunakan React + Vite + TanStack Router + TanStack Query.

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool & dev server
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Data fetching & caching
- **TypeScript** - Type safety

## Getting Started

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
├── main.tsx              # App entry point (providers setup)
├── routeTree.gen.ts      # Auto-generated route tree (don't edit)
├── routes/
│   ├── __root.tsx        # Root layout (navbar, providers)
│   ├── index.tsx         # Home page (/)
│   ├── about.tsx         # About page (/about)
│   └── aws/
│       └── index.tsx     # AWS page (/aws)
├── components/           # Reusable components
├── hooks/                # Custom hooks
├── lib/                  # Utilities & API clients
└── index.css             # Global styles
```

## TanStack Router

### File-Based Routing

Routes are automatically generated from the `src/routes/` folder structure:

| File | Route |
|------|-------|
| `routes/index.tsx` | `/` |
| `routes/about.tsx` | `/about` |
| `routes/aws/index.tsx` | `/aws` |
| `routes/aws/$stationId.tsx` | `/aws/:stationId` |
| `routes/public/weather.tsx` | `/public/weather` |

### Creating a New Route

```tsx
// src/routes/aws.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aws")({
  component: AWSPage,
});

function AWSPage() {
  return <div>AWS Weather Stations</div>;
}
```

### Route with Loader (Data Fetching)

```tsx
// src/routes/aws.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aws")({
  loader: async () => {
    const response = await fetch("http://localhost:3000/aws?province=PR013");
    return response.json();
  },
  component: AWSPage,
});

function AWSPage() {
  const data = Route.useLoaderData();
  return <div>{JSON.stringify(data)}</div>;
}
```

### Dynamic Route Parameters

```tsx
// src/routes/aws/$stationId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aws/$stationId")({
  component: StationDetail,
});

function StationDetail() {
  const { stationId } = Route.useParams();
  return <div>Station: {stationId}</div>;
}
```

### Search Parameters (Query Strings)

```tsx
// src/routes/aws.tsx
import { createFileRoute } from "@tanstack/react-router";

type AWSSearch = {
  province?: string;
  type?: string;
};

export const Route = createFileRoute("/aws")({
  validateSearch: (search: Record<string, unknown>): AWSSearch => ({
    province: search.province as string | undefined,
    type: search.type as string | undefined,
  }),
  component: AWSPage,
});

function AWSPage() {
  const { province, type } = Route.useSearch();
  return <div>Province: {province}, Type: {type}</div>;
}
```

### Navigation

```tsx
import { Link, useNavigate } from "@tanstack/react-router";

// Declarative navigation
<Link to="/aws" search={{ province: "PR013" }}>
  Go to AWS
</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: "/aws", search: { province: "PR013" } });
```

## TanStack Query

### Basic Query (useQuery)

```tsx
import { useQuery } from "@tanstack/react-query";

function AWSPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["aws", "PR013"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/aws?province=PR013");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### Query with Parameters

```tsx
import { useQuery } from "@tanstack/react-query";

function useAWSData(province: string, type?: string) {
  return useQuery({
    queryKey: ["aws", province, type],
    queryFn: async () => {
      const params = new URLSearchParams({ province });
      if (type) params.append("type", type);
      
      const res = await fetch(`http://localhost:3000/aws?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!province, // Only fetch when province is provided
  });
}

function AWSPage() {
  const { data, isLoading } = useAWSData("PR013", "aws");
  // ...
}
```

### Query Options Factory (Best Practice)

```tsx
// src/lib/queries/aws.ts
import { queryOptions } from "@tanstack/react-query";

export const awsQueryOptions = (province: string, type?: string) =>
  queryOptions({
    queryKey: ["aws", province, type],
    queryFn: async () => {
      const params = new URLSearchParams({ province });
      if (type) params.append("type", type);
      
      const res = await fetch(`http://localhost:3000/aws?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for weather data
  });

// Usage in component
import { useQuery } from "@tanstack/react-query";
import { awsQueryOptions } from "@/lib/queries/aws";

function AWSPage() {
  const { data } = useQuery(awsQueryOptions("PR013", "aws"));
}

// Usage in route loader
export const Route = createFileRoute("/aws")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(awsQueryOptions("PR013"));
  },
});
```

### Mutation (POST/PUT/DELETE)

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateStationForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newStation: StationData) => {
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStation),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["aws"] });
    },
  });

  return (
    <button 
      onClick={() => mutation.mutate({ name: "New Station" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create Station"}
    </button>
  );
}
```

## Integration: Router + Query

### Route Loader with Query

Best practice untuk data fetching di route:

```tsx
// src/routes/aws.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { awsQueryOptions } from "@/lib/queries/aws";

export const Route = createFileRoute("/aws")({
  // Prefetch data saat navigasi
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(awsQueryOptions("PR013"));
  },
  component: AWSPage,
});

function AWSPage() {
  // Data sudah di-cache dari loader, akan instant
  const { data, isLoading } = useQuery(awsQueryOptions("PR013"));

  if (isLoading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### Route with Search Params + Query

```tsx
// src/routes/aws.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { awsQueryOptions } from "@/lib/queries/aws";

type AWSSearch = {
  province: string;
  type?: string;
};

export const Route = createFileRoute("/aws")({
  validateSearch: (search): AWSSearch => ({
    province: (search.province as string) || "PR013",
    type: search.type as string | undefined,
  }),
  loaderDeps: ({ search: { province, type } }) => ({ province, type }),
  loader: ({ context: { queryClient }, deps: { province, type } }) => {
    return queryClient.ensureQueryData(awsQueryOptions(province, type));
  },
  component: AWSPage,
});

function AWSPage() {
  const { province, type } = Route.useSearch();
  const { data } = useSuspenseQuery(awsQueryOptions(province, type));

  return (
    <div>
      <h1>AWS Stations - {province}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## API Client Setup

Buat API client yang reusable:

```tsx
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Usage
import { fetchAPI } from "@/lib/api";

const data = await fetchAPI<AWSResponse>("/aws?province=PR013");
```

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

```tsx
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
```

## Devtools

### TanStack Router Devtools

Otomatis muncul di pojok kanan bawah saat development. Fitur:
- Lihat route tree
- Inspect route params & search
- Debug navigation

### TanStack Query Devtools

Otomatis muncul di pojok kiri bawah saat development. Fitur:
- Lihat semua queries & status
- Inspect cache
- Trigger refetch/invalidate
- Debug loading/error states

## Best Practices

### 1. Query Keys

```tsx
// ✅ Good: Hierarchical & predictable
queryKey: ["aws", province, type]
queryKey: ["aws", "stations", stationId]
queryKey: ["public", "weather", province]

// ❌ Bad: Flat & unpredictable
queryKey: ["getAWSData"]
queryKey: [province, type, "aws"]
```

### 2. Error Handling

```tsx
// Global error boundary di __root.tsx
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: ({ error }) => (
    <div>Something went wrong: {error.message}</div>
  ),
});

// Per-route error handling
export const Route = createFileRoute("/aws")({
  errorComponent: ({ error }) => (
    <div>Failed to load AWS data: {error.message}</div>
  ),
});
```

### 3. Loading States

```tsx
// Global pending UI di __root.tsx
const RootLayout = () => {
  const isFetching = useIsFetching();
  
  return (
    <>
      {isFetching > 0 && <LoadingBar />}
      <Outlet />
    </>
  );
};

// Per-route pending
export const Route = createFileRoute("/aws")({
  pendingComponent: () => <div>Loading AWS data...</div>,
});
```

### 4. Prefetching

```tsx
// Prefetch on hover
<Link to="/aws" preload="intent">AWS Stations</Link>

// Manual prefetch
const queryClient = useQueryClient();
queryClient.prefetchQuery(awsQueryOptions("PR013"));
```

### 5. Stale Time untuk Weather Data

```tsx
// Weather data: 10 menit (update interval AWS)
staleTime: 1000 * 60 * 10

// Real-time data: 0 (selalu refetch)
staleTime: 0

// Static data: 1 jam
staleTime: 1000 * 60 * 60
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run check-types` | TypeScript type check |
| `bun run lint` | Run ESLint |
