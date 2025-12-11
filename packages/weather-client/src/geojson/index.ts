/**
 * GeoJSON Converter Library
 * Convert any location data to GeoJSON format
 */

import * as fs from "fs";

/**
 * Weather data from BMKG public API (signature.bmkg.go.id)
 * @see kode.md for weather code reference
 */
export interface WeatherData {
  /** Kelembapan udara dalam % */
  humidity: string;
  /** Suhu udara dalam °C */
  temperature: string;
  /** Kode cuaca (0-97), lihat kode.md untuk referensi */
  weatherCode: string;
  /** Arah angin dari (N, NE, E, SE, S, SW, W, NW, dll) */
  windDirection: string;
  /** Kecepatan angin dalam km/jam */
  windSpeed: string;
}

export interface GeoJSONFeature {
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

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * Load weather locations from JSON file
 */
export function loadLocationData(filePath: string): any[] {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Convert weather data array to structured object
 * Array format: [humidity, temperature, weatherCode, windDirection, windSpeed]
 */
export function parseWeatherData(
  weatherData: string[] | null,
): WeatherData | null {
  if (!weatherData || weatherData.length < 5) {
    return null;
  }

  return {
    humidity: weatherData[0] || "",
    temperature: weatherData[1] || "",
    weatherCode: weatherData[2] || "",
    windDirection: weatherData[3] || "",
    windSpeed: weatherData[4] || "",
  };
}

/**
 * Convert single public weather location to GeoJSON feature
 */
export function publicToGeoJSONFeature(location: any[]): GeoJSONFeature | null {
  if (!location || location.length === 0) {
    return null;
  }

  const [
    province,
    kabupaten,
    kecamatan,
    lat,
    lon,
    id,
    timestamp,
    weatherData,
    type,
  ] = location;

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lon, lat], // GeoJSON uses [longitude, latitude]
    },
    properties: {
      id,
      province,
      kabupaten,
      kecamatan,
      timestamp,
      type,
      weather: parseWeatherData(weatherData),
    },
  };
}

/**
 * Convert public weather locations to GeoJSON FeatureCollection
 *
 * @param source - Array of locations OR file path string
 * @returns GeoJSON FeatureCollection
 *
 * @example
 * // From array (e.g., API response from getPwxDarat())
 * const data = await publicWeather.getPwxDarat();
 * const geojson = publicToGeoJSON(data);
 *
 * @example
 * // From file
 * const geojson = publicToGeoJSON("./locations.json");
 */
