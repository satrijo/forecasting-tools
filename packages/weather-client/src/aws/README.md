# BMKG AWS/ARG Data Fetcher

Library untuk mengambil data cuaca real-time dari stasiun AWS (Automatic Weather Station) dan ARG (Automatic Rain Gauge) BMKG.

## Features

- ✅ Fetch data berdasarkan provinsi
- ✅ Fetch data berdasarkan kota/kabupaten
- ✅ Fetch data berdasarkan radius (koordinat + jarak)
- ✅ Filter berdasarkan tipe station (AWS, ARG, AAWS, ASRS, SOIL, IKLIMMIKRO, AWSSHIP)
- ✅ City filtering dengan include/exclude
- ✅ Match mode: partial, exact, startsWith
- ✅ Konversi ke GeoJSON
- ✅ 2000+ stasiun di seluruh Indonesia
- ✅ Auto-retry dengan rate limiting
- ✅ TypeScript dengan full typing

## Installation

```bash
# Install package (jika sudah publish)
npm install @bmkg/weather-client

# Atau jika dalam monorepo
bun install
```

## Quick Start

```typescript
import { BMKGAuth, AWSDataFetcher } from "@bmkg/weather-client/aws";

// 1. Inisialisasi dengan kredensial BMKG
const auth = new BMKGAuth(
  process.env.BMKG_USERNAME || "",
  process.env.BMKG_PASSWORD || "",
);

// 2. Create fetcher instance
const fetcher = new AWSDataFetcher(auth);

// 3. Fetch data by province
const data = await fetcher.fetchDataByProvince(["PR013"], "aws");
console.log(data);
```

## Authentication

### BMKGAuth

```typescript
import { BMKGAuth } from "@bmkg/weather-client/aws";

const auth = new BMKGAuth(username, password);
```

**Features:**

- Auto-login dengan credentials
- Cookie-based session management
- Auto-retry dengan exponential backoff
- Rate limiting (500ms delay between requests)

## AWSDataFetcher API

### Constructor

```typescript
const fetcher = new AWSDataFetcher(auth);
```

### Methods

#### 1. `getStationsByProvince()`

Filter stasiun berdasarkan kode provinsi (tanpa fetch data).

```typescript
getStationsByProvince(
  provinceCodes: string[],
  type?: string | string[] | null,
  city?: string | string[] | null,
  excludeCity?: string | string[] | null
): Station[]
```

**Parameters:**

- `provinceCodes` - Array kode provinsi (e.g., `["PR013"]`)
- `type` - Filter tipe: `"aws"`, `"arg"`, `["aws", "arg"]`, atau `null` (semua)
- `city` - Filter kota (partial match, case-insensitive)
- `excludeCity` - Exclude kota (partial match, case-insensitive)

**Example:**

```typescript
// Semua AWS di Jawa Tengah
const stations = fetcher.getStationsByProvince(["PR013"], "aws");

// AWS di Banyumas, exclude Jatilawang
const stations = fetcher.getStationsByProvince(
  ["PR013"],
  "aws",
  "banyumas",
  "jatilawang",
);

// Semua tipe di Jawa Timur
const stations = fetcher.getStationsByProvince(["PR015"], null);

// AWS & ARG di beberapa provinsi
const stations = fetcher.getStationsByProvince(
  ["PR013", "PR015"],
  ["aws", "arg"],
);
```

#### 2. `getStationsByCity()`

Filter stasiun berdasarkan nama kota (tanpa fetch data).

```typescript
getStationsByCity(
  cityNames: string | string[],
  type?: string | string[] | null,
  matchMode?: "partial" | "exact" | "startsWith",
  excludeCity?: string | string[] | null
): Station[]
```

**Parameters:**

- `cityNames` - Nama kota atau array nama kota
- `type` - Filter tipe station
- `matchMode` - Mode pencarian: `"partial"` (default), `"exact"`, `"startsWith"`
- `excludeCity` - Exclude kota tertentu

**Example:**

```typescript
// Partial match (default)
const stations = fetcher.getStationsByCity("banyumas", "aws");
// Matches: "Kab. Banyumas"

// Exact match
const stations = fetcher.getStationsByCity("kab. banyumas", "aws", "exact");

// Starts with
const stations = fetcher.getStationsByCity("kota", "aws", "startsWith");
// Matches: "Kota Jakarta", "Kota Bandung", etc.

// Multiple cities
const stations = fetcher.getStationsByCity(["banyumas", "cilacap"], "aws");
```

