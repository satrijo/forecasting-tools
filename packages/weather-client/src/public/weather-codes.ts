/**
 * BMKG Weather and Wind Direction Codes
 * Reference: kode.md
 */

/** Weather code mapping */
export const WEATHER_CODES: Record<
  number,
  { id: string; en: string; icon?: string }
> = {
  0: { id: "Cerah", en: "Clear Skies" },
  1: { id: "Cerah Berawan", en: "Partly Cloudy" },
  2: { id: "Cerah Berawan", en: "Partly Cloudy" },
  3: { id: "Berawan", en: "Mostly Cloudy" },
  4: { id: "Berawan Tebal", en: "Overcast" },
  5: { id: "Udara Kabur", en: "Haze" },
  10: { id: "Asap", en: "Smoke" },
  45: { id: "Kabut", en: "Fog" },
  60: { id: "Hujan Ringan", en: "Light Rain" },
  61: { id: "Hujan Sedang", en: "Rain" },
  63: { id: "Hujan Lebat", en: "Heavy Rain" },
  80: { id: "Hujan Lokal", en: "Isolated Shower" },
  95: { id: "Hujan Petir", en: "Severe Thunderstorm" },
  97: { id: "Hujan Petir", en: "Severe Thunderstorm" },
  // Alternative codes (100+)
  100: { id: "Cerah", en: "Clear Skies" },
  101: { id: "Cerah Berawan", en: "Partly Cloudy" },
  102: { id: "Cerah Berawan", en: "Partly Cloudy" },
  103: { id: "Berawan", en: "Mostly Cloudy" },
  104: { id: "Berawan Tebal", en: "Overcast" },
};

/** Wind direction code mapping (CARD) */
export const WIND_DIRECTION_CODES: Record<
  string,
  { en: string; id: string; degrees?: [number, number] }
> = {
  N: { en: "North", id: "Utara", degrees: [348.75, 11.25] },
  NNE: { en: "North-Northeast", id: "Utara-Timur Laut", degrees: [11.25, 33.75] },
  NE: { en: "Northeast", id: "Timur Laut", degrees: [33.75, 56.25] },
  ENE: { en: "East-Northeast", id: "Timur-Timur Laut", degrees: [56.25, 78.75] },
  E: { en: "East", id: "Timur", degrees: [78.75, 101.25] },
  ESE: { en: "East-Southeast", id: "Timur-Tenggara", degrees: [101.25, 123.75] },
  SE: { en: "Southeast", id: "Tenggara", degrees: [123.75, 146.25] },
  SSE: { en: "South-Southeast", id: "Selatan-Tenggara", degrees: [146.25, 168.75] },
  S: { en: "South", id: "Selatan", degrees: [168.75, 191.25] },
  SSW: { en: "South-Southwest", id: "Selatan-Barat Daya", degrees: [191.25, 213.75] },
  SW: { en: "Southwest", id: "Barat Daya", degrees: [213.75, 236.25] },
  WSW: { en: "West-Southwest", id: "Barat-Barat Daya", degrees: [236.25, 258.75] },
  W: { en: "West", id: "Barat", degrees: [258.75, 281.25] },
  WNW: { en: "West-Northwest", id: "Barat-Barat Laut", degrees: [281.25, 303.75] },
  NW: { en: "Northwest", id: "Barat Laut", degrees: [303.75, 326.25] },
  NNW: { en: "North-Northwest", id: "Utara-Barat Laut", degrees: [326.25, 348.75] },
  VARIABLE: { en: "Variable", id: "Berubah-ubah" },
};

/**
 * Get weather description by code
 * @param code Weather code (0-104)
 * @param lang Language: 'id' (Indonesian) or 'en' (English)
 * @returns Weather description or undefined if code not found
 */
export function getWeatherDescription(
  code: number,
  lang: "id" | "en" = "id",
): string | undefined {
  const weather = WEATHER_CODES[code];
  return weather ? weather[lang] : undefined;
}

/**
 * Get wind direction description by code
 * @param code Wind direction code (N, NE, SW, etc.)
 * @param lang Language: 'id' (Indonesian) or 'en' (English)
 * @returns Wind direction description or undefined if code not found
 */
export function getWindDirectionDescription(
  code: string,
  lang: "id" | "en" = "id",
): string | undefined {
  const wind = WIND_DIRECTION_CODES[code.toUpperCase()];
  return wind ? wind[lang] : undefined;
}

/**
 * Convert degrees to wind direction code
 * @param degrees Wind direction in degrees (0-360)
 * @returns Wind direction code (N, NE, SW, etc.)
 */
export function degreesToWindDirection(degrees: number): string {
  // Normalize degrees to 0-360
  const normalized = ((degrees % 360) + 360) % 360;

  // Check each direction's range
  for (const [code, data] of Object.entries(WIND_DIRECTION_CODES)) {
    if (code === "VARIABLE" || !data.degrees) continue;

    const [min, max] = data.degrees;

    // Handle N which wraps around 0
    if (code === "N") {
      if (normalized >= min || normalized < max) return code;
    } else {
      if (normalized >= min && normalized < max) return code;
    }
  }

  return "N"; // Default fallback
}

/**
 * Check if weather code indicates rain
 * @param code Weather code
 * @returns true if weather indicates rain
 */
export function isRainy(code: number): boolean {
  return [60, 61, 63, 80, 95, 97].includes(code);
}

/**
 * Check if weather code indicates clear/sunny
 * @param code Weather code
 * @returns true if weather is clear/sunny
 */
export function isClear(code: number): boolean {
  return [0, 1, 100, 101].includes(code);
}

/**
 * Check if weather code indicates cloudy
 * @param code Weather code
 * @returns true if weather is cloudy
 */
export function isCloudy(code: number): boolean {
  return [2, 3, 4, 102, 103, 104].includes(code);
}

/**
 * Check if weather code indicates poor visibility (haze/smoke/fog)
 * @param code Weather code
 * @returns true if visibility is poor
 */
export function isPoorVisibility(code: number): boolean {
  return [5, 10, 45].includes(code);
}

/**
 * Get all weather codes
 * @returns Array of all weather codes with descriptions
 */
export function getAllWeatherCodes(): Array<{
  code: number;
  id: string;
  en: string;
}> {
  return Object.entries(WEATHER_CODES).map(([code, desc]) => ({
    code: parseInt(code),
    ...desc,
  }));
}

/**
 * Get all wind direction codes
 * @returns Array of all wind direction codes with descriptions
 */
export function getAllWindDirectionCodes(): Array<{
  code: string;
  id: string;
  en: string;
}> {
  return Object.entries(WIND_DIRECTION_CODES).map(([code, desc]) => ({
    code,
    id: desc.id,
    en: desc.en,
  }));
}
