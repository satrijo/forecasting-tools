# weather-client

Library untuk fetch dan konversi data cuaca BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) Indonesia.

## Features

- ✅ Fetch data AWS/ARG stations (2000+ stasiun)
- ✅ Fetch public weather forecast data
- ✅ Convert ke GeoJSON format
- ✅ Filter by province, city, radius, bounding box
- ✅ Support semua tipe station (AWS, AAWS, ARG, ASRS, Soil, Iklimmikro)
- ✅ TypeScript dengan full typing

## Installation

```bash
bun add weather-client
```

## Modules

| Module | Description | Documentation |
|--------|-------------|---------------|
| `aws` | AWS/ARG station data fetcher | [README](src/aws/README.md) |
| `public` | Public weather data fetcher | [README](src/public/README.md) |
| `geojson` | GeoJSON converter & filters | [README](src/geojson/README.md) |

## Quick Start

### AWS Station Data

```typescript
import { AWSDataFetcher, BMKGAuth } from "weather-client";

// Setup authentication
const auth = new BMKGAuth(
  process.env.BMKG_USERNAME,
  process.env.BMKG_PASSWORD
);
const fetcher = new AWSDataFetcher(auth);

// Fetch by province
const data = await fetcher.fetchDataByProvince(["PR013"], "aws");

// Fetch by city
const data = await fetcher.fetchDataByCity("banyumas", "aws");

// Fetch by radius (50km from coordinate)
const data = await fetcher.fetchDataByRadius(-7.43, 109.24, 50, "aws");
```

### Public Weather Data

```typescript
import { PublicWeather } from "weather-client";

const publicWeather = new PublicWeather();

// Get weather forecast
const forecast = await publicWeather.getPwxDarat();

// Get nowcasting
const nowcast = await publicWeather.getNowcasting("CJH");
```

### GeoJSON Conversion

```typescript
import { 
  // Public weather
  publicToGeoJSON,
  filterPublicGeoJSON,
  filterPublicByBoundingBox,
  
  // AWS stations
  awsToGeoJSON,
  awsToGeoJSONFeature,
  awsToGeoJSONString,
} from "weather-client";

// Convert public weather to GeoJSON
const pwxData = await publicWeather.getPwxDarat();
const geojson = publicToGeoJSON(pwxData);

// Filter by province
const filtered = filterPublicGeoJSON(geojson, { 
  province: "Jawa Tengah",
  excludeKabupaten: ["Banyumas", "Cilacap"]
});

// Filter by bounding box (Java area)
const java = filterPublicByBoundingBox(geojson, 105, -8, 115, -5);

// Convert AWS stations to GeoJSON
const stations = await fetcher.fetchDataByProvince(["PR013"], "aws");
const awsGeoJSON = awsToGeoJSON(stations);
```

## Station Types

| Type | Description | Data Fields |
|------|-------------|-------------|
| `aws` | Automatic Weather Station | Temperature, humidity, rainfall, wind, pressure, solar radiation |
| `aaws` | Advanced AWS | AWS + PAR, wind speed 2m |
| `arg` | Automatic Rain Gauge | Rainfall only |
| `asrs` | Automatic Solar Radiation Station | Solar radiation (diffuse, global, DNI, reflected, net) |
| `soil` | Soil Moisture Station | Soil moisture & temperature at 10-100cm depths |
| `iklimmikro` | Microclimate Station | Multi-level data (4m, 7m, 10m) |

## API Reference

### AWS Module

```typescript
// Data fetching
fetcher.fetchDataByProvince(provinceCodes, type, city?, excludeCity?)
fetcher.fetchDataByCity(cityNames, type, matchMode?, excludeCity?)
fetcher.fetchDataByRadius(lat, lon, radius, type?)
fetcher.fetchStationData(stationId, type?, includeLocationInfo?)

// Station filtering (without fetch)
fetcher.getStationsByProvince(provinceCodes, type?, city?, excludeCity?)
fetcher.getStationsByCity(cityNames, type?, matchMode?, excludeCity?)
fetcher.getStationsByRadius(lat, lon, radius, type?)
```

### Public Module

```typescript
publicWeather.getPwxDarat()                    // Weather forecast
publicWeather.getNowcasting(code)              // Nowcasting (signature)
publicWeather.getNowcastingXML(url)            // Nowcasting (XML)
publicWeather.getNowcastingXMLLatest(province) // Latest nowcasting list
```

### GeoJSON Module

```typescript
// Public weather
publicToGeoJSON(source)                        // Convert to GeoJSON
publicToGeoJSONFeature(location)               // Convert single location
filterPublicGeoJSON(geojson, options)          // Filter by criteria
filterPublicByBoundingBox(geojson, minLon, minLat, maxLon, maxLat)

// AWS stations
awsToGeoJSON(stations, includeMetadata?)       // Convert to GeoJSON
awsToGeoJSONFeature(station)                   // Convert single station
awsToGeoJSONString(stations, pretty?, includeMetadata?)
```

## TypeScript Types

```typescript
import type {
  // AWS types
  AWSStation,
  AWSGeoJSONFeature,
  AWSGeoJSONFeatureCollection,
  AWSWeatherData,
  ARGWeatherData,
  SoilWeatherData,
  IklimmikroWeatherData,
  ASRSWeatherData,
  StationWeatherData,
  
  // Public weather types
  GeoJSONFeature,
  GeoJSONCollection,
  WeatherData,
} from "weather-client";
```

## Documentation

- [AWS Fetcher](src/aws/README.md) - Complete AWS data fetching documentation
- [GeoJSON Converter](src/geojson/README.md) - GeoJSON conversion & filtering
- [AWS to GeoJSON](src/geojson/AWS.md) - Detailed AWS GeoJSON format

## License

MIT
