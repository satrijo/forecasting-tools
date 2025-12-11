/**
 * BMKG Public Weather API Client
 *
 * Endpoints:
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=pwxDarat
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&lon=109.11552349560588&lat=-7.656747622457885
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&code=31.72.05.1003
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getForecastDarat&code=202512111800.json
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getManifest&code=jalurDarat
 * - https://www.bmkg.go.id/alerts/nowcast/id/CJH20251210002_alert.xml
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=nowcasting&code=CJH
 */

import { XMLParser } from "fast-xml-parser";

// Re-export weather codes utilities
export * from "./weather-codes";

// =====================================================
// Type Definitions
// =====================================================

/** Location information */
export interface LocationInfo {
  lon: number;
  lat: number;
  adm1: string;
  adm2: string;
  adm3: string;
  adm4: string;
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
}

/** Current weather data */
export interface CurrentWeather {
  /** Weather code (0-104), see weather-codes.ts */
  weather: number;
  weather_desc: string;
  weather_desc_en: string;
  image: string;
  datetime: string;
  local_datetime: string;
  /** Temperature in °C */
  t: number;
  /** Cloud cover in % */
  tcc: number;
  /** Wind direction in degrees */
  wd_deg: number;
  /** Wind direction code (N, NE, SW, etc.) */
  wd: string;
  /** Wind direction to */
  wd_to: string;
  /** Wind speed in km/h */
  ws: number;
  /** Humidity in % */
  hu: number;
  /** Visibility in meters */
  vs: number;
  vs_text: string;
  source: string;
}

/** Forecast weather data (extends CurrentWeather) */
export interface ForecastWeather extends CurrentWeather {
  /** Total precipitation in mm */
  tp: number;
  time_index: string;
  analysis_date: string;
  utc_datetime: string;
}

/** Response from getLocationWeatherByCode / getLocationWeather */
export interface LocationWeatherResponse {
  status: number;
  data: {
    lokasi: LocationInfo;
    cuaca: CurrentWeather;
    prakiraan: ForecastWeather[];
  };
}

class PublicWeather {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  }

  getPwxDarat() {
    const url =
      "https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=pwxDarat";
    return fetch(url).then((res) => res.json());
  }

  getLocationWeatherByCode(code: string): Promise<LocationWeatherResponse> {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&code=${code}`;
    return fetch(url).then((res) => res.json() as Promise<LocationWeatherResponse>);
  }

  getLocationWeather(lat: number, lon: number): Promise<LocationWeatherResponse> {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&lon=${lon}&lat=${lat}`;
    return fetch(url).then((res) => res.json() as Promise<LocationWeatherResponse>);
  }

  getForecastDarat(code: string) {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getForecastDarat&code=${code}.json`;
    return fetch(url).then((res) => res.json());
  }

  getManifest() {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getManifest&code=jalurDarat`;
    return fetch(url).then((res) => res.json());
  }

  getNowcasting(code: string) {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=nowcasting&code=${code}`;
    return fetch(url).then((res) => res.json());
  }

  async getNowcastingXMLLatest(provinceName?: string) {
    const url = `https://www.bmkg.go.id/alerts/nowcast/id`;
    const xmlString = await fetch(url).then((res) => res.text());
    const data = this.xmlParser.parse(xmlString);

    if (provinceName) {
      return this.filterByProvince(data, provinceName);
    }

    return data;
  }

  filterByProvince(data: any, provinceName: string) {
    if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
      return null;
    }

    const items = data.rss.channel.item;
    if (!Array.isArray(items)) {
      return null;
    }

    // Filter by title containing province name (case-insensitive)
    const provinceKeyword = provinceName.toLowerCase();
    const filtered = items.filter((item: any) => {
      if (!item.title) return false;
      const title = item.title.toLowerCase();
      return title.includes(provinceKeyword);
    });

    return {
      nowcasting: filtered,
    };
  }

  async getNowcastingXML(url: string) {
    const xmlString = await fetch(url).then((res) => res.text());
    return this.xmlParser.parse(xmlString);
  }
}

export { PublicWeather };