#### 3. `getStationsByRadius()`

Filter stasiun berdasarkan radius dari koordinat (tanpa fetch data).

```typescript
getStationsByRadius(
  lat: number,
  lon: number,
  radius: number,
  type?: string | string[] | null
): Station[]
```

**Parameters:**

- `lat` - Latitude center point
- `lon` - Longitude center point
- `radius` - Radius dalam kilometer
- `type` - Filter tipe station

**Returns:** Array stasiun dengan property `distance` (dalam km), sorted by distance.

**Example:**

```typescript
// AWS dalam radius 50km dari Banyumas
const nearby = fetcher.getStationsByRadius(-7.4297, 109.2389, 50, "aws");

console.log(nearby[0].distance); // 0.5 km
console.log(nearby[0].name_station); // "AWS Banyumas"
```

#### 4. `fetchDataByProvince()`

Fetch data cuaca berdasarkan kode provinsi.

```typescript
async fetchDataByProvince(
  provinceCodes: string[],
  type?: string | string[] | null,
  city?: string | string[] | null,
  excludeCity?: string | string[] | null
): Promise<StationData[]>
```

**Example:**

```typescript
// Fetch semua AWS di Jawa Tengah
const data = await fetcher.fetchDataByProvince(["PR013"], "aws");

// Fetch AWS di Banyumas, exclude Jatilawang
const data = await fetcher.fetchDataByProvince(
  ["PR013"],
  "aws",
  "banyumas",
  "jatilawang",
);

// Fetch semua tipe (AWS + ARG + AAWS)
const data = await fetcher.fetchDataByProvince(["PR013"], null);
```

#### 5. `fetchDataByCity()`

Fetch data cuaca berdasarkan nama kota.

```typescript
async fetchDataByCity(
  cityNames: string | string[],
  type?: string | string[] | null,
  matchMode?: "partial" | "exact" | "startsWith",
  excludeCity?: string | string[] | null
): Promise<StationData[]>
```

**Example:**

```typescript
// Fetch AWS di Banyumas
const data = await fetcher.fetchDataByCity("banyumas", "aws");

// Fetch dari multiple cities
const data = await fetcher.fetchDataByCity(["banyumas", "cilacap"], "aws");

// Exact match
const data = await fetcher.fetchDataByCity("kab. banyumas", "aws", "exact");
```

#### 6. `fetchDataByRadius()`

Fetch data cuaca berdasarkan radius dari koordinat.

```typescript
async fetchDataByRadius(
  lat: number,
  lon: number,
  radius: number,
  type?: string | string[] | null
): Promise<StationData[]>
```

**Example:**

```typescript
// Fetch AWS dalam 50km dari koordinat
const data = await fetcher.fetchDataByRadius(-7.4297, 109.2389, 50, "aws");

// Data includes distance property
console.log(data[0].distance); // 0.5 km
```

#### 7. `fetchStationData()`

Fetch data untuk satu stasiun tertentu.

```typescript
async fetchStationData(
  stationId: string,
  type?: string | null,
  includeLocationInfo?: boolean
): Promise<StationData>
```

**Example:**

```typescript
// Fetch single station
const data = await fetcher.fetchStationData("STW1234", "aws");

// Auto-detect type from location.json
const data = await fetcher.fetchStationData("STW1234");

// Without location info (lighter)
const data = await fetcher.fetchStationData("STW1234", "aws", false);
```

#### 8. `getLocationInfo()`

Get informasi lokasi stasiun dari location.json.

```typescript
getLocationInfo(stationId: string): Station | undefined
```

**Example:**

```typescript
const info = fetcher.getLocationInfo("STW1234");
console.log(info?.name_station); // "AWS Banyumas"
console.log(info?.nama_kota); // "Kab. Banyumas"
console.log(info?.lat, info?.lng); // -7.4297, 109.2389
```

## Province Codes

Gunakan kode provinsi untuk filtering:

