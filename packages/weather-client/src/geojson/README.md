# GeoJSON Converter Library

Convert location data to GeoJSON format with filtering capabilities.

## Files

- `index.ts` - Main library with all conversion functions
- `convert-to-geojson.ts` - CLI script to generate GeoJSON file
- `examples.ts` - Comprehensive usage examples
- `README.md` - This documentation

## Quick Start

### CLI Tool

```bash
# Generate location.geojson from location.json
bun src/geojson/convert-to-geojson.ts

# Run examples
bun src/geojson/examples.ts
```

## Features

- Convert location data to standard GeoJSON FeatureCollection
- Parse weather data into structured objects
- Filter by province, type, or bounding box
- Save GeoJSON to files
- Type-safe TypeScript interfaces

## Installation

```typescript
import {
  toGeoJSON,
  filter,
  saveGeoJSON,
  filterByBoundingBox,
} from "weather-client/geojson";
```

## Usage Examples

### Basic Conversion

```typescript
import { toGeoJSON } from "weather-client/geojson";

// From array (API response, database, etc)
const locations = await fetch("https://api.example.com/locations").then((r) =>
  r.json(),
);
const geojson = toGeoJSON(locations);
console.log(`Total locations: ${geojson.features.length}`);

// From file
const geojson = toGeoJSON("./custom-locations.json");

// From default file (../weather/location.json)
const geojson = toGeoJSON();
```

### Unified Filter Function

The `filter()` function provides flexible filtering with multiple options:

```typescript
import { toGeoJSON, filter } from "weather-client/geojson";

const geojson = toGeoJSON();

// Filter by province
const aceh = filter(geojson, { province: "Aceh" });

// Filter by kabupaten
const banyumas = filter(geojson, { kabupaten: "Banyumas" });

// Filter by kecamatan
const purwokerto = filter(geojson, {
  kabupaten: "Banyumas",
  kecamatan: "Purwokerto",
});

// Province excluding kabupatens
const jawaTengah = filter(geojson, {
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"],
});

// Kabupaten excluding kecamatans
const banyumasFiltered = filter(geojson, {
  kabupaten: "Banyumas",
  excludeKecamatan: ["Jatilawang"],
});

// Multiple criteria
const complex = filter(geojson, {
  province: "Jawa Barat",
  kabupaten: "Bandung",
  excludeKabupaten: ["Bandung Barat"],
  type: "pwx",
});
```

### Filter by Bounding Box

```typescript
import { toGeoJSON, filterByBoundingBox } from "weather-client/geojson";

const geojson = toGeoJSON();
// Filter locations in Java area
const javaLocations = filterByBoundingBox(geojson, 105, -8, 115, -5);
console.log(`Java area locations: ${javaLocations.features.length}`);
```

### Combined Filters

```typescript
import { toGeoJSON, filter, saveGeoJSON } from "weather-client/geojson";

const geojson = toGeoJSON();

const filtered = filter(geojson, {
  province: "Aceh",
  type: "pwx",
});

saveGeoJSON(filtered, "./output/aceh-pwx.geojson");
```

### Real-world Example: API to GeoJSON

```typescript
import { toGeoJSON, filter, saveGeoJSON } from "weather-client/geojson";

async function fetchAndConvert() {
  // Fetch from BMKG API
  const response = await fetch("https://api.bmkg.go.id/locations");
  const locations = await response.json();

  // Convert to GeoJSON
  const geojson = toGeoJSON(locations);

  // Filter by province, exclude specific kabupatens
  const jakartaFiltered = filter(geojson, {
    province: "DKI Jakarta",
    excludeKabupaten: ["Jakarta Utara"],
  });

  // Save filtered data
  saveGeoJSON(jakartaFiltered, "./jakarta-stations.geojson");

  return jakartaFiltered;
}
```

## API Reference

### `toGeoJSON(source?: any[] | string): GeoJSONCollection`

**Main conversion function** - Flexible input: array, file path, or default.

- `source` (optional):
  - Array of location data (from API/fetch/database)
  - File path string to load from
  - Omit to load default file (`../weather/location.json`)