export function publicToGeoJSON(source: any[] | string): GeoJSONCollection {
  // If string, load from file
  const locations =
    typeof source === "string" ? loadLocationData(source) : source;

  // Convert to GeoJSON
  const features = locations
    .map(publicToGeoJSONFeature)
    .filter((feature): feature is GeoJSONFeature => feature !== null);

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Save GeoJSON to file
 */
export function saveGeoJSON(
  geojson: GeoJSONCollection,
  outputPath: string,
): void {
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
}

/**
 * Filter public weather GeoJSON by multiple criteria
 * @param geojson - GeoJSON FeatureCollection from publicToGeoJSON()
 * @param options - Filter options
 * @returns Filtered GeoJSON FeatureCollection
 *
 * @example
 * // Jawa Tengah tapi tidak termasuk Banyumas dan Cilacap
 * filterPublicGeoJSON(geojson, {
 *   province: "Jawa Tengah",
 *   excludeKabupaten: ["Banyumas", "Cilacap"]
 * })
 *
 * @example
 * // Banyumas tapi tidak termasuk kecamatan Jatilawang
 * filterPublicGeoJSON(geojson, {
 *   kabupaten: "Banyumas",
 *   excludeKecamatan: ["Jatilawang"]
 * })
 */
export function filterPublicGeoJSON(
  geojson: GeoJSONCollection,
  options: {
    province?: string;
    kabupaten?: string;
    kecamatan?: string;
    type?: string;
    excludeProvince?: string | string[];
    excludeKabupaten?: string | string[];
    excludeKecamatan?: string | string[];
    excludeType?: string | string[];
  } = {},
): GeoJSONCollection {
  const {
    province,
    kabupaten,
    kecamatan,
    type,
    excludeProvince,
    excludeKabupaten,
    excludeKecamatan,
    excludeType,
  } = options;

  // Normalize exclude lists
  const excludeProvinceList = excludeProvince
    ? (Array.isArray(excludeProvince)
        ? excludeProvince
        : [excludeProvince]
      ).map((p) => p.toLowerCase())
    : [];

  const excludeKabupatenList = excludeKabupaten
    ? (Array.isArray(excludeKabupaten)
        ? excludeKabupaten
        : [excludeKabupaten]
      ).map((k) => k.toLowerCase())
    : [];

  const excludeKecamatanList = excludeKecamatan
    ? (Array.isArray(excludeKecamatan)
        ? excludeKecamatan
        : [excludeKecamatan]
      ).map((kec) => kec.toLowerCase())
    : [];

  const excludeTypeList = excludeType
    ? (Array.isArray(excludeType) ? excludeType : [excludeType]).map((t) =>
        t.toLowerCase(),
      )
    : [];

  return {
    type: "FeatureCollection",
    features: geojson.features.filter((feature) => {
      const props = feature.properties;
      const featureProvince = props.province.toLowerCase();
      const featureKabupaten = props.kabupaten.toLowerCase();
      const featureKecamatan = props.kecamatan.toLowerCase();
      const featureType = props.type.toLowerCase();

      // Province filter
      if (province && featureProvince !== province.toLowerCase()) {
        return false;
      }

      // Kabupaten filter (partial match)
      if (kabupaten && !featureKabupaten.includes(kabupaten.toLowerCase())) {
        return false;
      }

      // Kecamatan filter (partial match)
      if (kecamatan && !featureKecamatan.includes(kecamatan.toLowerCase())) {
        return false;
      }

      // Type filter
      if (type && featureType !== type.toLowerCase()) {
        return false;
      }

      // Exclude filters
      if (excludeProvinceList.includes(featureProvince)) {
        return false;
      }

      if (
        excludeKabupatenList.some((excl) => featureKabupaten.includes(excl))
      ) {
        return false;
      }

      if (
        excludeKecamatanList.some((excl) => featureKecamatan.includes(excl))
      ) {
        return false;
      }

      if (excludeTypeList.includes(featureType)) {
        return false;
      }

      return true;
    }),
  };
}

/**
 * Filter public weather GeoJSON by bounding box
 */
export function filterPublicByBoundingBox(
  geojson: GeoJSONCollection,
  minLon: number,
  minLat: number,
  maxLon: number,
  maxLat: number,
): GeoJSONCollection {
  return {
    type: "FeatureCollection",
    features: geojson.features.filter((feature) => {
      const [lon, lat] = feature.geometry.coordinates;
      return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
    }),
  };
}

// =====================================================
// AWS GeoJSON Converter
// =====================================================

export interface AWSStation {
  id_station: string;
  name_station: string;
  nama_stasiun?: string;
  nama_kota: string;
  lat: string;
  lng: string;
  latt?: string;
  type: string;
  tipe_station?: string;
  kode_provinsi: string;
  nama_provinsi: string;
  klasifikasi?: string | null;
  icon?: string;
  status_symbol?: string;
  diff_day?: string;
  diff_hour?: string;
  diff_minute?: string;
  tanggal?: string;
  // Temperature
  tt_air_avg?: string;
  tt_air_max?: string;
  tt_air_min?: string;
  t?: string;
  tx?: string;
  tn?: string;
  // Humidity
  rh_avg?: string;
  rh?: string;
  // Rainfall
  rr?: string;
  rr_symbol?: string;
  // Pressure
  pp_air?: string;
  // Solar radiation
  sr_avg?: string;
  sr_max?: string;
  ss?: string;
  // Wind
  ws_avg?: string;
  ws_max?: string;
  wd_avg?: string;
  ff_x?: string;
  ddd_car?: string;
  // Water level
  wl?: string;
  // Battery & logger
  batt_volt?: string;
  logger_temp?: string;
  // Soil moisture (soil station)
  sm_10?: string;
  sm_20?: string;
  sm_30?: string;
  sm_40?: string;
  sm_60?: string;
  sm_100?: string;
  sm10?: string;
  sm20?: string;
  sm30?: string;
  sm40?: string;
  sm60?: string;
  sm100?: string;
  // Soil temperature (soil station)
  ts10?: string;
  ts20?: string;
  ts30?: string;
  ts40?: string;
  ts60?: string;
  ts100?: string;
  // Soil water content
  swc?: string;
  // AAWS additional fields
  par?: string;
  ws_2m?: string;
  // ASRS fields (solar radiation)
  diffuse_rad_round?: string;
  global_rad_round?: string;
  dni_rad_round?: string;
  reflected_rad_round?: string;
  nett_rad_round?: string;
  sunshine_minutes?: string;
  // Iklimmikro multi-level fields (4m)
  tt_4m?: string;
  tt_min_4m?: string;
  tt_avg_4m?: string;
  tt_max_4m?: string;
  rh_4m?: string;
  rh_min_4m?: string;
  rh_avg_4m?: string;
  rh_max_4m?: string;
  ws_4m?: string;
  ws_min_4m?: string;
  ws_avg_4m?: string;
  ws_max_4m?: string;
  wd_4m?: string;
  wd_avg_4m?: string;
  // Iklimmikro multi-level fields (7m)
  tt_7m?: string;
  tt_min_7m?: string;
  tt_avg_7m?: string;
  tt_max_7m?: string;
  rh_7m?: string;
  rh_min_7m?: string;
  rh_avg_7m?: string;
  rh_max_7m?: string;
  ws_7m?: string;
  ws_min_7m?: string;
  ws_avg_7m?: string;
  ws_max_7m?: string;
  wd_7m?: string;
  wd_avg_7m?: string;
  // Iklimmikro multi-level fields (10m)
  tt_10m?: string;
  tt_min_10m?: string;
  tt_avg_10m?: string;
  tt_max_10m?: string;
  rh_10m?: string;
  rh_min_10m?: string;
  rh_avg_10m?: string;
  rh_max_10m?: string;
  ws_10m?: string;
  ws_min_10m?: string;
  ws_avg_10m?: string;
  ws_max_10m?: string;
  wd_10m?: string;
  wd_avg_10m?: string;
  // Distance (from radius search)
  distance?: number;
  [key: string]: any;
}

// Base weather data - common fields
export interface BaseWeatherData {
  battery: number | null;
}

// AWS/AAWS weather data - full weather station
export interface AWSWeatherData extends BaseWeatherData {
  temperature: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  humidity: number | null;
  rainfall: number | null;
  pressure: number | null;
  solarRadiation: number | null;
  solarRadiationMax: number | null;
  windSpeed: number | null;
  windSpeedMax: number | null;
  windDirection: number | null;
  waterLevel: number | null;
  // AAWS additional fields
  par: number | null; // Photosynthetically Active Radiation
  windSpeed2m: number | null;
}

// ARG weather data - rain gauge only
export interface ARGWeatherData extends BaseWeatherData {
  rainfall: number | null;
}

// Soil station data
export interface SoilWeatherData extends BaseWeatherData {
  swc: number | null; // Soil Water Content
  soilMoisture: {
    sm10: number | null;
    sm20: number | null;
    sm30: number | null;
    sm40: number | null;
    sm60: number | null;
    sm100: number | null;
  };
  soilTemperature: {
    ts10: number | null;
    ts20: number | null;
    ts30: number | null;
    ts40: number | null;
    ts60: number | null;
    ts100: number | null;
  };
}

// Level data for Iklimmikro (4m, 7m, 10m heights)
export interface IklimmikroLevelData {
  temperature: number | null;
  temperatureMin: number | null;
  temperatureAvg: number | null;
  temperatureMax: number | null;
  humidity: number | null;
  humidityMin: number | null;
  humidityAvg: number | null;
  humidityMax: number | null;
  windSpeed: number | null;
  windSpeedMin: number | null;
  windSpeedAvg: number | null;
  windSpeedMax: number | null;
  windDirection: number | null;
}

// Iklimmikro weather data - multi-level measurements (4m, 7m, 10m)
export interface IklimmikroWeatherData extends BaseWeatherData {
  level4m: IklimmikroLevelData;
  level7m: IklimmikroLevelData;
  level10m: IklimmikroLevelData;
}

// ASRS weather data - solar radiation station
export interface ASRSWeatherData extends BaseWeatherData {
  diffuseRadiation: number | null;
  globalRadiation: number | null;
  directNormalIrradiance: number | null;
  reflectedRadiation: number | null;
  netRadiation: number | null;
  sunshineMinutes: number | null;
}

// Union type for all weather data
export type StationWeatherData =
  | AWSWeatherData
  | ARGWeatherData
  | SoilWeatherData
  | IklimmikroWeatherData
  | ASRSWeatherData;

export interface AWSGeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    city: string;
    type: string;
    province: string;
    provinceCode: string;
    classification: string | null;
    status: {
      daysDiff: number;
      hoursDiff: number;
      minutesDiff: number;
      lastUpdate: string;
      icon: string;
    };
    weather: StationWeatherData;
    loggerTemp: number | null;
    distance?: number;
  };
}