| Kode    | Provinsi            |
| ------- | ------------------- |
| `PR001` | Aceh                |
| `PR002` | Sumatera Utara      |
| `PR003` | Sumatera Barat      |
| `PR004` | Riau                |
| `PR005` | Kepulauan Riau      |
| `PR006` | Jambi               |
| `PR007` | Bengkulu            |
| `PR008` | Sumatera Selatan    |
| `PR009` | Bangka Belitung     |
| `PR010` | Lampung             |
| `PR011` | DKI Jakarta         |
| `PR012` | Jawa Barat          |
| `PR013` | Jawa Tengah         |
| `PR014` | Banten              |
| `PR015` | Jawa Timur          |
| `PR016` | DI Yogyakarta       |
| `PR017` | Bali                |
| `PR018` | Nusa Tenggara Barat |
| `PR019` | Nusa Tenggara Timur |
| `PR020` | Kalimantan Barat    |
| `PR021` | Kalimantan Tengah   |
| `PR022` | Kalimantan Selatan  |
| `PR023` | Kalimantan Timur    |
| `PR024` | Kalimantan Utara    |
| `PR025` | Sulawesi Utara      |
| `PR026` | Gorontalo           |
| `PR027` | Sulawesi Tengah     |
| `PR028` | Sulawesi Selatan    |
| `PR029` | Sulawesi Barat      |
| `PR030` | Sulawesi Tenggara   |
| `PR031` | Maluku              |
| `PR032` | Maluku Utara        |
| `PR033` | Papua               |
| `PR034` | Papua Barat         |

**Lihat:** `province.json` untuk daftar lengkap.

## Station Types

- **AWS** - Automatic Weather Station (stasiun cuaca otomatis lengkap) - 418 stasiun
- **ARG** - Automatic Rain Gauge (penakar hujan otomatis) - 754 stasiun
- **AAWS** - Advanced Automatic Weather Station - 105 stasiun
- **ASRS** - Automated Surface/Reference Station - 35 stasiun
- **SOIL** - Soil Monitoring Station (stasiun monitoring tanah) - 27 stasiun
- **IKLIMMIKRO** - Microclimate Station (stasiun iklim mikro) - 27 stasiun
- **AWSSHIP** - AWS on Ship (stasiun cuaca di kapal) - 3 stasiun

**Total:** ~1,369 stasiun di seluruh Indonesia

### Filter by Station Type

```typescript
// Get specific station type
const aws = await fetcher.fetchDataByProvince(["PR013"], "aws");
const arg = await fetcher.fetchDataByProvince(["PR013"], "arg");
const soil = await fetcher.fetchDataByProvince(["PR013"], "soil");
const asrs = await fetcher.fetchDataByProvince(["PR013"], "asrs");
const iklimmikro = await fetcher.fetchDataByProvince(["PR013"], "iklimmikro");
const awsship = await fetcher.fetchDataByProvince(["PR013"], "awsship");

// Combine multiple types
const weatherStations = await fetcher.fetchDataByProvince(
  ["PR013"],
  ["aws", "aaws", "asrs"], // All weather monitoring stations
);

const rainfallStations = await fetcher.fetchDataByProvince(
  ["PR013"],
  ["arg", "aws"], // Stations with rainfall data
);

const specializedStations = await fetcher.fetchDataByProvince(
  ["PR013"],
  ["soil", "iklimmikro"], // Soil and microclimate monitoring
);

// All station types
const allStations = await fetcher.fetchDataByProvince(["PR013"], null);
```

## Data Structure

### Station (Location Data)

```typescript
{
  id_station: "STW1234",
  name_station: "AWS Banyumas",
  nama_kota: "Kab. Banyumas",
  lat: "-7.4297",
  lng: "109.2389",
  icon: "status_aws_1.png",
  type: "aws",
  diff_day: "0",
  diff_hour: "0",
  diff_minute: "15",
  tanggal: "2025-12-10 08:30:00+00",
  kode_provinsi: "PR013",
  nama_provinsi: "Jawa Tengah",
  klasifikasi: "1"
}
```

### Station Data (With Weather)

```typescript
{
  success: true,
  stationId: "STW1234",
  stationName: "AWS Banyumas",
  city: "Kab. Banyumas",
  province: "Jawa Tengah",
  provinceCode: "PR013",
  lat: "-7.4297",
  lng: "109.2389",
  type: "aws",
  data: {
    t: "28.5",        // temperature (°C)
    tx: "32.0",       // max temperature
    tn: "24.0",       // min temperature
    tavg: "28.0",     // average temperature
    rh: "75.5",       // relative humidity (%)
    rr: "2.5",        // rainfall (mm)
    ss: "6.5",        // sunshine duration (hours)
    ff_x: "15.2",     // max wind speed (knot)
    ddd_x: "90",      // wind direction (°)
    ff_avg: "8.5",    // average wind speed (knot)
    ddd_car: "E",     // wind cardinal direction
    // ... other parameters
  }
}
```

