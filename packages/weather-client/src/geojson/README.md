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
  saveGeoJSON,
  filterByProvince,
  filterByType,
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

### Filter by Province

```typescript
import { toGeoJSON, filterByProvince } from "weather-client/geojson";

const geojson = toGeoJSON();
const acehData = filterByProvince(geojson, "aceh");
console.log(`Aceh locations: ${acehData.features.length}`);
```

### Filter by Type

```typescript
import { toGeoJSON, filterByType } from "weather-client/geojson";

const geojson = toGeoJSON();
const pwxStations = filterByType(geojson, "pwx");
console.log(`PWX stations: ${pwxStations.features.length}`);
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
import {
  toGeoJSON,
  filterByProvince,
  filterByType,
  saveGeoJSON,
} from "weather-client/geojson";

const geojson = toGeoJSON();
const acehData = filterByProvince(geojson, "aceh");
const acehPWX = filterByType(acehData, "pwx");

saveGeoJSON(acehPWX, "./output/aceh-pwx.geojson");
```

### Real-world Example: API to GeoJSON

```typescript
import {
  toGeoJSON,
  filterByProvince,
  saveGeoJSON,
} from "weather-client/geojson";

async function fetchAndConvert() {
  // Fetch from BMKG API
  const response = await fetch("https://api.bmkg.go.id/locations");
  const locations = await response.json();

  // Convert to GeoJSON
  const geojson = toGeoJSON(locations);

  // Filter by province
  const jakartaStations = filterByProvince(geojson, "DKI Jakarta");

  // Save filtered data
  saveGeoJSON(jakartaStations, "./jakarta-stations.geojson");

  return jakartaStations;
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

### `filterByProvince(geojson: GeoJSONCollection, province: string): GeoJSONCollection`

Filter GeoJSON features by province name (case-insensitive).

- `geojson`: GeoJSON FeatureCollection
- `province`: Province name to filter
- Returns: Filtered GeoJSON FeatureCollection

### `filterByType(geojson: GeoJSONCollection, type: string): GeoJSONCollection`

Filter GeoJSON features by station type (case-insensitive).

- `geojson`: GeoJSON FeatureCollection
- `type`: Station type to filter (e.g., "pwx")
- Returns: Filtered GeoJSON FeatureCollection

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
