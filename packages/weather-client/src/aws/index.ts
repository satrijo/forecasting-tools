/**
 * BMKG AWS Data Fetcher
 * Fetch data AWS berdasarkan kode provinsi dari location.json
 */

import * as fs from "fs";
import * as path from "path";
import { BMKGAuth } from "./bmkg-auth";

// Get current directory using Bun's import.meta.dir
const __dirname = import.meta.dir;

class AWSDataFetcher {
  auth: any;
  locations: Array<any>;

  constructor(auth: any) {
    this.auth = auth;
    this.locations = this.loadLocations();
  }

  /**
   * Load data dari location.json
   */
  loadLocations() {
    const locationPath = path.join(__dirname, "location.json");
    const data = fs.readFileSync(locationPath, "utf-8");
    return JSON.parse(data);
  }

  /**
   * Filter station berdasarkan kode provinsi dan tipe (opsional)
   * @param {Array} provinceCodes - Array kode provinsi
   * @param {String|Array} type - Tipe station ("aws", "arg", ["aws", "arg"], atau null untuk semua)
   * @param {String|Array} city - Filter hanya kota tertentu (partial match, case-insensitive)
   * @param {String|Array} excludeCity - Exclude kota tertentu (partial match, case-insensitive)
   */
  getStationsByProvince(
    provinceCodes: any[],
    type: string | string[] | null = "aws",
    city: string | string[] | null = null,
    excludeCity: string | string[] | null = null,
  ) {
    // Normalize city filters to lowercase arrays
    const cityList = city
      ? (Array.isArray(city) ? city : [city]).map((c) =>
          c.replace(/_/g, " ").toLowerCase(),
        )
      : [];

    const excludeCityList = excludeCity
      ? (Array.isArray(excludeCity) ? excludeCity : [excludeCity]).map((c) =>
          c.replace(/_/g, " ").toLowerCase(),
        )
      : [];

    return this.locations.filter((loc) => {
      const matchProvince = provinceCodes.includes(loc.kode_provinsi);

      // Check province match first
      if (!matchProvince) return false;

      const locationCity = loc.nama_kota.toLowerCase();

      // Check exclude city
      if (excludeCityList.length > 0) {
        const isExcluded = excludeCityList.some((excl) =>
          locationCity.includes(excl),
        );
        if (isExcluded) return false;
      }

      // Check include city filter
      if (cityList.length > 0) {
        const matchCity = cityList.some((c) => locationCity.includes(c));
        if (!matchCity) return false;
      }

      // Jika type null/kosong, ambil semua
      if (!type) {
        return true;
      }

      // Jika type array, cek apakah loc.type ada di array
      if (Array.isArray(type)) {
        return type.includes(loc.type);
      }

      // Jika type string, cek exact match
      return loc.type === type;
    });
  }

  /**
   * Get location info by station ID
   */
  getLocationInfo(stationId: string) {
    return this.locations.find((loc) => loc.id_station === stationId);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Number} lat1 - Latitude point 1
   * @param {Number} lon1 - Longitude point 1
   * @param {Number} lat2 - Latitude point 2
   * @param {Number} lon2 - Longitude point 2
   * @returns {Number} Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Filter station berdasarkan radius dari koordinat tertentu
   * @param {Number} lat - Latitude center point
   * @param {Number} lon - Longitude center point
   * @param {Number} radius - Radius dalam kilometer
   * @param {String|Array} type - Tipe station ("aws", "arg", ["aws", "arg"], atau null untuk semua)
   */
  getStationsByRadius(
    lat: number,
    lon: number,
    radius: number,
    type: string | string[] | null = null,
  ) {
    return this.locations
      .map((loc) => {
        const stationLat = parseFloat(loc.lat);
        const stationLon = parseFloat(loc.lng);
        const distance = this.calculateDistance(
          lat,
          lon,
          stationLat,
          stationLon,
        );
        return { ...loc, distance };
      })
      .filter((loc) => {
        const withinRadius = loc.distance <= radius;

        // Jika type null/kosong, ambil semua yang dalam radius
        if (!type) {
          return withinRadius;
        }

        // Jika type array, cek apakah loc.type ada di array
        if (Array.isArray(type)) {
          return withinRadius && type.includes(loc.type);
        }

        // Jika type string, cek exact match
        return withinRadius && loc.type === type;
      })
      .sort((a, b) => a.distance - b.distance); // Sort by distance, nearest first
  }