## GeoJSON Conversion

Konversi data stasiun ke format GeoJSON untuk mapping.

```typescript
import { awsToGeoJSON } from "@bmkg/weather-client/geojson";

const stations = await fetcher.fetchDataByProvince(["PR013"], "aws");
const geojson = awsToGeoJSON(stations);

// Use with Leaflet, Mapbox GL JS, etc.
map.addSource("stations", {
  type: "geojson",
  data: geojson,
});
```

**Lihat:** [AWS GeoJSON Conversion](../geojson/AWS.md) untuk dokumentasi lengkap konversi GeoJSON.

## Use Cases

### 1. Weather Dashboard

```typescript
// Fetch all AWS in province
const data = await fetcher.fetchDataByProvince(["PR013"], "aws");

// Display on dashboard
data.forEach((station) => {
  if (station.success) {
    console.log(`${station.stationName}: ${station.data.t}°C`);
  }
});
```

### 2. Nearest Weather Stations

```typescript
// Find 10 nearest stations
const nearby = await fetcher.fetchDataByRadius(userLat, userLon, 100, "aws");

// Show to user (sorted by distance)
nearby.slice(0, 10).forEach((station) => {
  console.log(`${station.stationName}: ${station.distance.toFixed(2)} km`);
});
```

### 3. Regional Weather Map

```typescript
import { awsToGeoJSON } from "@bmkg/weather-client/geojson";

// Get all stations in region
const stations = await fetcher.fetchDataByProvince(
  ["PR013", "PR015", "PR016"],
  null,
);

// Convert to GeoJSON
const geojson = awsToGeoJSON(stations);

// Display on map
map.addLayer({
  id: "weather-stations",
  type: "circle",
  source: "stations",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "interpolate",
      ["linear"],
      ["get", "temperature", ["get", "weather"]],
      20,
      "#0000ff",
      25,
      "#00ff00",
      30,
      "#ffff00",
      35,
      "#ff0000",
    ],
  },
});
```

### 4. City Weather Monitoring

```typescript
// Monitor specific cities
const cities = ["banyumas", "purwokerto", "cilacap"];
const data = await fetcher.fetchDataByCity(cities, "aws");

// Send alerts if temperature > 35°C
data.forEach((station) => {
  if (station.success && parseFloat(station.data.t) > 35) {
    sendAlert(
      `High temperature at ${station.stationName}: ${station.data.t}°C`,
    );
  }
});
```

### 5. Rainfall Analysis

```typescript
// Get ARG stations for rainfall data
const rainfall = await fetcher.fetchDataByProvince(["PR013"], "arg");

// Calculate total rainfall
const totalRainfall = rainfall.reduce((sum, station) => {
  return sum + (station.success ? parseFloat(station.data.rr || 0) : 0);
}, 0);

console.log(`Total rainfall: ${totalRainfall.toFixed(2)} mm`);
```

### 6. Soil Moisture Monitoring

```typescript
// Get SOIL stations for soil monitoring
const soilStations = await fetcher.fetchDataByProvince(["PR013"], "soil");

// Monitor soil conditions
soilStations.forEach((station) => {
  if (station.success && station.data) {
    console.log(`${station.stationName}:`);
    console.log(`  Soil Moisture: ${station.data.soil_moisture || "N/A"}`);
    console.log(`  Soil Temperature: ${station.data.soil_temp || "N/A"}°C`);
  }
});
```

### 7. Microclimate Analysis

```typescript
// Get microclimate stations
const microclimate = await fetcher.fetchDataByProvince(["PR013"], "iklimmikro");

// Analyze local climate conditions
microclimate.forEach((station) => {
  if (station.success) {
    console.log(`${station.stationName}: ${station.data.t}°C`);
  }
});
```

### 8. Aviation Weather (ASRS)

