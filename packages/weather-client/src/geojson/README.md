# GeoJSON Converter Library

Convert location data to GeoJSON format with filtering capabilities.

## Files

- `index.ts` - Main library with all conversion functions
- `convert-to-geojson.ts` - CLI script to generate GeoJSON file
- `examples.ts` - Comprehensive usage examples
- `AWS.md` - Documentation for AWS station conversion
- `README.md` - This documentation

## Quick Start

### CLI Tool

```bash
# Generate location.geojson from location.json
bun src/geojson/convert-to-geojson.ts <input.json> <output.geojson>

# Run examples
bun src/geojson/examples.ts
```

## Features

### Public Weather Data (PWX)
- `publicToGeoJSON()` - Convert public weather data to GeoJSON
- `publicToGeoJSONFeature()` - Convert single location
- `filterPublicGeoJSON()` - Filter by province, kabupaten, kecamatan
- `filterPublicByBoundingBox()` - Filter by bounding box

### AWS Station Data
- `awsToGeoJSON()` - Convert AWS stations to GeoJSON
- `awsToGeoJSONFeature()` - Convert single station
- `awsToGeoJSONString()` - Convert to JSON string

## Installation

```typescript
import {
  // Public weather functions
  publicToGeoJSON,
  publicToGeoJSONFeature,
  filterPublicGeoJSON,
  filterPublicByBoundingBox,
  saveGeoJSON,
  
  // AWS station functions
  awsToGeoJSON,
  awsToGeoJSONFeature,
  awsToGeoJSONString,
} from "weather-client";
```

## Usage Examples

### Public Weather Data

#### Basic Conversion

```typescript
import { publicToGeoJSON } from "weather-client";

// From array (API response from getPwxDarat())
const publicWeather = new PublicWeather();
const locations = await publicWeather.getPwxDarat();
const geojson = publicToGeoJSON(locations);
console.log(`Total locations: ${geojson.features.length}`);

// From file
const geojson = publicToGeoJSON("./locations.json");
```

#### Filter Public Weather GeoJSON

```typescript
import { publicToGeoJSON, filterPublicGeoJSON } from "weather-client";

const geojson = publicToGeoJSON(locations);

// Filter by province
const aceh = filterPublicGeoJSON(geojson, { province: "Aceh" });

// Filter by kabupaten
const banyumas = filterPublicGeoJSON(geojson, { kabupaten: "Banyumas" });

// Filter by kecamatan
const purwokerto = filterPublicGeoJSON(geojson, {
  kabupaten: "Banyumas",
  kecamatan: "Purwokerto",
});

// Province excluding kabupatens
const jawaTengah = filterPublicGeoJSON(geojson, {
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"],
});

// Kabupaten excluding kecamatans
const banyumasFiltered = filterPublicGeoJSON(geojson, {
  kabupaten: "Banyumas",
  excludeKecamatan: ["Jatilawang"],
});

// Multiple criteria
const complex = filterPublicGeoJSON(geojson, {
  province: "Jawa Barat",
  kabupaten: "Bandung",
  excludeKabupaten: ["Bandung Barat"],
  type: "pwx",
});
```

#### Filter by Bounding Box

```typescript
import { publicToGeoJSON, filterPublicByBoundingBox } from "weather-client";

const geojson = publicToGeoJSON(locations);

// Filter locations in Java area
const javaLocations = filterPublicByBoundingBox(geojson, 105, -8, 115, -5);
console.log(`Java area locations: ${javaLocations.features.length}`);
```

### AWS Station Data

```typescript
import { awsToGeoJSON, awsToGeoJSONString } from "weather-client";

// Convert AWS stations to GeoJSON
const geojson = awsToGeoJSON(stations);

// Convert to JSON string
const jsonString = awsToGeoJSONString(stations, true); // pretty print
```

> **See [AWS.md](./AWS.md) for complete AWS documentation**

## API Reference

### Public Weather Functions

#### `publicToGeoJSON(source: any[] | string): GeoJSONCollection`

Convert public weather locations to GeoJSON FeatureCollection.