  /**
   * Filter station berdasarkan nama kota dan tipe (opsional)
   * @param {String|Array} cityNames - Nama kota atau array nama kota
   * @param {String|Array} type - Tipe station ("aws", "arg", ["aws", "arg"], atau null untuk semua)
   * @param {String} matchMode - Mode pencarian: "partial" (default), "exact", "startsWith"
   * @param {String|Array} excludeCity - Nama kota yang dikecualikan (partial match)
   */
  getStationsByCity(
    cityNames: string | string[],
    type: string | string[] | null = null,
    matchMode: "partial" | "exact" | "startsWith" = "partial",
    excludeCity: string | string[] | null = null,
  ) {
    const searchTerms = Array.isArray(cityNames)
      ? cityNames.map((name) => name.replace(/_/g, " ").toLowerCase())
      : [cityNames.replace(/_/g, " ").toLowerCase()];

    const excludeTerms = excludeCity
      ? Array.isArray(excludeCity)
        ? excludeCity.map((name) => name.replace(/_/g, " ").toLowerCase())
        : [excludeCity.replace(/_/g, " ").toLowerCase()]
      : [];

    return this.locations.filter((loc) => {
      const locationCity = loc.nama_kota.toLowerCase();

      // Check exclude first
      if (excludeTerms.length > 0) {
        const isExcluded = excludeTerms.some((term) =>
          locationCity.includes(term),
        );
        if (isExcluded) return false;
      }

      let matchCity = false;
      if (matchMode === "exact") {
        matchCity = searchTerms.some((term) => locationCity === term);
      } else if (matchMode === "startsWith") {
        matchCity = searchTerms.some((term) => locationCity.startsWith(term));
      } else {
        // partial (default)
        matchCity = searchTerms.some((term) => locationCity.includes(term));
      }

      // Jika type null/kosong, ambil semua
      if (!type) {
        return matchCity;
      }

      // Jika type array, cek apakah loc.type ada di array
      if (Array.isArray(type)) {
        return matchCity && type.includes(loc.type);
      }

      // Jika type string, cek exact match
      return matchCity && loc.type === type;
    });
  }