```typescript
// Get ASRS stations for aviation weather
const asrsStations = await fetcher.fetchDataByProvince(["PR011"], "asrs"); // Jakarta

// Critical for flight operations
asrsStations.forEach((station) => {
  if (station.success) {
    console.log(`${station.stationName}:`);
    console.log(`  Visibility: ${station.data.visibility || "N/A"}`);
    console.log(
      `  Wind: ${station.data.ff_avg} knot from ${station.data.ddd_car}`,
    );
  }
});
```

### 9. Marine Weather (AWSSHIP)

```typescript
// Get ship-based AWS
const shipStations = await fetcher.fetchDataByProvince(
  ["PR010"], // Kepulauan Riau
  "awsship",
);

// Marine weather conditions
shipStations.forEach((station) => {
  if (station.success) {
    console.log(`${station.stationName}:`);
    console.log(`  Sea Temperature: ${station.data.t}°C`);
    console.log(`  Wind Speed: ${station.data.ff_avg} knot`);
  }
});
```

### 10. API Endpoint

```typescript
import { Hono } from "hono";
import { awsToGeoJSON } from "@bmkg/weather-client/geojson";

const app = new Hono();

app.get("/api/weather/:province", async (c) => {
  const province = c.req.param("province");
  const type = c.req.query("type") || "aws";

  const data = await fetcher.fetchDataByProvince([province], type);
  const geojson = toGeoJSON(data);

  return c.json(geojson);
});
```

## Error Handling

```typescript
const data = await fetcher.fetchDataByProvince(["PR013"], "aws");

data.forEach((station) => {
  if (station.success) {
    console.log(`✓ ${station.stationName}: ${station.data.t}°C`);
  } else {
    console.error(`✗ ${station.stationName}: ${station.error}`);
  }
});
```

## Performance Notes

- **Rate Limiting:** 500ms delay antara requests
- **Retry Logic:** Exponential backoff (1s, 2s, 4s)
- **Station Count:** ~2000+ stasiun di seluruh Indonesia
- **Response Time:** ~100-500ms per stasiun
- **Caching:** Consider implementing cache layer untuk production

## Examples

See example files:

- `examples-geojson.ts` - GeoJSON conversion examples

Run examples:

```bash
bun run packages/weather-client/src/aws/examples-geojson.ts
```

## Related Documentation

- [AWS GeoJSON Conversion](../geojson/AWS.md) - Dokumentasi lengkap konversi ke GeoJSON
- [GeoJSON Library](../geojson/README.md) - GeoJSON converter library
- [Province List](./province.json) - Daftar kode provinsi
- [Location Data](./location.json) - Database ~1,369 stasiun

## Tips & Best Practices

### 1. Use City Filtering for Better Performance

```typescript
// ❌ Bad: Fetch semua, filter di client
const all = await fetcher.fetchDataByProvince(["PR013"], "aws");
const filtered = all.filter((s) => s.city.includes("Banyumas"));

// ✅ Good: Filter di server
const data = await fetcher.fetchDataByProvince(["PR013"], "aws", "banyumas");
```

### 2. Cache Station List

```typescript
// ❌ Bad: Load location.json setiap request
app.get("/api/stations", (c) => {
  const fetcher = new AWSDataFetcher(auth); // Loads location.json
  const stations = fetcher.getStationsByProvince(["PR013"]);
  return c.json(stations);
});

// ✅ Good: Reuse fetcher instance
const fetcher = new AWSDataFetcher(auth);

app.get("/api/stations", (c) => {
  const stations = fetcher.getStationsByProvince(["PR013"]);
  return c.json(stations);
});
```

### 3. Use Radius for Nearby Stations

```typescript
// ✅ Good: Get stations within 50km
const nearby = fetcher.getStationsByRadius(lat, lon, 50, "aws");

// Sorted by distance, includes distance property
console.log(nearby[0].distance); // 0.5 km
```

### 4. Combine Filters

```typescript
// Get AWS in Jawa Tengah, only Banyumas, exclude Jatilawang
const data = await fetcher.fetchDataByProvince(
  ["PR013"],
  "aws",
  "banyumas",
  "jatilawang",
);
```

### 5. Handle Errors Gracefully

```typescript
const data = await fetcher.fetchDataByProvince(["PR013"], "aws");

const successful = data.filter((s) => s.success);
const failed = data.filter((s) => !s.success);

console.log(`Success: ${successful.length}, Failed: ${failed.length}`);
```

## License

MIT
