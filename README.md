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

- `GET /` - API info
- `GET /aws` - Fetch weather data

**Features:**

- ✅ Fetch by Province
- ✅ Fetch by City (dengan exclude & match mode)
- ✅ Fetch by Radius (Haversine formula)
- ✅ Fetch by Station IDs
- ✅ Filter by Type (AWS/ARG)

**Dokumentasi lengkap**: [`apps/api/README.md`](apps/api/README.md)

### Web (`apps/web`)

Frontend aplikasi untuk visualisasi data cuaca (coming soon).

**Tech Stack:**

- React
- Vite
- TypeScript

## 📦 Packages

### weather-client (`packages/weather-client`)

Shared library untuk fetch data dari BMKG API.

**Exports:**

- `AWSDataFetcher` - Main class untuk fetch data
- `BMKGAuth` - Authentication handler

**Methods:**

```typescript
// Fetch by province
await fetcher.fetchDataByProvince(provinceCodes, type);

// Fetch by city
await fetcher.fetchDataByCity(cityNames, type, matchMode, excludeCity);

// Fetch by radius
await fetcher.fetchDataByRadius(lat, lon, radius, type);

// Fetch by station IDs
await fetcher.fetchMultipleStations(
  stationIds,
  defaultType,
  includeLocationInfo,
);

// Fetch single station
await fetcher.fetchStationData(stationId, type, includeLocationInfo);
```

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

- **API Documentation**: [`apps/api/README.md`](apps/api/README.md)
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
