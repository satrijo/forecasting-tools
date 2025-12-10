/**
 * GeoJSON Converter Library
 * Convert any location data to GeoJSON format
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WeatherData {
  humidity: string;
  temperature: string;
  rainfall: string;
  windDirection: string;
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
export function loadLocationData(filePath?: string): any[] {
  const defaultPath = path.join(__dirname, "../weather/location.json");
  const locationPath = filePath || defaultPath;
  const data = fs.readFileSync(locationPath, "utf-8");
  return JSON.parse(data);
}

/**
 * Convert weather data array to structured object
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
    rainfall: weatherData[2] || "",
    windDirection: weatherData[3] || "",
    windSpeed: weatherData[4] || "",
  };
}

/**
 * Convert single location to GeoJSON feature
 */
export function toGeoJSONFeature(location: any[]): GeoJSONFeature | null {
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
 * Convert locations to GeoJSON FeatureCollection
 *
 * @param source - Array of locations OR file path string
 * @returns GeoJSON FeatureCollection
 *
 * @example
 * // From array (e.g., API response, database, etc)
 * const data = await fetchFromAPI();
 * const geojson = toGeoJSON(data);
 *
 * @example
 * // From file
 * const geojson = toGeoJSON("./locations.json");
 *
 * @example
 * // Load default file (../weather/location.json)
 * const geojson = toGeoJSON();
 */
export function toGeoJSON(source?: any[] | string): GeoJSONCollection {
  // If no source, load default file
  if (source === undefined) {
    source = loadLocationData();
  }

  // If string, load from file
  const locations =
    typeof source === "string" ? loadLocationData(source) : source;

  // Convert to GeoJSON
  const features = locations
    .map(toGeoJSONFeature)
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
 * Filter GeoJSON locations by multiple criteria
 * @param geojson - GeoJSON FeatureCollection
 * @param options - Filter options
 * @returns Filtered GeoJSON FeatureCollection
 *
 * @example
 * // Jawa Tengah tapi tidak termasuk Banyumas dan Cilacap
 * filter(geojson, {
 *   province: "Jawa Tengah",
 *   excludeKabupaten: ["Banyumas", "Cilacap"]
 * })
 *
 * @example
 * // Banyumas tapi tidak termasuk kecamatan Jatilawang
 * filter(geojson, {
 *   kabupaten: "Banyumas",
 *   excludeKecamatan: ["Jatilawang"]
 * })
 */
export function filter(
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
 * Filter GeoJSON by bounding box
 */
export function filterByBoundingBox(
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
