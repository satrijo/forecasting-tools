# AWS to GeoJSON Converter

Utilities untuk konversi data AWS/ARG station BMKG ke format GeoJSON.

> **📍 Location:** Converter ini adalah bagian dari `geojson` library (`packages/weather-client/src/geojson/index.ts`)
>
> **💡 Usage:** Import dari `weather-client`

## Features

- ✅ Konversi station location data ke GeoJSON
- ✅ Konversi weather data lengkap ke GeoJSON
- ✅ Support semua tipe station (AWS, AAWS, ARG, ASRS, SOIL, IKLIMMIKRO)
- ✅ Weather data berbeda per tipe station
- ✅ Include metadata (count, types, timestamp)
- ✅ Validasi koordinat (range & NaN check)
- ✅ TypeScript dengan full typing
- ✅ Support distance data (dari radius filtering)

## Tipe Station

| Tipe | Nama Lengkap | Deskripsi |
|------|--------------|-----------|
| `aws` | Automatic Weather Station | Stasiun cuaca lengkap |
| `aaws` | Advanced AWS | AWS dengan sensor tambahan |
| `arg` | Automatic Rain Gauge | Pengukur curah hujan otomatis |
| `asrs` | Automatic Solar Radiation Station | Stasiun radiasi matahari |
| `soil` | Soil Moisture Station | Stasiun kelembaban tanah |
| `iklimmikro` | Iklim Mikro | Stasiun iklim mikro multi-level |

## Data Structure per Tipe

### AWS / AAWS Weather Data

```typescript
interface AWSWeatherData {
  battery: number | null;
  temperature: number | null;      // Suhu rata-rata (°C)
  temperatureMax: number | null;   // Suhu maksimum (°C)
  temperatureMin: number | null;   // Suhu minimum (°C)
  humidity: number | null;         // Kelembaban (%)
  rainfall: number | null;         // Curah hujan (mm)
  pressure: number | null;         // Tekanan udara (hPa)
  solarRadiation: number | null;   // Radiasi matahari rata-rata (W/m²)
  solarRadiationMax: number | null;// Radiasi matahari maksimum (W/m²)
  windSpeed: number | null;        // Kecepatan angin rata-rata (m/s)
  windSpeedMax: number | null;     // Kecepatan angin maksimum (m/s)
  windDirection: number | null;    // Arah angin (derajat)
  waterLevel: number | null;       // Tinggi muka air (m)
  par: number | null;              // Photosynthetically Active Radiation
  windSpeed2m: number | null;      // Kecepatan angin 2m (m/s)
}
```

### ARG Weather Data

```typescript
interface ARGWeatherData {
  battery: number | null;
  rainfall: number | null;  // Curah hujan (mm)
}
```

### Soil Weather Data

```typescript
interface SoilWeatherData {
  battery: number | null;
  swc: number | null;  // Soil Water Content
  soilMoisture: {
    sm10: number | null;   // Kedalaman 10cm (%)
    sm20: number | null;   // Kedalaman 20cm (%)
    sm30: number | null;   // Kedalaman 30cm (%)
    sm40: number | null;   // Kedalaman 40cm (%)
    sm60: number | null;   // Kedalaman 60cm (%)
    sm100: number | null;  // Kedalaman 100cm (%)
  };
  soilTemperature: {
    ts10: number | null;   // Kedalaman 10cm (°C)
    ts20: number | null;   // Kedalaman 20cm (°C)
    ts30: number | null;   // Kedalaman 30cm (°C)
    ts40: number | null;   // Kedalaman 40cm (°C)
    ts60: number | null;   // Kedalaman 60cm (°C)
    ts100: number | null;  // Kedalaman 100cm (°C)
  };
}
```

### Iklimmikro Weather Data (Multi-level: 4m, 7m, 10m)