export interface AWSGeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: AWSGeoJSONFeature[];
  metadata?: {
    count: number;
    generated: string;
    types: Record<string, number>;
  };
}

/**
 * Helper to parse float safely
 */
function parseFloatSafe(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Build Iklimmikro level data
 */
function buildIklimmikroLevelData(
  station: AWSStation,
  level: "4m" | "7m" | "10m",
): IklimmikroLevelData {
  return {
    temperature: parseFloatSafe(station[`tt_${level}`]),
    temperatureMin: parseFloatSafe(station[`tt_min_${level}`]),
    temperatureAvg: parseFloatSafe(station[`tt_avg_${level}`]),
    temperatureMax: parseFloatSafe(station[`tt_max_${level}`]),
    humidity: parseFloatSafe(station[`rh_${level}`]),
    humidityMin: parseFloatSafe(station[`rh_min_${level}`]),
    humidityAvg: parseFloatSafe(station[`rh_avg_${level}`]),
    humidityMax: parseFloatSafe(station[`rh_max_${level}`]),
    windSpeed: parseFloatSafe(station[`ws_${level}`]),
    windSpeedMin: parseFloatSafe(station[`ws_min_${level}`]),
    windSpeedAvg: parseFloatSafe(station[`ws_avg_${level}`]),
    windSpeedMax: parseFloatSafe(station[`ws_max_${level}`]),
    windDirection: parseFloatSafe(station[`wd_${level}`]) ?? parseFloatSafe(station[`wd_avg_${level}`]),
  };
}

/**
 * Build weather data based on station type
 */
function buildWeatherData(station: AWSStation, stationType: string): StationWeatherData {
  const battery = parseFloatSafe(station.batt_volt);

  // ARG (Automatic Rain Gauge) - only rainfall data
  if (stationType === "arg") {
    return {
      battery,
      rainfall: parseFloatSafe(station.rr),
    } as ARGWeatherData;
  }

  // Soil station - soil moisture and temperature
  if (stationType === "soil") {
    return {
      battery,
      swc: parseFloatSafe(station.swc),
      soilMoisture: {
        sm10: parseFloatSafe(station.sm_10) ?? parseFloatSafe(station.sm10),
        sm20: parseFloatSafe(station.sm_20) ?? parseFloatSafe(station.sm20),
        sm30: parseFloatSafe(station.sm_30) ?? parseFloatSafe(station.sm30),
        sm40: parseFloatSafe(station.sm_40) ?? parseFloatSafe(station.sm40),
        sm60: parseFloatSafe(station.sm_60) ?? parseFloatSafe(station.sm60),
        sm100: parseFloatSafe(station.sm_100) ?? parseFloatSafe(station.sm100),
      },
      soilTemperature: {
        ts10: parseFloatSafe(station.ts10),
        ts20: parseFloatSafe(station.ts20),
        ts30: parseFloatSafe(station.ts30),
        ts40: parseFloatSafe(station.ts40),
        ts60: parseFloatSafe(station.ts60),
        ts100: parseFloatSafe(station.ts100),
      },
    } as SoilWeatherData;
  }

  // Iklimmikro - multi-level measurements (4m, 7m, 10m)
  if (stationType === "iklimmikro") {
    return {
      battery,
      level4m: buildIklimmikroLevelData(station, "4m"),
      level7m: buildIklimmikroLevelData(station, "7m"),
      level10m: buildIklimmikroLevelData(station, "10m"),
    } as IklimmikroWeatherData;
  }

  // ASRS (Automatic Solar Radiation Station)
  if (stationType === "asrs") {
    return {
      battery,
      diffuseRadiation: parseFloatSafe(station.diffuse_rad_round),
      globalRadiation: parseFloatSafe(station.global_rad_round),
      directNormalIrradiance: parseFloatSafe(station.dni_rad_round),
      reflectedRadiation: parseFloatSafe(station.reflected_rad_round),
      netRadiation: parseFloatSafe(station.nett_rad_round),
      sunshineMinutes: parseFloatSafe(station.sunshine_minutes),
    } as ASRSWeatherData;
  }

  // AWS, AAWS - full weather data
  return {
    battery,
    temperature: parseFloatSafe(station.tt_air_avg) ?? parseFloatSafe(station.t),
    temperatureMax: parseFloatSafe(station.tt_air_max) ?? parseFloatSafe(station.tx),
    temperatureMin: parseFloatSafe(station.tt_air_min) ?? parseFloatSafe(station.tn),
    humidity: parseFloatSafe(station.rh_avg) ?? parseFloatSafe(station.rh),
    rainfall: parseFloatSafe(station.rr),
    pressure: parseFloatSafe(station.pp_air),
    solarRadiation: parseFloatSafe(station.sr_avg),
    solarRadiationMax: parseFloatSafe(station.sr_max),
    windSpeed: parseFloatSafe(station.ws_avg),
    windSpeedMax: parseFloatSafe(station.ws_max) ?? parseFloatSafe(station.ff_x),
    windDirection: parseFloatSafe(station.wd_avg),
    waterLevel: parseFloatSafe(station.wl),
    par: parseFloatSafe(station.par),
    windSpeed2m: parseFloatSafe(station.ws_2m),
  } as AWSWeatherData;
}

/**
 * Convert single AWS station to GeoJSON feature
 */
export function awsToGeoJSONFeature(
  station: AWSStation,
): AWSGeoJSONFeature | null {
  // Handle both 'lat' and 'latt' field names from API
  const latStr = station.lat || station.latt;
  const lngStr = station.lng;
  
  const lat = parseFloat(latStr || "0");
  const lng = parseFloat(lngStr || "0");

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  // Get station type - prefer type, fallback to tipe_station
  const stationType = (station.type || station.tipe_station || "unknown").toLowerCase();

  // Get station name - prefer name_station, fallback to nama_stasiun
  const stationName = station.name_station || station.nama_stasiun || "N/A";

  // Get status icon - prefer icon, fallback to status_symbol
  const statusIcon = station.icon || station.status_symbol || "";

  // Build weather data based on station type
  const weather = buildWeatherData(station, stationType);

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lng, lat],
    },
    properties: {
      id: station.id_station,
      name: stationName,
      city: station.nama_kota,
      type: stationType,
      province: station.nama_provinsi,
      provinceCode: station.kode_provinsi,
      classification: station.klasifikasi ?? null,
      status: {
        daysDiff: parseInt(station.diff_day || "0", 10),
        hoursDiff: parseInt(station.diff_hour || "0", 10),
        minutesDiff: parseInt(station.diff_minute || "0", 10),
        lastUpdate: station.tanggal || "",
        icon: statusIcon,
      },
      weather,
      loggerTemp: parseFloatSafe(station.logger_temp),
      ...(station.distance !== undefined && { distance: station.distance }),
    },
  };
}

/**
 * Convert array of AWS stations to GeoJSON FeatureCollection
 */
export function awsToGeoJSON(
  stations: AWSStation[],
  includeMetadata: boolean = true,
): AWSGeoJSONFeatureCollection {
  const features = stations
    .map(awsToGeoJSONFeature)
    .filter((f): f is AWSGeoJSONFeature => f !== null);

  const typeCounts: Record<string, number> = {};
  stations.forEach((s) => {
    const t = s.type || "unknown";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const result: AWSGeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  if (includeMetadata) {
    result.metadata = {
      count: features.length,
      generated: new Date().toISOString(),
      types: typeCounts,
    };
  }

  return result;
}

/**
 * Convert AWS stations to GeoJSON string
 */
export function awsToGeoJSONString(
  stations: AWSStation[],
  pretty: boolean = false,
  includeMetadata: boolean = true,
): string {
  const geojson = awsToGeoJSON(stations, includeMetadata);
  return pretty ? JSON.stringify(geojson, null, 2) : JSON.stringify(geojson);
}