- Returns: GeoJSON FeatureCollection

**Examples:**

```typescript
// From array (API response)
const geojson = toGeoJSON(locationArray);

// From file
const geojson = toGeoJSON("./locations.json");

// From default file
const geojson = toGeoJSON();
```

### `filter(geojson, options): GeoJSONCollection`

**NEW unified filter function** - Filter with multiple criteria and exclusions.

Options:

- `province?: string` - Filter by province (exact match, case-insensitive)
- `kabupaten?: string` - Filter by kabupaten (partial match, case-insensitive)
- `kecamatan?: string` - Filter by kecamatan (partial match, case-insensitive)
- `type?: string` - Filter by station type (exact match, case-insensitive)
- `excludeProvince?: string | string[]` - Exclude provinces
- `excludeKabupaten?: string | string[]` - Exclude kabupatens
- `excludeKecamatan?: string | string[]` - Exclude kecamatans
- `excludeType?: string | string[]` - Exclude types

**Examples:**

```typescript
// Province only
filter(geojson, { province: "Jawa Tengah" });

// Province excluding kabupatens
filter(geojson, {
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"],
});

// Kabupaten excluding kecamatans
filter(geojson, {
  kabupaten: "Banyumas",
  excludeKecamatan: ["Jatilawang"],
});

// Kecamatan only
filter(geojson, {
  kabupaten: "Banyumas",
  kecamatan: "Purwokerto",
});

// Multiple criteria
filter(geojson, {
  province: "Jawa Barat",
  type: "pwx",
  excludeKabupaten: ["Bandung Barat"],
});
```

### `loadLocationData(filePath?: string): any[]`

Load location data from JSON file. Used internally by `toGeoJSON()`.

- `filePath` (optional): Path to location JSON file. Defaults to `../weather/location.json`
- Returns: Array of location data

### `parseWeatherData(weatherData: string[] | null): WeatherData | null`

Parse weather data array into structured object. Used internally by `toGeoJSONFeature()`.

- `weatherData`: Array of weather values `[humidity, temperature, rainfall, windDirection, windSpeed]`
- Returns: Structured `WeatherData` object or `null`

### `toGeoJSONFeature(location: any[]): GeoJSONFeature | null`

Convert single location to GeoJSON feature. Used internally by `toGeoJSON()`.

- `location`: Location array `[province, kabupaten, kecamatan, lat, lon, id, timestamp, weatherData, type]`
- Returns: GeoJSON Feature object or `null`

### `saveGeoJSON(geojson: GeoJSONCollection, outputPath: string): void`

Save GeoJSON to file.

- `geojson`: GeoJSON FeatureCollection to save
- `outputPath`: Output file path

### `filterByBoundingBox(geojson, minLon, minLat, maxLon, maxLat): GeoJSONCollection`

Filter GeoJSON features within a bounding box.

- `geojson`: GeoJSON FeatureCollection
- `minLon`: Minimum longitude
- `minLat`: Minimum latitude
- `maxLon`: Maximum longitude
- `maxLat`: Maximum latitude
- Returns: Filtered GeoJSON FeatureCollection

## TypeScript Interfaces

### `WeatherData`

```typescript
interface WeatherData {
  humidity: string;
  temperature: string;
  rainfall: string;
  windDirection: string;
  windSpeed: string;
}
```

### `GeoJSONFeature`

```typescript
interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    id: string;
    province: string;
    kabupaten: string;
    kecamatan: string;
    timestamp: string;
    type: string;
    weather: WeatherData | null;
  };
}
```

### `GeoJSONCollection`

```typescript
interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
```

## GeoJSON Output Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [95.32, 5.55]
      },
      "properties": {
        "id": "96001",
        "province": "Aceh",
        "kabupaten": "Aceh Besar",
        "kecamatan": "Lhoknga",
        "timestamp": "202412100800",
        "type": "pwx",
        "weather": {
          "humidity": "82",
          "temperature": "26.5",
          "rainfall": "0",
          "windDirection": "90",
          "windSpeed": "5"
        }
      }
    }
  ]
}
```