```typescript
interface IklimmikroWeatherData {
  battery: number | null;
  level4m: IklimmikroLevelData;
  level7m: IklimmikroLevelData;
  level10m: IklimmikroLevelData;
}

interface IklimmikroLevelData {
  temperature: number | null;     // Suhu saat ini (°C)
  temperatureMin: number | null;  // Suhu minimum (°C)
  temperatureAvg: number | null;  // Suhu rata-rata (°C)
  temperatureMax: number | null;  // Suhu maksimum (°C)
  humidity: number | null;        // Kelembaban saat ini (%)
  humidityMin: number | null;     // Kelembaban minimum (%)
  humidityAvg: number | null;     // Kelembaban rata-rata (%)
  humidityMax: number | null;     // Kelembaban maksimum (%)
  windSpeed: number | null;       // Kecepatan angin saat ini (m/s)
  windSpeedMin: number | null;    // Kecepatan angin minimum (m/s)
  windSpeedAvg: number | null;    // Kecepatan angin rata-rata (m/s)
  windSpeedMax: number | null;    // Kecepatan angin maksimum (m/s)
  windDirection: number | null;   // Arah angin (derajat)
}
```

### ASRS Weather Data

```typescript
interface ASRSWeatherData {
  battery: number | null;
  diffuseRadiation: number | null;       // Radiasi diffuse (W/m²)
  globalRadiation: number | null;        // Radiasi global (W/m²)
  directNormalIrradiance: number | null; // DNI (W/m²)
  reflectedRadiation: number | null;     // Radiasi yang dipantulkan (W/m²)
  netRadiation: number | null;           // Radiasi bersih (W/m²)
  sunshineMinutes: number | null;        // Durasi penyinaran (menit)
}
```

## Output GeoJSON Examples

### AWS Station

```json
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
    "classification": null,
    "status": {
      "daysDiff": 0,
      "hoursDiff": 0,
      "minutesDiff": 15,
      "lastUpdate": "10 Desember 2025 12:06:00+00",
      "icon": "status_aws_1.png"
    },
    "weather": {
      "battery": 12.9,
      "temperature": 28.6,
      "temperatureMax": 31.1,
      "temperatureMin": 26.9,
      "humidity": 76,
      "rainfall": 0.0,
      "pressure": 1009.2,
      "solarRadiation": 0.0,
      "solarRadiationMax": 964.0,
      "windSpeed": 0.6,
      "windSpeedMax": 1.1,
      "windDirection": 222,
      "waterLevel": 0.882,
      "par": null,
      "windSpeed2m": null
    },
    "loggerTemp": null
  }
}
```

### ARG Station

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [109.5, -7.5]
  },
  "properties": {
    "id": "ARG1234",
    "name": "ARG Banyumas",
    "city": "Kab. Banyumas",
    "type": "arg",
    "province": "Jawa Tengah",
    "provinceCode": "PR013",
    "status": { ... },
    "weather": {
      "battery": 12.57,
      "rainfall": 27.2
    },
    "loggerTemp": null
  }
}
```

### Soil Station

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [110.380872, -6.983863]
  },
  "properties": {
    "id": "STM1002",
    "name": "Soil Moisture Stasiun Klimatologi Jawa Tengah",
    "city": "Kota Semarang",
    "type": "soil",
    "province": "Jawa Tengah",
    "status": { ... },
    "weather": {
      "battery": null,
      "swc": -352.43,
      "soilMoisture": {
        "sm10": 30.05,
        "sm20": 29.49,
        "sm30": 72.06,
        "sm40": 73.17,
        "sm60": 72.09,
        "sm100": 73.17
      },
      "soilTemperature": {
        "ts10": 56.03,
        "ts20": 62.13,
        "ts30": 58.67,
        "ts40": 62.45,
        "ts60": 59.56,
        "ts100": 65.55
      }
    },
    "loggerTemp": null
  }
}
```

### Iklimmikro Station

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [110.3808, -6.9848]
  },
  "properties": {
    "id": "50003",
    "name": "IKRO Staklim Jawa Tengah",
    "city": "Kota Semarang",
    "type": "iklimmikro",
    "province": "Jawa Tengah",
    "status": { ... },
    "weather": {
      "battery": null,
      "level4m": {
        "temperature": 27.2,
        "temperatureMin": 26.9,
        "temperatureAvg": 27.2,
        "temperatureMax": 27.5,
        "humidity": 78,
        "humidityMin": 77,
        "humidityAvg": 78,
        "humidityMax": 78,
        "windSpeed": 2.0,
        "windSpeedMin": 0.6,
        "windSpeedAvg": 1.0,
        "windSpeedMax": 2.0,
        "windDirection": 73
      },
      "level7m": { ... },
      "level10m": { ... }
    },
    "loggerTemp": null
  }
}
```

### ASRS Station

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [110.3809, -6.984]
  },
  "properties": {
    "id": "STA6018",
    "name": "ASRS Staklim Jawa Tengah",
    "city": "Kota Semarang",
    "type": "asrs",
    "province": "Jawa Tengah",
    "status": { ... },
    "weather": {
      "battery": null,
      "diffuseRadiation": 0.0,
      "globalRadiation": 0.0,
      "directNormalIrradiance": 95.4,
      "reflectedRadiation": 0.8,
      "netRadiation": -0.8,
      "sunshineMinutes": 271
    },
    "loggerTemp": null
  }
}
```