  /**
   * Fetch data untuk satu station dengan info lokasi
   * @param {String} stationId - ID stasiun
   * @param {String} type - Tipe stasiun (aws/arg), jika null akan cek dari location.json
   * @param {Boolean} includeLocationInfo - Include location info or not
   */
  async fetchStationData(
    stationId: string,
    type: string | null = null,
    includeLocationInfo: boolean = true,
  ) {
    // Jika type tidak diberikan, cek dari location.json
    let actualType = type;
    if (!actualType) {
      const locationInfo = this.getLocationInfo(stationId);
      actualType = locationInfo?.type || "aws"; // fallback to "aws" if not found
    }

    try {
      const response = await this.auth.fetchWithRetry(
        `https://awscenter.bmkg.go.id/monitoring/${actualType}/${stationId}/json`,
      );

      // Cek apakah response OK
      if (!response.ok) {
        const baseResult = {
          success: false,
          stationId: stationId,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };

        if (!includeLocationInfo) {
          return baseResult;
        }

        const locationInfo = this.getLocationInfo(stationId);
        return {
          ...baseResult,
          stationName: locationInfo?.name_station || "N/A",
          city: locationInfo?.nama_kota || "N/A",
          province: locationInfo?.nama_provinsi || "N/A",
          provinceCode: locationInfo?.kode_provinsi || "N/A",
          lat: locationInfo?.lat || "N/A",
          lng: locationInfo?.lng || "N/A",
          type: locationInfo?.type || actualType,
        };
      }

      const data = await response.json();
      const baseResult = {
        success: true,
        stationId: stationId,
        data: data,
      };

      if (!includeLocationInfo) {
        return baseResult;
      }

      const locationInfo = this.getLocationInfo(stationId);
      return {
        ...baseResult,
        stationName: locationInfo?.name_station || "N/A",
        city: locationInfo?.nama_kota || "N/A",
        province: locationInfo?.nama_provinsi || "N/A",
        provinceCode: locationInfo?.kode_provinsi || "N/A",
        lat: locationInfo?.lat || "N/A",
        lng: locationInfo?.lng || "N/A",
        type: locationInfo?.type || actualType,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const baseResult = {
        success: false,
        stationId: stationId,
        error: errorMessage,
      };

      if (!includeLocationInfo) {
        return baseResult;
      }

      const locationInfo = this.getLocationInfo(stationId);
      return {
        ...baseResult,
        stationName: locationInfo?.name_station || "N/A",
        city: locationInfo?.nama_kota || "N/A",
        province: locationInfo?.nama_provinsi || "N/A",
        provinceCode: locationInfo?.kode_provinsi || "N/A",
        lat: locationInfo?.lat || "N/A",
        lng: locationInfo?.lng || "N/A",
        type: locationInfo?.type || actualType,
      };
    }
  }

  /**
   * Fetch data untuk multiple stations dengan info lokasi
   * @param {Array} stationIds - Array of station IDs (string[]) or station objects
   * @param {String} defaultType - Default type if not specified per station, null untuk auto-detect dari location.json
   * @param {Boolean} includeLocationInfo - Include location info or not
   */
  async fetchMultipleStations(
    stationIds: string[] | any[],
    defaultType: string | null = null,
    includeLocationInfo: boolean = true,
  ) {
    const results = [];

    for (const station of stationIds) {
      const stationId =
        typeof station === "string" ? station : station.id_station;
      const stationType =
        typeof station === "string" ? defaultType : station.type || defaultType;

      const result = await this.fetchStationData(
        stationId,
        stationType,
        includeLocationInfo,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Main: Fetch data berdasarkan kode provinsi
   * @param {Array} provinceCodes - Array kode provinsi
   * @param {String|Array} type - Tipe station ("aws", "arg", ["aws", "arg"], null untuk semua)
   * @param {String|Array} city - Filter hanya kota tertentu (partial match, case-insensitive)
   * @param {String|Array} excludeCity - Exclude kota tertentu (partial match, case-insensitive)
   */
  async fetchDataByProvince(
    provinceCodes: any[],
    type: string | string[] | null = null,
    city: string | string[] | null = null,
    excludeCity: string | string[] | null = null,
  ) {
    // 1. Filter stations dari location.json
    const stations = this.getStationsByProvince(
      provinceCodes,
      type,
      city,
      excludeCity,
    );

    const typeLabel = Array.isArray(type)
      ? type.join(" & ")
      : type || "all types";

    console.log(
      `Found ${stations.length} ${typeLabel} stations in selected provinces:`,
    );
    provinceCodes.forEach((code) => {
      const count = stations.filter((s) => s.kode_provinsi === code).length;
      const provName =
        stations.find((s) => s.kode_provinsi === code)?.nama_provinsi || code;
      console.log(`  - ${provName} (${code}): ${count} stations`);
    });

    if (city) {
      const cityLabel = Array.isArray(city) ? city.join(", ") : city;
      console.log(`  Filtered by city: ${cityLabel}`);
    }

    if (excludeCity) {
      const excludeLabel = Array.isArray(excludeCity)
        ? excludeCity.join(", ")
        : excludeCity;
      console.log(`  Excluded cities: ${excludeLabel}`);
    }

    // 2. Fetch data untuk setiap station (includeLocationInfo = true by default)
    console.log("Fetching data...");
    const results = await this.fetchMultipleStations(stations, null, true);

    return results;
  }

  /**
   * Fetch data berdasarkan radius dari koordinat tertentu
   * @param {Number} lat - Latitude center point
   * @param {Number} lon - Longitude center point
   * @param {Number} radius - Radius dalam kilometer
   * @param {String|Array} type - Tipe station ("aws", "arg", ["aws", "arg"], null untuk semua)
   */
  async fetchDataByRadius(
    lat: number,
    lon: number,
    radius: number,
    type: string | string[] | null = null,
  ) {
    // 1. Filter stations berdasarkan radius
    const stations = this.getStationsByRadius(lat, lon, radius, type);

    const typeLabel = Array.isArray(type)
      ? type.join(" & ")
      : type || "all types";

    console.log(
      `Found ${stations.length} ${typeLabel} stations within ${radius}km from (${lat}, ${lon}):`,
    );
    stations.slice(0, 10).forEach((s) => {
      console.log(
        `  - ${s.name_station} (${s.id_station}) - ${s.nama_kota} - ${s.distance.toFixed(2)}km`,
      );
    });
    if (stations.length > 10) {
      console.log(`  ... and ${stations.length - 10} more stations`);
    }

    // 2. Fetch data untuk setiap station
    console.log("Fetching data...");
    const results = await this.fetchMultipleStations(stations, null, true);

    return results;
  }

  /**
   * Fetch data berdasarkan nama kota
   * @param {String|Array} cityNames - Nama kota atau array nama kota
   * @param {String|Array} type - Tipe station ("aws", "arg", ["aws", "arg"], null untuk semua)
   * @param {String} matchMode - Mode pencarian: "partial" (default), "exact", "startsWith"
   * @param {String|Array} excludeCity - Nama kota yang dikecualikan (partial match)
   */
  async fetchDataByCity(
    cityNames: string | string[],
    type: string | string[] | null = null,
    matchMode: "partial" | "exact" | "startsWith" = "partial",
    excludeCity: string | string[] | null = null,
  ) {
    // 1. Filter stations dari location.json berdasarkan nama kota
    const stations = this.getStationsByCity(
      cityNames,
      type,
      matchMode,
      excludeCity,
    );

    const typeLabel = Array.isArray(type)
      ? type.join(" & ")
      : type || "all types";

    const cityLabel = Array.isArray(cityNames)
      ? cityNames.join(", ")
      : cityNames;

    console.log(
      `Found ${stations.length} ${typeLabel} stations in cities "${cityLabel}":`,
    );
    stations.forEach((s) => {
      console.log(`  - ${s.name_station} (${s.id_station}) - ${s.nama_kota}`);
    });

    // 2. Fetch data untuk setiap station
    console.log("Fetching data...");
    const results = await this.fetchMultipleStations(stations, null, true);

    return results;
  }
}

export { AWSDataFetcher, BMKGAuth };
