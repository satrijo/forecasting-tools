# Weather Client Package Structure

Package telah direorganisasi menjadi beberapa library terpisah:

## 📦 Modules

### 1. **AWS Module** (`src/aws/`)

Library untuk fetch data dari BMKG Automatic Weather Station (AWS) dan Automatic Rain Gauge (ARG).

**Files:**

- `index.ts` - AWSDataFetcher class dengan berbagai method fetch
- `location.json` - Data lokasi stasiun AWS/ARG
- `province.json` - Data kode provinsi
- `bmkg-auth.ts` - Authentication helper

**Features:**

- Fetch by station ID, province, city, radius
- Advanced search: match modes, exclude filter
- Haversine distance calculation
- Auto type detection

---

### 2. **AWOS Module** (`src/awos/`)

Library untuk Aviation Weather Observation System.

**Status:** 🚧 Structure only (not implemented)

---

### 3. **GeoJSON Module** (`src/geojson/`) ⭐ NEW

Library terpisah untuk convert location data ke format GeoJSON.

**Files:**

- `index.ts` - GeoJSON converter library
- `convert-to-geojson.ts` - CLI script untuk generate GeoJSON file
- `examples.ts` - Comprehensive usage examples
- `README.md` - Dokumentasi lengkap

**Features:**

- ✅ **Fleksibel** - Terima data dari array (API) atau file
- ✅ Convert ke GeoJSON FeatureCollection
- ✅ Type-safe TypeScript interfaces
- ✅ Filter by province, type, bounding box
- ✅ Load/save GeoJSON files
- ✅ Reusable functions

**CLI Usage:**

```bash
# Generate GeoJSON file
bun src/geojson/convert-to-geojson.ts

# Run examples
bun src/geojson/examples.ts
```

**Main Functions:**

```typescript
// Main conversion function - flexible input
export function toGeoJSON(source?: any[] | string): GeoJSONCollection

// Unified filter function with all options
export function filter(geojson: GeoJSONCollection, options: {
  province?: string;
  kabupaten?: string;
  kecamatan?: string;
  type?: string;
  excludeProvince?: string | string[];
  excludeKabupaten?: string | string[];
  excludeKecamatan?: string | string[];
  excludeType?: string | string[];
}): GeoJSONCollection

// Helper functions (used internally)
export function loadLocationData(filePath?: string): any[]
export function parseWeatherData(weatherData: string[] | null): WeatherData | null
export function toGeoJSONFeature(location: any[]): GeoJSONFeature | null
export function saveGeoJSON(geojson: GeoJSONCollection, outputPath: string): void

// Other filters
export function filterByBoundingBox(...): GeoJSONCollection
```

**Usage Examples:**

```typescript
import { toGeoJSON, filter } from "weather-client/geojson";

// From API/fetch (array)
const locations = await fetch("https://api.example.com/locations").then((r) =>
  r.json(),
);
const geojson = toGeoJSON(locations);

// From file
const geojson = toGeoJSON("./locations.json");

// From default file
const geojson = toGeoJSON();

// Filter with multiple options
const filtered = filter(geojson, {
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"],
});
```

---

### 4. **Weather Module** (`src/weather/`) 🔄 CHANGED

Library untuk weather forecast (bukan GeoJSON lagi).

**Files:**

- `index.ts` - Weather forecast functions (TODO: implement)
- `location.json` - Raw location data
- `location.geojson` - Generated GeoJSON (by convert script)
- `README.md` - Forecast documentation

**Status:** 🚧 Interface only, belum implement fetch forecast

**Planned:**

```typescript
export interface WeatherForecast {
  location: string;
  date: string;
  temperature: { min: number; max: number };
  humidity: number;
  weather: string;
  windSpeed: number;
}

export async function fetchForecast(
  location: string,
): Promise<WeatherForecast[]>;
```

---

---

## 📋 Main Export (`src/index.ts`)

```typescript
// Export all modules
export * from "./aws"; // AWS data fetcher
export * from "./awos"; // AWOS (not implemented)
export * from "./geojson"; // GeoJSON converter ⭐
export * from "./weather"; // Weather forecast (TODO)

export const VERSION = "0.0.0";
```

export _ from "./geojson"; // GeoJSON converter ⭐ NEW
export _ from "./weather"; // Weather forecast (TODO)

export const VERSION = "0.0.0";

````

---

## ✅ What Changed

### Before:

- `weather/index.ts` - Contained GeoJSON conversion code
- GeoJSON mixed with weather forecast

### After:

- **`geojson/index.ts`** - Dedicated GeoJSON library ⭐
- **`weather/index.ts`** - Clean, forecast-only (TODO implement)
- Clear separation of concerns
- Better reusability

---

## 🎯 Benefits

1. **Separation of Concerns**
   - GeoJSON = Data conversion (dari array atau file)
   - Weather = Forecast fetching

2. **Fleksibilitas**
   ```typescript
   // Dari API/fetch
   const data = await fetchFromAPI();
   const geojson = convertToGeoJSON(data);

   // Dari file
   const geojson = convertToGeoJSON("./data.json");
   ```

3. **Better Imports**
   ```typescript
   // Import dari geojson module
   import { convertToGeoJSON } from "weather-client/geojson";

   // Atau dari main export
   import { convertToGeoJSON } from "weather-client";
   ```

4. **Reusability**
   - GeoJSON library dapat digunakan untuk any location data
   - Weather library fokus untuk BMKG forecast API

5. **Maintainability**
   - Each module has single responsibility
   - Easier to test and debug
   - Clear documentation per module

---

## 🚀 Next Steps

1. **Weather Forecast Implementation**
   - Implement `fetchForecast()` function
   - Add support untuk multi-day forecast
   - Add location-based search

2. **AWOS Implementation**
   - Implement AWOS data fetching
   - Add aviation-specific weather data

3. **API Integration**
   - Add GeoJSON endpoint to API
   - Serve dynamic GeoJSON based on filters

4. **Web Frontend**
   - Use GeoJSON library for map visualization
   - Display weather data on interactive map
````