## API

### `awsToGeoJSONFeature(station: AWSStation): AWSGeoJSONFeature | null`

Konversi single station ke GeoJSON Feature.

**Returns:** AWSGeoJSONFeature atau `null` jika koordinat invalid

**Example:**

```typescript
import { awsToGeoJSONFeature } from "weather-client";

const station = {
  id_station: "STA2201",
  name_station: "AWS Cilacap",
  nama_kota: "Kab. Cilacap",
  lat: "-7.724880",
  lng: "109.022964",
  type: "aws",
  // ... other fields
};

const feature = awsToGeoJSONFeature(station);
console.log(feature.geometry.coordinates); // [109.022964, -7.72488]
```

### `awsToGeoJSON(stations: AWSStation[], includeMetadata?: boolean): AWSGeoJSONFeatureCollection`

Konversi array of stations ke GeoJSON FeatureCollection.

**Parameters:**

- `stations` - Array of AWS station data
- `includeMetadata` - Include metadata (default: `true`)

**Returns:** AWSGeoJSONFeatureCollection

**Example:**

```typescript
import { awsToGeoJSON } from "weather-client";

const geojson = awsToGeoJSON(stations);
console.log(geojson.features.length);
console.log(geojson.metadata);
```

### `awsToGeoJSONString(stations: AWSStation[], pretty?: boolean, includeMetadata?: boolean): string`

Konversi ke GeoJSON string (JSON.stringify wrapper).

**Parameters:**

- `stations` - Array of AWS station data
- `pretty` - Pretty print JSON (default: `false`)
- `includeMetadata` - Include metadata (default: `true`)

**Example:**

```typescript
import { awsToGeoJSONString } from "weather-client";

const compact = awsToGeoJSONString(stations);
const pretty = awsToGeoJSONString(stations, true);
```

## Integration dengan Mapping Libraries

### Leaflet

```typescript
import { awsToGeoJSON } from "weather-client";

const geojson = awsToGeoJSON(stations);

L.geoJSON(geojson, {
  pointToLayer: (feature, latlng) => {
    return L.marker(latlng).bindPopup(`
      <b>${feature.properties.name}</b><br>
      Type: ${feature.properties.type}<br>
      ${feature.properties.type === 'aws' 
        ? `Temp: ${feature.properties.weather.temperature}°C`
        : feature.properties.type === 'arg'
        ? `Rainfall: ${feature.properties.weather.rainfall}mm`
        : 'Data available'}
    `);
  },
}).addTo(map);
```

### Mapbox GL JS

```typescript
import { awsToGeoJSON } from "weather-client";

const geojson = awsToGeoJSON(stations);

map.addSource("stations", {
  type: "geojson",
  data: geojson,
});

map.addLayer({
  id: "station-points",
  type: "circle",
  source: "stations",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "match",
      ["get", "type"],
      "aws", "#2196F3",
      "aaws", "#1976D2",
      "arg", "#4CAF50",
      "soil", "#795548",
      "iklimmikro", "#9C27B0",
      "asrs", "#FF9800",
      "#999999"
    ],
  },
});
```

## TypeScript Types

```typescript
import type {
  AWSStation,
  AWSGeoJSONFeature,
  AWSGeoJSONFeatureCollection,
  AWSWeatherData,
  ARGWeatherData,
  SoilWeatherData,
  IklimmikroWeatherData,
  IklimmikroLevelData,
  ASRSWeatherData,
  StationWeatherData,
} from "weather-client";
```