- `source`: Array of location data OR file path string
- Returns: GeoJSON FeatureCollection

```typescript
// From array (API response)
const geojson = publicToGeoJSON(locationArray);

// From file
const geojson = publicToGeoJSON("./locations.json");
```

#### `publicToGeoJSONFeature(location: any[]): GeoJSONFeature | null`

Convert single public weather location to GeoJSON feature.

- `location`: Location array `[province, kabupaten, kecamatan, lat, lon, id, timestamp, weatherData, type]`
- Returns: GeoJSON Feature object or `null`

#### `filterPublicGeoJSON(geojson, options): GeoJSONCollection`

Filter public weather GeoJSON with multiple criteria and exclusions.

Options:
- `province?: string` - Filter by province (exact match, case-insensitive)
- `kabupaten?: string` - Filter by kabupaten (partial match, case-insensitive)
- `kecamatan?: string` - Filter by kecamatan (partial match, case-insensitive)
- `type?: string` - Filter by station type (exact match, case-insensitive)
- `excludeProvince?: string | string[]` - Exclude provinces
- `excludeKabupaten?: string | string[]` - Exclude kabupatens
- `excludeKecamatan?: string | string[]` - Exclude kecamatans
- `excludeType?: string | string[]` - Exclude types

```typescript
// Province only
filterPublicGeoJSON(geojson, { province: "Jawa Tengah" });

// Province excluding kabupatens
filterPublicGeoJSON(geojson, {
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"],
});

// Multiple criteria
filterPublicGeoJSON(geojson, {
  province: "Jawa Barat",
  type: "pwx",
  excludeKabupaten: ["Bandung Barat"],
});
```

#### `filterPublicByBoundingBox(geojson, minLon, minLat, maxLon, maxLat): GeoJSONCollection`

Filter public weather GeoJSON features within a bounding box.

- `geojson`: GeoJSON FeatureCollection
- `minLon`: Minimum longitude
- `minLat`: Minimum latitude
- `maxLon`: Maximum longitude
- `maxLat`: Maximum latitude
- Returns: Filtered GeoJSON FeatureCollection

#### `saveGeoJSON(geojson: GeoJSONCollection, outputPath: string): void`

Save GeoJSON to file.

### AWS Station Functions

See [AWS.md](./AWS.md) for complete documentation.

#### `awsToGeoJSON(stations: AWSStation[], includeMetadata?: boolean): AWSGeoJSONFeatureCollection`

Convert array of AWS stations to GeoJSON FeatureCollection.

#### `awsToGeoJSONFeature(station: AWSStation): AWSGeoJSONFeature | null`

Convert single AWS station to GeoJSON feature.

#### `awsToGeoJSONString(stations: AWSStation[], pretty?: boolean, includeMetadata?: boolean): string`

Convert AWS stations to GeoJSON string.

## TypeScript Interfaces

### Public Weather Types

```typescript
interface WeatherData {
  humidity: string;
  temperature: string;
  rainfall: string;
  windDirection: string;
  windSpeed: string;
}

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

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
```

### AWS Types

See [AWS.md](./AWS.md) for AWS TypeScript interfaces.

## GeoJSON Output Structure

### Public Weather

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

### AWS Station

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [109.022964, -7.72488]
      },
      "properties": {
        "id": "STA2201",
        "name": "AWS Maritim Cilacap",
        "city": "Kab. Cilacap",
        "type": "aws",
        "province": "Jawa Tengah",
        "provinceCode": "PR013",
        "status": { ... },
        "weather": { ... },
        "loggerTemp": null
      }
    }
  ],
  "metadata": {
    "count": 14,
    "generated": "2025-12-11T08:45:30.123Z",
    "types": { "aws": 10, "arg": 4 }
  }
}
```

## Function Naming Convention

| Data Source | Functions |
|-------------|-----------|
| Public Weather (PWX) | `publicToGeoJSON`, `publicToGeoJSONFeature`, `filterPublicGeoJSON`, `filterPublicByBoundingBox` |
| AWS Stations | `awsToGeoJSON`, `awsToGeoJSONFeature`, `awsToGeoJSONString` |
