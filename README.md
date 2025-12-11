# BMKG Weather Tools

Monorepo untuk tools dan API data cuaca BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) Indonesia.

## 📋 Daftar Isi

- [Struktur Project](#-struktur-project)
- [Quick Start](#-quick-start)
- [Apps](#-apps)
- [Packages](#-packages)
- [Development](#-development)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

## 🏗️ Struktur Project

```
tools/
├── apps/
│   ├── api/          # REST API untuk data cuaca BMKG
│   └── web/          # Web frontend (React + Vite)
├── packages/
│   └── weather-client/  # Library untuk fetch data BMKG
├── .env              # Environment variables (git ignored)
├── .env.example      # Template environment variables
└── turbo.json        # Turborepo configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env dan isi credentials BMKG
nano .env
```

File `.env`:

```env
BMKG_USERNAME=your_station_id
BMKG_PASSWORD=your_password
```

### 3. Run Development Server

```bash
# Run API server
bun run dev --filter=api

# Run Web app
bun run dev --filter=web

# Run semua apps
bun run dev
```

### 4. Access

- **API**: http://localhost:3000
- **Web**: http://localhost:5173

## 📱 Apps

### API (`apps/api`)

REST API untuk mengambil data cuaca real-time dari stasiun AWS/ARG BMKG.

**Tech Stack:**

- Bun 1.3.3
- Hono 4.10.7
- TypeScript

**Endpoints:**

| Endpoint                 | Description                       |
| ------------------------ | --------------------------------- |
| `GET /`                  | API info & documentation links    |
| `GET /aws`               | AWS/ARG station weather data      |
| `GET /public`            | Public weather API info           |
| `GET /public/nowcasting` | Nowcasting data (signature/XML)   |
| `GET /public/weather`    | Public weather forecast (GeoJSON) |
| `GET /docs`              | API documentation (Scalar UI)     |
| `GET /openapi.yaml`      | OpenAPI 3.1.0 spec                |

**Features:**

- ✅ Fetch by Province, City, Radius, Station IDs
- ✅ Filter by Type (AWS, AAWS, ARG, ASRS, Soil, Iklimmikro)
- ✅ GeoJSON output format
- ✅ Consistent REST response format (`success` field)
- ✅ OpenAPI 3.1.0 documentation

**Dokumentasi lengkap**: [`apps/api/README.md`](apps/api/README.md)

### Web (`apps/web`)

Dashboard untuk visualisasi data cuaca BMKG.

**Tech Stack:**

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Library |
| Vite | 7 | Build tool |
| TanStack Router | 1.x | File-based routing |
| TanStack Query | 5.x | Data fetching & caching |
| Tailwind CSS | 4 | Styling |
| TypeScript | 5.9 | Type safety |

**Features:**

- ✅ File-based routing dengan TanStack Router
- ✅ Data fetching & caching dengan TanStack Query
- ✅ Multiple layouts (Default, Dashboard)
- ✅ Feature-based architecture
- ✅ Type-safe navigation & API calls

**Routes:**

| URL | Layout | Description |
|-----|--------|-------------|
| `/` | Default | Home page |
| `/about` | Default | About page |
| `/dashboard` | Dashboard | Dashboard overview |
| `/dashboard/aws` | Dashboard | AWS stations data |
| `/dashboard/public` | Dashboard | Public weather data |
| `/dashboard/settings` | Dashboard | Settings |

**Project Structure:**

```
apps/web/src/
├── routes/           # Route definitions (thin)
├── features/         # Feature modules (business logic)
├── components/       # Shared components
├── layouts/          # Page layouts
├── lib/              # Utilities
└── main.tsx          # Entry point
```

**Dokumentasi lengkap**: [`apps/web/README.md`](apps/web/README.md)

## 📦 Packages

### weather-client (`packages/weather-client`)

Shared library untuk fetch dan konversi data BMKG.

**Modules:**

| Module    | Description                  |
| --------- | ---------------------------- |
| `aws`     | AWS/ARG station data fetcher |
| `public`  | Public weather data fetcher  |
| `geojson` | GeoJSON converter & filters  |

**AWS Data Fetcher:**

```typescript
import { AWSDataFetcher, BMKGAuth } from "weather-client";

const auth = new BMKGAuth(username, password);
const fetcher = new AWSDataFetcher(auth);

await fetcher.fetchDataByProvince(["PR013"], "aws");
await fetcher.fetchDataByCity("banyumas", "aws");
await fetcher.fetchDataByRadius(-7.43, 109.24, 50, "aws");
```

**GeoJSON Converter:**

```typescript
import {
  // Public weather (PWX)
  publicToGeoJSON,
  filterPublicGeoJSON,
  filterPublicByBoundingBox,

  // AWS stations
  awsToGeoJSON,
  awsToGeoJSONFeature,
} from "weather-client";

// Public weather
const geojson = publicToGeoJSON(pwxData);
const filtered = filterPublicGeoJSON(geojson, { province: "Jawa Tengah" });

// AWS stations
const awsGeoJSON = awsToGeoJSON(stations);
```

**Station Types:**

| Type         | Description                        |
| ------------ | ---------------------------------- |
| `aws`        | Automatic Weather Station          |
| `aaws`       | Advanced AWS                       |
| `arg`        | Automatic Rain Gauge               |
| `asrs`       | Automatic Solar Radiation Station  |
| `soil`       | Soil Moisture Station              |
| `iklimmikro` | Microclimate Station (multi-level) |

## 💻 Development

### Requirements

- **Bun** 1.3.3 or higher
- **Node.js** 18+ (optional, Bun is primary runtime)
- **BMKG Credentials** (username & password)

### Tech Stack

- **Monorepo**: Turborepo 2.6.3
- **Package Manager**: Bun
- **Runtime**: Bun
- **Language**: TypeScript
- **API Framework**: Hono 4.10.7

### Project Commands

```bash
# Development
bun run dev                    # Run all apps in dev mode
bun run dev --filter=api       # Run only API
bun run dev --filter=web       # Run only Web

# Build
bun run build                  # Build all apps
bun run build --filter=api     # Build only API

# Type Check
bun run check-types            # Check TypeScript in all packages
bun run check-types --filter=api

# Lint
bun run lint                   # Lint all packages
```

## 🔐 Environment Variables

### Setup

1. Copy template:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` dengan credentials Anda:
   ```env
   BMKG_USERNAME=your_station_id
   BMKG_PASSWORD=your_password
   ```

### Security

- ✅ File `.env` sudah di `.gitignore`
- ✅ Credentials tidak pernah di-commit ke repository
- ✅ Setiap developer setup credentials sendiri
- ✅ `.env.example` hanya template tanpa nilai asli

### Mendapatkan Credentials

Credentials BMKG didapat dengan menghubungi administrator BMKG atau melalui stasiun cuaca setempat.

## 📜 Scripts

### Global Scripts (dari root)

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `bun install`         | Install dependencies semua packages |
| `bun run dev`         | Run all apps in development mode    |
| `bun run build`       | Build all apps for production       |
| `bun run lint`        | Lint all packages                   |
| `bun run check-types` | TypeScript type checking            |

### Filtered Scripts

```bash
# Development
bun run dev --filter=api              # API only
bun run dev --filter=web              # Web only
bun run dev --filter=weather-client   # Package only

# Build
bun run build --filter=api

# Type check specific package
bun run check-types --filter=weather-client
```

### Package-Specific Scripts

**API (`apps/api`):**

```bash
cd apps/api
bun run dev          # Development server
bun run build        # Build for production
bun run check-types  # Type checking
```

**Weather Client (`packages/weather-client`):**

```bash
cd packages/weather-client
bun run build        # Build library
bun run check-types  # Type checking
```

## 📚 Documentation

### API

- **API README**: [`apps/api/README.md`](apps/api/README.md)
- **OpenAPI Spec**: [`apps/api/openapi.yaml`](apps/api/openapi.yaml)
- **Interactive Docs**: `http://localhost:3000/docs` (Scalar UI)

### Library

- **AWS Fetcher**: [`packages/weather-client/src/aws/README.md`](packages/weather-client/src/aws/README.md)
- **GeoJSON Converter**: [`packages/weather-client/src/geojson/README.md`](packages/weather-client/src/geojson/README.md)
- **AWS to GeoJSON**: [`packages/weather-client/src/geojson/AWS.md`](packages/weather-client/src/geojson/AWS.md)

### Web

- **Web README**: [`apps/web/README.md`](apps/web/README.md) - Dokumentasi lengkap frontend

### Data

- **Province Codes**: [`packages/weather-client/src/aws/province.json`](packages/weather-client/src/aws/province.json)
- **Station Data**: [`packages/weather-client/src/aws/location.json`](packages/weather-client/src/aws/location.json)

## 🤝 Contributing

1. Fork repository ini
2. Buat branch untuk feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 License

Project ini dibuat untuk keperluan pembelajaran dan integrasi data BMKG Indonesia.

## 🙏 Acknowledgments

- **BMKG** - Sumber data cuaca
- **Turborepo** - Monorepo tooling
- **Bun** - JavaScript runtime & toolkit
- **Hono** - Web framework

---

**Built with ❤️ using Bun + Turborepo + Hono**
